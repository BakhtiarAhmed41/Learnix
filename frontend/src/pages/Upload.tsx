import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { HiUpload, HiDocumentText, HiX } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const Upload = () => {
    const [files, setFiles] = useState<File[]>([]);
    const navigate = useNavigate();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles((prev) => [...prev, ...acceptedFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'text/plain': ['.txt'],
            'application/msword': ['.doc', '.docx'],
        },
    });

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        // TODO: Implement file upload logic
        navigate('/generate');
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold text-gray-900">Upload Your Study Materials</h1>
                <p className="text-gray-600">
                    Upload your documents to generate personalized tests
                </p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ${isDragActive
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-300 hover:border-primary-600'
                        }`}
                >
                    <input {...getInputProps()} />
                    <HiUpload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                        {isDragActive
                            ? 'Drop the files here...'
                            : 'Drag and drop files here, or click to select files'}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                        Supported formats: PDF, TXT, DOC, DOCX
                    </p>
                </div>

                {files.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900">Uploaded Files</h2>
                        <div className="space-y-2">
                            {files.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"
                                >
                                    <div className="flex items-center space-x-3">
                                        <HiDocumentText className="h-6 w-6 text-primary-600" />
                                        <span className="text-sm text-gray-900">{file.name}</span>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-xs text-gray-500">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </span>
                                        <button
                                            onClick={() => removeFile(index)}
                                            className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                                        >
                                            <HiX className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={handleSubmit}
                                className="btn btn-primary"
                                disabled={files.length === 0}
                            >
                                Continue to Generate Test
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Upload; 