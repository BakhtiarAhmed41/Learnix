from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from app.models.test import TestType

class QuestionBase(BaseModel):
    question_text: str
    correct_answer: str
    options: Optional[str] = None  # JSON string for multiple choice options

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(QuestionBase):
    pass

class Question(QuestionBase):
    id: int
    created_at: datetime
    test_id: int

    class Config:
        from_attributes = True

class TestBase(BaseModel):
    title: str
    description: Optional[str] = None
    test_type: TestType

class TestCreate(TestBase):
    document_id: int
    num_questions: int = 5  # Default to 5 questions if not specified

class TestUpdate(TestBase):
    pass

class Test(TestBase):
    id: int
    created_at: datetime
    updated_at: datetime
    document_id: int
    user_id: int
    questions: List[Question] = []

    class Config:
        from_attributes = True

class UserAnswerBase(BaseModel):
    answer_text: str
    question_id: int

class UserAnswerCreate(UserAnswerBase):
    pass

class UserAnswerUpdate(UserAnswerBase):
    is_correct: Optional[bool] = None

class UserAnswer(UserAnswerBase):
    id: int
    is_correct: Optional[bool]
    created_at: datetime
    user_id: int

    class Config:
        from_attributes = True 