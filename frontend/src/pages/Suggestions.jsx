import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle, Info, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SuggestionItem = ({ type, title, description, impact }) => {
    const [isOpen, setIsOpen] = useState(false);

    const getIcon = () => {
        switch (type) {
            case 'critical': return <AlertCircle className="text-red-500" />;
            case 'warning': return <Info className="text-amber-500" />;
            case 'success': return <CheckCircle className="text-emerald-500" />;
            default: return <Info className="text-blue-500" />;
        }
    };

    const getBorderColor = () => {
        switch (type) {
            case 'critical': return 'border-red-500/30 hover:border-red-500/60';
            case 'warning': return 'border-amber-500/30 hover:border-amber-500/60';
            case 'success': return 'border-emerald-500/30 hover:border-emerald-500/60';
            default: return 'border-slate-700 hover:border-primary/50';
        }
    };

    return (
        <div className={`rounded-xl border bg-dark-card overflow-hidden transition-all duration-300 ${getBorderColor()}`}>
            <div
                className="p-4 flex items-center justify-between cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-white/5">
                        {getIcon()}
                    </div>
                    <div>
                        <h4 className="font-semibold text-white">{title}</h4>
                        <span className={`text-xs uppercase font-bold tracking-wider 
              ${impact === 'High' ? 'text-red-400' : impact === 'Medium' ? 'text-amber-400' : 'text-slate-400'}
            `}>
                            {impact} Impact
                        </span>
                    </div>
                </div>
                <div className="text-slate-400">
                    {isOpen ? <ChevronUp /> : <ChevronDown />}
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/5 bg-slate-900/30"
                    >
                        <div className="p-4 text-slate-300 leading-relaxed text-sm">
                            {description}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Suggestions = () => {
    const [filter, setFilter] = useState('all');
    const navigate = useNavigate();
    const location = useLocation();

    // Retrieve suggestions from state OR full data from local storage
    const savedData = JSON.parse(localStorage.getItem('atsData') || '{}');
    const suggestions = location.state?.suggestions || savedData.suggestions || [];

    useEffect(() => {
        // If accessed directly without data
        if (suggestions.length === 0) {
            // Optional: redirect or just show empty state
            // navigate('/upload'); 
        }
    }, []);

    const filteredSuggestions = filter === 'all'
        ? suggestions
        : suggestions.filter(s => s.type === filter || (filter === 'critical' && s.impact === 'High'));

    return (
        <div className="min-h-screen pt-24 pb-12 px-6">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft size={20} /> Back to Results
                </button>

                <div className="mb-10 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Improvement Suggestions</h1>
                    <p className="text-slate-400">Actionable steps to optimize your resume and increase your score.</p>
                </div>

                {/* Filters */}
                <div className="flex justify-center gap-2 mb-8 overflow-x-auto pb-2">
                    {['all', 'critical', 'warning'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition-all
                ${filter === f
                                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                    : 'bg-dark-card border border-dark-border text-slate-400 hover:text-white'}
              `}
                        >
                            {f === 'critical' ? 'High Impact' : f === 'warning' ? 'Warnings' : 'All Issues'}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {filteredSuggestions.map((suggestion, index) => (
                            <motion.div
                                key={suggestion.id || index}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                layout
                            >
                                <SuggestionItem {...suggestion} />
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredSuggestions.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                            No suggestions found. {suggestions.length === 0 && "Upload a resume to see suggestions."}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Suggestions;
