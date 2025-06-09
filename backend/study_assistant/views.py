from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from .models import Document, Test, Question, TestAttempt, Answer
from .serializers import (
    DocumentSerializer, TestSerializer, QuestionSerializer,
    TestAttemptSerializer, AnswerSerializer
)
import openai
from django.conf import settings
from django.utils import timezone
import os

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

        # Create document
        document = Document.objects.create(
            title=title,
            file=file,
            file_type=file_type,
            status='processed',
            content="Sample content for testing"
        )

        serializer = self.get_serializer(document)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def generate_test(self, request, pk=None):
        document = self.get_object()
        
        # Initialize OpenAI client
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        
        try:
            # Generate questions using OpenAI
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that generates educational test questions."},
                    {"role": "user", "content": f"Generate 5 multiple choice questions based on this text: {document.content}"}
                ],
                temperature=0.7,
            )
            
            # Parse the response and create questions
            questions_text = response.choices[0].message.content
            questions = self._parse_questions(questions_text)
            
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
            
            return Response(TestSerializer(test).data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _parse_questions(self, questions_text):
        # This is a simple parser - you might want to make it more robust
        questions = []
        current_question = None
        
        for line in questions_text.split('\n'):
            line = line.strip()
            if not line:
                continue
                
            if line.startswith(('1.', '2.', '3.', '4.', '5.')):
                if current_question:
                    questions.append(current_question)
                current_question = {
                    'question': line[2:].strip(),
                    'options': [],
                    'correct_answer': None
                }
            elif line.startswith(('a)', 'b)', 'c)', 'd)')):
                option = line[2:].strip()
                current_question['options'].append(option)
                if line.endswith('(correct)'):
                    current_question['correct_answer'] = option.replace('(correct)', '').strip()
        
        if current_question:
            questions.append(current_question)
            
        return questions

class TestViewSet(viewsets.ModelViewSet):
    queryset = Test.objects.all()
    serializer_class = TestSerializer

class TestAttemptViewSet(viewsets.ModelViewSet):
    queryset = TestAttempt.objects.all()
    serializer_class = TestAttemptSerializer

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