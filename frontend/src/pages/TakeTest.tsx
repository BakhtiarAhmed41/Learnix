import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { HiClock, HiCheck, HiX, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { testAPI } from '../services/api';

interface Question {
    id: number;
    question_text: string;
    question_type: 'multiple_choice' | 'short_answer';
    options: string[];
    correct_answer: string;
    order: number;
}

interface Test {
    id: number;
    title: string;
    questions: Question[];
}

const TakeTest = () => {
    const { testId } = useParams<{ testId: string }>();
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [test, setTest] = useState<Test | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [attemptId, setAttemptId] = useState<number | null>(null);

    // Define handleSubmit before the useEffect that uses it
    const handleSubmit = useCallback(async () => {
        if (!attemptId) {
            setError('No test attempt found. Please refresh the page and try again.');
            return;
        }

        try {
            // Format answers for API
            const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
                questionId: parseInt(questionId),
                answer: answer
            }));

            // Submit answers to API
            const response = await testAPI.submit(attemptId, formattedAnswers);

            // Navigate to results page with the attemptId
            navigate(`/results/${response.id}`);
        } catch (error) {
            console.error('Error submitting test:', error);
            setError('Failed to submit test. Please try again.');
        }
    }, [navigate, testId, answers, attemptId]);

    useEffect(() => {
        const fetchTest = async () => {
            if (!testId) {
                setError("Test ID not found in URL.");
                setLoading(false);
                return;
            }
            try {
                const fetchedTest = await testAPI.get(parseInt(testId));
                setTest(fetchedTest);

                // Create a new test attempt
                const attempt = await testAPI.createAttempt(parseInt(testId));
                setAttemptId(attempt.id);

                setLoading(false);
            } catch (err: any) {
                console.error('Failed to fetch test:', err);
                setError(err.response?.data?.error || 'Failed to load test. Please try again.');
                setLoading(false);
            }
        };
        fetchTest();
    }, [testId]);

    useEffect(() => {
        if (test && test.questions.length > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 0) {
                        clearInterval(timer);
                        handleSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [test, handleSubmit]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleAnswer = (answer: string) => {
        if (test && test.questions.length > 0) {
            setAnswers((prev) => ({
                ...prev,
                [test.questions[currentQuestionIndex].id]: answer,
            }));
        }
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto mb-4"></div>
                <p className="text-gray-900 dark:text-white">Loading test...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <div className="text-red-500 dark:text-red-400 mb-4">Error: {error}</div>
                <button
                    onClick={() => navigate('/')}
                    className="btn btn-primary"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    if (!test || test.questions.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-900 dark:text-white mb-4">No questions found for this test.</p>
                <button
                    onClick={() => navigate('/')}
                    className="btn btn-primary"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    const currentQuestion = test.questions[currentQuestionIndex];
    const progress = (Object.keys(answers).length / test.questions.length) * 100;

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Take Test: {test.title}</h1>
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                    <HiClock className="h-5 w-5 text-red-500" />
                    <span className="font-medium">{formatTime(timeLeft)}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <motion.div
                    className="bg-indigo-600 dark:bg-indigo-500 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            {/* Question */}
            <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg space-y-8 border border-gray-200 dark:border-gray-700"
            >
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                            Question {currentQuestionIndex + 1} of {test.questions.length}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {Math.round(progress)}% Complete
                        </span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white leading-relaxed">
                        {currentQuestion.question_text}
                    </h2>
                </div>

                {currentQuestion.question_type === 'multiple_choice' && currentQuestion.options && (
                    <div className="space-y-4">
                        {currentQuestion.options.map((option, index) => (
                            <motion.button
                                key={option}
                                onClick={() => handleAnswer(option)}
                                className={`w-full p-6 text-left rounded-xl border-2 transition-all duration-300 hover:shadow-md ${answers[currentQuestion.id] === option
                                        ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-400 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                                    }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${answers[currentQuestion.id] === option
                                            ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-600 dark:bg-indigo-400 text-white'
                                            : 'border-gray-300 dark:border-gray-500 text-gray-500 dark:text-gray-400'
                                        }`}>
                                        {String.fromCharCode(65 + index)} {/* A, B, C, D */}
                                    </div>
                                    <span className={`text-lg ${answers[currentQuestion.id] === option
                                            ? 'text-indigo-900 dark:text-indigo-100 font-medium'
                                            : 'text-gray-900 dark:text-white'
                                        }`}>
                                        {option}
                                    </span>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                )}

                {currentQuestion.question_type === 'short_answer' && (
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                            Your Answer
                        </label>
                        <textarea
                            className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                            rows={6}
                            placeholder="Type your detailed answer here..."
                            value={answers[currentQuestion.id] || ''}
                            onChange={e => handleAnswer(e.target.value)}
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Provide a comprehensive answer. You can use multiple sentences to explain your reasoning.
                        </p>
                    </div>
                )}
            </motion.div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
                <button
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${currentQuestionIndex === 0
                            ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                            : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                >
                    <HiChevronLeft className="h-5 w-5" />
                    <span>Previous</span>
                </button>

                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {answers[currentQuestion.id] ? 'Answered' : 'Not answered'}
                    </span>

                    {currentQuestionIndex < test.questions.length - 1 ? (
                        <button
                            onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                            className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <span>Next</span>
                            <HiChevronRight className="h-5 w-5" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className="flex items-center space-x-2 px-6 py-3 bg-green-600 dark:bg-green-500 text-white rounded-lg font-medium hover:bg-green-700 dark:hover:bg-green-600 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <HiCheck className="h-5 w-5" />
                            <span>Submit Test</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TakeTest; 