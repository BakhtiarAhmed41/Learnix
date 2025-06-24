import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { HiDocumentText, HiQuestionMarkCircle } from 'react-icons/hi';
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
        { id: 'mcq', name: 'MCQs', icon: HiQuestionMarkCircle, description: 'Multiple choice questions with one correct answer.' },
        { id: 'qa', name: 'Question-Answer', icon: HiDocumentText, description: 'Open-ended questions graded by AI for partial credit.' },
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
            navigate(`/take-test/${test.id}`);
        } catch (err: any) {
            console.error('Failed to generate test:', err);
            setError(err.response?.data?.error || 'Failed to generate test. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold text-gray-900">Generate Your Test</h1>
                <p className="text-gray-600">
                    Configure your test settings to generate a personalized assessment
                </p>
                {error && (
                    <p className="text-red-500 text-sm mt-2">{error}</p>
                )}
            </div>

            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
                onSubmit={handleSubmit}
            >
                {/* Exam Type Selection */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                        Select Test Type
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {examTypes.map((type) => (
                            <button
                                key={type.id}
                                type="button"
                                onClick={() => setTestConfig({ ...testConfig, examType: type.id })}
                                className={`p-4 rounded-lg border-2 transition-all duration-200 w-full text-left ${testConfig.examType === type.id
                                    ? 'border-indigo-600 bg-indigo-50 shadow-md'
                                    : 'border-gray-200 hover:border-indigo-400'
                                    }`}
                            >
                                <div className="flex items-center mb-2">
                                    <type.icon className="h-7 w-7 text-indigo-600 mr-3" />
                                    <span className="text-lg font-semibold text-gray-900">{type.name}</span>
                                </div>
                                <div className="text-gray-600 text-sm">{type.description}</div>
                                {testConfig.examType === type.id && (
                                    <div className="mt-2 text-xs text-indigo-700 font-bold">Selected</div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Question Count */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
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
                        className="input"
                    />
                </div>

                {/* Time Limit */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
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
                        className="input"
                    />
                </div>

                {/* Difficulty Level */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Difficulty Level
                    </label>
                    <select
                        value={testConfig.difficulty}
                        onChange={(e) =>
                            setTestConfig({ ...testConfig, difficulty: e.target.value })
                        }
                        className="input"
                    >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>

                <div className="flex justify-end">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Generating...' : 'Generate Test'}
                    </button>
                </div>
            </motion.form>
        </div>
    );
};

export default GenerateTest; 