import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TestResult, Test } from '../types/test';

export default function TestResults() {
    const [testResult, setTestResult] = useState<TestResult | null>(null);
    const [test, setTest] = useState<Test | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { resultId } = useParams<{ resultId: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const [resultResponse, testResponse] = await Promise.all([
                    axios.get(`/api/v1/test-results/${resultId}`),
                    axios.get(`/api/v1/tests/${resultResponse.data.test_id}`),
                ]);
                setTestResult(resultResponse.data);
                setTest(testResponse.data);
            } catch (err) {
                setError('Error loading test results. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [resultId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error || !testResult || !test) {
        return (
            <div className="max-w-2xl mx-auto mt-8">
                <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                                {error || 'Test results not found'}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const scorePercentage = (testResult.score / testResult.max_score) * 100;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Test Results: {test.title}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">{test.description}</p>
                </div>
            </div>

            <div className="mt-8">
                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="text-center">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Your Score</h3>
                            <div className="mt-2">
                                <div className="relative pt-1">
                                    <div className="flex mb-2 items-center justify-between">
                                        <div>
                                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-200">
                                                Score
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-semibold inline-block text-primary-600">
                                                {testResult.score} / {testResult.max_score}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-200">
                                        <div
                                            style={{ width: `${scorePercentage}%` }}
                                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-600"
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 space-y-6">
                    {testResult.answers.map((answer) => {
                        const question = test.questions.find((q) => q.id === answer.question_id);
                        if (!question) return null;

                        return (
                            <div
                                key={answer.question_id}
                                className={`bg-white shadow sm:rounded-lg p-6 ${answer.is_correct ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
                                    }`}
                            >
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <span
                                            className={`inline-flex items-center justify-center h-8 w-8 rounded-full ${answer.is_correct ? 'bg-green-100' : 'bg-red-100'
                                                }`}
                                        >
                                            <span
                                                className={`text-sm font-medium ${answer.is_correct ? 'text-green-600' : 'text-red-600'
                                                    }`}
                                            >
                                                {answer.is_correct ? '✓' : '✗'}
                                            </span>
                                        </span>
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <h3 className="text-lg font-medium text-gray-900">{question.question_text}</h3>
                                        <div className="mt-4 space-y-2">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Your Answer:</p>
                                                <p className="mt-1 text-sm text-gray-900">{answer.user_answer}</p>
                                            </div>
                                            {!answer.is_correct && (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Correct Answer:</p>
                                                    <p className="mt-1 text-sm text-gray-900">{question.correct_answer}</p>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Points Earned:</p>
                                                <p className="mt-1 text-sm text-gray-900">
                                                    {answer.points_earned} / {question.points}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
} 