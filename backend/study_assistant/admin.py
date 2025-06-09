from django.contrib import admin
from .models import Document, Test, Question, TestAttempt, Answer

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'file_type', 'upload_date', 'status')
    list_filter = ('file_type', 'status')
    search_fields = ('title',)

@admin.register(Test)
class TestAdmin(admin.ModelAdmin):
    list_display = ('title', 'document', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('title',)

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('question_text', 'test', 'question_type', 'order')
    list_filter = ('question_type',)
    search_fields = ('question_text',)

@admin.register(TestAttempt)
class TestAttemptAdmin(admin.ModelAdmin):
    list_display = ('test', 'score', 'started_at', 'completed_at')
    list_filter = ('completed_at',)
    search_fields = ('test__title',)

@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ('attempt', 'question', 'is_correct')
    list_filter = ('is_correct',)
    search_fields = ('question__question_text',) 