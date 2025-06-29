import { useState, useEffect } from 'react';
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

    useEffect(() => {
        const fetchTests = async () => {
            try {
                const fetchedTests = await testAPI.list();
                setTests(fetchedTests);
            } catch (error) {
                console.error('Error fetching tests:', error);
            }
        };
        fetchTests();
    }, []);

    const handleStartTest = async (test: Test) => {
        try {
            const fetchedQuestions = await testAPI.getQuestions(test.id);
            setQuestions(fetchedQuestions);
            setSelectedTest(test);
            setAnswers({});
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
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
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Tests</h1>

            {selectedTest ? (
                <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-5 sm:p-6">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            {selectedTest.title}
                        </h2>
                        <div className="space-y-6">
                            {questions.map((question) => (
                                <div key={question.id} className="space-y-2">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
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
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
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
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
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
                                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            placeholder="Enter your answer"
                                        />
                                    )}
                                </div>
                            ))}
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setSelectedTest(null)}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmitTest}
                                    disabled={isSubmitting}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Test'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md border border-gray-200 dark:border-gray-700">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {tests.map((test) => (
                            <li key={test.id}>
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <svg
                                                    className="h-6 w-6 text-gray-400 dark:text-gray-500"
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
                                                <h2 className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {test.title}
                                                </h2>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    From: {test.document_title}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${test.status === 'completed'
                                                        ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                                                        : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                                                    }`}
                                            >
                                                {test.status}
                                            </span>
                                            {test.score !== undefined && (
                                                <span className="ml-4 text-sm text-gray-500 dark:text-gray-400">
                                                    Score: {test.score}%
                                                </span>
                                            )}
                                            {test.status === 'pending' && (
                                                <button
                                                    onClick={() => handleStartTest(test)}
                                                    className="ml-4 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/20 hover:bg-indigo-200 dark:hover:bg-indigo-900/30"
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
                                <div className="text-center text-gray-500 dark:text-gray-400">
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