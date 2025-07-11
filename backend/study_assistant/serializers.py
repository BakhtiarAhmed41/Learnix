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
    question_text = serializers.CharField(source='question.question_text', read_only=True)
    correct_answer = serializers.CharField(source='question.correct_answer', read_only=True)
    score = serializers.FloatField(read_only=True)
    feedback = serializers.CharField(read_only=True)

    class Meta:
        model = Answer
        fields = ['id', 'question', 'question_text', 'user_answer', 'is_correct', 'correct_answer', 'score', 'feedback']

class TestAttemptSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True)
    test = TestSerializer(read_only=True)

    class Meta:
        model = TestAttempt
        fields = ['id', 'test', 'score', 'started_at', 'completed_at', 'answers'] 