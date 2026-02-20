import React, { useState, useRef } from 'react';
import { Copy, FileText, Brain, ChevronDown, ChevronUp, ExternalLink, Loader, Lock, Download, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import html2canvas from 'html2canvas';

const ReportView = ({ answers }) => {
  const [activeTab, setActiveTab] = useState('A企业: 企业真正想要的是什么?');
  const [apiKey, setApiKey] = useState('sk-d224af7813174344aaa96ac04ac25774');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const reportRef = useRef(null);

  const categories = Object.keys(answers);
  
  const formattedContent = categories.map(cat => {
    const qa = answers[cat];
    return `### ${cat}\n${Object.entries(qa).map(([q, a]) => `- 问: ${q}\n  答: ${a}`).join('\n')}`;
  }).join('\n\n');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formattedContent);
    alert('已复制');
  };

  const handleDownloadImage = async () => {
    if (!reportRef.current) return;
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#0f172a', // slate-900
        scale: 2, // Higher quality
      });
      
      const link = document.createElement('a');
      link.download = 'Brand_Consulting_Report.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to export image:', err);
      alert('图片生成失败，请重试');
    }
  };

  const generateAnalysis = async () => {
    if (!apiKey) {
      alert('请输入API Key');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "qwen-plus",
          messages: [
            {
              role: "system",
              content: `You are Dan Koe (The Zen Capitalist).
              
              Your task is to analyze the user's business inputs and provide a "Clarity Protocol" (not a corporate report).
              
              Apply the following philosophy:
              1. **The Niche is You**: The user is solving a problem they once had. Identify that problem.
              2. **The Product is a Synthesis**: How can they combine their unique interests?
              3. **The Goal is Freedom**: Move away from "scale at all costs" to "lifestyle design".
              
              Output structure:
              ### 1. The Trap (Current Situation)
              What game are they playing that they can't win? (The "Old System").
              
              ### 2. The Clarity (Core Insight)
              One sentence that defines their unique value.
              
              ### 3. The Path (Next Steps)
              3 specific actions to build leverage (Content, Product, or System).
              
              Tone: Minimalist, direct, philosophical, empowering. No corporate jargon.
              
              Format: Use Lists and Headers. No Tables.`
            },
            {
              role: "user",
              content: formattedContent
            }
          ]
        })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message || JSON.stringify(data.error));
      }
      setAnalysis(data.choices[0].message.content);
    } catch (error) {
      alert('Generation failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-12 font-sans text-zinc-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 min-h-[80vh]">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-lg font-serif italic text-zinc-100 mb-8 flex items-center gap-2 px-2 tracking-wide">
            <FileText className="text-zinc-500" size={18} /> 
            Protocol Data
          </h2>
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(cat)}
              className={`w-full text-left px-4 py-3 text-xs uppercase tracking-widest transition-all duration-300 border-l ${
                activeTab === cat 
                  ? 'border-zinc-100 text-zinc-100 bg-zinc-900' 
                  : 'border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600'
              }`}
            >
              <span className="font-mono opacity-30 mr-3 text-[10px]">{String.fromCharCode(65 + idx)}</span>
              {cat.split(':')[0].substring(1)}
            </button>
          ))}
          
          <div className="pt-8 mt-8 border-t border-zinc-900 space-y-4">
             <button 
              onClick={copyToClipboard}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-zinc-200 text-xs uppercase tracking-widest transition-colors"
            >
              <Copy size={12} /> Copy Raw Data
            </button>
            {analysis && (
              <button 
                onClick={handleDownloadImage}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-100 hover:bg-white text-black text-xs uppercase tracking-widest transition-colors"
              >
                <Download size={12} /> Export Image
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9 space-y-12">
          {/* Answer Review Section */}
          <div className="bg-zinc-950 border-b border-zinc-900 pb-12">
             <h3 className="text-xl font-serif italic text-zinc-100 mb-8 pb-4 border-b border-zinc-900">
                {activeTab}
             </h3>
             <div className="space-y-12">
                {answers[activeTab] && Object.entries(answers[activeTab]).map(([q, a], idx) => (
                  <div key={idx} className="group">
                    <p className="text-xs uppercase tracking-widest text-zinc-600 mb-4 flex gap-3">
                      <span className="text-zinc-400 font-mono">Q{idx + 1}</span> {q}
                    </p>
                    <div className="pl-6 border-l border-zinc-800 group-hover:border-zinc-600 transition-colors">
                      <p className="text-zinc-300 leading-loose text-lg font-light whitespace-pre-wrap">
                        {a}
                      </p>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          {/* AI Analysis Section */}
          <div className="relative">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-2xl font-serif italic text-zinc-100 flex items-center gap-3">
                 <Brain className="text-zinc-500" strokeWidth={1} /> The Synthesis
               </h3>
               {!analysis && (
                 <button 
                   onClick={() => setShowKeyInput(!showKeyInput)}
                   className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors uppercase tracking-widest flex items-center gap-2"
                 >
                   <Lock size={12} /> {showKeyInput ? 'Hide Config' : 'Config Key'}
                 </button>
               )}
             </div>

             {showKeyInput && !analysis && (
               <motion.div 
                 initial={{ height: 0, opacity: 0 }}
                 animate={{ height: 'auto', opacity: 1 }}
                 className="mb-8 p-6 bg-zinc-900/30 border border-zinc-800"
               >
                 <label className="block text-[10px] font-bold text-zinc-500 mb-3 uppercase tracking-widest">OpenAI API Key</label>
                 <div className="flex gap-4">
                   <input 
                     type="password" 
                     value={apiKey}
                     onChange={(e) => setApiKey(e.target.value)}
                     placeholder="sk-..."
                     className="flex-1 px-4 py-3 bg-zinc-950 border border-zinc-800 text-zinc-300 focus:outline-none focus:border-zinc-500 transition-all font-mono text-sm"
                   />
                   <button 
                     onClick={generateAnalysis}
                     disabled={loading || !apiKey}
                     className="bg-zinc-100 text-black px-8 py-3 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-xs uppercase tracking-widest font-bold"
                   >
                     {loading ? <Loader className="animate-spin" size={14} /> : <Brain size={14} />}
                     Synthesize
                   </button>
                 </div>
               </motion.div>
             )}

             {loading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-8 border border-zinc-900 bg-zinc-950/50">
                  <div className="relative">
                    <Loader className="animate-spin text-zinc-500" size={48} strokeWidth={1} />
                  </div>
                  <div className="text-center space-y-3">
                    <p className="text-zinc-300 font-serif italic text-xl">Synthesizing Clarity...</p>
                    <p className="text-zinc-600 text-xs uppercase tracking-widest">Consulting the digital oracle</p>
                  </div>
                </div>
             ) : analysis ? (
               <div ref={reportRef} className="bg-zinc-950 p-8 md:p-12 border border-zinc-900">
                 <div className="flex justify-end mb-8 md:hidden">
                    <button 
                     onClick={handleDownloadImage}
                     className="text-zinc-500 text-xs uppercase tracking-widest border border-zinc-800 px-3 py-2"
                   >
                     Save Image
                   </button>
                 </div>
                 <div className="prose prose-invert prose-zinc max-w-none 
                   prose-headings:font-serif prose-headings:font-normal prose-headings:italic prose-headings:text-zinc-100
                   prose-p:text-zinc-400 prose-p:font-light prose-p:leading-loose
                   prose-li:text-zinc-400 prose-li:leading-loose
                   prose-strong:text-zinc-200 prose-strong:font-medium
                   prose-hr:border-zinc-800
                 ">
                   <ReactMarkdown 
                     components={{
                       h3: ({node, ...props}) => <h3 className="text-xl mt-12 mb-6 border-b border-zinc-900 pb-2" {...props} />,
                       strong: ({node, ...props}) => <strong className="text-zinc-100 font-medium" {...props} />,
                       ul: ({node, ...props}) => <ul className="my-8 space-y-2 pl-4 border-l border-zinc-800" {...props} />
                     }}
                   >
                     {analysis}
                   </ReactMarkdown>
                 </div>
                 <div className="mt-16 pt-8 border-t border-zinc-900 flex justify-between items-center text-[10px] uppercase tracking-widest text-zinc-700">
                   <span>The Clarity Protocol</span>
                   <span>By Yaohui Growth</span>
                 </div>
               </div>
             ) : (
               !showKeyInput && (
                 <div className="space-y-8 py-12 text-center border border-zinc-900 bg-zinc-950/50">
                   <div className="max-w-2xl mx-auto px-6">
                     <h4 className="font-serif italic text-2xl text-zinc-200 mb-8">
                        Ready to find your signal?
                     </h4>
                     <p className="text-zinc-500 font-light leading-relaxed mb-12">
                       We will use AI to process your inputs through the lens of Essentialism and Focus.<br/>
                       The goal is not more information, but less confusion.
                     </p>
                     
                     <button 
                       onClick={() => generateAnalysis()}
                       className="bg-zinc-100 hover:bg-white text-black px-10 py-4 text-sm uppercase tracking-widest transition-all transform hover:scale-105 flex items-center gap-3 mx-auto"
                     >
                       <Brain size={16} />
                       Generate Protocol
                     </button>
                   </div>
                 </div>
               )
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportView;
