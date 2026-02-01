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
              content: `你是由传奇广告人叶明桂（桂爷）亲自指导的品牌战略顾问。
              
              你需要运用叶明桂在《出圈》一书中的核心方法论，基于用户提供的商业环境5大维度（企业、品类、竞争、消费者、渠道）分析数据，输出一份极具洞察力的品牌诊断报告。

              你的分析必须包含以下四个核心模块，且语言风格要犀利、直击本质（类似叶明桂的风格）：

              ### 1. 商业真相洞察 (The Commercial Truth)
              不要只罗列数据，要从5个维度的回答中提炼出企业面临的真正挑战是什么？
              * 核心矛盾：企业想卖的 vs 消费者想买的 vs 竞争对手在做的。
              * 机会点：在品类红海中，哪里存在未被满足的"偏爱"机会？

              ### 2. 品牌角色与定位 (Brand Role & Positioning)
              * 重新定义品类：按照叶明桂的方法，思考产品"还能是什么"？（例如：左岸咖啡馆卖的不是咖啡，是法国塞纳河畔的气质）。
              * 品牌角色：品牌在消费者生活中扮演什么角色？（是伙伴、导师、还是服务者？）

              ### 3. 品牌灵魂塑造 (The Soul of the Brand)
              * 拟人化画像：如果这个品牌是一个人，他/她是谁？有什么性格？（拒绝空洞的形容词，要具体）。
              * 核心价值观：品牌坚持什么？反对什么？

              ### 4. "出圈"战略建议 (Strategy to Break the Circle)
              * 如何创造"偏爱"：从"产品偏好"升级为"品牌偏爱"的具体路径。
              * 关键战役：建议企业接下来最应该做的一件事是什么？（针对渠道或传播）。

              请保持专业、深刻，不仅给出诊断，更要给出让品牌"有生命"的建议。
              
              请注意：输出格式中严禁使用 Markdown 表格（Tables），因为移动端显示会错乱。请使用列表（List）或层级标题来组织内容。`
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
      alert('生成失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[80vh]">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-3 space-y-2">
          <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2 px-2">
            <FileText className="text-blue-500" /> 
            分析报告
          </h2>
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(cat)}
              className={`w-full text-left p-3 rounded-lg text-sm transition-all duration-200 ${
                activeTab === cat 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span className="font-mono opacity-50 mr-2">{String.fromCharCode(65 + idx)}</span>
              {cat.split(':')[0].substring(1)}
            </button>
          ))}
          
          <div className="pt-6 mt-6 border-t border-slate-800 space-y-3">
             <button 
              onClick={copyToClipboard}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
            >
              <Copy size={14} /> 复制原始数据
            </button>
            {analysis && (
              <button 
                onClick={handleDownloadImage}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm transition-colors shadow-lg shadow-purple-900/20"
              >
                <Download size={14} /> 导出报告图片
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9 space-y-6">
          {/* Answer Review Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
             <h3 className="text-lg font-bold text-slate-200 mb-6 pb-4 border-b border-slate-800">
                {activeTab}
             </h3>
             <div className="space-y-8">
                {answers[activeTab] && Object.entries(answers[activeTab]).map(([q, a], idx) => (
                  <div key={idx} className="group">
                    <p className="text-sm font-medium text-slate-500 mb-2 flex gap-2">
                      <span className="text-blue-500 font-mono">Q{idx + 1}</span> {q}
                    </p>
                    <div className="pl-4 border-l-2 border-slate-700 group-hover:border-blue-500 transition-colors">
                      <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {a}
                      </p>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          {/* AI Analysis Section */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-3 opacity-5">
               <Brain size={120} />
             </div>
             
             <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 flex items-center gap-2">
                    <Brain className="text-purple-500" /> AI 深度诊断
                  </h3>
                  {!analysis && (
                    <button 
                      onClick={() => setShowKeyInput(!showKeyInput)}
                      className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
                    >
                      <Lock size={12} /> {showKeyInput ? '隐藏配置' : '配置 Key'}
                    </button>
                  )}
                </div>

                {showKeyInput && !analysis && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mb-6 p-4 bg-slate-950/50 rounded-xl border border-slate-800"
                  >
                    <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">OpenAI API Key</label>
                    <div className="flex gap-2">
                      <input 
                        type="password" 
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sk-..."
                        className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                      />
                      <button 
                        onClick={generateAnalysis}
                        disabled={loading || !apiKey}
                        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium shadow-lg shadow-purple-900/20"
                      >
                        {loading ? <Loader className="animate-spin" size={16} /> : <Brain size={16} />}
                        开始分析
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-2">
                      Key 仅用于当前请求，不会被保存。
                    </p>
                  </motion.div>
                )}

                {loading ? (
                   <div className="flex flex-col items-center justify-center py-16 space-y-6">
                     <div className="relative">
                       <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 animate-pulse"></div>
                       <Loader className="animate-spin text-purple-500 relative z-10" size={64} />
                     </div>
                     <div className="text-center space-y-2">
                       <p className="text-slate-200 font-bold text-xl animate-pulse">正在生成深度品牌诊断报告...</p>
                       <p className="text-slate-500 text-sm max-w-xs mx-auto">AI 正在运用叶明桂方法论解构您的商业模式，预计耗时 30-60 秒，请耐心等待灵感降临</p>
                     </div>
                   </div>
                ) : analysis ? (
                  <div ref={reportRef} className="bg-slate-900 p-8 rounded-xl border border-slate-800/50 shadow-inner">
                    <div className="flex justify-end mb-4 md:hidden">
                       <button 
                        onClick={handleDownloadImage}
                        className="text-purple-400 text-xs flex items-center gap-1 border border-purple-900/50 px-2 py-1 rounded bg-purple-900/20"
                      >
                        <Download size={12} /> 保存图片
                      </button>
                    </div>
                    <div className="prose prose-invert prose-slate max-w-none 
                      prose-headings:text-blue-400 
                      prose-strong:text-purple-300
                      prose-p:leading-loose
                      prose-li:leading-loose
                      prose-h3:border-b prose-h3:border-slate-700 prose-h3:pb-2 prose-h3:mb-6 prose-h3:mt-8
                      prose-h3:bg-slate-800/50 prose-h3:px-4 prose-h3:rounded-lg
                    ">
                      <ReactMarkdown 
                        components={{
                          h3: ({node, ...props}) => <h3 className="text-xl font-bold text-blue-400 border-l-4 border-blue-500 pl-4 py-2 bg-slate-800/50 rounded-r-lg mb-6 mt-10" {...props} />,
                          p: ({node, ...props}) => <p className="mb-4 text-slate-300 tracking-wide" {...props} />,
                          ul: ({node, ...props}) => <ul className="space-y-2 mb-6 bg-slate-800/30 p-4 rounded-lg border border-slate-700/50" {...props} />,
                          li: ({node, ...props}) => <li className="text-slate-300" {...props} />,
                          strong: ({node, ...props}) => <strong className="text-purple-300 font-bold bg-purple-900/20 px-1 rounded" {...props} />
                        }}
                      >
                        {analysis}
                      </ReactMarkdown>
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center text-xs text-slate-600">
                      <span>Generated by Yaohui Growth Brand Consultant</span>
                      <span>Powered by Qwen Plus</span>
                    </div>
                  </div>
                ) : (
                  !showKeyInput && (
                    <div className="space-y-6">
                      <div className="bg-slate-950/30 rounded-xl p-6 border border-slate-800/50 backdrop-blur-sm">
                        <h4 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-green-500"></span>
                           通用咨询建议
                        </h4>
                        <div className="grid md:grid-cols-2 gap-6 text-sm">
                          {[
                            { title: 'A 企业维度', desc: 'KPI量化是核心。如果目标无法被数字衡量，执行力将大打折扣。' },
                            { title: 'B 品类维度', desc: '重新定义品类往往能避开红海竞争。思考你的产品还能"是谁"？' },
                            { title: 'C 竞争维度', desc: '关注间接竞品。打败方便面的不是另一款面，而是外卖。' },
                            { title: 'D 消费者维度', desc: '不要只看人口属性，要看场景需求。在什么情况下用户非你不可？' },
                            { title: 'E 渠道维度', desc: '渠道即服务。评估渠道的价值不只看销量，更要看品牌体验的传递。' }
                          ].map((item, i) => (
                            <div key={i} className="space-y-1">
                              <strong className="text-blue-400 block">{item.title}</strong>
                              <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-center pt-4">
                        <button 
                          onClick={() => generateAnalysis()}
                          className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-purple-900/30 transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
                        >
                          <Brain size={20} />
                          一键生成深度报告
                        </button>
                        <p className="text-xs text-slate-500 mt-3">
                          将使用预置 API Key 进行 AI 分析
                        </p>
                      </div>
                    </div>
                  )
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportView;
