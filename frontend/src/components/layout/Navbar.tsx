import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiMenu, HiX, HiAcademicCap } from 'react-icons/hi';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'Upload', path: '/upload' },
        { name: 'Generate Test', path: '/generate' },
    ];

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-lg w-full border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center h-16 w-full px-4 sm:px-6 lg:px-8">
                {/* Logo - Left side */}
                <div className="flex items-center">
                    <Link to="/" className="flex-shrink-0 flex items-center space-x-2">
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="flex items-center space-x-2"
                        >
                            <HiAcademicCap className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                            <span
                                className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 uppercase"
                                style={{ fontFamily: 'Poppins, cursive, sans-serif', letterSpacing: '2px', background: '#e0e7ff', padding: '2px 10px', borderRadius: '6px' }}
                            >
                                Learnix
                            </span>
                        </motion.div>
                    </Link>
                </div>

                {/* Desktop Navigation - Center */}
                <div className="hidden md:flex items-center justify-center flex-1">
                    <div className="flex space-x-8">
                        <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">Home</Link>
                        <Link to="/upload" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">Upload</Link>
                        <Link to="/generate" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">Generate Test</Link>
                    </div>
                </div>

                {/* Mobile Navigation Button - Right side */}
                <div className="md:hidden flex items-center">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none"
                    >
                        {isOpen ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
                >
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsOpen(false)}>Home</Link>
                        <Link to="/upload" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsOpen(false)}>Upload</Link>
                        <Link to="/generate" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsOpen(false)}>Generate Test</Link>
                    </div>
                </motion.div>
            )}
        </nav>
    );
};

export default Navbar; 