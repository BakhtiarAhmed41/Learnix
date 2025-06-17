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
        <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Generate Test</h2>

            <div className="space-y-4">
                <p className="text-gray-600">
                    Click the button below to generate a test based on your uploaded document.
                    The test will include multiple-choice questions covering the key concepts.
                </p>

                {error && (
                    <div className="text-red-500 text-sm">{error}</div>
                )}

                <button
                    onClick={handleGenerateTest}
                    disabled={isGenerating}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isGenerating
                        ? 'bg-indigo-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                        }`}
                >
                    {isGenerating ? 'Generating Test...' : 'Generate Test'}
                </button>
            </div>
        </div>
    );
};

export default TestGeneration; 