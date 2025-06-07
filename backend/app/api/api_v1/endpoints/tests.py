from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.models.document import Document
from app.models.test import Test, Question, UserAnswer, TestType
from app.schemas.test import (
    Test as TestSchema,
    TestCreate,
    TestUpdate,
    Question as QuestionSchema,
    QuestionCreate,
    QuestionUpdate,
    UserAnswer as UserAnswerSchema,
    UserAnswerCreate,
    UserAnswerUpdate
)
from app.services.ai_service import AIService

router = APIRouter()

@router.post("/", response_model=TestSchema)
def create_test(
    *,
    db: Session = Depends(deps.get_db),
    test_in: TestCreate,
    current_user = Depends(deps.get_current_user)
):
    """
    Create new test.
    """
    test = Test(
        **test_in.dict(),
        user_id=current_user.id
    )
    db.add(test)
    db.commit()
    db.refresh(test)
    return test

@router.get("/", response_model=List[TestSchema])
def read_tests(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(deps.get_current_user)
):
    """
    Retrieve tests.
    """
    tests = db.query(Test).filter(Test.user_id == current_user.id).offset(skip).limit(limit).all()
    return tests

@router.get("/{test_id}", response_model=TestSchema)
def read_test(
    *,
    db: Session = Depends(deps.get_db),
    test_id: int,
    current_user = Depends(deps.get_current_user)
):
    """
    Get test by ID.
    """
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    if test.user_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    return test

@router.put("/{test_id}", response_model=TestSchema)
def update_test(
    *,
    db: Session = Depends(deps.get_db),
    test_id: int,
    test_in: TestUpdate,
    current_user = Depends(deps.get_current_user)
):
    """
    Update test.
    """
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    if test.user_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    for field, value in test_in.dict(exclude_unset=True).items():
        setattr(test, field, value)
    
    db.add(test)
    db.commit()
    db.refresh(test)
    return test

@router.delete("/{test_id}", response_model=TestSchema)
def delete_test(
    *,
    db: Session = Depends(deps.get_db),
    test_id: int,
    current_user = Depends(deps.get_current_user)
):
    """
    Delete test.
    """
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    if test.user_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    db.delete(test)
    db.commit()
    return test

# Question endpoints
@router.post("/{test_id}/questions/", response_model=QuestionSchema)
def create_question(
    *,
    db: Session = Depends(deps.get_db),
    test_id: int,
    question_in: QuestionCreate,
    current_user = Depends(deps.get_current_user)
):
    """
    Create new question for a test.
    """
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    if test.user_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    question = Question(**question_in.dict(), test_id=test_id)
    db.add(question)
    db.commit()
    db.refresh(question)
    return question

@router.get("/{test_id}/questions/", response_model=List[QuestionSchema])
def read_questions(
    *,
    db: Session = Depends(deps.get_db),
    test_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(deps.get_current_user)
):
    """
    Retrieve questions for a test.
    """
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    if test.user_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    questions = db.query(Question).filter(Question.test_id == test_id).offset(skip).limit(limit).all()
    return questions

# User Answer endpoints
@router.post("/questions/{question_id}/answers/", response_model=UserAnswerSchema)
def create_answer(
    *,
    db: Session = Depends(deps.get_db),
    question_id: int,
    answer_in: UserAnswerCreate,
    current_user = Depends(deps.get_current_user)
):
    """
    Create new answer for a question.
    """
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    answer = UserAnswer(**answer_in.dict(), user_id=current_user.id)
    db.add(answer)
    db.commit()
    db.refresh(answer)
    return answer

@router.get("/questions/{question_id}/answers/", response_model=List[UserAnswerSchema])
def read_answers(
    *,
    db: Session = Depends(deps.get_db),
    question_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(deps.get_current_user)
):
    """
    Retrieve answers for a question.
    """
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    answers = db.query(UserAnswer).filter(
        UserAnswer.question_id == question_id,
        UserAnswer.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    return answers

@router.post("/generate", response_model=TestSchema)
async def generate_test(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    test_in: TestCreate,
) -> Any:
    """
    Generate a new test from a document.
    """
    # Get the document
    document = db.query(Document).filter(
        Document.id == test_in.document_id,
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )
    
    # Initialize AI service
    ai_service = AIService()
    
    try:
        # Generate questions using AI
        questions = await ai_service.generate_questions(
            content=document.content,
            test_type=test_in.test_type,
            num_questions=test_in.num_questions
        )
        
        # Create test record
        test = Test(
            title=test_in.title,
            description=test_in.description,
            test_type=test_in.test_type,
            document_id=document.id,
            user_id=current_user.id
        )
        db.add(test)
        db.flush()  # Get test ID without committing
        
        # Create question records
        for q in questions:
            question = Question(
                question_text=q["question_text"],
                question_type=q["question_type"],
                correct_answer=q["correct_answer"],
                explanation=q["explanation"],
                options=q.get("options"),
                points=q.get("points", 1.0),
                test_id=test.id
            )
            db.add(question)
        
        db.commit()
        db.refresh(test)
        return test
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Error generating test: {str(e)}"
        )

@router.get("/", response_model=List[TestSchema])
def list_tests(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve tests for the current user.
    """
    tests = db.query(Test).filter(
        Test.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    return tests

@router.get("/{test_id}", response_model=TestSchema)
def get_test(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    test_id: int,
) -> Any:
    """
    Get a specific test by ID.
    """
    test = db.query(Test).filter(
        Test.id == test_id,
        Test.user_id == current_user.id
    ).first()
    
    if not test:
        raise HTTPException(
            status_code=404,
            detail="Test not found"
        )
    
    return test

@router.post("/{test_id}/submit", response_model=List[UserAnswerSchema])
async def submit_answers(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    test_id: int,
    answers: List[UserAnswerCreate],
) -> Any:
    """
    Submit answers for a test and get evaluation.
    """
    # Get the test
    test = db.query(Test).filter(
        Test.id == test_id,
        Test.user_id == current_user.id
    ).first()
    
    if not test:
        raise HTTPException(
            status_code=404,
            detail="Test not found"
        )
    
    # Initialize AI service
    ai_service = AIService()
    
    try:
        user_answers = []
        for answer in answers:
            # Get the question
            question = db.query(Question).filter(
                Question.id == answer.question_id,
                Question.test_id == test_id
            ).first()
            
            if not question:
                raise HTTPException(
                    status_code=404,
                    detail=f"Question {answer.question_id} not found"
                )
            
            # Evaluate the answer
            evaluation = await ai_service.evaluate_answer(
                question=question.question_text,
                correct_answer=question.correct_answer,
                user_answer=answer.answer_text,
                question_type=question.question_type
            )
            
            # Create user answer record
            user_answer = UserAnswer(
                answer_text=answer.answer_text,
                is_correct=evaluation["is_correct"],
                score=evaluation["score"],
                feedback=evaluation["feedback"],
                question_id=question.id,
                user_id=current_user.id
            )
            db.add(user_answer)
            user_answers.append(user_answer)
        
        db.commit()
        for answer in user_answers:
            db.refresh(answer)
        
        return user_answers
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Error evaluating answers: {str(e)}"
        ) 