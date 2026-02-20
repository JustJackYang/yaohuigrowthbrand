import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowRight, Check, Zap, Play, SkipForward } from 'lucide-react';
import { getQuestions, industries } from '../questions';
import { motion, AnimatePresence } from 'framer-motion';

const ChatInterface = ({ onFinish }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState('intro'); // intro, industry, chat
  const [currentQIndex, setCurrentQIndex] = useState(-1);
  const [answers, setAnswers] = useState({});
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [questions, setQuestions] = useState([]);
  const messagesEndRef = useRef(null);
  
  // Initialize questions when industry is selected
  useEffect(() => {
    if (selectedIndustry) {
      const rawQuestions = getQuestions(selectedIndustry.id);
      // Flatten questions
      const flat = rawQuestions.flatMap(cat => 
        cat.questions.map((q, idx) => ({
          id: `${cat.id}-${idx}`,
          category: cat.category,
          categoryId: cat.id,
          ...q,
          totalInCat: cat.questions.length,
          indexInCat: idx + 1
        }))
      );
      setQuestions(flat);
    }
  }, [selectedIndustry]);

  const progress = questions.length > 0 ? Math.max(0, Math.min(100, ((currentQIndex) / questions.length) * 100)) : 0;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStart = () => {
    setStep('industry');
  };

  const handleIndustrySelect = (ind) => {
    setSelectedIndustry(ind);
    setStep('chat');
    setCurrentQIndex(0);
    setMessages([
      {
        id: 'intro',
        type: 'bot',
        text: `已为您切换至【${ind.label}】行业模式。我们将从“企业”维度开始分析。请告诉我：`,
        isSystem: true
      }
    ]);
    // Need to wait for state update, so we pass raw data directly or use timeout
    // But since we use useEffect for setQuestions, we can just use a small timeout to ensure questions are ready
    setTimeout(() => {
      // Re-fetch to be safe or rely on the effect. 
      // Actually since setQuestions is async via Effect, we should trigger the first message inside the Effect or use a ref.
      // Let's just re-calculate here for safety to send the first message immediately.
      const rawQuestions = getQuestions(ind.id);
      const flat = rawQuestions.flatMap(cat => 
        cat.questions.map((q, idx) => ({
          id: `${cat.id}-${idx}`,
          category: cat.category,
          categoryId: cat.id,
          ...q,
          totalInCat: cat.questions.length,
          indexInCat: idx + 1
        }))
      );
      addBotMessage(flat[0]);
    }, 100);
  };

  const addBotMessage = (question) => {
    const isNewCategory = question.indexInCat === 1;
    
    if (isNewCategory && question.categoryId !== 'A') {
      setTimeout(() => {
        setMessages(prev => [
          ...prev, 
          {
            id: `cat-${question.categoryId}`,
            type: 'divider',
            text: question.category
          }
        ]);
      }, 200);
    }

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: question.id,
          type: 'bot',
          text: question.text,
          isQuestion: true,
          qData: question
        }
      ]);
    }, isNewCategory ? 800 : 400);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const text = input;
    setInput(''); // Clear immediately for better UX

    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      text: text
    }]);
    
    // Save answer
    if (currentQIndex >= 0 && currentQIndex < questions.length) {
      const currentQ = questions[currentQIndex];
      setAnswers(prev => ({
        ...prev,
        [currentQ.category]: {
          ...(prev[currentQ.category] || {}),
          [currentQ.text]: text
        }
      }));
    }

    nextQuestion();
  };

  const handleSkip = () => {
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: '跳过', isSkip: true }]);
    nextQuestion();
  };

  const nextQuestion = () => {
    const nextIdx = currentQIndex + 1;
    if (nextIdx < questions.length) {
      setCurrentQIndex(nextIdx);
      addBotMessage(questions[nextIdx]);
    } else {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: 'finish',
            type: 'bot',
            text: '分析完成。所有数据已采集完毕，准备生成报告。',
            isFinal: true
          }
        ]);
      }, 500);
    }
  };

  // Mock answers for demo
  const mockAnswers = {
    "A企业: 企业真正想要的是什么?": {
      "你需要销售多少产品? 在多长的时间内完成销售?": "希望在未来12个月内，实现咖啡豆和周边产品销售额达到5000万。",
      "价格是多少? 利润率是多少?": "核心咖啡豆产品均价80元/包，挂耳咖啡3-5元/包，利润率约25%。",
      "目前具体的用户量是多少? 必须新增的用户量是多少?": "现有私域会员10万，需要新增20万活跃用户。",
      "营销预算是多少?": "50-200万 (加速扩张)",
      "可充分利用什么资产或社会事件?": "我们有云南高海拔自有庄园，且创始人是世界咖啡师大赛冠军。",
      "企业最想达成的 KPI（关键绩效指标）是什么?": "复购率从20%提升到40%。",
      "KPI（关键绩效指标）能否被量化?": "完全可以量化 (如销售额)",
      "达到 KPI（关键绩效指标）最大的阻碍是什么?": "品牌认知度低，用户只认瑞幸和星巴克，觉得我们贵。",
      "企业有什么可以利用的资源?": "与30家精品独立书店有合作关系。",
      "如何衡量品牌是否成功?": "成为“中式精品咖啡”的代表品牌。"
    },
    "B品类: 应该如何界定品牌所处的类别": {
      "人们如何看待我们产品的品类?": "认为是“稍微贵一点的速溶咖啡”或“没听过的牌子”。",
      "我们的产品可以属于哪些品类?": "精品速溶、挂耳咖啡、咖啡豆、甚至“职场礼品”。",
      "这些品类的规模如何(如市场渗透率、数量、销售额、利润等)?": "百亿级成熟大市场",
      "这些品类是呈现增长趋势还是下降趋势?": "快速增长 (红利期)",
      "我们的产品在这些品类中的份额是多少?": "不足0.1%。",
      "我们的产品应该属于什么品类?": "不仅是咖啡，更是“职场充电宝”和“精致生活道具”。",
      "这个品类对应哪个大需求?": "提神醒脑、社交货币、自我奖赏。",
      "我们的产品最大的特点是什么?": "冠军品质、云南风味、国潮设计。",
      "我们的产品还能归入什么品类?": "东方茶饮（咖啡茶）、文化创意产品。",
      "归入其他品类，会有什么好处?": "避开与雀巢、三顿半的直接价格战，获得文化溢价。"
    },
    "C竞争: 竞争对手的策略与定位是什么": {
      "谁是你的主要直接竞争对手?": "三顿半、隅田川、永璞。",
      "谁是你的主要间接竞争对手?": "瑞幸（现磨外卖）、喜茶。",
      "是否存在需要防备的新的潜在竞争对手?": "蜜雪冰城旗下的幸运咖，价格极低。",
      "竞争对手的产品或服务的价格是多少?": "三顿半约5-8元/颗，瑞幸约9.9元/杯。",
      "它们现在的诉求是什么，曾经的诉求是什么，是如何被传播的?": "三顿半主打“超即溶”和“环保回收”；瑞幸主打“好喝不贵”。",
      "它们的媒体预算有多大，曾经是多少?": "铺天盖地 (千万级以上)",
      "它们的销售额有多大?": "头部品牌年销数亿。",
      "它们的产品或服务主要卖给谁?": "年轻白领、学生。",
      "它们的主要卖点是什么?": "方便、快捷、设计好看。",
      "和它们相比，我们的优势和劣势是什么?": "优势：口味更独特（冠军把控）、有产地故事；劣势：渠道少、知名度低、价格无优势。"
    },
    "D消费者: 谁是我们最有意义的潜在客户，他们需要什么、想要什么？": {
      "产品可以吸引哪种消费者?": "对生活品质有要求，喝腻了商业咖啡，想尝试不同风味的资深咖啡爱好者。",
      "如何细分市场? 市场如何区隔最有意义?": "按口味偏好分（果酸/坚果），按场景分（办公室/露营）。",
      "这些细分市场的消费者、销售及利润差别是什么?": "露营场景虽然小众，但客单价高，且容易出片传播。",
      "他们喜欢或厌恶品类的哪些方面?": "喜欢方便，厌恶口感差、添加剂多。",
      "他们喜欢或厌恶品牌的哪些方面?": "喜欢真实的故事、有温度的设计；厌恶过度营销。",
      "他们喜欢或厌恶竞争对手的哪些方面?": "喜欢竞品的周边；厌恶竞品口味千篇一律。",
      "他们是谁?": "25-35岁，一线城市，创意/媒体/互联网行业。",
      "他们是哪类人?": "生活美学家、成分党。",
      "我们的产品满足了他们的什么需求?": "喝到一杯“有灵魂”的好咖啡，展示自己的独特品味。",
      "他们有什么需求没有被满足?": "了解咖啡背后的种植者故事，参与到品牌建设中。"
    },
    "E渠道: 渠道通路和销售环境如何": {
      "产品在哪儿销售?": "线上电商 (天猫/京东/抖音)",
      "销售产品的过程如何?": "主要靠直播间讲解和详情页种草。",
      "我们的市场份额是否非常依赖分销渠道?": "一般依赖 (混合模式)",
      "分销渠道是成功的关键吗?": "是核心关键",
      "销售渠道的主要趋势是什么?": "兴趣电商、内容种草。",
      "这些渠道如何看待你的品牌和产品?": "认为我们是腰部品牌，需要更多投放才能给流量。",
      "产品如何在商店中摆放?": "在电商页面中，视觉冲击力还不够强。",
      "渠道的硬件优势、劣势如何?": "没有线下体验店，无法让用户试喝。",
      "渠道的软件优势、劣势如何?": "客服响应快，但缺乏专业的咖啡知识引导。",
      "渠道需要改变吗? 怎么改变?": "需要拓展线下合作（如书店），增加体验触点。"
    }
  };

  const handleDemo = () => {
    // Select retail/coffee industry for demo context
    const demoIndustry = industries.find(i => i.id === 'food') || industries[0];
    onFinish(mockAnswers);
  };

  // Render Landing Page
  if (step === 'intro') {
    return (
      <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-xl"
        >
          <div className="mb-12 flex justify-center">
            <div className="w-16 h-16 border border-zinc-700 flex items-center justify-center rotate-45">
               <div className="w-8 h-8 bg-zinc-100"></div>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-serif italic text-zinc-100 mb-6 tracking-wide">
            The Clarity Protocol
          </h1>
          
          <p className="text-zinc-500 text-lg mb-12 leading-relaxed max-w-md mx-auto font-light">
            Most people are lost in the noise.<br/>
            You are about to find your signal.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button 
              onClick={handleStart}
              className="group relative inline-flex items-center justify-center px-10 py-4 text-sm uppercase tracking-widest font-medium text-black bg-zinc-100 hover:bg-white transition-all duration-300"
            >
              <span>Enter the Void</span>
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button 
              onClick={handleDemo}
              className="text-xs uppercase tracking-widest text-zinc-600 hover:text-zinc-400 transition-colors border-b border-transparent hover:border-zinc-400 pb-1"
            >
              View Demo
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Industry Selection
  if (step === 'industry') {
    return (
      <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center p-6 text-center">
         <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl w-full"
        >
          <h2 className="text-xl font-serif italic text-zinc-400 mb-12 tracking-wide">Select your reality</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {industries.map((ind) => (
              <button
                key={ind.id}
                onClick={() => handleIndustrySelect(ind)}
                className="group p-8 bg-zinc-950 border border-zinc-800 hover:border-zinc-400 transition-all duration-300 flex flex-col items-center gap-4"
              >
                <span className="text-2xl opacity-50 group-hover:opacity-100 transition-opacity grayscale">{ind.icon}</span>
                <span className="text-zinc-500 font-light text-sm tracking-wider uppercase group-hover:text-zinc-200 transition-colors">{ind.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Get current question object
  const currentQ = currentQIndex >= 0 && currentQIndex < questions.length ? questions[currentQIndex] : null;

  // Handle Quick Option Click
  const handleOptionClick = (option) => {
    // If it's a simple string option
    const text = typeof option === 'string' ? option : option.label || option.text;
    
    // Send immediately
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      text: text
    }]);
    
    // Save answer
    if (currentQ) {
      setAnswers(prev => ({
        ...prev,
        [currentQ.category]: {
          ...(prev[currentQ.category] || {}),
          [currentQ.text]: text
        }
      }));
    }

    nextQuestion();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-3xl mx-auto w-full relative">
      {/* Minimal Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-zinc-900 z-10">
        <motion.div 
          className="h-full bg-zinc-200"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-12 scroll-smooth pb-40">
        {messages.map((msg, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={msg.id || index} 
            className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}
          >
            {msg.type === 'divider' ? (
              <div className="w-full flex items-center gap-6 my-12 opacity-40">
                <div className="h-px bg-zinc-800 flex-1"></div>
                <span className="text-xs font-serif italic tracking-widest text-zinc-500 uppercase">{msg.text}</span>
                <div className="h-px bg-zinc-800 flex-1"></div>
              </div>
            ) : (
              <div className={`max-w-[90%] md:max-w-[85%] ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.qData && (
                   <span className="inline-block text-[9px] uppercase tracking-widest text-zinc-600 mb-2">
                     Query {msg.qData.indexInCat} / {msg.qData.totalInCat}
                   </span>
                )}
                
                <div className={`
                  relative text-lg leading-relaxed font-light
                  ${msg.type === 'user' 
                    ? 'bg-zinc-100 text-black p-6 shadow-xl' 
                    : msg.isSystem 
                      ? 'text-zinc-500 italic text-sm pl-0 font-serif'
                      : 'border-l border-zinc-800 pl-6 text-zinc-300 py-2'
                  }
                `}>
                   {msg.text}
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {messages.some(m => m.isFinal) && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center py-12"
          >
            <button 
              onClick={() => onFinish(answers)}
              className="bg-zinc-100 hover:bg-white text-black px-10 py-4 uppercase tracking-widest text-sm font-medium transition-all transform hover:scale-105"
            >
              Generate Protocol
            </button>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {!messages.some(m => m.isFinal) && (
        <div className="p-6 md:p-12 bg-zinc-950 sticky bottom-0 z-20">
          <div className="max-w-3xl mx-auto relative group">
            <div className="absolute -top-16 right-0 flex gap-2">
              {currentQIndex > 0 && (
                <button
                  onClick={() => onFinish(answers)}
                  className="text-zinc-600 hover:text-zinc-300 px-4 py-2 text-xs uppercase tracking-widest transition-colors flex items-center gap-2"
                >
                  <Check size={12} />
                  Finish Early
                </button>
              )}
            </div>

            {/* Minimal Quick Options */}
            {currentQ?.options && (
              <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {currentQ.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOptionClick(opt)}
                    className="whitespace-nowrap px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-600 text-sm transition-all duration-300"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            <div className="relative flex items-center border-b border-zinc-800 focus-within:border-zinc-500 transition-colors duration-300 pb-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={currentQ?.placeholder || "Type your thought..."}
                autoFocus
                className="flex-1 p-2 bg-transparent text-xl text-zinc-200 placeholder-zinc-700 focus:outline-none font-light"
              />
              <div className="flex items-center gap-4 pl-4">
                <button 
                  onClick={handleSkip}
                  className="text-zinc-700 hover:text-zinc-500 transition-colors uppercase text-xs tracking-widest"
                  title="Skip"
                >
                  Skip
                </button>
                <button 
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
                >
                  <ArrowRight size={24} strokeWidth={1} />
                </button>
              </div>
            </div>
            <div className="text-center mt-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-700">Press Enter to Focus</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
