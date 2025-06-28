import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Feedback = () => {
    const formRef = useRef<HTMLFormElement>(null);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(false);
        setSuccess(false);
        const form = formRef.current;
        if (!form) return;
        const formData = new FormData(form);
        try {
            const res = await fetch('https://formspree.io/f/xldnaljg', {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' },
            });
            if (res.ok) {
                setSuccess(true);
                setTimeout(() => navigate('/'), 2000);
                form.reset();
            } else {
                setError(true);
            }
        } catch {
            setError(true);
        }
    };

    return (
        <div className="max-w-lg mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md mt-8">
            <h2 className="text-2xl font-bold mb-2 text-center text-gray-800 dark:text-gray-100">Feedback</h2>
            <p className="mb-6 text-center text-gray-600 dark:text-gray-300">We value your feedback! Please let us know your thoughts or suggestions below.</p>
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                <input name="name" type="text" required placeholder="Your Name" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                <input name="email" type="email" required placeholder="Your Email" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                <textarea name="feedback" required placeholder="Your Feedback" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" rows={5} />
                <button type="submit" className="w-full py-2 px-4 rounded-md bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium">
                    Submit Feedback
                </button>
                {success && <p className="text-green-600 dark:text-green-400 text-center">Feedback sent! Redirecting...</p>}
                {error && <p className="text-red-600 dark:text-red-400 text-center">Failed to send feedback. Please try again.</p>}
            </form>
        </div>
    );
};

export default Feedback; 