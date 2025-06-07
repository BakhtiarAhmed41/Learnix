import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Test, TestResult } from '../types/test';

interface Document {
    id: number;
    title: string;
    file_name: string;
    created_at: string;
    updated_at: string;
}

export default function Dashboard() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [documentsResponse, testResultsResponse] = await Promise.all([
                    axios.get('/api/v1/documents'),
                    axios.get('/api/v1/test-results'),
                ]);
                setDocuments(documentsResponse.data);
                setTestResults(testResultsResponse.data);
            } catch (err) {
                setError('Error loading dashboard data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">{error}</h3>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Dashboard
                    </h2>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0">
                    <Link
                        to="/upload"
                        className="ml-3 inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                    >
                        Upload New Document
                    </Link>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Documents Section */}
                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Your Documents</h3>
                        <div className="mt-6 flow-root">
                            <ul role="list" className="-my-5 divide-y divide-gray-200">
                                {documents.map((document) => (
                                    <li key={document.id} className="py-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-shrink-0">
                                                <svg
                                                    className="h-6 w-6 text-gray-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{document.title}</p>
                                                <p className="text-sm text-gray-500 truncate">{document.file_name}</p>
                                            </div>
                                            <div>
                                                <Link
                                                    to={`/generate-test/${document.id}`}
                                                    className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-primary-600 shadow-sm ring-1 ring-inset ring-primary-300 hover:bg-primary-50"
                                                >
                                                    Generate Test
                                                </Link>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                                {documents.length === 0 && (
                                    <li className="py-4">
                                        <p className="text-sm text-gray-500">No documents uploaded yet.</p>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Test Results Section */}
                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Test Results</h3>
                        <div className="mt-6 flow-root">
                            <ul role="list" className="-my-5 divide-y divide-gray-200">
                                {testResults.map((result) => (
                                    <li key={result.id} className="py-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-shrink-0">
                                                <span
                                                    className={`inline-flex items-center justify-center h-8 w-8 rounded-full ${(result.score / result.max_score) * 100 >= 70
                                                            ? 'bg-green-100'
                                                            : 'bg-red-100'
                                                        }`}
                                                >
                                                    <span
                                                        className={`text-sm font-medium ${(result.score / result.max_score) * 100 >= 70
                                                                ? 'text-green-600'
                                                                : 'text-red-600'
                                                            }`}
                                                    >
                                                        {Math.round((result.score / result.max_score) * 100)}%
                                                    </span>
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    Score: {result.score} / {result.max_score}
                                                </p>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {new Date(result.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div>
                                                <Link
                                                    to={`/test-results/${result.id}`}
                                                    className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-primary-600 shadow-sm ring-1 ring-inset ring-primary-300 hover:bg-primary-50"
                                                >
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                                {testResults.length === 0 && (
                                    <li className="py-4">
                                        <p className="text-sm text-gray-500">No test results yet.</p>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 