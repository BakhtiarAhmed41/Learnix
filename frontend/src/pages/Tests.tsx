import { useState } from 'react';
import { testAPI } from '../services/api';

interface Test {
    id: number;
    title: string;
    document_title: string;
    created_at: string;
    status: 'pending' | 'completed';
    score?: number;
}

interface Question {
    id: number;
    text: string;
    type: 'multiple_choice' | 'true_false' | 'short_answer';
    options?: string[];
    correct_answer?: string;
}

const Tests = () => {
    const [tests, setTests] = useState<Test[]>([]);
    const [selectedTest, setSelectedTest] = useState<Test | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleStartTest = async (test: Test) => {
        setSelectedTest(test);
        // Fetch test questions here
        // const testQuestions = await getTestQuestions(test.id);
        // setQuestions(testQuestions);
    };

    const handleAnswerChange = (questionId: number, answer: string) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: answer,
        }));
    };

    const handleSubmitTest = async () => {
        if (!selectedTest) return;

        setIsSubmitting(true);
        try {
            const response = await testAPI.submitTest(selectedTest.id, answers);
            // Update test status and score
            setTests((prev) =>
                prev.map((test) =>
                    test.id === selectedTest.id
                        ? { ...test, status: 'completed', score: response.score }
                        : test
                )
            );
            setSelectedTest(null);
            setQuestions([]);
            setAnswers({});
        } catch (error) {
            console.error('Error submitting test:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-gray-900">Tests</h1>

            {selectedTest ? (
                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                            {selectedTest.title}
                        </h2>
                        <div className="space-y-6">
                            {questions.map((question) => (
                                <div key={question.id} className="space-y-2">
                                    <p className="text-sm font-medium text-gray-900">
                                        {question.text}
                                    </p>
                                    {question.type === 'multiple_choice' && question.options && (
                                        <div className="space-y-2">
                                            {question.options.map((option, index) => (
                                                <label
                                                    key={index}
                                                    className="flex items-center space-x-3"
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`question-${question.id}`}
                                                        value={option}
                                                        checked={answers[question.id] === option}
                                                        onChange={(e) =>
                                                            handleAnswerChange(question.id, e.target.value)
                                                        }
                                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <span className="text-sm text-gray-700">{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                    {question.type === 'true_false' && (
                                        <div className="space-y-2">
                                            {['True', 'False'].map((option) => (
                                                <label
                                                    key={option}
                                                    className="flex items-center space-x-3"
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`question-${question.id}`}
                                                        value={option}
                                                        checked={answers[question.id] === option}
                                                        onChange={(e) =>
                                                            handleAnswerChange(question.id, e.target.value)
                                                        }
                                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <span className="text-sm text-gray-700">{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                    {question.type === 'short_answer' && (
                                        <input
                                            type="text"
                                            value={answers[question.id] || ''}
                                            onChange={(e) =>
                                                handleAnswerChange(question.id, e.target.value)
                                            }
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            placeholder="Enter your answer"
                                        />
                                    )}
                                </div>
                            ))}
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setSelectedTest(null)}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmitTest}
                                    disabled={isSubmitting}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Test'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {tests.map((test) => (
                            <li key={test.id}>
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <svg
                                                    className="h-6 w-6 text-gray-400"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="ml-4">
                                                <h2 className="text-sm font-medium text-gray-900">
                                                    {test.title}
                                                </h2>
                                                <p className="text-sm text-gray-500">
                                                    From: {test.document_title}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${test.status === 'completed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                    }`}
                                            >
                                                {test.status}
                                            </span>
                                            {test.score !== undefined && (
                                                <span className="ml-4 text-sm text-gray-500">
                                                    Score: {test.score}%
                                                </span>
                                            )}
                                            {test.status === 'pending' && (
                                                <button
                                                    onClick={() => handleStartTest(test)}
                                                    className="ml-4 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                                                >
                                                    Start Test
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                        {tests.length === 0 && (
                            <li className="px-4 py-5 sm:px-6">
                                <div className="text-center text-gray-500">
                                    No tests available yet. Upload documents to generate tests.
                                </div>
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Tests; 