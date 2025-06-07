from typing import List, Dict, Any
import openai
from app.core.config import settings
from app.models.test import TestType

class AIService:
    def __init__(self):
        openai.api_key = settings.OPENAI_API_KEY
    
    async def generate_questions(
        self,
        content: str,
        test_type: TestType,
        num_questions: int = 5
    ) -> List[Dict[str, Any]]:
        """Generate questions from document content."""
        prompt = self._create_question_generation_prompt(content, test_type, num_questions)
        
        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert educator creating test questions."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            # Parse the response and structure the questions
            questions = self._parse_questions(response.choices[0].message.content, test_type)
            return questions[:num_questions]
            
        except Exception as e:
            print(f"Error generating questions: {str(e)}")
            return []
    
    def _create_question_generation_prompt(
        self,
        content: str,
        test_type: TestType,
        num_questions: int
    ) -> str:
        """Create a prompt for question generation."""
        prompt = f"""Generate {num_questions} {test_type.value} questions based on the following content:
        
        {content}
        
        For each question, provide:
        1. The question text
        2. The correct answer
        3. A detailed explanation
        4. For multiple choice questions, provide 4 options (A, B, C, D)
        
        Format the response as a JSON array of question objects."""
        
        return prompt
    
    def _parse_questions(self, response: str, test_type: TestType) -> List[Dict[str, Any]]:
        """Parse the AI response into structured question objects."""
        # Implementation would depend on the exact format of the AI response
        # This is a simplified version
        questions = []
        try:
            # Parse the response and create question objects
            # This is a placeholder - actual implementation would parse the AI response
            pass
        except Exception as e:
            print(f"Error parsing questions: {str(e)}")
        
        return questions
    
    async def evaluate_answer(
        self,
        question: str,
        correct_answer: str,
        user_answer: str,
        test_type: TestType
    ) -> Dict[str, Any]:
        """Evaluate a user's answer and provide feedback."""
        prompt = self._create_evaluation_prompt(
            question,
            correct_answer,
            user_answer,
            test_type
        )
        
        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert educator evaluating student answers."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1000
            )
            
            # Parse the response and structure the evaluation
            evaluation = self._parse_evaluation(response.choices[0].message.content)
            return evaluation
            
        except Exception as e:
            print(f"Error evaluating answer: {str(e)}")
            return {
                "is_correct": False,
                "score": 0.0,
                "feedback": "Error evaluating answer. Please try again."
            }
    
    def _create_evaluation_prompt(
        self,
        question: str,
        correct_answer: str,
        user_answer: str,
        test_type: TestType
    ) -> str:
        """Create a prompt for answer evaluation."""
        prompt = f"""Evaluate the following answer for a {test_type.value} question:
        
        Question: {question}
        Correct Answer: {correct_answer}
        User's Answer: {user_answer}
        
        Provide:
        1. Whether the answer is correct (true/false)
        2. A score between 0 and 1
        3. Detailed feedback explaining why the answer is correct or incorrect
        4. Suggestions for improvement if the answer is incorrect
        
        Format the response as a JSON object."""
        
        return prompt
    
    def _parse_evaluation(self, response: str) -> Dict[str, Any]:
        """Parse the AI response into a structured evaluation object."""
        # Implementation would depend on the exact format of the AI response
        # This is a simplified version
        try:
            # Parse the response and create evaluation object
            # This is a placeholder - actual implementation would parse the AI response
            pass
        except Exception as e:
            print(f"Error parsing evaluation: {str(e)}")
            return {
                "is_correct": False,
                "score": 0.0,
                "feedback": "Error parsing evaluation. Please try again."
            } 