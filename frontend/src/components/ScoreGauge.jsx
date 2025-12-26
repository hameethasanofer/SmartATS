import React from 'react';
import { motion } from 'framer-motion';

const ScoreGauge = ({ score }) => {
    // Config
    const radius = 80;
    const stroke = 12;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    // Color based on score
    const getColor = (s) => {
        if (s >= 80) return '#10b981'; // Emerald
        if (s >= 60) return '#f59e0b'; // Amber
        return '#ef4444'; // Red
    };

    const color = getColor(score);

    return (
        <div className="relative flex flex-col items-center justify-center p-6 bg-dark-card rounded-3xl border border-dark-border shadow-2xl">
            <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Background Circle */}
                <svg
                    height={radius * 2}
                    width={radius * 2}
                    className="transform -rotate-90"
                >
                    <circle
                        stroke="#334155"
                        strokeWidth={stroke}
                        fill="transparent"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                    <motion.circle
                        stroke={color}
                        strokeWidth={stroke}
                        strokeLinecap="round"
                        fill="transparent"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                        initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                </svg>

                {/* Score Text */}
                <div className="absolute flex flex-col items-center">
                    <motion.span
                        className="text-5xl font-bold text-white"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        {score}
                    </motion.span>
                    <span className="text-slate-400 text-sm font-medium">ATS SCORE</span>
                </div>
            </div>

            {/* Grade */}
            <div className="mt-4 text-center">
                <h3 className="text-xl font-bold" style={{ color }}>
                    {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Improvement'}
                </h3>
                <p className="text-slate-500 text-sm mt-1">
                    {score >= 80 ? 'Your resume is ready for applications!' : 'A few tweaks can boost your chances.'}
                </p>
            </div>
        </div>
    );
};

export default ScoreGauge;
