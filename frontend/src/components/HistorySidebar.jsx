import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronRight, FileText, Trash2, X } from 'lucide-react';

const HistorySidebar = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const loadHistory = () => {
            const savedHistory = JSON.parse(localStorage.getItem('atsHistory') || '[]');
            setHistory(savedHistory);
        };

        loadHistory();

        // Listen for storage events to update real-time
        window.addEventListener('storage', loadHistory);
        return () => window.removeEventListener('storage', loadHistory);
    }, [isOpen]); // Reload when sidebar opens

    const handleSelect = (item) => {
        // Navigate to results with this item's data
        navigate('/results', { state: { data: item } });
        if (window.innerWidth < 768) {
            onClose();
        }
    };

    const clearHistory = () => {
        if (confirm('Are you sure you want to clear your analysis history?')) {
            localStorage.removeItem('atsHistory');
            setHistory([]);
        }
    };

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed top-0 right-0 h-full w-80 bg-dark-card border-l border-dark-border z-50 
                transform transition-transform duration-300 ease-in-out shadow-2xl
                ${isOpen ? 'translate-x-0' : 'translate-x-full'}
            `}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 border-b border-dark-border flex justify-between items-center bg-slate-900/50">
                        <div className="flex items-center gap-2 text-white font-semibold">
                            <Clock size={18} className="text-primary" />
                            <h3>Recent Analysis</h3>
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                            <X size={20} className="text-slate-400" />
                        </button>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {history.length === 0 ? (
                            <div className="text-center text-slate-500 mt-10">
                                <FileText size={48} className="mx-auto mb-3 opacity-20" />
                                <p>No history yet.</p>
                                <p className="text-xs mt-1">Upload a resume to start.</p>
                            </div>
                        ) : (
                            history.map((item, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleSelect(item)}
                                    className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800 hover:border-primary/30 cursor-pointer transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                                            ${item.score >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                                                item.score >= 60 ? 'bg-amber-500/20 text-amber-400' :
                                                    'bg-red-500/20 text-red-400'}
                                        `}>
                                            Score: {item.score}
                                        </span>
                                        <span className="text-[10px] text-slate-500">
                                            {new Date(item.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-medium text-slate-200 line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                                        {item.fileName || `Resume Analysis ${history.length - index}`}
                                    </h4>
                                    <div className="flex items-center justify-between text-xs text-slate-400">
                                        <span>{item.issues?.critical || 0} Critical Issues</span>
                                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {history.length > 0 && (
                        <div className="p-4 border-t border-dark-border bg-slate-900/50">
                            <button
                                onClick={clearHistory}
                                className="flex items-center justify-center gap-2 w-full py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                                <Trash2 size={16} /> Clear History
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default HistorySidebar;
