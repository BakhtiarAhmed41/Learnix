import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';

interface UploadFormData {
    title: string;
    file: FileList;
}

export default function DocumentUpload() {
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<UploadFormData>();
    const navigate = useNavigate();

    const onSubmit = async (data: UploadFormData) => {
        try {
            setError(null);
            setUploading(true);

            const formData = new FormData();
            formData.append('file', data.file[0]);
            formData.append('title', data.title);

            const response = await axios.post('/api/v1/documents/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Navigate to test generation page
            navigate(`/generate-test/${response.data.id}`);
        } catch (err) {
            setError('Error uploading document. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Upload Study Material
                    </h2>
                </div>
            </div>

            <div className="mt-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">
                            Document Title
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
                        <label htmlFor="file" className="block text-sm font-medium leading-6 text-gray-900">
                            Document File
                        </label>
                        <div className="mt-2">
                            <input
                                type="file"
                                id="file"
                                accept=".pdf,.txt,.doc,.docx,.jpg,.jpeg,.png"
                                {...register('file', {
                                    required: 'File is required',
                                })}
                                className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                            />
                            {errors.file && (
                                <p className="mt-2 text-sm text-red-600">{errors.file.message}</p>
                            )}
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                            Supported formats: PDF, TXT, DOC, DOCX, JPG, JPEG, PNG
                        </p>
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
                            disabled={uploading}
                            className="flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50"
                        >
                            {uploading ? 'Uploading...' : 'Upload Document'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 