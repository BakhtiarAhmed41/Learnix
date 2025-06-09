import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HiDocumentText, HiClock, HiQuestionMarkCircle } from 'react-icons/hi';

const GenerateTest = () => {
    const navigate = useNavigate();
    const [testConfig, setTestConfig] = useState({
        examType: 'multiple-choice',
        questionCount: 10,
        timeLimit: 30,
        difficulty: 'medium',
    });

    const examTypes = [
        { id: 'multiple-choice', name: 'Multiple Choice', icon: HiQuestionMarkCircle },
        { id: 'short-answer', name: 'Short Answer', icon: HiDocumentText },
        { id: 'mixed', name: 'Mixed Format', icon: HiClock },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement test generation logic
        navigate('/test/1'); // Temporary navigation
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold text-gray-900">Generate Your Test</h1>
                <p className="text-gray-600">
                    Configure your test settings to generate a personalized assessment
                </p>
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
                        Select Exam Type
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {examTypes.map((type) => (
                            <button
                                key={type.id}
                                type="button"
                                onClick={() => setTestConfig({ ...testConfig, examType: type.id })}
                                className={`p-4 rounded-lg border-2 transition-all duration-200 ${testConfig.examType === type.id
                                        ? 'border-primary-600 bg-primary-50'
                                        : 'border-gray-200 hover:border-primary-600'
                                    }`}
                            >
                                <type.icon className="h-8 w-8 mx-auto text-primary-600 mb-2" />
                                <span className="block text-sm font-medium text-gray-900">
                                    {type.name}
                                </span>
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
                    <button type="submit" className="btn btn-primary">
                        Generate Test
                    </button>
                </div>
            </motion.form>
        </div>
    );
};

export default GenerateTest; 