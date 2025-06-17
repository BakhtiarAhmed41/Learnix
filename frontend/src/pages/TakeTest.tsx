import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { HiClock, HiCheck, HiX } from 'react-icons/hi';
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
        return <div className="text-center py-8">Loading test...</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">Error: {error}</div>;
    }

    if (!test || test.questions.length === 0) {
        return <div className="text-center py-8">No questions found for this test.</div>;
    }

    const currentQuestion = test.questions[currentQuestionIndex];
    const progress = (Object.keys(answers).length / test.questions.length) * 100;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Take Test: {test.title}</h1>
                <div className="flex items-center space-x-2 text-gray-600">
                    <HiClock className="h-5 w-5" />
                    <span className="font-medium">{formatTime(timeLeft)}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                    className="bg-primary-600 h-2 rounded-full"
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
                className="bg-white p-6 rounded-lg shadow-md space-y-6"
            >
                <div className="space-y-2">
                    <span className="text-sm text-gray-500">
                        Question {currentQuestionIndex + 1} of {test.questions.length}
                    </span>
                    <h2 className="text-xl font-semibold text-gray-900">
                        {currentQuestion.question_text}
                    </h2>
                </div>

                {currentQuestion.question_type === 'multiple_choice' && currentQuestion.options && (
                    <div className="space-y-3">
                        {currentQuestion.options.map((option) => (
                            <button
                                key={option}
                                onClick={() => handleAnswer(option)}
                                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${answers[currentQuestion.id] === option
                                    ? 'border-primary-600 bg-primary-50'
                                    : 'border-gray-200 hover:border-primary-600'
                                    }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Navigation */}
            <div className="flex justify-between">
                <button
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="btn btn-secondary"
                >
                    Previous
                </button>
                <div className="space-x-4">
                    {currentQuestionIndex < test.questions.length - 1 ? (
                        <button
                            onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                            className="btn btn-primary"
                        >
                            Next
                        </button>
                    ) : (
                        <button onClick={handleSubmit} className="btn btn-primary">
                            Submit Test
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TakeTest; 