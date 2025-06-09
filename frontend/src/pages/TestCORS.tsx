import { useState, useEffect } from 'react';
import axios from 'axios';

const TestCORS = () => {
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const testCORS = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/test-cors/', {
                    withCredentials: true,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    }
                });
                setMessage(response.data.message);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            }
        };

        testCORS();
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">CORS Test</h1>
            {message && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    {message}
                </div>
            )}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}
        </div>
    );
};

export default TestCORS; 