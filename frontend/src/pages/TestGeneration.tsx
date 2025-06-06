import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { TestType } from '../types/test';

interface TestGenerationFormData {
    title: string;
    description: string;
    test_type: TestType;
    num_questions: number;
}

export default function TestGeneration() {
    const [error, setError] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);
    const { documentId } = useParams<{ documentId: string }>();
    const { register, handleSubmit, formState: { errors } } = useForm<TestGenerationFormData>();
    const navigate = useNavigate();

    const onSubmit = async (data: TestGenerationFormData) => {
        try {
            setError(null);
            setGenerating(true);

            const response = await axios.post('/api/v1/tests/generate', {
                ...data,
                document_id: parseInt(documentId!),
            });

            // Navigate to test taking page
            navigate(`/test/${response.data.id}`);
        } catch (err) {
            setError('Error generating test. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Generate Test
                    </h2>
                </div>
            </div>

            <div className="mt-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">
                            Test Title
                        </label>
                        <div className="mt-2">
                            <input
                                type="text"
                                id="title"
                                {...register('title', {
                                    required: 'Title is required',
                                })}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                            />
                            {errors.title && (
                                <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
                            Description
                        </label>
                        <div className="mt-2">
                            <textarea
                                id="description"
                                rows={3}
                                {...register('description')}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="test_type" className="block text-sm font-medium leading-6 text-gray-900">
                            Test Type
                        </label>
                        <div className="mt-2">
                            <select
                                id="test_type"
                                {...register('test_type', {
                                    required: 'Test type is required',
                                })}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                            >
                                <option value={TestType.MULTIPLE_CHOICE}>Multiple Choice</option>
                                <option value={TestType.SHORT_ANSWER}>Short Answer</option>
                                <option value={TestType.LONG_ANSWER}>Long Answer</option>
                                <option value={TestType.MIXED}>Mixed</option>
                            </select>
                            {errors.test_type && (
                                <p className="mt-2 text-sm text-red-600">{errors.test_type.message}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="num_questions" className="block text-sm font-medium leading-6 text-gray-900">
                            Number of Questions
                        </label>
                        <div className="mt-2">
                            <input
                                type="number"
                                id="num_questions"
                                min={1}
                                max={20}
                                defaultValue={5}
                                {...register('num_questions', {
                                    required: 'Number of questions is required',
                                    min: {
                                        value: 1,
                                        message: 'Minimum 1 question',
                                    },
                                    max: {
                                        value: 20,
                                        message: 'Maximum 20 questions',
                                    },
                                })}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                            />
                            {errors.num_questions && (
                                <p className="mt-2 text-sm text-red-600">{errors.num_questions.message}</p>
                            )}
                        </div>
                    </div>

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
                            disabled={generating}
                            className="flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50"
                        >
                            {generating ? 'Generating Test...' : 'Generate Test'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 