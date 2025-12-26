import React from 'react';

const Footer = () => {
    return (
        <footer className="mt-auto py-8 border-t border-dark-border bg-dark-bg/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-2 text-center">
                <p className="text-slate-400 text-sm">
                    &copy; {new Date().getFullYear()} SmartATS. All rights reserved.
                </p>
                <p className="text-slate-600 text-xs">
                    Built for job seekers, by job seekers.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
