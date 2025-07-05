import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { HiCheck, HiX } from 'react-icons/hi';
import { testAPI } from '../services/api';

interface Question {
    id: number;
    question_text: string;
    question_type: 'multiple_choice' | 'short_answer';
    correct_answer: string;
}

interface Answer {
    id: number;
    question: number;  // This is the question ID
    question_text: string;  // This comes directly in the answer
    user_answer: string;
    is_correct: boolean;
    correct_answer: string;  // This comes directly in the answer
    score?: number; // For QA
    feedback?: string; // For QA
}

interface TestAttempt {
    id: number;
    test: {
        id: number;
        title: string;
        questions: Question[];
    };
    answers: Answer[];
    score: number;
    completed_at: string;
}

const Results = () => {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
    const [attempt, setAttempt] = useState<TestAttempt | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchResults = async () => {
            if (!attemptId) {
                setError('No attempt ID provided');
                setLoading(false);
                return;
            }

            try {
                const data = await testAPI.getAttempt(parseInt(attemptId));
                console.log('Attempt data:', data); // Debug log
                setAttempt(data);
            } catch (err) {
                console.error('Error fetching test results:', err);
                setError('Failed to load test results. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [attemptId]);

    if (loading) {
        return <div className="text-center py-8 text-gray-900 dark:text-white">Loading results...</div>;
    }

    if (error || !attempt) {
        return (
            <div className="text-center py-8">
                <div className="text-red-500 dark:text-red-400 mb-4">{error || 'Failed to load results'}</div>
                <button
                    onClick={() => navigate('/')}
                    className="btn btn-primary"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    // Calculate total score for QA (sum of answer scores) or count of correct answers for MCQ
    const isQA = attempt.answers.some(a => typeof a.score === 'number' && a.score !== 0 && a.score !== 1);
    let totalScore = 0;
    if (isQA) {
        totalScore = attempt.answers.reduce((sum, a) => sum + (typeof a.score === 'number' ? a.score : 0), 0);
    } else {
        totalScore = attempt.answers.filter(a => a.is_correct).length;
    }
    const percentage = ((isQA ? totalScore : totalScore) / attempt.answers.length) * 100;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Score Summary */}
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Test Results</h1>
                <div className="flex justify-center items-center space-x-4">
                    <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">{percentage.toFixed(2)}%</div>
                    <div className="text-gray-600 dark:text-gray-300">
                        <div>
                            Score: {isQA ? totalScore.toFixed(2) : totalScore}/{attempt.answers.length}
                        </div>
                        <div className="text-sm">
                            {totalScore === attempt.answers.length
                                ? 'Perfect score!'
                                : `${attempt.answers.length - totalScore} questions incorrect`}
                        </div>
                    </div>
                </div>
            </div>

            {/* Questions Review */}
            <div className="space-y-4">
                {attempt.answers.map((answer, index) => (
                    <motion.div
                        key={answer.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4 border border-gray-200 dark:border-gray-700"
                    >
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        Question {index + 1}
                                    </span>
                                    {answer.is_correct ? (
                                        <HiCheck className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <HiX className="h-5 w-5 text-red-500" />
                                    )}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {answer.question_text}
                                </h3>
                            </div>
                            <button
                                onClick={() =>
                                    setSelectedQuestion(
                                        selectedQuestion === answer.id ? null : answer.id
                                    )
                                }
                                className="w-28 h-9 min-w-[7rem] min-h-[2.25rem] flex items-center justify-center bg-gray-50 dark:bg-gray-700 text-primary-600 dark:text-primary-400 rounded-lg font-medium text-sm shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 whitespace-nowrap"
                                style={{ alignSelf: 'center' }}
                            >
                                {selectedQuestion === answer.id ? 'Hide Details' : 'Show Details'}
                            </button>
                        </div>

                        {selectedQuestion === answer.id && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="pt-4 border-t border-gray-200 dark:border-gray-600"
                            >
                                <div className="bg-gray-50 dark:bg-gray-900/40 border-l-4 border-indigo-300 dark:border-indigo-500 rounded-md p-4 space-y-4">
                                    <div className="mb-2">
                                        <span className="font-semibold text-gray-800 dark:text-gray-100 mr-2">Your Answer:</span>
                                        <span className="text-gray-700 dark:text-gray-300">{answer.user_answer}</span>
                                    </div>
                                    {!answer.is_correct && (
                                        <div className="mb-2">
                                            <span className="font-semibold text-gray-800 dark:text-gray-100 mr-2">Correct Answer:</span>
                                            <span className="text-gray-700 dark:text-gray-300">{answer.correct_answer}</span>
                                        </div>
                                    )}
                                    {answer.score !== undefined && (
                                        <div className="mb-2">
                                            <span className="font-semibold text-gray-800 dark:text-gray-100 mr-2">Score:</span>
                                            <span className="text-gray-700 dark:text-gray-300">{answer.score}</span>
                                        </div>
                                    )}
                                    {answer.feedback && (
                                        <div className="mb-2">
                                            <span className="font-semibold text-gray-800 dark:text-gray-100 mr-2">Feedback:</span>
                                            <span className="text-gray-700 dark:text-gray-300">{answer.feedback}</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                        {/* Add horizontal line between answers, except after the last one */}
                        {index < attempt.answers.length - 1 && (
                            <hr className="my-4 border-gray-600 dark:border-gray-700" />
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
                <button
                    onClick={() => navigate('/')}
                    className="btn btn-secondary"
                >
                    Back to Home
                </button>
                <button
                    onClick={() => navigate('/documents')}
                    className="btn btn-primary"
                >
                    Create New Test
                </button>
            </div>
        </div>
    );
};

export default Results; 