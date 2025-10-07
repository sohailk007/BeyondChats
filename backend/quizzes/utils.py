import json
import google.generativeai as genai
from django.conf import settings
from documents.models import Document, DocumentChunk
from .models import Quiz, Question

# Configure Gemini
genai.configure(api_key=settings.GOOGLE_API_KEY)

def generate_quiz_questions(document_id, quiz_type, questions_count, user, difficulty='medium'):
    """
    Generate quiz questions using Gemini AI
    """
    try:
        document = Document.objects.get(id=document_id, user=user)
        
        if not document.processed:
            raise ValueError("Document is not processed yet")
        
        # Get relevant content from document
        chunks = DocumentChunk.objects.filter(document=document).order_by('chunk_index')[:15]
        content = "\n".join([chunk.content for chunk in chunks])
        
        # Create prompt based on quiz type
        prompt = create_quiz_prompt(content, quiz_type, questions_count, difficulty)
        
        # Generate questions using Gemini
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(prompt)
        
        # Parse response
        quiz_data = parse_quiz_response(response.text, quiz_type)
        
        # Create quiz in database
        return create_quiz_from_data(quiz_data, document, quiz_type, questions_count, difficulty)
        
    except Exception as e:
        raise Exception(f"Error generating quiz: {str(e)}")

def create_quiz_prompt(content, quiz_type, questions_count, difficulty):
    """
    Create a detailed prompt for quiz generation
    """
    base_prompt = f"""
    You are an expert educational content creator. Generate {questions_count} {quiz_type.upper()} questions 
    based on the following educational content from a Physics textbook. Difficulty level: {difficulty}.
    
    CONTENT:
    {content[:8000]}  # Limit content length
    
    REQUIREMENTS:
    """
    
    if quiz_type == 'mcq':
        base_prompt += """
        - Create multiple choice questions with exactly 4 options (A, B, C, D)
        - Each question should have one clear correct answer
        - Options should be plausible but only one is correct
        - Include explanation for why the correct answer is right
        - Mark the difficulty level
        - Identify the main topic of each question
        """
        
        output_format = """
        Return ONLY valid JSON in this exact format:
        {
            "questions": [
                {
                    "question_text": "clear question here",
                    "option_a": "option A text",
                    "option_b": "option B text", 
                    "option_c": "option C text",
                    "option_d": "option D text",
                    "correct_answer": "a" (or b, c, d),
                    "explanation": "detailed explanation of correct answer",
                    "topic": "main topic name"
                }
            ]
        }
        """
    
    elif quiz_type == 'saq':
        base_prompt += """
        - Create short answer questions that require 2-3 sentence answers
        - Provide expected model answers
        - Include explanations for better understanding
        - Mark the difficulty level
        - Identify the main topic of each question
        """
        
        output_format = """
        Return ONLY valid JSON in this exact format:
        {
            "questions": [
                {
                    "question_text": "clear question here",
                    "expected_answer": "model answer (2-3 sentences)",
                    "explanation": "additional context or explanation",
                    "topic": "main topic name"
                }
            ]
        }
        """
    
    else:  # laq
        base_prompt += """
        - Create long answer questions that require detailed explanations
        - Provide comprehensive model answers
        - Include detailed explanations and key points
        - Mark the difficulty level  
        - Identify the main topic of each question
        """
        
        output_format = """
        Return ONLY valid JSON in this exact format:
        {
            "questions": [
                {
                    "question_text": "clear, comprehensive question here",
                    "expected_answer": "detailed model answer (paragraph format)",
                    "explanation": "comprehensive explanation and key points",
                    "topic": "main topic name"
                }
            ]
        }
        """
    
    return base_prompt + "\n\n" + output_format + "\n\nIMPORTANT: Return ONLY JSON, no other text."

def parse_quiz_response(response_text, quiz_type):
    """
    Parse Gemini response and extract quiz data
    """
    try:
        # Clean response text
        cleaned_text = response_text.strip()
        if '```json' in cleaned_text:
            cleaned_text = cleaned_text.split('```json')[1].split('```')[0]
        elif '```' in cleaned_text:
            cleaned_text = cleaned_text.split('```')[1]
        
        # Parse JSON
        quiz_data = json.loads(cleaned_text)
        
        # Validate structure
        if 'questions' not in quiz_data or not isinstance(quiz_data['questions'], list):
            raise ValueError("Invalid response format: missing questions array")
        
        return quiz_data
        
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse JSON response: {str(e)}")
    except Exception as e:
        raise ValueError(f"Error parsing quiz response: {str(e)}")

def create_quiz_from_data(quiz_data, document, quiz_type, questions_count, difficulty):
    """
    Create quiz and questions in database from parsed data
    """
    # Create quiz
    quiz = Quiz.objects.create(
        document=document,
        quiz_type=quiz_type,
        title=f"{quiz_type.upper()} Quiz - {document.title} - {difficulty.title()}",
        questions_count=len(quiz_data['questions']),
        difficulty=difficulty
    )
    
    # Create questions
    for idx, q_data in enumerate(quiz_data['questions']):
        question = Question(
            quiz=quiz,
            question_text=q_data.get('question_text', ''),
            question_type=quiz_type,
            topic=q_data.get('topic', 'General')
        )
        
        if quiz_type == 'mcq':
            question.option_a = q_data.get('option_a', '')
            question.option_b = q_data.get('option_b', '')
            question.option_c = q_data.get('option_c', '')
            question.option_d = q_data.get('option_d', '')
            question.correct_answer = q_data.get('correct_answer', '').lower()
            question.explanation = q_data.get('explanation', '')
        else:  # saq or laq
            question.expected_answer = q_data.get('expected_answer', '')
            question.explanation = q_data.get('explanation', '')
        
        question.save()
    
    return quiz

def evaluate_answer(question, user_answer):
    """
    Evaluate user's answer against correct answer
    """
    if question.question_type == 'mcq':
        # For MCQ, compare with correct option
        user_answer_clean = user_answer.strip().lower()
        correct_answer_clean = question.correct_answer.strip().lower() if question.correct_answer else ''
        
        is_correct = user_answer_clean == correct_answer_clean
        
        feedback = f"Correct answer is {question.correct_answer.upper()}. {question.explanation}" if not is_correct else question.explanation
        
    else:
        # For SAQ/LAQ, use Gemini to evaluate
        is_correct, feedback = evaluate_text_answer(question, user_answer)
    
    return is_correct, feedback

def evaluate_text_answer(question, user_answer):
    """
    Use Gemini to evaluate text answers for SAQ/LAQ
    """
    try:
        prompt = f"""
        Evaluate the student's answer for this question:
        
        QUESTION: {question.question_text}
        
        EXPECTED ANSWER: {question.expected_answer}
        
        STUDENT'S ANSWER: {user_answer}
        
        Provide evaluation in this exact JSON format:
        {{
            "is_correct": true/false,
            "feedback": "constructive feedback explaining what's good and what needs improvement",
            "score": 0-10
        }}
        
        Consider:
        - Key concepts covered
        - Accuracy of information
        - Completeness of answer
        - Clarity of explanation
        """
        
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(prompt)
        
        # Parse evaluation
        evaluation = json.loads(response.text.strip())
        
        is_correct = evaluation.get('is_correct', False)
        feedback = evaluation.get('feedback', 'Unable to evaluate answer.')
        
        return is_correct, feedback
        
    except Exception as e:
        return False, f"Evaluation failed: {str(e)}"