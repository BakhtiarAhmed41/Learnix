from rest_framework import serializers
from .models import Document, Test, Question, TestAttempt, Answer

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id', 'title', 'file_type', 'upload_date', 'status']

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'question_text', 'question_type', 'options', 'correct_answer', 'order']

class TestSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Test
        fields = ['id', 'document', 'title', 'created_at', 'questions']

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'question', 'user_answer', 'is_correct']

class TestAttemptSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True)

    class Meta:
        model = TestAttempt
        fields = ['id', 'test', 'score', 'started_at', 'completed_at', 'answers'] 