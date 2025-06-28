import { ReactNode, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiAcademicCap } from 'react-icons/hi';
import { FiSun, FiMoon } from 'react-icons/fi';

interface LayoutProps {
    children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const root = document.documentElement;
        if (darkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [darkMode]);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
            <nav className="bg-white shadow-md w-full dark:bg-gray-900">
                <div className="flex justify-between items-center h-16 w-full px-4 sm:px-6 lg:px-8">
                    {/* Logo - Left side */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center">
                            <span className="flex items-center space-x-2 text-xl font-bold uppercase" style={{ fontFamily: 'Poppins, cursive, sans-serif', letterSpacing: '2px', background: '#e0e7ff', padding: '2px 16px', borderRadius: '9999px' }}>
                                <HiAcademicCap className="h-7 w-7" style={{ color: 'black' }} />
                                <span className="text-indigo-600">Learnix</span>
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation - Center */}
                    <div className="hidden sm:flex items-center justify-center flex-1">
                        <div className="flex space-x-8">
                            <Link
                                to="/"
                                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 dark:text-gray-100"
                            >
                                Home
                            </Link>
                            <Link
                                to="/documents"
                                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                            >
                                Documents
                            </Link>
                            <Link
                                to="/contact"
                                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                            >
                                Contact
                            </Link>
                            <Link
                                to="/feedback"
                                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                            >
                                Feedback
                            </Link>
                        </div>
                    </div>

                    {/* Theme toggle button - Right side */}
                    <div className="flex items-center">
                        <button
                            onClick={() => setDarkMode((prev) => !prev)}
                            className="ml-4 p-2 rounded-full bg-indigo-100 hover:bg-indigo-200 dark:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none transition-colors"
                            aria-label="Toggle theme"
                        >
                            {darkMode ? (
                                <FiSun className="h-6 w-6 text-yellow-500" />
                            ) : (
                                <FiMoon className="h-6 w-6 text-gray-800" />
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            <main className="flex-grow">
                <div className="w-full py-6 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    {children}
                </div>
            </main>

            <footer className="bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-sm text-gray-500 dark:text-gray-300">
                        © {new Date().getFullYear()} Learnix. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Layout; 