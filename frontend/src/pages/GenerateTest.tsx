import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { HiDocumentText, HiQuestionMarkCircle, HiLightBulb, HiAcademicCap } from 'react-icons/hi';
import { documentAPI } from '../services/api';

const GenerateTest = () => {
    const navigate = useNavigate();
    const { documentId } = useParams<{ documentId: string }>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [testConfig, setTestConfig] = useState({
        examType: 'mcq',
        questionCount: 10,
        timeLimit: 30,
        difficulty: 'medium',
    });

    const examTypes = [
        {
            value: 'mcq',
            label: 'Multiple Choice Questions',
            description: 'Answer questions by selecting the best option from several choices.'
        },
        {
            value: 'qa',
            label: 'Short Answer Questions',
            description: 'Provide a written response to open-ended questions.'
        }
    ];

    const difficultyLevels = [
        {
            value: 'easy',
            name: 'Easy',
            description: 'Basic comprehension and recall of main concepts',
            icon: '🌱'
        },
        {
            value: 'medium',
            name: 'Medium',
            description: 'Application and analysis of concepts',
            icon: '🧠'
        },
        {
            value: 'hard',
            name: 'Hard',
            description: 'Synthesis, evaluation, and complex problem-solving',
            icon: '🚀'
        }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!documentId) {
            setError("Document ID not found in URL.");
            setLoading(false);
            return;
        }

        try {
            const test = await documentAPI.generateTest(
                parseInt(documentId),
                testConfig.examType,
                testConfig.questionCount,
                testConfig.difficulty,
                testConfig.timeLimit
            );

            // Check if fewer questions were generated than requested
            if (test.questions && test.questions.length < testConfig.questionCount) {
                const warningMessage = `Warning: Only ${test.questions.length} questions were generated instead of the requested ${testConfig.questionCount}. This may be due to limited content in the document or AI processing constraints.`;
                console.warn(warningMessage);
                // You could show this as a toast notification or alert here
            }

            navigate(`/take-test/${test.id}`);
        } catch (err: any) {
            console.error('Failed to generate test:', err);
            setError(err.response?.data?.error || 'Failed to generate test. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-4">
            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Generate Your Test</h1>
                {error && (
                    <p className="text-red-500 dark:text-red-400 text-sm mt-2">{error}</p>
                )}
            </div>

            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
                onSubmit={handleSubmit}
            >
                {/* Exam Type Selection */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-white">
                        Select Test Type
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {examTypes.map((type) => (
                            <motion.button
                                key={type.value}
                                type="button"
                                onClick={() => setTestConfig({ ...testConfig, examType: type.value })}
                                className={`p-6 rounded-xl border-2 transition-all duration-200 w-full text-left ${testConfig.examType === type.value
                                    ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-400 bg-white dark:bg-gray-800'
                                    }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="flex items-center mb-4">
                                    <HiQuestionMarkCircle className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mr-3" />
                                    <span className="text-xl font-semibold text-gray-900 dark:text-white">{type.label}</span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">{type.description}</p>
                                {testConfig.examType === type.value && (
                                    <div className="mt-4 text-sm text-indigo-700 dark:text-indigo-300 font-bold flex items-center">
                                        <HiLightBulb className="h-4 w-4 mr-1" />
                                        Selected
                                    </div>
                                )}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Question Count */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-white">
                        Number of Questions
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="50"
                        value={testConfig.questionCount}
                        onChange={(e) =>
                            setTestConfig({ ...testConfig, questionCount: parseInt(e.target.value) })
                        }
                        className="w-full px-3 py-2 rounded-md border bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Recommended: 10-15 questions for a comprehensive assessment
                    </p>
                </div>

                {/* Time Limit */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-white">
                        Time Limit (minutes)
                    </label>
                    <input
                        type="number"
                        min="5"
                        max="180"
                        value={testConfig.timeLimit}
                        onChange={(e) =>
                            setTestConfig({ ...testConfig, timeLimit: parseInt(e.target.value) })
                        }
                        className="w-full px-3 py-2 rounded-md border bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Allow 2-3 minutes per question for thoughtful answers
                    </p>
                </div>

                {/* Difficulty Level */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-white">
                        Difficulty Level
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {difficultyLevels.map((level) => (
                            <motion.button
                                key={level.value}
                                type="button"
                                onClick={() => setTestConfig({ ...testConfig, difficulty: level.value })}
                                className={`p-4 rounded-lg border-2 transition-all duration-200 text-center ${testConfig.difficulty === level.value
                                    ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-400 bg-white dark:bg-gray-800'
                                    }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="text-2xl mb-2">{level.icon}</div>
                                <div className="font-semibold text-gray-900 dark:text-white">{level.name}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{level.description}</div>
                            </motion.button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-center pt-6">
                    <motion.button
                        type="submit"
                        className="btn btn-primary px-8 py-4 text-lg"
                        disabled={loading}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {loading ? (
                            <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Generating Test Questions...</span>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <HiLightBulb className="h-5 w-5" />
                                <span>Generate Test</span>
                            </div>
                        )}
                    </motion.button>
                </div>
            </motion.form>
        </div>
    );
};

export default GenerateTest; 