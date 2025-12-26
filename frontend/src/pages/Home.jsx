import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Zap, Target } from 'lucide-react';
import Button from '../components/Button';

const Home = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: <Zap size={24} className="text-accent" />,
            title: "Instant Analysis",
            description: "Get detailed feedback on your resume in seconds with our advanced AI scanner."
        },
        {
            icon: <Target size={24} className="text-primary" />,
            title: "ATS Compatibility",
            description: "Ensure your resume passes Applicant Tracking Systems used by top companies."
        },
        {
            icon: <CheckCircle size={24} className="text-secondary" />,
            title: "Actionable Tips",
            description: "Receive specific, actionable suggestions to improve your score and get hired."
        }
    ];

    return (
        <div className="min-h-screen pt-24 pb-12 px-6 flex flex-col gap-20">
            {/* Hero Section */}
            <section className="relative min-h-[70vh] flex items-center justify-center text-center">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -z-10" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto space-y-8"
                >
                    <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4 border border-primary/20">
                        🚀 Boost your hiring chances today
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight text-white">
                        Optimize Your Resume for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Success</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Beat the ATS bots and land your dream job. Our intelligent resume analyzer gives you instant scoring and personalized improvement suggestions.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                        <Button onClick={() => navigate('/upload')} className="w-full sm:w-auto h-14 text-lg">
                            Analyze My Resume <ArrowRight size={20} />
                        </Button>
                        <Button variant="secondary" onClick={() => navigate('/suggestions')} className="w-full sm:w-auto h-14 text-lg">
                            View Sample Suggestions
                        </Button>
                    </div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="max-w-7xl mx-auto w-full">
                <h2 className="text-3xl font-bold text-center mb-12 text-white">Why Use SmartATS?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="group p-8 rounded-2xl bg-dark-card border border-dark-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
                        >
                            <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                            <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
