import { useState } from 'react';
import DocumentUpload from '../components/DocumentUpload';
import TestGeneration from '../components/TestGeneration';
import { documentAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiCheck, HiX } from 'react-icons/hi';

interface Document {
    id: number;
    title: string;
    file_type: string;
    upload_date: string;
    status: string;
}

interface Question {
    id: number;
    question_text: string;
    question_type: string;
    options: string[];
    correct_answer: string;
    order: number;
}

interface Test {
    id: number;
    title: string;
    questions: Question[];
}

const Documents = () => {
    const [uploadedDocument, setUploadedDocument] = useState<Document | null>(null);
    const [test, setTest] = useState<Test | null>(null);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [score, setScore] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Step 1: Upload
    if (!uploadedDocument) {
        return (
            <DocumentUpload
                onUploadSuccess={async () => {
                    try {
                        // Get the latest uploaded document
                        const docs = await documentAPI.list();
                        const latest = docs[docs.length - 1];
                        setUploadedDocument(latest);
                    } catch (e) {
                        setError('Failed to fetch uploaded document.');
                    }
                }}
            />
        );
    }

    // Step 2: Generate Test
    if (uploadedDocument) {
        navigate(`/documents/${uploadedDocument.id}/generate-test`);
        return null;
    }

    // Step 3: Take Test
    const handleAnswerChange = (questionId: number, answer: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    };

    const handleSubmitTest = async () => {
        // Here you would call your API to submit answers and get score
        // For now, just calculate score locally if possible
        let correct = 0;
        test?.questions.forEach(q => {
            if (answers[q.id] === q.correct_answer) correct++;
        });
        setScore(Math.round((correct / (test?.questions.length || 1)) * 100));
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                    Take Test: {test?.title}
                </h1>

                <div className="space-y-8">
                    {test?.questions.map((q, questionIndex) => (
                        <motion.div
                            key={q.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: questionIndex * 0.1 }}
                            className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 space-y-4"
                        >
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-600 px-3 py-1 rounded-full">
                                        Question {questionIndex + 1} of {test.questions.length}
                                    </span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {answers[q.id] ? 'Answered' : 'Not answered'}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-relaxed">
                                    {q.question_text}
                                </h3>
                            </div>

                            {q.question_type === 'multiple_choice' && q.options && (
                                <div className="space-y-3">
                                    {q.options.map((opt, idx) => (
                                        <motion.label
                                            key={idx}
                                            className={`flex items-center space-x-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${answers[q.id] === opt
                                                    ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                                                    : 'border-gray-200 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-400 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500'
                                                }`}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${answers[q.id] === opt
                                                    ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-600 dark:bg-indigo-400 text-white'
                                                    : 'border-gray-300 dark:border-gray-500 text-gray-500 dark:text-gray-400'
                                                }`}>
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            <span className={`text-base ${answers[q.id] === opt
                                                    ? 'text-indigo-900 dark:text-indigo-100 font-medium'
                                                    : 'text-gray-900 dark:text-white'
                                                }`}>
                                                {opt}
                                            </span>
                                        </motion.label>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                <div className="mt-8 flex justify-center">
                    <motion.button
                        className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 shadow-lg hover:shadow-xl flex items-center space-x-2"
                        onClick={handleSubmitTest}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <HiCheck className="h-5 w-5" />
                        <span>Submit Test</span>
                    </motion.button>
                </div>

                {score !== null && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-6 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-center"
                    >
                        <div className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">
                            Your Score: {score}%
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-300">
                            {score >= 80 ? 'Excellent work!' : score >= 60 ? 'Good job!' : 'Keep practicing!'}
                        </div>
                    </motion.div>
                )}

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 text-red-500 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800 flex items-center space-x-2"
                    >
                        <HiX className="h-5 w-5" />
                        <span>{error}</span>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Documents; 