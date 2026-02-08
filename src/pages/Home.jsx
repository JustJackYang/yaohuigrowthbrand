import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Image, ArrowRight, Zap, Flame } from 'lucide-react';

function Home() {
  const tools = [
    {
      id: 'brand-consultant',
      title: '品牌战略顾问',
      description: '基于叶明桂 50 个关键维度，深度扫描并重构您的商业认知与品牌战略。',
      icon: <MessageSquare size={32} className="text-blue-400" />,
      path: '/consultant',
      color: 'from-blue-600 to-cyan-400'
    },
    {
      id: 'content-generator',
      title: '小红书图文生成器',
      description: '输入核心观点，AI 自动拆解逻辑并生成排版精美的深度图文卡片。',
      icon: <Image size={32} className="text-purple-400" />,
      path: '/generator',
      color: 'from-purple-600 to-pink-400'
    },
    {
      id: 'hotspots',
      title: '每日热点聚合',
      description: '自动追踪 Hacker News 等技术博客热点，每日更新，保持技术敏锐度。',
      icon: <Flame size={32} className="text-orange-400" />,
      path: '/hotspots.html',
      isExternal: true,
      color: 'from-orange-600 to-red-400'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="z-10 max-w-4xl w-full text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 mb-6 bg-slate-900/50 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl">
           <Zap className="text-yellow-400 mr-2" />
           <span className="text-slate-300 font-medium">Yaohui Growth Toolkit</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
          打造超级个体的<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            数字化军火库
          </span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          这里汇集了杨尧晖构建个人 IP 与商业闭环的核心工具。从品牌战略到内容生产，一站式赋能。
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full z-10">
        {tools.map((tool) => {
          const CardContent = (
            <>
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${tool.color} opacity-10 rounded-bl-full transform translate-x-8 translate-y-[-8px] group-hover:scale-110 transition-transform`}></div>
              
              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-6 group-hover:border-slate-600 transition-colors`}>
                  {tool.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-slate-400 leading-relaxed mb-6">
                  {tool.description}
                </p>
                <div className="flex items-center text-sm font-bold text-slate-300 group-hover:text-white">
                  立即使用 <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </>
          );

          return tool.isExternal ? (
             <a 
              key={tool.id} 
              href={tool.path}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-8 rounded-2xl transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl overflow-hidden"
            >
              {CardContent}
            </a>
          ) : (
            <Link 
              key={tool.id} 
              to={tool.path}
              className="group relative bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-8 rounded-2xl transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl overflow-hidden"
            >
              {CardContent}
            </Link>
          );
        })}
      </div>

      <footer className="mt-16 text-slate-600 text-sm">
        © 2026 YaohuiGrowth. All rights reserved.
      </footer>
    </div>
  );
}

export default Home;
