import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import '../components/Generator/Generator.css';

const ContentGenerator = () => {
  const [input, setInput] = useState('');
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [downloading, setDownloading] = useState(false);
  
  // Configuration State
  const [config, setConfig] = useState({
    provider: 'deepseek',
    apiKey: '',
    baseUrl: 'https://api.deepseek.com',
    modelName: 'deepseek-chat'
  });

  const STORAGE_KEY = 'yaohuigrowth_generator_config';

  // Load config on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem(STORAGE_KEY);
    if (savedConfig) {
      setConfig(prev => ({ ...prev, ...JSON.parse(savedConfig) }));
    } else {
        // Default Key from original HTML (for convenience if user hasn't set one)
        setConfig(prev => ({
            ...prev,
            apiKey: 'sk-nexnvzkolndlzfqrcblwnaggxqypyeqquvrippnowkjsqodb'
        }));
    }
  }, []);

  const handleProviderChange = (e) => {
    const type = e.target.value;
    let newConfig = { ...config, provider: type };

    if (type === 'deepseek') {
        newConfig.baseUrl = 'https://api.deepseek.com';
        newConfig.modelName = 'deepseek-chat';
    } else if (type === 'openai') {
        newConfig.baseUrl = 'https://api.openai.com/v1';
        newConfig.modelName = 'gpt-4o';
    } else if (type === 'siliconflow') {
        newConfig.baseUrl = 'https://api.siliconflow.cn/v1';
        newConfig.modelName = 'deepseek-ai/DeepSeek-V3';
    } else if (type === 'ollama') {
        newConfig.baseUrl = 'http://localhost:11434/v1';
        newConfig.modelName = 'qwen2.5:7b';
        if (!newConfig.apiKey) newConfig.apiKey = 'ollama';
    }
    
    setConfig(newConfig);
  };

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const saveConfig = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  };

  const generateContent = async () => {
    if (!input) return alert('请输入内容');
    if (!config.apiKey) return alert('请先在设置中填写 API Key');

    saveConfig();
    setLoading(true);

    const prompt = `
你是一个专业的“小红书深度图文”生成专家。你的任务是将用户的输入（观点/文章）拆解为一套逻辑严密、排版精美的 Slide 数据。

**核心风格要求（Cognitive Deconstruction）**：
1. **封面 (Cover)**：标题要极其吸引人（痛点/反常识），副标题要点题。
2. **逻辑流**：遵循“现象(What) -> 本质(Why) -> 结论/行动(How)”的拆解逻辑。
3. **语言风格**：拒绝爹味，保持“人味儿”，用“深夜撸串”的语气，简练、扎心。
4. **结构**：至少 4 页，最多 8 页。

**输出格式**：
必须严格返回 JSON 格式，不要包含 Markdown 代码块标记（\`\`\`json）。JSON 结构如下：
{
  "slides": [
    {
      "type": "cover", // 封面
      "brand": "BUSINESS LOGIC", // 品牌栏文字，可根据内容调整，如 LIFE HACK, DEEP THINK
      "pageNum": "01",
      "subtitle": "副标题（英文或短中文）",
      "title": "主标题（可包含HTML换行<br>，重点词用<span class=\"highlight\">包裹）",
      "boxContent": "封面底部框内的引言或金句"
    },
    {
      "type": "content", // 正文页
      "brand": "...",
      "pageNum": "02",
      "title": "本页标题", // 如：一、小企业的第一目标...
      "content": "正文段落，可包含HTML标签。", // 可选
      "list": [ // 列表项（可选）
        {"icon": "✕", "text": "列表内容1"},
        {"icon": "⚠", "text": "列表内容2"}
      ],
      "box": "重点框内容（可选）",
      "boxCenter": "居中强调框内容（可选）"
    }
    // ... 更多页面
  ]
}

用户输入：
${input}
`;

    try {
        const response = await fetch(`${config.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.modelName,
                messages: [
                    { role: "system", content: "You are a JSON generator." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'API Request Failed');
        }

        const data = await response.json();
        let content = data.choices[0].message.content;
        // Clean up markdown code blocks if present
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const json = JSON.parse(content);
        setSlides(json.slides || []);

    } catch (e) {
        let msg = e.message;
        if (msg.includes('Failed to fetch') && config.baseUrl.includes('localhost')) {
            msg += '\n\n提示：本地调用失败可能是因为 CORS 跨域限制。\n请确保 Ollama 已设置 OLLAMA_ORIGINS="*" 环境变量并重启。';
        }
        alert('生成失败: ' + msg);
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const downloadAll = async () => {
    setDownloading(true);
    const slideElements = document.querySelectorAll('.slide');

    for (let i = 0; i < slideElements.length; i++) {
        const slide = slideElements[i];
        
        try {
            const canvas = await html2canvas(slide, {
                scale: 2, // High res
                backgroundColor: '#0A0A12',
                useCORS: true,
                logging: false,
                ignoreElements: (element) => false 
            });

            const link = document.createElement('a');
            link.download = `xhs_slide_${String(i + 1).padStart(2, '0')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            // Wait a bit to prevent browser choking
            await new Promise(r => setTimeout(r, 320));
        } catch (err) {
            console.error(err);
        }
    }
    setDownloading(false);
  };

  return (
    <div className="generator-container generator-layout font-sans">
      {/* Sidebar */}
      <div className="generator-sidebar">
        <div className="flex items-center gap-2 mb-4">
             <Link to="/" className="text-gray-400 hover:text-white text-xs">← 返回首页</Link>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">YaohuiGrowth</h2>
        <p className="text-xs text-gray-500 mb-6">输入观点，AI 自动生成认知拆解图文。</p>

        <div className="generator-form-group">
            <label>核心观点 / 原始文本</label>
            <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="例如：小企业必须站在现金流安全的结构上..."
            />
        </div>

        <div className="generator-settings-toggle" onClick={() => setShowSettings(!showSettings)}>
            ⚙️ {showSettings ? '隐藏高级设置' : '显示高级设置 (API Key / Local LLM)'}
        </div>
        
        {showSettings && (
            <div className="generator-settings-panel">
                <div className="generator-form-group">
                    <label>1. 选择服务商 (Provider)</label>
                    <select 
                        name="provider" 
                        value={config.provider} 
                        onChange={handleProviderChange}
                        className="mb-2"
                    >
                        <option value="deepseek">DeepSeek 官方 (api.deepseek.com)</option>
                        <option value="openai">OpenAI (api.openai.com)</option>
                        <option value="siliconflow">硅基流动 (SiliconFlow)</option>
                        <option value="ollama">本地 Ollama (localhost)</option>
                        <option value="custom">自定义 (Custom)</option>
                    </select>
                    
                    <label>2. API Key</label>
                    <input 
                        type="password" 
                        name="apiKey"
                        value={config.apiKey}
                        onChange={handleConfigChange}
                        placeholder="sk-..." 
                    />
                </div>
                <div className="generator-form-group">
                    <label>Base URL</label>
                    <input 
                        type="text" 
                        name="baseUrl"
                        value={config.baseUrl}
                        onChange={handleConfigChange}
                    />
                </div>
                <div className="generator-form-group">
                    <label>Model Name</label>
                    <input 
                        type="text" 
                        name="modelName"
                        value={config.modelName}
                        onChange={handleConfigChange}
                    />
                </div>
            </div>
        )}

        <button className="generator-btn-primary" onClick={generateContent} disabled={loading}>
            {loading ? '生成中...' : '✨ 生成图文'}
        </button>

        <div className="mt-6 text-xs text-gray-500 leading-relaxed">
            <p>提示：</p>
            <ol className="list-decimal pl-5 space-y-1">
                <li>填写你的 API Key (OpenAI/DeepSeek)。</li>
                <li>输入你想表达的观点或文章。</li>
                <li>点击生成，AI 将自动拆解逻辑并排版。</li>
                <li>生成后可下载图片发布到小红书。</li>
            </ol>
        </div>
      </div>

      {/* Main Content */}
      <div className="generator-main">
        <div id="preview-container" className="flex flex-wrap gap-5 justify-center w-full">
            {slides.length === 0 && !loading && (
                <div className="text-gray-500 mt-24">
                    👈 请在左侧输入内容并点击生成
                </div>
            )}
            
            {slides.map((slide, idx) => {
                const total = slides.length;
                const pageNum = String(idx + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
                
                return (
                    <div key={idx} className="slide">
                        <div className="layer">
                            <div className="header">
                                <div className="brand">{slide.brand || 'YAOHUI GROWTH'}</div>
                                <div className="page-num">{pageNum}</div>
                            </div>
                            <div className={`stack ${slide.type === 'cover' ? 'justify-center' : ''}`}>
                                {slide.type === 'cover' ? (
                                    <div className="cover-grid">
                                        <div className="cover-left">
                                            <p className="muted" style={{letterSpacing: '2px'}}>{slide.subtitle}</p>
                                            <h1 dangerouslySetInnerHTML={{__html: slide.title}}></h1>
                                            {slide.boxContent && (
                                                <div className="box">
                                                    <p style={{fontSize: '18px'}}>{slide.boxContent}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {slide.title && <h2>{slide.title}</h2>}
                                        {slide.content && <p dangerouslySetInnerHTML={{__html: slide.content}}></p>}
                                        
                                        {slide.list && slide.list.length > 0 && slide.list.map((item, i) => (
                                            <div key={i} className="list-item">
                                                <div className="list-icon">{item.icon || '•'}</div>
                                                <div>{item.text}</div>
                                            </div>
                                        ))}

                                        {slide.box && (
                                            <div className="box"><p style={{margin:0}}>{slide.box}</p></div>
                                        )}
                                        
                                        {slide.boxCenter && (
                                            <div className="box center">
                                                <p className="highlight" style={{fontSize: '22px', margin: 0}}>{slide.boxCenter}</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="generator-loading-overlay">
            <div className="spinner"></div>
            <div className="text-white">AI 正在深度思考与拆解...</div>
        </div>
      )}

      {/* Download Button */}
      {slides.length > 0 && (
          <button className="generator-download-btn" onClick={downloadAll} disabled={downloading}>
            {downloading ? '正在渲染...' : '下载所有图片'}
          </button>
      )}
    </div>
  );
};

export default ContentGenerator;
