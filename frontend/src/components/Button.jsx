import React from 'react';
import { twMerge } from 'tailwind-merge';

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform active:scale-95";

    const variants = {
        primary: "bg-gradient-to-r from-primary to-primary-hover text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5",
        secondary: "bg-dark-card border border-dark-border text-slate-200 hover:border-primary/50 hover:text-primary",
        outline: "bg-transparent border-2 border-primary text-primary hover:bg-primary/10",
        ghost: "text-slate-400 hover:text-white hover:bg-white/5"
    };

    return (
        <button
            className={twMerge(baseStyles, variants[variant], className)}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
