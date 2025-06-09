import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { HiClock, HiCheck, HiX } from 'react-icons/hi';

interface Question {
    id: number;
    text: string;
    type: 'multiple-choice' | 'short-answer';
    options?: string[];
    answer?: string;
}

const TakeTest = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});

    // Mock questions - replace with actual API call
    const questions: Question[] = [
        {
            id: 1,
            text: 'What is the capital of France?',
            type: 'multiple-choice',
            options: ['London', 'Berlin', 'Paris', 'Madrid'],
        },
        {
            id: 2,
            text: 'Explain the concept of photosynthesis.',
            type: 'short-answer',
        },
        // Add more questions here
    ];

    useEffect(() => {
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
    }, []);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleAnswer = (answer: string) => {
        setAnswers((prev) => ({
            ...prev,
            [questions[currentQuestion].id]: answer,
        }));
    };

    const handleSubmit = () => {
        // TODO: Implement answer submission logic
        navigate(`/results/${testId}`);
    };

    const progress = (Object.keys(answers).length / questions.length) * 100;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Test in Progress</h1>
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
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-6 rounded-lg shadow-md space-y-6"
            >
                <div className="space-y-2">
                    <span className="text-sm text-gray-500">
                        Question {currentQuestion + 1} of {questions.length}
                    </span>
                    <h2 className="text-xl font-semibold text-gray-900">
                        {questions[currentQuestion].text}
                    </h2>
                </div>

                {questions[currentQuestion].type === 'multiple-choice' ? (
                    <div className="space-y-3">
                        {questions[currentQuestion].options?.map((option) => (
                            <button
                                key={option}
                                onClick={() => handleAnswer(option)}
                                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${answers[questions[currentQuestion].id] === option
                                        ? 'border-primary-600 bg-primary-50'
                                        : 'border-gray-200 hover:border-primary-600'
                                    }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                ) : (
                    <textarea
                        value={answers[questions[currentQuestion].id] || ''}
                        onChange={(e) => handleAnswer(e.target.value)}
                        className="input min-h-[150px]"
                        placeholder="Type your answer here..."
                    />
                )}
            </motion.div>

            {/* Navigation */}
            <div className="flex justify-between">
                <button
                    onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                    disabled={currentQuestion === 0}
                    className="btn btn-secondary"
                >
                    Previous
                </button>
                <div className="space-x-4">
                    {currentQuestion < questions.length - 1 ? (
                        <button
                            onClick={() => setCurrentQuestion((prev) => prev + 1)}
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