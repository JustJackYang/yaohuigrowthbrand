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
    <div className="min-h-screen bg-zinc-950 text-zinc-300 flex flex-col font-sans selection:bg-zinc-700 selection:text-white">
      {/* Minimal Header - Dan Koe Style */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-900">
        <div className="max-w-4xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="group flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-6 h-6 border border-zinc-700 flex items-center justify-center group-hover:bg-zinc-900 transition-colors">
                  <span className="text-zinc-400 text-xs font-serif italic">Y</span>
                </div>
                <span className="text-sm tracking-widest uppercase text-zinc-500 group-hover:text-zinc-300 transition-colors">Return</span>
            </Link>
          </div>
          
          <div className="absolute left-1/2 -translate-x-1/2">
             <h1 className="text-sm font-serif italic tracking-wide text-zinc-400">
              The Clarity Protocol
            </h1>
          </div>

          {showReport && (
            <button 
              onClick={() => setShowReport(false)}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-widest"
            >
              Reset Focus
            </button>
          )}
        </div>
      </header>
      
      <main className="flex-1 w-full pt-16 max-w-4xl mx-auto">
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
