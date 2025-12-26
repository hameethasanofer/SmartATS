import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ResumeUpload from './pages/ResumeUpload';
import ATSResult from './pages/ATSResult';
import Suggestions from './pages/Suggestions';
import './App.css';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-dark-bg">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<ResumeUpload />} />
            <Route path="/results" element={<ATSResult />} />
            <Route path="/suggestions" element={<Suggestions />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
