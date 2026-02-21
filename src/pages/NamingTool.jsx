import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Sparkles, User, RefreshCw, Search, BookOpen, Star, TrendingUp, Brain, Volume2, ShieldCheck } from 'lucide-react';
import { calculateBazi } from '../lib/bazi';
import { generateNames, calculateNameScore } from '../lib/naming';
import { STYLE_DEFINITIONS } from '../lib/data';
import { getLongitude } from '../lib/city_data';

export default function NamingTool() {
  const [formData, setFormData] = useState({
    surname: '杨',
    gender: 'male',
    style: 'all',
    nameLength: 2,
    sourcePreference: 'balanced',
    birthTime: '2024-01-01T08:00', 
    birthLocation: '深圳',
    customName: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [result, setResult] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e, isLoadMore = false, isCustom = false) => {
    e.preventDefault();
    setErrorMsg(null);
    
    if (isLoadMore) {
        setLoadingMore(true);
    } else {
        setLoading(true);
        setResult(null);
        setOffset(0); 
        setHasMore(true);
    }

    // Small delay to allow UI to update to loading state
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
        const longitude = getLongitude(formData.birthLocation);
        const baziResult = calculateBazi(formData.birthTime.replace('T', ' '), longitude);
        
        let names = [];
        const currentOffset = isLoadMore ? offset + 10 : 0;

        try {
            if (isCustom && formData.customName) {
                // Custom name analysis
                // Assume surname is formData.surname
                const surname = formData.surname;
                let givenName = formData.customName;
                if (givenName.startsWith(surname)) {
                    givenName = givenName.substring(surname.length);
                }
                
                const char1 = givenName[0];
                const char2 = givenName[1] || '';
                
                if (char1) {
                     names = [calculateNameScore(surname, char1, char2, baziResult)];
                }
            } else {
                // Generate names
                names = generateNames(
                    formData.surname, 
                    baziResult, 
                    10, 
                    currentOffset, 
                    formData.gender, 
                    formData.style,
                    Number(formData.nameLength) || 2,
                    formData.sourcePreference || 'balanced'
                );
            }
        } catch (genErr) {
            console.error("Generation Logic Error:", genErr);
            throw new Error("起名算法运行异常，请刷新页面重试");
        }

        const data = {
            success: true,
            data: {
                bazi: baziResult,
                names: names
            }
        };
      
      if (data.success) {
        if (isLoadMore) {
             if (data.data.names.length < 10) setHasMore(false);
             setResult((prev) => {
                 const combined = [...(prev?.names || []), ...(data.data.names || [])];
                 const seen = new Set();
                 const deduped = [];
                 for (const n of combined) {
                     const key = n?.fullName || `${n?.surname || ''}${n?.char1 || ''}${n?.char2 || ''}`;
                     if (!key || seen.has(key)) continue;
                     seen.add(key);
                     deduped.push(n);
                 }
                 return {
                     ...prev,
                     names: deduped
                 };
             });
             setOffset(prev => prev + 10);
        } else {
            if (data.data.names.length < 10) setHasMore(false);
            setResult(data.data);
        }
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || '生成失败，请重试');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const renderRichText = (text) => {
      if (!text) return null;
      const parts = text.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
              return <span key={i} className="text-cyan-400 font-bold">{part.slice(2, -2)}</span>;
          }
          return part;
      });
  };

  return (
    <div className="min-h-screen font-sans bg-slate-950 text-slate-200 selection:bg-cyan-500/30 selection:text-cyan-200">
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pointer-events-none"></div>
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-cyan-900/10 to-transparent pointer-events-none"></div>
      
      {/* Header */}
      <header className="relative border-b border-white/10 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <Link to="/" className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors">
                    <Sparkles className="w-6 h-6 text-cyan-400" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                        YaohuiGrowth <span className="text-cyan-500">.AI</span>
                    </h1>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">智能起名系统</p>
                </div>
            </div>
            <div className="hidden md:flex items-center gap-4 text-xs font-mono text-slate-500">
                <span className="px-2 py-0.5 bg-amber-900/20 border border-amber-900/30 text-amber-500 rounded text-[10px]">康熙字典校对</span>
                <span>版本 V1.1.3</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>系统在线</span>
            </div>
        </div>
      </header>
      
      <div className="relative max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Error Message */}
        {errorMsg && (
            <div className="lg:col-span-12 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm">
                    <ShieldCheck className="w-4 h-4" />
                    {errorMsg}
                </span>
                <button onClick={() => setErrorMsg(null)} className="text-xs underline hover:text-red-300">关闭</button>
            </div>
        )}

        {/* Input Section */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl shadow-black/50 sticky top-24">
                <h2 className="text-sm font-bold mb-6 flex items-center gap-2 text-white/90 border-b border-white/10 pb-4 tracking-wider uppercase">
                    <User className="w-4 h-4 text-cyan-500" />
                    基本信息录入
                </h2>
                <form onSubmit={(e) => handleSubmit(e, false, false)} className="space-y-5">
                    <div className="group">
                    <label className="block text-[10px] font-bold text-cyan-500/80 uppercase tracking-widest mb-1.5">姓氏</label>
                    <input 
                        type="text" 
                        value={formData.surname}
                        onChange={e => setFormData({...formData, surname: e.target.value})}
                        className="w-full p-3 bg-slate-950/50 border border-white/10 rounded-lg focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none transition-all text-white font-serif text-lg placeholder:text-slate-700 group-hover:border-white/20"
                        placeholder="如：杨"
                    />
                    </div>
                    
                    <div>
                    <label className="block text-[10px] font-bold text-cyan-500/80 uppercase tracking-widest mb-1.5">性别</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setFormData({...formData, gender: 'male', style: 'all'})}
                            className={`p-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2 ${formData.gender === 'male' ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400' : 'bg-slate-950/30 border-white/10 text-slate-500 hover:border-white/20'}`}
                        >
                            <span className="w-2 h-2 rounded-full bg-current"></span>
                            男 (Male)
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({...formData, gender: 'female', style: 'all'})}
                            className={`p-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2 ${formData.gender === 'female' ? 'bg-pink-500/10 border-pink-500/50 text-pink-400' : 'bg-slate-950/30 border-white/10 text-slate-500 hover:border-white/20'}`}
                        >
                            <span className="w-2 h-2 rounded-full bg-current"></span>
                            女 (Female)
                        </button>
                    </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-cyan-500/80 uppercase tracking-widest mb-1.5">期望风格</label>
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                             <button
                                type="button"
                                onClick={() => setFormData({...formData, style: 'all'})}
                                className={`p-2 rounded text-xs font-medium transition-all border ${formData.style === 'all' ? 'bg-white/10 border-white/30 text-white' : 'bg-slate-950/30 border-white/5 text-slate-500 hover:border-white/10'}`}
                            >
                                🎲 综合不限
                            </button>
                            {Object.entries(STYLE_DEFINITIONS[formData.gender] || {}).map(([key, def]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setFormData({...formData, style: key})}
                                    className={`p-2 rounded text-xs font-medium transition-all border text-left flex flex-col gap-0.5 ${formData.style === key ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400' : 'bg-slate-950/30 border-white/5 text-slate-500 hover:border-white/10'}`}
                                >
                                    <span className="font-bold">{def.label}</span>
                                    <span className="text-[9px] opacity-70 truncate w-full">{def.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold text-cyan-500/80 uppercase tracking-widest mb-1.5">名字字数</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({...formData, nameLength: 2})}
                                    className={`p-2 rounded text-xs font-medium transition-all border ${Number(formData.nameLength) === 2 ? 'bg-white/10 border-white/30 text-white' : 'bg-slate-950/30 border-white/5 text-slate-500 hover:border-white/10'}`}
                                >
                                    双字名
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({...formData, nameLength: 1})}
                                    className={`p-2 rounded text-xs font-medium transition-all border ${Number(formData.nameLength) === 1 ? 'bg-white/10 border-white/30 text-white' : 'bg-slate-950/30 border-white/5 text-slate-500 hover:border-white/10'}`}
                                >
                                    单字名
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-cyan-500/80 uppercase tracking-widest mb-1.5">参考来源</label>
                            <select
                                value={formData.sourcePreference}
                                onChange={e => setFormData({...formData, sourcePreference: e.target.value})}
                                className="w-full p-2.5 bg-slate-950/50 border border-white/10 rounded-lg focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none text-xs text-white"
                            >
                                <option value="balanced">不限（古文仅参考）</option>
                                <option value="modern">现代优先</option>
                                <option value="classic">古文优先</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                    <label className="block text-[10px] font-bold text-cyan-500/80 uppercase tracking-widest mb-1.5">出生时间 (公历)</label>
                    <input 
                        type="datetime-local" 
                        value={formData.birthTime}
                        onChange={e => setFormData({...formData, birthTime: e.target.value})}
                        className="w-full p-3 bg-slate-950/50 border border-white/10 rounded-lg focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none text-sm text-white placeholder:text-slate-700"
                    />
                    </div>
                    
                    <div>
                    <label className="block text-[10px] font-bold text-cyan-500/80 uppercase tracking-widest mb-1.5">出生地点</label>
                    <input 
                        type="text" 
                        value={formData.birthLocation}
                        onChange={e => setFormData({...formData, birthLocation: e.target.value})}
                        className="w-full p-3 bg-slate-950/50 border border-white/10 rounded-lg focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none text-sm text-white placeholder:text-slate-700"
                        placeholder="如：深圳"
                    />
                    </div>
                    
                    <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4 border border-white/10"
                    >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    {loading ? '正在分析命理...' : '开始起名'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/5">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                         <Search className="w-3 h-3" />
                         已有名字测算
                    </h3>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={formData.customName}
                            onChange={e => setFormData({...formData, customName: e.target.value})}
                            className="flex-1 p-2 bg-slate-950/50 border border-white/10 rounded-lg focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none text-sm text-white placeholder:text-slate-700"
                            placeholder="输入全名"
                        />
                        <button 
                            onClick={(e) => handleSubmit(e, false, true)}
                            disabled={!formData.customName}
                            className="bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 px-4 rounded-lg text-xs font-bold disabled:opacity-30 transition-all"
                        >
                            立即测算
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-8 space-y-8">
          {result ? (
            <>
              {/* BaZi Report Card */}
              <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[50px] rounded-full pointer-events-none"></div>
                
                <h2 className="text-sm font-bold mb-6 text-white flex items-center gap-2 tracking-wider uppercase border-b border-white/10 pb-4">
                    <Brain className="w-4 h-4 text-cyan-500" />
                    八字命理排盘
                </h2>
                <div className="grid md:grid-cols-2 gap-6 text-sm">
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                        真太阳时
                        <span className="text-[8px] bg-slate-800 px-1 rounded text-slate-400" title="根据出生地经度和季节均时差校正后的天文时间，八字排盘以此为准">校正后</span>
                    </div>
                    <div className="font-mono text-cyan-400 text-base">{result.bazi.solarTime}</div>
                    <div className="text-slate-400 mt-1 text-xs">{result.bazi.lunarDate}</div>
                  </div>
                  
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">四柱结构</div>
                    <div className="flex justify-between font-mono text-lg text-white">
                        <span>{result.bazi.bazi.year}</span>
                        <span>{result.bazi.bazi.month}</span>
                        <span className="text-cyan-400 border-b border-cyan-500/50 px-1">{result.bazi.bazi.day}</span>
                        <span>{result.bazi.bazi.hour}</span>
                    </div>
                    <div className="mt-2 text-[10px] text-slate-600 flex justify-between px-1 uppercase tracking-wider">
                        <span>年柱</span><span>月柱</span><span>日柱</span><span>时柱</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 uppercase tracking-wider">日主 (本命)</span>
                        <span className="font-mono text-white bg-slate-800 px-2 py-0.5 rounded text-sm border border-white/10">{result.bazi.dayMaster}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 uppercase tracking-wider">八字喜用 (真神)</span>
                        <div className="flex gap-2">
                        {result.bazi.xiyongshen.map((wx, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-xs border border-blue-500/20 font-mono">
                                {wx}
                            </span>
                        ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 uppercase tracking-wider">起名建议 (补益)</span>
                        <div className="flex gap-2 items-center">
                        {result.bazi.favorable.map((wx, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded text-xs border border-amber-500/20 font-mono">
                                {wx}
                            </span>
                        ))}
                        <span className="text-[9px] text-slate-600 ml-1 font-mono uppercase tracking-tight opacity-50"> // 已优化五行平衡</span>
                        </div>
                    </div>
                </div>
              </div>

              {/* Names List */}
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <h3 className="font-bold text-lg text-white tracking-tight">
                        {formData.customName ? '名字深度分析报告' : '精选起名方案'}
                    </h3>
                    <span className="text-xs font-mono text-cyan-500/70 bg-cyan-950/30 px-2 py-1 rounded border border-cyan-500/20">
                        数量: {result.names.length}
                    </span>
                </div>
                
                <div className="grid gap-6">
                    {result.names.map((name, idx) => (
                    <div key={idx} className="group bg-slate-900/40 backdrop-blur-sm rounded-xl border border-white/5 hover:border-cyan-500/30 transition-all overflow-hidden relative">
                        {/* Name Header */}
                        <div className="p-6 pb-4 flex justify-between items-start bg-gradient-to-r from-slate-900 to-slate-900/50 border-b border-white/5">
                            <div>
                                <div className="text-4xl font-serif font-bold text-white mb-2 flex items-baseline gap-4 tracking-tight">
                                    {name.fullName}
                                    <div className={`text-xs px-2 py-1 rounded font-mono tracking-wider border ${name.score >= 90 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
                                        {name.score} 分
                                    </div>
                                </div>
                                <div className="flex gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                                    <span className="flex items-center gap-1">
                                        五行: {name.wuxing.join('/')}
                                        <span className="bg-amber-900/30 text-amber-500 px-1 py-0.5 rounded text-[8px] border border-amber-900/50">康熙</span>
                                    </span>
                                    <span className="text-slate-700">|</span>
                                    <span>笔画总数: {name.strokes.total}</span>
                                </div>
                            </div>
                            {/* Score Ring */}
                            <div className="text-right">
                                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">综合评分</div>
                                <div className={`text-2xl font-bold font-mono ${name.score >= 90 ? 'text-emerald-400' : 'text-blue-400'}`}>{name.score}</div>
                            </div>
                        </div>
                        
                        {/* Analysis Grid */}
                        <div className="px-6 py-6 grid md:grid-cols-2 gap-x-12 gap-y-8 text-sm">
                            <div className="space-y-6">
                                <div>
                                    <h4 className="flex items-center gap-2 text-cyan-500/80 text-[10px] font-bold uppercase tracking-widest mb-2">
                                        <ShieldCheck className="w-3 h-3" />
                                        01. 八字契合度
                                    </h4>
                                    <p className="text-slate-300 leading-relaxed whitespace-pre-line text-xs">{renderRichText(name.analysis.baziMatch)}</p>
                                </div>
                                <div>
                                    <h4 className="flex items-center gap-2 text-cyan-500/80 text-[10px] font-bold uppercase tracking-widest mb-2">
                                        <BookOpen className="w-3 h-3" />
                                        02. 文化底蕴
                                    </h4>
                                    <p className="text-slate-300 leading-relaxed whitespace-pre-line text-xs font-serif italic opacity-80">{renderRichText(name.analysis.culturalDepth)}</p>
                                </div>
                                <div>
                                    <h4 className="flex items-center gap-2 text-cyan-500/80 text-[10px] font-bold uppercase tracking-widest mb-2">
                                        <Volume2 className="w-3 h-3" />
                                        03. 音律字形
                                    </h4>
                                    <p className="text-slate-300 leading-relaxed text-xs">{renderRichText(name.analysis.phonetic)}</p>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <div>
                                    <h4 className="flex items-center gap-2 text-purple-500/80 text-[10px] font-bold uppercase tracking-widest mb-2">
                                        <TrendingUp className="w-3 h-3" />
                                        04. 三才五格
                                    </h4>
                                    <p className="text-slate-300 leading-relaxed text-xs">{renderRichText(name.analysis.stroke)}</p>
                                </div>
                                <div>
                                    <h4 className="flex items-center gap-2 text-purple-500/80 text-[10px] font-bold uppercase tracking-widest mb-2">
                                        <User className="w-3 h-3" />
                                        05. 社会/心理印象
                                    </h4>
                                    <div className="bg-slate-900/30 border border-white/5 p-3 rounded-lg space-y-3">
                                        <div className="flex gap-2 items-start">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase mt-0.5 shrink-0 w-12">社会印象</span>
                                            <span className="text-slate-300 text-xs whitespace-pre-line">{renderRichText(name.analysis.social)}</span>
                                        </div>
                                        <div className="flex gap-2 items-start border-t border-white/5 pt-2">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase mt-0.5 shrink-0 w-12">潜意识</span>
                                            <span className="text-slate-300 text-xs whitespace-pre-line">{renderRichText(name.analysis.psychology)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Summary Footer */}
                        <div className="px-6 py-4 bg-gradient-to-r from-slate-900/80 to-slate-900/40 border-t border-white/5 flex items-start gap-3">
                             <Star className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                             <div>
                                <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">
                                    专家点评
                                </h4>
                                <p className="text-slate-300 text-xs whitespace-pre-line leading-relaxed">
                                    {renderRichText(name.analysis.summary)}
                                </p>
                             </div>
                        </div>
                    </div>
                    ))}
                </div>

                {!formData.customName && result.names.length > 0 && hasMore && (
                    <button 
                        onClick={(e) => handleSubmit(e, true, false)}
                        disabled={loadingMore}
                        className="w-full py-4 bg-slate-900/50 border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-950/20 text-slate-400 hover:text-cyan-400 font-mono text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-3 rounded-xl group"
                    >
                        {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />}
                        加载更多方案
                    </button>
                )}
                
                {!formData.customName && result.names.length === 0 && (
                    <div className="p-8 text-center text-slate-500 bg-slate-900/30 rounded-xl border border-white/5 border-dashed">
                        <p>未找到符合条件的吉名。</p>
                        <p className="text-xs mt-2">建议尝试切换“期望风格”或选择“综合不限”。</p>
                    </div>
                )}
              </div>
            </>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-600 min-h-[400px] border border-dashed border-white/10 rounded-2xl bg-slate-900/20 backdrop-blur-sm">
                <div className="p-4 bg-slate-900/50 rounded-full mb-4 border border-white/5">
                    <Sparkles className="w-8 h-8 text-cyan-900/50" />
                </div>
                <p className="text-sm font-mono tracking-widest uppercase">系统待机中</p>
                <p className="text-xs text-slate-700 mt-2">请在左侧输入信息以开始</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
