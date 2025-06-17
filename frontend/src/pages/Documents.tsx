import { useState } from 'react';
import DocumentUpload from '../components/DocumentUpload';
import TestGeneration from '../components/TestGeneration';
import { documentAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

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
    if (!test) {
        return (
            <TestGeneration
                documentId={uploadedDocument.id}
                onTestGenerated={(testId: number) => {
                    navigate(`/take-test/${testId}`);
                }}
            />
        );
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
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">Take Test: {test?.title}</h1>
            {test?.questions.map((q) => (
                <div key={q.id} className="mb-4">
                    <div className="font-medium mb-2">{q.question_text}</div>
                    {q.question_type === 'multiple_choice' && q.options && (
                        <div className="space-y-1">
                            {q.options.map((opt, idx) => (
                                <label key={idx} className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name={`question-${q.id}`}
                                        value={opt}
                                        checked={answers[q.id] === opt}
                                        onChange={() => handleAnswerChange(q.id, opt)}
                                    />
                                    <span>{opt}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            ))}
            <button
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                onClick={handleSubmitTest}
            >
                Submit Test
            </button>
            {score !== null && (
                <div className="mt-4 text-lg font-bold text-green-700">Your Score: {score}%</div>
            )}
            {error && <div className="text-red-500 mt-2">{error}</div>}
        </div>
    );
};

export default Documents; 