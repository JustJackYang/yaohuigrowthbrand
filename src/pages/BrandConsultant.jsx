import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ChatInterface from '../components/ChatInterface';
import ReportView from '../components/ReportView';

function BrandConsultant() {
  const [showReport, setShowReport] = useState(false);
  const [answers, setAnswers] = useState({});

  const handleFinish = (collectedAnswers) => {
    setAnswers(collectedAnswers);
    setShowReport(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-slate-950/50 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link to="/" className="hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <span className="text-white font-bold text-lg">Y</span>
                </div>
            </Link>
            <h1 className="text-lg font-medium tracking-wide text-slate-100">
              YaohuiGrowth<span className="text-slate-500 font-light">BrandConsultant</span>
            </h1>
          </div>
          
          {showReport && (
            <button 
              onClick={() => setShowReport(false)}
              className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2 px-3 py-1 rounded-full hover:bg-white/5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              返回对话
            </button>
          )}
        </div>
      </header>
      
      <main className="flex-1 w-full pt-16">
        {showReport ? (
          <ReportView answers={answers} />
        ) : (
          <ChatInterface onFinish={handleFinish} />
        )}
      </main>
    </div>
  );
}

export default BrandConsultant;
