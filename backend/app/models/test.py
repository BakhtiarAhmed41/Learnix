from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Boolean, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.base_class import Base

class TestType(enum.Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    TRUE_FALSE = "true_false"
    SHORT_ANSWER = "short_answer"

class Test(Base):
    __tablename__ = "tests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    test_type = Column(Enum(TestType), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relationships
    document = relationship("Document", back_populates="tests")
    user = relationship("User", back_populates="tests")
    questions = relationship("Question", back_populates="test", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Test {self.title}>"

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    question_text = Column(Text, nullable=False)
    correct_answer = Column(Text, nullable=False)
    options = Column(Text)  # JSON string for multiple choice options
    created_at = Column(DateTime, default=datetime.utcnow)
    test_id = Column(Integer, ForeignKey("tests.id"), nullable=False)

    # Relationships
    test = relationship("Test", back_populates="questions")
    user_answers = relationship("UserAnswer", back_populates="question", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Question {self.id}>"

class UserAnswer(Base):
    __tablename__ = "user_answers"

    id = Column(Integer, primary_key=True, index=True)
    answer_text = Column(Text, nullable=False)
    is_correct = Column(Boolean)
    created_at = Column(DateTime, default=datetime.utcnow)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relationships
    question = relationship("Question", back_populates="user_answers")
    user = relationship("User", back_populates="answers")

    def __repr__(self):
        return f"<UserAnswer {self.id}>" 