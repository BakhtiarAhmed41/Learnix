import React, { useState } from 'react';
import { documentAPI } from '../services/api';

interface TestGenerationProps {
    documentId: number;
    onTestGenerated: (testId: number) => void;
}

const TestGeneration: React.FC<TestGenerationProps> = ({ documentId, onTestGenerated }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateTest = async () => {
        setIsGenerating(true);
        setError(null);

        try {
            const test = await documentAPI.generateTest(documentId);
            onTestGenerated(test.id);
        } catch (err) {
            setError('Failed to generate test. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Generate Test</h2>

            <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                    Click the button below to generate a test based on your uploaded document.
                    The test will include multiple-choice questions covering the key concepts.
                </p>

                {error && (
                    <div className="text-red-500 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleGenerateTest}
                    disabled={isGenerating}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all duration-200 ${isGenerating
                            ? 'bg-indigo-400 dark:bg-indigo-500 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800'
                        }`}
                >
                    {isGenerating ? (
                        <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Generating Test...</span>
                        </div>
                    ) : (
                        'Generate Test'
                    )}
                </button>
            </div>
        </div>
    );
};

export default TestGeneration; 