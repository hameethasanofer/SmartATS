import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Rocket, Upload, FileText, Menu, X, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import HistorySidebar from './HistorySidebar';

const Navbar = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const isActive = (path) => location.pathname === path;

    const navLinkClass = (path) => twMerge(
        "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium",
        isActive(path)
            ? "text-primary bg-primary/10"
            : "text-slate-400 hover:text-primary hover:bg-white/5"
    );

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 p-4">
                <div className="max-w-7xl mx-auto backdrop-blur-md bg-dark-card/70 border border-white/10 rounded-2xl shadow-lg px-6 py-3 flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
                        <div className="w-8 h-8 bg-gradient-to-tr from-primary to-primary-hover rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <Rocket size={18} />
                        </div>
                        <span>Smart<span className="text-primary">ATS</span></span>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex gap-2">
                        <Link to="/" className={navLinkClass('/')}>
                            Home
                        </Link>
                        <Link to="/upload" className={navLinkClass('/upload')}>
                            <Upload size={18} />
                            Analyze Resume
                        </Link>
                        <Link to="/suggestions" className={navLinkClass('/suggestions')}>
                            <FileText size={18} />
                            Suggestions
                        </Link>
                        <button
                            onClick={() => setShowHistory(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium text-slate-400 hover:text-primary hover:bg-white/5"
                        >
                            <Clock size={18} /> History
                        </button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden text-slate-300 hover:text-white"
                    >
                        {isOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden absolute top-20 left-4 right-4 bg-dark-card border border-dark-border rounded-xl p-4 shadow-xl flex flex-col gap-2 animate-fade-in">
                        <Link to="/" onClick={() => setIsOpen(false)} className={navLinkClass('/')}>
                            Home
                        </Link>
                        <Link to="/upload" onClick={() => setIsOpen(false)} className={navLinkClass('/upload')}>
                            <Upload size={18} />
                            Analyze Resume
                        </Link>
                        <Link to="/suggestions" onClick={() => setIsOpen(false)} className={navLinkClass('/suggestions')}>
                            <FileText size={18} />
                            Suggestions
                        </Link>
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                setShowHistory(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium text-slate-400 hover:text-primary hover:bg-white/5 w-full text-left"
                        >
                            <Clock size={18} /> History
                        </button>
                    </div>
                )}
            </nav>

            <HistorySidebar isOpen={showHistory} onClose={() => setShowHistory(false)} />
        </>
    );
};

export default Navbar;
