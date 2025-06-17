from rest_framework import viewsets, status
from rest_framework.decorators import action
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
        
        # Configure Gemini client
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash-latest') # Using gemini-1.5-flash-latest for text generation
        
        try:
            # Generate questions using Gemini
            print(f"Document content: {document.content}") # Temporarily added for debugging
            # Updated prompt to request JSON output with explicit correct answers
            prompt_text = f"""
            Generate 5 multiple choice questions based on the following text.
            For each question, provide the question text, a list of options, and the correct answer.
            Format the output as a JSON array of objects, like this:
            [
              {{"question": "Question 1 text", "options": ["Option A", "Option B", "Option C", "Option D"], "correct_answer": "Option B"}},
              {{"question": "Question 2 text", "options": ["Option A", "Option B", "Option C", "Option D"], "correct_answer": "Option C"}}
            ]

            Text: {document.content}
            """
            response = model.generate_content(prompt_text)
            
            # Parse the response and create questions
            questions_text = response.text
            questions = self._parse_questions(questions_text)
            print(f"Parsed questions from Gemini: {questions}") # Added print
            
            # Create test
            test = Test.objects.create(
                document=document,
                title=f"Test for {document.title}"
            )
            
            # Create questions
            for i, q in enumerate(questions):
                Question.objects.create(
                    test=test,
                    question_text=q['question'],
                    question_type='multiple_choice',
                    correct_answer=q['correct_answer'],
                    options=q['options'],
                    order=i
                )
            
            # Refresh the test object to include the newly created questions
            test.refresh_from_db()
            print(f"Number of questions after refresh: {test.questions.count()}") # Added print

            serialized_test_data = TestSerializer(test).data
            print(f"Serialized Test Data: {serialized_test_data}") # Print the serialized data

            return Response(serialized_test_data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"Error generating test: {e}") # Log the error for debugging
            raise e # Re-raise the exception to get a full traceback in the console

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
        
        # Create answers
        for answer_data in answers_data:
            question = Question.objects.get(id=answer_data['questionId'])
            is_correct = answer_data['answer'] == question.correct_answer
            
            Answer.objects.create(
                attempt=attempt,
                question=question,
                user_answer=answer_data['answer'],
                is_correct=is_correct
            )
        
        # Calculate score
        total_questions = attempt.test.questions.count()
        correct_answers = attempt.answers.filter(is_correct=True).count()
        score = (correct_answers / total_questions) * 100 if total_questions > 0 else 0
        
        # Update attempt
        attempt.score = score
        attempt.completed_at = timezone.now()
        attempt.save()
        
        return Response(self.get_serializer(attempt).data) 