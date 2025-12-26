import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import { Loader2 } from 'lucide-react';

const ResumeUpload = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleUpload = async (file) => {
        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('resume', file);

        try {
            // Assuming backend is running on port 5000
            const response = await fetch('http://localhost:5000/api/analyze', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Analysis failed. Please try again.');
                // In a real scenario, read the error message from response
            }

            const data = await response.json();

            // Save for active session persistence
            localStorage.setItem('atsData', JSON.stringify(data));

            // Add to History
            const historyItem = {
                ...data,
                fileName: file.name,
                timestamp: new Date().toISOString()
            };

            const history = JSON.parse(localStorage.getItem('atsHistory') || '[]');
            history.unshift(historyItem); // Add to top
            // Limit history to last 20 items
            if (history.length > 20) history.pop();

            localStorage.setItem('atsHistory', JSON.stringify(history));

            // Dispatch storage event to update sidebar immediately without refresh
            window.dispatchEvent(new Event('storage'));

            // Navigate to results with the real data
            navigate('/results', { state: { data } });

        } catch (err) {
            console.error(err);
            setError('Something went wrong examining your resume. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-28 pb-12 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Check Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Resume Score</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Upload your resume to see how well it parses for Applicant Tracking Systems. Get instant feedback on formatting, keywords, and content.
                    </p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center p-12 space-y-4">
                        <Loader2 className="w-16 h-16 text-primary animate-spin" />
                        <p className="text-xl font-medium text-white">Analyzing your resume...</p>
                        <p className="text-slate-400">This usually takes about 10-15 seconds.</p>
                    </div>
                ) : (
                    <>
                        <FileUpload onUpload={handleUpload} />
                        {error && (
                            <div className="mt-6 text-center text-red-400 bg-red-400/10 p-4 rounded-xl border border-red-500/20 max-w-lg mx-auto">
                                {error}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ResumeUpload;
