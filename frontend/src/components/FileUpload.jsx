import React, { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import Button from './Button';

const FileUpload = ({ onUpload }) => {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const validateFile = (file) => {
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(file.type)) {
            setError('Please upload a PDF or DOCX file.');
            return false;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB
            setError('File size must be less than 5MB.');
            return false;
        }
        setError('');
        return true;
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (validateFile(droppedFile)) {
                setFile(droppedFile);
            }
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (validateFile(selectedFile)) {
                setFile(selectedFile);
            }
        }
    };

    const handleRemove = () => {
        setFile(null);
        setError('');
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const handleSubmit = () => {
        if (file && onUpload) {
            onUpload(file);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div
                className={twMerge(
                    "relative flex flex-col items-center justify-center w-full min-h-[300px] p-8 border-2 border-dashed rounded-2xl transition-all duration-300",
                    dragActive
                        ? "border-primary bg-primary/5 scale-[1.02]"
                        : "border-dark-border bg-dark-card/50 hover:border-slate-500",
                    error ? "border-red-500/50" : ""
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    onChange={handleChange}
                    accept=".pdf,.docx"
                />

                {!file ? (
                    <div className="text-center space-y-4">
                        <div className="w-20 h-20 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <Upload size={40} className="text-primary animate-bounce" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">Upload your resume</h3>
                        <p className="text-slate-400">
                            Drag and drop your resume here, or <button onClick={() => inputRef.current?.click()} className="text-primary hover:underline font-medium">browse</button>
                        </p>
                        <p className="text-xs text-slate-500 mt-4">
                            Supports PDF and DOCX (Max 5MB)
                        </p>
                    </div>
                ) : (
                    <div className="w-full space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                                <FileText size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">{file.name}</p>
                                <p className="text-slate-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <button
                                onClick={handleRemove}
                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex justify-center pt-4">
                            <Button onClick={handleSubmit} className="w-full sm:w-auto min-w-[200px]">
                                Analyze Resume
                            </Button>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-lg text-sm">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    "AI-Powered Analysis",
                    "ATS Formatting Check",
                    "Keyword Optimization"
                ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-400 text-sm justify-center">
                        <CheckCircle size={16} className="text-primary" />
                        {feature}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FileUpload;
