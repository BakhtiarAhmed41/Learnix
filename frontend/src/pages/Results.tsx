import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { HiCheck, HiX, HiLightBulb } from 'react-icons/hi';

interface QuestionResult {
    id: number;
    text: string;
    type: 'multiple-choice' | 'short-answer';
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
}

const Results = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);

    // Mock results - replace with actual API call
    const results: QuestionResult[] = [
        {
            id: 1,
            text: 'What is the capital of France?',
            type: 'multiple-choice',
            userAnswer: 'Paris',
            correctAnswer: 'Paris',
            isCorrect: true,
            explanation: 'Paris is the capital city of France, known for its iconic Eiffel Tower and rich cultural heritage.',
        },
        {
            id: 2,
            text: 'Explain the concept of photosynthesis.',
            type: 'short-answer',
            userAnswer: 'The process by which plants convert sunlight into energy.',
            correctAnswer: 'Photosynthesis is the process by which plants, algae, and some bacteria convert light energy into chemical energy, producing oxygen and organic compounds.',
            isCorrect: false,
            explanation: 'While your answer captures the basic idea, photosynthesis is more complex. It involves the conversion of light energy into chemical energy, producing oxygen and organic compounds. The process occurs in the chloroplasts of plant cells and is essential for life on Earth.',
        },
    ];

    const score = results.filter((q) => q.isCorrect).length;
    const percentage = (score / results.length) * 100;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Score Summary */}
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold text-gray-900">Test Results</h1>
                <div className="flex justify-center items-center space-x-4">
                    <div className="text-4xl font-bold text-primary-600">{percentage}%</div>
                    <div className="text-gray-600">
                        <div>Score: {score}/{results.length}</div>
                        <div className="text-sm">
                            {score === results.length
                                ? 'Perfect score!'
                                : `${results.length - score} questions incorrect`}
                        </div>
                    </div>
                </div>
            </div>

            {/* Questions Review */}
            <div className="space-y-4">
                {results.map((question, index) => (
                    <motion.div
                        key={question.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white p-6 rounded-lg shadow-md space-y-4"
                    >
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500">
                                        Question {index + 1}
                                    </span>
                                    {question.isCorrect ? (
                                        <HiCheck className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <HiX className="h-5 w-5 text-red-500" />
                                    )}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {question.text}
                                </h3>
                            </div>
                            <button
                                onClick={() =>
                                    setSelectedQuestion(
                                        selectedQuestion === question.id ? null : question.id
                                    )
                                }
                                className="text-primary-600 hover:text-primary-700"
                            >
                                {selectedQuestion === question.id ? 'Hide Details' : 'Show Details'}
                            </button>
                        </div>

                        {selectedQuestion === question.id && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-4 pt-4 border-t"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2 text-gray-700">
                                        <span className="font-medium">Your Answer:</span>
                                        <span>{question.userAnswer}</span>
                                    </div>
                                    {!question.isCorrect && (
                                        <div className="flex items-center space-x-2 text-gray-700">
                                            <span className="font-medium">Correct Answer:</span>
                                            <span>{question.correctAnswer}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-primary-50 p-4 rounded-lg">
                                    <div className="flex items-start space-x-2">
                                        <HiLightBulb className="h-5 w-5 text-primary-600 mt-1" />
                                        <div>
                                            <h4 className="font-medium text-primary-900 mb-1">
                                                Explanation
                                            </h4>
                                            <p className="text-primary-700">{question.explanation}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
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
                    onClick={() => navigate('/upload')}
                    className="btn btn-primary"
                >
                    Create New Test
                </button>
            </div>
        </div>
    );
};

export default Results; 