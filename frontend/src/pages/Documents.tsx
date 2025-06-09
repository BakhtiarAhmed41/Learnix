import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentAPI } from '../services/api';

interface Document {
    id: number;
    title: string;
    file_type: string;
    upload_date: string;
    status: string;
}

const Documents = () => {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchDocuments = async () => {
            try {
                const data = await documentAPI.list();
                setDocuments(data);
            } catch (err: any) {
                if (err.response?.status === 401) {
                    navigate('/login');
                } else {
                    setError('Failed to fetch documents. Please try again.');
                    console.error('Fetch error:', err);
                }
            }
        };

        fetchDocuments();
    }, [navigate]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError(null);

        try {
            const response = await documentAPI.upload(file, file.name);
            setDocuments([...documents, response]);
        } catch (err: any) {
            if (err.response?.status === 401) {
                navigate('/login');
            } else {
                setError('Failed to upload document. Please try again.');
                console.error('Upload error:', err);
            }
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <h1 className="text-2xl font-semibold text-gray-900">Documents</h1>
                <div className="mt-4 sm:mt-0">
                    <label
                        htmlFor="file-upload"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
                    >
                        {isUploading ? 'Uploading...' : 'Upload Document'}
                        <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.txt"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                        />
                    </label>
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

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {documents.map((doc) => (
                        <li key={doc.id}>
                            <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <svg
                                                className="h-6 w-6 text-gray-400"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                />
                                            </svg>
                                        </div>
                                        <div className="ml-4">
                                            <h2 className="text-sm font-medium text-gray-900">{doc.title}</h2>
                                            <p className="text-sm text-gray-500">{doc.file_type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${doc.status === 'processed'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                        >
                                            {doc.status}
                                        </span>
                                        <span className="ml-4 text-sm text-gray-500">
                                            {new Date(doc.upload_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                    {documents.length === 0 && (
                        <li className="px-4 py-5 sm:px-6">
                            <div className="text-center text-gray-500">
                                No documents uploaded yet. Upload your first document to get started.
                            </div>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default Documents; 