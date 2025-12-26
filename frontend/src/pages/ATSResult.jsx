import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, X, AlertTriangle, ArrowRight, Download } from 'lucide-react';
import Button from '../components/Button';
import ScoreGauge from '../components/ScoreGauge';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ATSResult = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Retrieve data from location state OR local storage
    const data = location.state?.data || JSON.parse(localStorage.getItem('atsData'));

    useEffect(() => {
        if (!data) {
            navigate('/upload');
        }
    }, [data, navigate]);

    if (!data) return null;

    const { score, issues, metrics } = data;

    const handleDownload = () => {
        const doc = new jsPDF();

        // Title
        doc.setFontSize(22);
        doc.setTextColor(41, 128, 185); // Blue color
        doc.text("SmartATS Resume Analysis Report", 14, 20);

        // Date
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

        // Score Section
        doc.setDrawColor(200);
        doc.line(14, 32, 196, 32); // Horizontal line

        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text(`Overall Score: ${score}/100`, 14, 42);

        // Summary Counts
        doc.setFontSize(12);
        doc.setTextColor(231, 76, 60); // Red
        doc.text(`Critical Issues: ${issues.critical}`, 14, 52);

        doc.setTextColor(243, 156, 18); // Orange
        doc.text(`Warnings: ${issues.warnings}`, 60, 52);

        doc.setTextColor(39, 174, 96); // Green
        doc.text(`Good Points: ${issues.good}`, 110, 52);

        // Resume Summary Text
        if (data.summary) {
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text("Executive Summary", 14, 65);
            doc.setFontSize(10);
            doc.setTextColor(80);
            const splitSummary = doc.splitTextToSize(data.summary, 180);
            doc.text(splitSummary, 14, 72);
        }

        // Metrics Table
        const tableBody = metrics.map(metric => [
            metric.label,
            metric.status.toUpperCase(),
            metric.message
        ]);

        autoTable(doc, {
            startY: data.summary ? 90 : 65,
            head: [['Metric', 'Status', 'Feedback']],
            body: tableBody,
            headStyles: { fillColor: [44, 62, 80] },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 40 },
                1: { fontStyle: 'bold', cellWidth: 25 },
                2: { cellWidth: 'auto' }
            },
            didParseCell: (data) => {
                if (data.section === 'body' && data.column.index === 1) {
                    const status = data.cell.raw;
                    if (status === 'PASS') data.cell.styles.textColor = [39, 174, 96];
                    if (status === 'WARNING') data.cell.styles.textColor = [243, 156, 18];
                    if (status === 'FAIL') data.cell.styles.textColor = [231, 76, 60];
                }
            }
        });

        // Save
        doc.save('SmartATS_Report.pdf');
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-6">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Score Card */}
                <div className="lg:col-span-1 space-y-6">
                    <ScoreGauge score={score} />

                    <div className="p-6 bg-dark-card rounded-2xl border border-dark-border">
                        <h3 className="text-lg font-bold text-white mb-4">Summary</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg text-red-400">
                                <span className="flex items-center gap-2"><X size={18} /> Critical Issues</span>
                                <span className="font-bold">{issues.critical}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-amber-500/10 rounded-lg text-amber-400">
                                <span className="flex items-center gap-2"><AlertTriangle size={18} /> Improvements</span>
                                <span className="font-bold">{issues.warnings}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
                                <span className="flex items-center gap-2"><Check size={18} /> Passed Checks</span>
                                <span className="font-bold">{issues.good}</span>
                            </div>
                        </div>

                        <Button onClick={() => navigate('/suggestions', { state: { suggestions: data.suggestions } })} className="w-full mt-6">
                            Fix Issues Now <ArrowRight size={18} />
                        </Button>
                    </div>
                </div>

                {/* Right Column: Key Metrics */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-dark-card rounded-3xl border border-dark-border p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Analysis Details</h2>
                                <p className="text-slate-400">Breakdown of your resume's performance</p>
                            </div>
                            <Button variant="secondary" className="hidden sm:flex" onClick={handleDownload}>
                                <Download size={18} /> Download Report
                            </Button>
                        </div>

                        <div className="grid gap-4">
                            {metrics.map((metric, i) => (
                                <div key={i} className="flex items-center p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors">
                                    <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center mr-4 shrink-0
                    ${metric.status === 'pass' ? 'bg-emerald-500/10 text-emerald-500' : ''}
                    ${metric.status === 'warning' ? 'bg-amber-500/10 text-amber-500' : ''}
                    ${metric.status === 'fail' ? 'bg-red-500/10 text-red-500' : ''}
                  `}>
                                        {metric.status === 'pass' && <Check size={20} />}
                                        {metric.status === 'warning' && <AlertTriangle size={20} />}
                                        {metric.status === 'fail' && <X size={20} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between mb-1">
                                            <h4 className="font-semibold text-white truncate mr-2">{metric.label}</h4>
                                            <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full shrink-0
                         ${metric.status === 'pass' ? 'bg-emerald-500/10 text-emerald-500' : ''}
                         ${metric.status === 'warning' ? 'bg-amber-500/10 text-amber-500' : ''}
                         ${metric.status === 'fail' ? 'bg-red-500/10 text-red-500' : ''}
                      `}>
                                                {metric.status}
                                            </span>
                                        </div>
                                        <p className="text-slate-400 text-sm">{metric.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ATSResult;
