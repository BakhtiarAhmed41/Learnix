from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from .models import Document, Test, Question, TestAttempt, Answer
from .serializers import (
    DocumentSerializer, TestSerializer, QuestionSerializer,
    TestAttemptSerializer, AnswerSerializer
)
import google.generativeai as genai
from django.conf import settings
from django.utils import timezone
import os
from pypdf import PdfReader
from docx import Document as DocxDocument # Renamed to avoid conflict with Django model
import json # Import the json module
from rest_framework.permissions import AllowAny
from django.core.mail import send_mail

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer

    def create(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        title = request.data.get('title')
        
        if not file:
            return Response(
                {'error': 'No file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not title:
            title = file.name

        # Get file extension
        file_ext = os.path.splitext(file.name)[1].lower()
        file_type = {
            '.pdf': 'PDF',
            '.doc': 'Word',
            '.docx': 'Word',
            '.txt': 'Text'
        }.get(file_ext, 'Unknown')

        # Read content from the file
        extracted_content = ""
        try:
            if file_ext == '.pdf':
                reader = PdfReader(file)
                for page in reader.pages:
                    extracted_content += page.extract_text() or ""
            elif file_ext == '.docx':
                doc = DocxDocument(file)
                for para in doc.paragraphs:
                    extracted_content += para.text + "\n"
            elif file_ext == '.txt':
                extracted_content = file.read().decode('utf-8')
            else:
                # For unsupported file types or .doc (which needs external tools)
                extracted_content = "Content extraction not supported for this file type or requires external tools."

        except Exception as e:
            print(f"Error extracting content from file: {e}")
            return Response(
                {'error': f'Failed to extract content from file: {e}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create document
        document = Document.objects.create(
            title=title,
            file=file,
            file_type=file_type,
            status='processed',
            content=extracted_content # Use extracted content here
        )

        serializer = self.get_serializer(document)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def generate_test(self, request, pk=None):
        document = self.get_object()
        exam_type = request.data.get('exam_type', 'mcq')
        question_count = int(request.data.get('question_count', 5))
        difficulty = request.data.get('difficulty', 'medium')
        time_limit = int(request.data.get('time_limit', 30))

        # Configure Gemini client
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash-latest')

        try:
            if exam_type == 'qa':
                prompt_text = f"""
                Generate {question_count} question-answer pairs based on the following text. Each question should be open-ended and require a short answer. For each, provide the question and the correct answer. Format the output as a JSON array of objects, like this:
                [
                  {{"question": "Question 1 text", "answer": "Correct answer 1"}},
                  {{"question": "Question 2 text", "answer": "Correct answer 2"}}
                ]
                Text: {document.content}
                """
                response = model.generate_content(prompt_text)
                questions_text = response.text
                questions = self._parse_qa_questions(questions_text)
                test = Test.objects.create(
                    document=document,
                    title=f"QA Test for {document.title}"
                )
                for i, q in enumerate(questions):
                    Question.objects.create(
                        test=test,
                        question_text=q['question'],
                        question_type='short_answer',
                        correct_answer=q['answer'],
                        options=[],
                        order=i
                    )
                test.refresh_from_db()
                serialized_test_data = TestSerializer(test).data
                return Response(serialized_test_data, status=status.HTTP_201_CREATED)
            else:
                # MCQ (default) behavior
                prompt_text = f"""
                Generate {question_count} multiple choice questions based on the following text. For each question, provide the question text, a list of options, and the correct answer. Format the output as a JSON array of objects, like this:
                [
                  {{"question": "Question 1 text", "options": ["Option A", "Option B", "Option C", "Option D"], "correct_answer": "Option B"}},
                  {{"question": "Question 2 text", "options": ["Option A", "Option B", "Option C", "Option D"], "correct_answer": "Option C"}}
                ]
                Text: {document.content}
                """
                response = model.generate_content(prompt_text)
                questions_text = response.text
                questions = self._parse_questions(questions_text)
                test = Test.objects.create(
                    document=document,
                    title=f"Test for {document.title}"
                )
                for i, q in enumerate(questions):
                    Question.objects.create(
                        test=test,
                        question_text=q['question'],
                        question_type='multiple_choice',
                        correct_answer=q['correct_answer'],
                        options=q['options'],
                        order=i
                    )
                test.refresh_from_db()
                serialized_test_data = TestSerializer(test).data
                return Response(serialized_test_data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"Error generating test: {e}")
            raise e

    def _parse_questions(self, questions_text):
        # First, strip any leading/trailing whitespace and potential outer quotes
        questions_text = questions_text.strip()
        if questions_text.startswith("'") and questions_text.endswith("'"):
            questions_text = questions_text[1:-1]
        
        # Remove markdown code block delimiters if present
        if questions_text.startswith('```json') and questions_text.endswith('```'):
            questions_text = questions_text[len('```json'):-len('```')].strip()
        elif questions_text.startswith('```') and questions_text.endswith('```'):
            questions_text = questions_text[len('```'):-len('```')].strip()

        print(f"Questions text before JSON load: '{questions_text}'") # Added print
        # Parse the JSON response from Gemini
        try:
            questions_data = json.loads(questions_text)
            parsed_questions = []
            for item in questions_data:
                # Ensure all required fields are present and handle potential missing values
                question_text = item.get('question', '')
                options = item.get('options', [])
                correct_answer = item.get('correct_answer', '')

                # Basic validation for essential fields
                if not question_text or not options or not correct_answer:
                    print(f"Skipping malformed question data: {item}")
                    continue

                # Check if correct_answer is one of the options
                if correct_answer not in options:
                    print(f"Warning: Correct answer \'{correct_answer}\' not found in options for question: {question_text}")
                    # Decide how to handle this: you might skip, log, or attempt to find a close match
                    # For now, we'll keep it as is, but it might lead to issues later if not aligned.

                parsed_questions.append({
                    'question': question_text,
                    'options': options,
                    'correct_answer': correct_answer
                })
            return parsed_questions
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {e}")
            print(f"Raw Gemini response: {questions_text}")
            return [] # Return empty list on parsing failure

    def _parse_qa_questions(self, questions_text):
        questions_text = questions_text.strip()
        if questions_text.startswith("'") and questions_text.endswith("'"):
            questions_text = questions_text[1:-1]
        if questions_text.startswith('```json') and questions_text.endswith('```'):
            questions_text = questions_text[len('```json'):-len('```')].strip()
        elif questions_text.startswith('```') and questions_text.endswith('```'):
            questions_text = questions_text[len('```'):-len('```')].strip()
        try:
            questions_data = json.loads(questions_text)
            parsed_questions = []
            for item in questions_data:
                question_text = item.get('question', '')
                answer = item.get('answer', '')
                if not question_text or not answer:
                    continue
                parsed_questions.append({
                    'question': question_text,
                    'answer': answer
                })
            return parsed_questions
        except json.JSONDecodeError as e:
            print(f"QA JSON parsing error: {e}")
            print(f"Raw Gemini response: {questions_text}")
            return []

class TestViewSet(viewsets.ModelViewSet):
    queryset = Test.objects.all()
    serializer_class = TestSerializer

class TestAttemptViewSet(viewsets.ModelViewSet):
    queryset = TestAttempt.objects.all()
    serializer_class = TestAttemptSerializer

    def create(self, request, *args, **kwargs):
        test_id = request.data.get('test')
        if not test_id:
            return Response(
                {'error': 'Test ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            test = Test.objects.get(id=test_id)
            attempt = TestAttempt.objects.create(test=test)
            return Response(self.get_serializer(attempt).data, status=status.HTTP_201_CREATED)
        except Test.DoesNotExist:
            return Response(
                {'error': 'Test not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        attempt = self.get_object()
        answers_data = request.data.get('answers', [])
        test = attempt.test
        is_qa = all(q.question_type == 'short_answer' for q in test.questions.all())

        # Configure Gemini client only if needed
        if is_qa:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel('gemini-1.5-flash-latest')

        total_score = 0
        for answer_data in answers_data:
            question = Question.objects.get(id=answer_data['questionId'])
            user_answer = answer_data['answer']
            if is_qa and question.question_type == 'short_answer':
                grading_prompt = f"""
                You are an expert grader. Grade the following student's answer to a multi-part question.
                - For each correct part, award 1 point.
                - For each missing or incorrect part, award 0 points.
                - Calculate the total score as (number of correct parts) / (number of expected parts), rounded to the nearest 0.5 (e.g., 0, 0.5, 1).
                - Accept synonyms and paraphrasing as correct.
                - Provide feedback listing which parts were correct, which were missing, and which were incorrect.
                - Output ONLY valid JSON, no markdown, no code block, no explanation.
                Example: {{"score": 0.5, "feedback": "Correct: X, Y. Missing: Z."}}

                Question: {question.question_text}
                Correct Answer: {question.correct_answer}
                Student Answer: {user_answer}
                """
                try:
                    response = model.generate_content(grading_prompt)
                    import json
                    text = response.text.strip()
                    # Try to extract JSON robustly
                    try:
                        result = json.loads(text)
                    except Exception:
                        # Try to extract JSON from within code blocks or after extra text
                        import re
                        match = re.search(r'\{.*\}', text, re.DOTALL)
                        if match:
                            result = json.loads(match.group(0))
                        else:
                            raise ValueError('No valid JSON found in Gemini response')
                    score = float(result.get('score', 0))
                    feedback = result.get('feedback', '')
                except Exception as e:
                    print(f"Gemini grading error: {e}")
                    score = 0
                    feedback = 'Could not evaluate answer. Please ensure your answer is clear and complete.'
                Answer.objects.create(
                    attempt=attempt,
                    question=question,
                    user_answer=user_answer,
                    is_correct=score == 1,
                    score=score,
                    feedback=feedback
                )
                total_score += score
            else:
                is_correct = user_answer == question.correct_answer
                Answer.objects.create(
                    attempt=attempt,
                    question=question,
                    user_answer=user_answer,
                    is_correct=is_correct,
                    score=1 if is_correct else 0,
                    feedback=''
                )
                total_score += 1 if is_correct else 0

        total_questions = test.questions.count()
        if is_qa:
            score = (total_score / total_questions) * 100 if total_questions > 0 else 0
        else:
            correct_answers = attempt.answers.filter(is_correct=True).count()
            score = (correct_answers / total_questions) * 100 if total_questions > 0 else 0

        attempt.score = score
        attempt.completed_at = timezone.now()
        attempt.save()

        return Response(self.get_serializer(attempt).data)

@api_view(['POST'])
@permission_classes([AllowAny])
def contact_view(request):
    name = request.data.get('name')
    email = request.data.get('email')
    message = request.data.get('message')
    if not (name and email and message):
        return Response({'error': 'All fields are required.'}, status=400)
    subject = f'Contact Form Submission from {name}'
    body = f'Name: {name}\nEmail: {email}\nMessage:\n{message}'
    send_mail(subject, body, email, ['ahmedbakhtiar41@gmail.com'])
    return Response({'success': 'Message sent.'})

@api_view(['POST'])
@permission_classes([AllowAny])
def feedback_view(request):
    name = request.data.get('name')
    email = request.data.get('email')
    feedback = request.data.get('feedback')
    if not (name and email and feedback):
        return Response({'error': 'All fields are required.'}, status=400)
    subject = f'Feedback Form Submission from {name}'
    body = f'Name: {name}\nEmail: {email}\nFeedback:\n{feedback}'
    send_mail(subject, body, email, ['ahmedbakhtiar41@gmail.com'])
    return Response({'success': 'Feedback sent.'}) 