import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Test, Question, TestType } from '../types/test';

interface TestTakingFormData {
    [key: string]: string; // question_id: answer
}

export default function TestTaking() {
    const [test, setTest] = useState<Test | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const { testId } = useParams<{ testId: string }>();
    const { register, handleSubmit, formState: { errors } } = useForm<TestTakingFormData>();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTest = async () => {
            try {
                const response = await axios.get(`/api/v1/tests/${testId}`);
                setTest(response.data);
            } catch (err) {
                setError('Error loading test. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchTest();
    }, [testId]);

    const onSubmit = async (data: TestTakingFormData) => {
        try {
            setError(null);
            setSubmitting(true);

            const answers = Object.entries(data).map(([questionId, answer]) => ({
                question_id: parseInt(questionId),
                user_answer: answer,
            }));

            const response = await axios.post(`/api/v1/tests/${testId}/submit`, { answers });
            navigate(`/test-results/${response.data.id}`);
        } catch (err) {
            setError('Error submitting test. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error || !test) {
        return (
            <div className="max-w-2xl mx-auto mt-8">
                <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                                {error || 'Test not found'}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        {test.title}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">{test.description}</p>
                </div>
            </div>

            <div className="mt-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {test.questions.map((question, index) => (
                        <div key={question.id} className="bg-white shadow sm:rounded-lg p-6">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary-100">
                                        <span className="text-sm font-medium text-primary-600">{index + 1}</span>
                                    </span>
                                </div>
                                <div className="ml-4 flex-1">
                                    <h3 className="text-lg font-medium text-gray-900">{question.question_text}</h3>

                                    {question.question_type === TestType.MULTIPLE_CHOICE && question.options && (
                                        <div className="mt-4 space-y-4">
                                            {question.options.map((option, optionIndex) => (
                                                <div key={optionIndex} className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        id={`question-${question.id}-option-${optionIndex}`}
                                                        value={option}
                                                        {...register(question.id.toString(), {
                                                            required: 'Please select an answer',
                                                        })}
                                                        className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-600"
                                                    />
                                                    <label
                                                        htmlFor={`question-${question.id}-option-${optionIndex}`}
                                                        className="ml-3 block text-sm font-medium text-gray-700"
                                                    >
                                                        {option}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {question.question_type === TestType.SHORT_ANSWER && (
                                        <div className="mt-4">
                                            <input
                                                type="text"
                                                {...register(question.id.toString(), {
                                                    required: 'Please provide an answer',
                                                })}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    )}

                                    {question.question_type === TestType.LONG_ANSWER && (
                                        <div className="mt-4">
                                            <textarea
                                                rows={4}
                                                {...register(question.id.toString(), {
                                                    required: 'Please provide an answer',
                                                })}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    )}

                                    {errors[question.id] && (
                                        <p className="mt-2 text-sm text-red-600">{errors[question.id]?.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Submit Test'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 