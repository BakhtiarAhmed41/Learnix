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

# ... after imports, before any class or function ...
TEST_CACHE = {}

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

    def _extract_main_content(self, content):
        """
        Extract and prioritize the main content from the document, removing metadata and focusing on key concepts.
        """
        # Configure Gemini for content analysis
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        
        analysis_prompt = f"""
        You are an expert content analyst with deep expertise in educational content extraction and analysis. Your task is to extract ONLY the core educational content from the provided text.

        CRITICAL EXTRACTION GUIDELINES:
        
        REMOVE COMPLETELY:
        - Copyright notices, edition information, publisher details
        - Page numbers, headers, footers, formatting artifacts
        - Bibliographic references, citations, footnotes
        - Administrative metadata, ISBN numbers, publication dates
        - Table of contents, index entries, appendices
        - Any non-educational or procedural content
        - Watermarks, headers, or document identifiers

        EXTRACT AND PRIORITIZE BY IMPORTANCE:
        1. Core Concepts and Theories (Highest Priority)
           - Fundamental principles and definitions
           - Key theoretical frameworks
           - Essential concepts that form the foundation

        2. Advanced Concepts and Applications
           - Complex theories and their applications
           - Problem-solving methodologies
           - Analytical frameworks and models

        3. Mathematical and Quantitative Content
           - Mathematical formulas, equations, and calculations
           - Statistical concepts and procedures
           - Numerical data, percentages, ratios, and relationships
           - Mathematical proofs and derivations

        4. Critical Insights and Conclusions
           - Important findings and conclusions
           - Cause-and-effect relationships
           - Comparative analyses and evaluations

        5. Practical Applications and Examples
           - Real-world applications of concepts
           - Case studies and examples
           - Problem-solving scenarios

        ORGANIZATION REQUIREMENTS:
        - Maintain logical flow and coherence
        - Preserve relationships between concepts
        - Ensure completeness of extracted content
        - Remove redundancy while keeping essential information

        Original content:
        {content}

        Return ONLY the cleaned, organized, and prioritized educational content:
        """
        
        try:
            response = model.generate_content(analysis_prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Error extracting main content: {e}")
            # Fallback to original content if analysis fails
            return content

    def _detect_numerical_content(self, content):
        """
        Detect if the content contains numerical or mathematical elements that could be used for numerical questions.
        """
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        
        detection_prompt = f"""
        You are an expert mathematical content analyst. Perform a comprehensive analysis of the following content to identify ALL numerical and mathematical elements suitable for assessment questions.

        COMPREHENSIVE DETECTION CRITERIA:

        MATHEMATICAL ELEMENTS:
        - Mathematical formulas, equations, and expressions
        - Algebraic operations and manipulations
        - Calculus concepts (derivatives, integrals, limits)
        - Geometric principles and calculations
        - Statistical formulas and procedures
        - Probability calculations and distributions
        - Linear algebra concepts and matrices
        - Trigonometry and trigonometric functions
        - Financial mathematics (interest, annuities, etc.)
        - Physics formulas and calculations
        - Chemistry equations and stoichiometry

        NUMERICAL CONTENT:
        - Raw numerical data and measurements
        - Percentages, ratios, and proportions
        - Statistical data and distributions
        - Time series and sequences
        - Quantified relationships and correlations
        - Measurement units and conversions
        - Precision and significant figures
        - Error analysis and uncertainty

        PROBLEM-SOLVING SCENARIOS:
        - Word problems with numerical solutions
        - Multi-step calculation procedures
        - Optimization problems
        - Data analysis and interpretation
        - Graph and chart analysis
        - Pattern recognition in numbers
        - Algorithmic procedures
        - Computational methods

        Content to analyze:
        {content}

        Respond with ONLY a comprehensive JSON object:
        {{
            "has_numerical_content": true/false,
            "numerical_elements": ["detailed list of specific numerical elements found"],
            "mathematical_concepts": ["comprehensive list of mathematical concepts present"],
            "suitable_for_calculation": true/false,
            "complexity_level": "basic/intermediate/advanced",
            "question_potential": ["types of numerical questions that can be generated"],
            "mathematical_domains": ["algebra", "calculus", "statistics", "geometry", etc.]
        }}
        """
        
        try:
            response = model.generate_content(detection_prompt)
            import json
            import re
            
            text = response.text.strip()
            # Try to extract JSON robustly
            try:
                result = json.loads(text)
            except Exception:
                # Try to extract JSON from within code blocks or after extra text
                match = re.search(r'\{.*\}', text, re.DOTALL)
                if match:
                    result = json.loads(match.group(0))
                else:
                    return {
                        "has_numerical_content": False, 
                        "numerical_elements": [], 
                        "mathematical_concepts": [], 
                        "suitable_for_calculation": False,
                        "complexity_level": "basic",
                        "question_potential": [],
                        "mathematical_domains": []
                    }
            
            return result
        except Exception as e:
            print(f"Error detecting numerical content: {e}")
            return {
                "has_numerical_content": False, 
                "numerical_elements": [], 
                "mathematical_concepts": [], 
                "suitable_for_calculation": False,
                "complexity_level": "basic",
                "question_potential": [],
                "mathematical_domains": []
            }

    def _analyze_content_complexity(self, content):
        """
        Analyze the complexity and depth of the content to determine appropriate question difficulty.
        """
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        
        analysis_prompt = f"""
        You are an expert educational content analyst. Analyze the following content to determine its complexity, depth, and educational value.

        ANALYSIS CRITERIA:

        CONCEPTUAL COMPLEXITY:
        - Number of interconnected concepts
        - Abstract vs. concrete concepts
        - Prerequisite knowledge requirements
        - Cognitive load and mental models required

        THEORETICAL DEPTH:
        - Theoretical frameworks presented
        - Abstract reasoning requirements
        - Synthesis and evaluation demands
        - Critical thinking requirements

        PRACTICAL APPLICATION:
        - Real-world application complexity
        - Problem-solving sophistication
        - Analytical thinking requirements
        - Creative application demands

        CONTENT STRUCTURE:
        - Logical organization and flow
        - Hierarchical concept relationships
        - Cross-referencing and integration
        - Progressive complexity build-up

        Content to analyze:
        {content}

        Respond with ONLY a JSON object:
        {{
            "overall_complexity": "basic/intermediate/advanced/expert",
            "conceptual_depth": "shallow/moderate/deep/profound",
            "theoretical_sophistication": "low/medium/high/expert",
            "practical_complexity": "simple/moderate/complex/expert",
            "cognitive_demands": ["list of cognitive skills required"],
            "prerequisites": ["list of prerequisite knowledge"],
            "suitable_difficulty_levels": ["list of appropriate difficulty levels"],
            "question_diversity_potential": "low/medium/high/excellent"
        }}
        """
        
        try:
            response = model.generate_content(analysis_prompt)
            import json
            import re
            
            text = response.text.strip()
            try:
                result = json.loads(text)
            except Exception:
                match = re.search(r'\{.*\}', text, re.DOTALL)
                if match:
                    result = json.loads(match.group(0))
                else:
                    return {
                        "overall_complexity": "intermediate",
                        "conceptual_depth": "moderate",
                        "theoretical_sophistication": "medium",
                        "practical_complexity": "moderate",
                        "cognitive_demands": ["comprehension", "application"],
                        "prerequisites": [],
                        "suitable_difficulty_levels": ["easy", "medium"],
                        "question_diversity_potential": "medium"
                    }
            
            return result
        except Exception as e:
            print(f"Error analyzing content complexity: {e}")
            return {
                "overall_complexity": "intermediate",
                "conceptual_depth": "moderate",
                "theoretical_sophistication": "medium",
                "practical_complexity": "moderate",
                "cognitive_demands": ["comprehension", "application"],
                "prerequisites": [],
                "suitable_difficulty_levels": ["easy", "medium"],
                "question_diversity_potential": "medium"
            }

    def _validate_question_quality(self, questions, content, difficulty):
        """
        Validate and improve the quality of generated questions to ensure they meet high standards.
        """
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        
        validation_prompt = f"""
        You are an expert educational assessment validator. Review and validate the following questions to ensure they meet the highest standards of educational quality.

        VALIDATION CRITERIA:

        CONTENT VALIDITY:
        - Questions must be directly related to the provided content
        - No questions about metadata, formatting, or administrative details
        - Questions should test understanding of core concepts
        - Avoid trivial or superficial questions

        COGNITIVE DEMANDS:
        - Questions should require appropriate level of thinking
        - Avoid simple recall questions unless testing fundamental concepts
        - Encourage analysis, synthesis, and evaluation
        - Test application of knowledge to new situations

        CLARITY AND PRECISION:
        - Questions must be unambiguous and clear
        - Avoid vague or confusing language
        - Ensure questions have single, correct interpretations
        - Use precise, academic language

        DIFFICULTY APPROPRIATENESS:
        - Questions should match the specified difficulty level
        - Easy: Basic comprehension and recall
        - Medium: Application and analysis
        - Hard: Synthesis, evaluation, and complex problem-solving

        OPTION QUALITY (for MCQs):
        - All options must be plausible
        - Avoid obvious wrong answers
        - Distractors should test common misconceptions
        - Options should be similar in length and complexity

        NUMERICAL ACCURACY (for numerical questions):
        - Calculations must be mathematically correct
        - Formulas must be applied properly
        - Units must be consistent and appropriate
        - Answers must be reasonable and realistic

        Original content:
        {content}

        Questions to validate:
        {questions}

        Difficulty level: {difficulty}

        For each question, provide:
        1. Quality score (1-10)
        2. Specific issues found (if any)
        3. Suggested improvements (if needed)
        4. Overall assessment

        Return ONLY valid JSON:
        {{
            "overall_quality_score": 8.5,
            "questions_analysis": [
                {{
                    "question_index": 0,
                    "quality_score": 9,
                    "issues": [],
                    "improvements": [],
                    "assessment": "Excellent question"
                }}
            ],
            "recommendations": ["list of general recommendations"],
            "passes_validation": true/false
        }}
        """
        
        try:
            response = model.generate_content(validation_prompt)
            import json
            import re
            
            text = response.text.strip()
            try:
                result = json.loads(text)
            except Exception:
                match = re.search(r'\{.*\}', text, re.DOTALL)
                if match:
                    result = json.loads(match.group(0))
                else:
                    return {
                        "overall_quality_score": 7.0,
                        "questions_analysis": [],
                        "recommendations": ["Ensure questions are content-focused"],
                        "passes_validation": True
                    }
            
            return result
        except Exception as e:
            print(f"Error validating questions: {e}")
            return {
                "overall_quality_score": 7.0,
                "questions_analysis": [],
                "recommendations": ["Ensure questions are content-focused"],
                "passes_validation": True
            }

    @action(detail=True, methods=['post'])
    def generate_test(self, request, pk=None):
        global TEST_CACHE
        document = self.get_object()
        exam_type = request.data.get('exam_type', 'mcq')
        question_count = int(request.data.get('question_count', 5))
        difficulty = request.data.get('difficulty', 'medium')
        time_limit = int(request.data.get('time_limit', 30))

        # Check cache first
        cache_key = f"{document.id}:{exam_type}:{question_count}:{difficulty}"
        if cache_key in TEST_CACHE:
            return Response(TEST_CACHE[cache_key], status=status.HTTP_201_CREATED)

        # Step 1: Extract and analyze main content (short prompt)
        main_content = self._extract_main_content(document.content)
        
        # Step 2: Detect numerical content (short prompt)
        numerical_analysis = self._detect_numerical_content(main_content)
        has_numerical = numerical_analysis.get('has_numerical_content', False)
        numerical_elements = numerical_analysis.get('numerical_elements', [])
        mathematical_concepts = numerical_analysis.get('mathematical_concepts', [])
        complexity_level = numerical_analysis.get('complexity_level', 'basic')
        question_potential = numerical_analysis.get('question_potential', [])
        mathematical_domains = numerical_analysis.get('mathematical_domains', [])
        
        # Step 3: Analyze content complexity
        complexity_analysis = self._analyze_content_complexity(main_content)
        overall_complexity = complexity_analysis.get('overall_complexity', 'intermediate')
        conceptual_depth = complexity_analysis.get('conceptual_depth', 'moderate')
        cognitive_demands = complexity_analysis.get('cognitive_demands', [])
        question_diversity = complexity_analysis.get('question_diversity_potential', 'medium')

        # Configure Gemini client
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash-latest')

        try:
            max_retries = 5
            all_questions = []
            seen_questions = set()
            retries = 0
            remaining = question_count

            def is_duplicate(q, existing):
                # Simple duplicate check by question text
                return any(q['question'].strip().lower() == ex['question'].strip().lower() for ex in existing)

            while len(all_questions) < question_count and retries < max_retries:
                to_generate = question_count - len(all_questions)
                if exam_type == 'qa':
                    prompt_text = f"""
                    Generate {to_generate} open-ended questions and answers from the content below. Only include numerical/math questions if relevant. Double-check all answers and calculations.
                    Do NOT generate questions that require referring to tables, figures, images, or any specific part of the document that is not included in the question itself. All questions must be fully self-contained and answerable without access to the original document.
                    Do not repeat any of these questions: {[q['question'] for q in all_questions]}
                    Content:
                    {main_content}
                    Output as JSON: [{{"question": "...", "answer": "..."}}, ...]
                    """
                    response = model.generate_content(prompt_text)
                    questions_text = response.text
                    new_questions = self._parse_qa_questions(questions_text)
                    # Deduplicate
                    new_questions = [q for q in new_questions if not is_duplicate(q, all_questions)]
                    # Only keep valid
                    new_questions = [q for q in new_questions if q.get('question') and q.get('answer')]
                    all_questions.extend(new_questions)
                else:
                    prompt_text = f"""
                    Generate {to_generate} multiple-choice questions (MCQs) from the content below. 
                    Each question must have:
                    - a 'question' field (string),
                    - an 'options' field (list of 4 strings, labeled A, B, C, D),
                    - a 'correct_answer' field (the FULL TEXT of the correct option, not just a letter).
                    Do NOT generate open-ended or short-answer questions. Only generate MCQs.
                    Do NOT generate questions that require referring to tables, figures, images, or any specific part of the document that is not included in the question itself. All questions must be fully self-contained and answerable without access to the original document.
                    Do not repeat any of these questions: {[q['question'] for q in all_questions]}
                    Content:
                    {main_content}
                    Output as JSON: [{{"question": "...", "options": ["Option A", "Option B", "Option C", "Option D"], "correct_answer": "The full text of the correct option"}}, ...]
                    """
                    response = model.generate_content(prompt_text)
                    questions_text = response.text
                    new_questions = self._parse_questions(questions_text)
                    # Deduplicate
                    new_questions = [q for q in new_questions if not is_duplicate(q, all_questions)]
                    # Only keep valid
                    new_questions = [q for q in new_questions if all(k in q and q[k] for k in ['question', 'options', 'correct_answer'])]
                    all_questions.extend(new_questions)
                retries += 1
                if len(new_questions) == 0:
                    break  # Avoid infinite loop if model can't generate more

            questions = all_questions[:question_count]

            # Fallback to QA if MCQ fails completely
            if len(questions) == 0 and exam_type != 'qa':
                print("MCQ generation failed after retries, falling back to QA.")
                retries = 0
                while len(questions) < question_count and retries < max_retries:
                    to_generate = question_count - len(questions)
                    prompt_text = f"""
                    Generate {to_generate} open-ended questions and answers from the content below. Only include numerical/math questions if relevant. Double-check all answers and calculations.
                    Do NOT generate questions that require referring to tables, figures, images, or any specific part of the document that is not included in the question itself. All questions must be fully self-contained and answerable without access to the original document.
                    Do not repeat any of these questions: {[q['question'] for q in questions]}
                    Content:
                    {main_content}
                    Output as JSON: [{{"question": "...", "answer": "..."}}, ...]
                    """
                    response = model.generate_content(prompt_text)
                    questions_text = response.text
                    new_questions = self._parse_qa_questions(questions_text)
                    new_questions = [q for q in new_questions if not is_duplicate(q, questions)]
                    new_questions = [q for q in new_questions if q.get('question') and q.get('answer')]
                    # Convert QA to MCQ-like dicts for uniformity
                    new_questions = [
                        {'question': q['question'], 'options': [], 'correct_answer': q['answer']} for q in new_questions
                    ]
                    questions.extend(new_questions)
                    retries += 1
                    if len(new_questions) == 0:
                        break

            if len(questions) == 0:
                return Response({
                    'error': "Sorry, we couldn't generate any questions from this document. Try a different document or reduce the number of questions."
                }, status=status.HTTP_400_BAD_REQUEST)

            # Log the number of questions generated
            print(f"Generated {len(questions)} questions out of {question_count} requested")

            test = Test.objects.create(
                document=document,
                title=f"Test for {document.title}"
            )
            for i, q in enumerate(questions):
                if exam_type == 'qa':
                    if not all(k in q for k in ['question', 'answer']):
                        print(f"Skipping malformed QA question: {q}")
                        continue
                    Question.objects.create(
                        test=test,
                        question_text=q['question'],
                        question_type='short_answer',
                        correct_answer=q['answer'],
                        options=[],
                        order=i
                    )
                else:
                    if not all(k in q for k in ['question', 'options', 'correct_answer']):
                        print(f"Skipping malformed MCQ question: {q}")
                        continue
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
            TEST_CACHE[cache_key] = serialized_test_data
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
                    print(f"Warning: Correct answer '{correct_answer}' not found in options for question: {question_text}")
                    # Decide how to handle this: you might skip, log, or attempt to find a close match
                    # For now, we'll keep it as is, but it might lead to issues later if not aligned.

                parsed_questions.append({
                    'question': question_text,
                    'options': options,
                    'correct_answer': correct_answer
                })
            
            print(f"Successfully parsed {len(parsed_questions)} questions from AI response")
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
        # Prevent duplicate submissions
        if attempt.answers.exists():
            return Response(self.get_serializer(attempt).data)
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
                # Check if the question involves numerical content
                is_numerical_question = any(keyword in question.question_text.lower() for keyword in 
                    ['calculate', 'compute', 'solve', 'find', 'determine', 'evaluate', 'formula', 'equation', 'percentage', 'ratio'])
                
                grading_prompt = f"""
                You are an expert educator grading a student's answer to an open-ended question. Your role is to assess understanding, not just keyword matching.

                {"NUMERICAL QUESTION DETECTION: This appears to be a numerical/mathematical question." if is_numerical_question else ""}

                GRADING CRITERIA:
                1. Conceptual Understanding (40%): Does the answer demonstrate grasp of the core concepts?
                2. Accuracy (30%): Are the facts, details, and calculations correct?
                3. Completeness (20%): Does the answer address all parts of the question?
                4. Clarity (10%): Is the answer well-articulated and logical?

                {"NUMERICAL GRADING GUIDELINES:" if is_numerical_question else ""}
                {"- Check if calculations are mathematically correct" if is_numerical_question else ""}
                {"- Verify that formulas are applied correctly" if is_numerical_question else ""}
                {"- Ensure units are properly included and consistent" if is_numerical_question else ""}
                {"- Accept different but valid mathematical approaches" if is_numerical_question else ""}
                {"- Give partial credit for correct setup even if final calculation has errors" if is_numerical_question else ""}

                SCORING SYSTEM:
                - 1.0 (Excellent): Demonstrates deep understanding, accurate, complete, and clear
                - 0.75 (Good): Shows good understanding with minor gaps or inaccuracies
                - 0.5 (Fair): Shows basic understanding but missing key elements
                - 0.25 (Poor): Shows minimal understanding with significant gaps
                - 0.0 (Incorrect): Shows misunderstanding or completely off-topic

                EVALUATION GUIDELINES:
                - Accept synonyms, paraphrasing, and different ways of expressing the same concept
                - Focus on understanding rather than exact wording
                - Consider partial credit for partially correct answers
                - Provide constructive feedback that helps the student learn
                - Be encouraging while maintaining academic standards
                {"- For numerical questions, check both the mathematical process and final answer" if is_numerical_question else ""}
                {"- Accept reasonable rounding differences in numerical answers" if is_numerical_question else ""}

                Question: {question.question_text}
                Expected Answer: {question.correct_answer}
                Student Answer: {user_answer}

                Output ONLY valid JSON in this exact format:
                {{"score": 0.75, "feedback": "Your answer shows good understanding of the main concept. You correctly identified X and Y. However, you missed Z which is important for complete understanding. Consider how A relates to B for a more comprehensive answer."}}
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
                    is_correct=score >= 0.75,  # Consider 75%+ as correct
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