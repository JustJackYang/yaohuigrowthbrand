# 全栈独立产品开发流程图：Yaohui Growth Brand Consultant

## 1. 需求分析与核心定位 (Idea & Concept)
*   **核心痛点**: 将叶明桂《出圈》中的品牌咨询方法论数字化，低成本为中小企业提供深度品牌诊断。
*   **产品形态**: 交互式问答 H5 -> 自动化 AI 诊断报告生成器。
*   **商业模式**: 免费引流 -> 未来扩展为付费咨询/课程/社群。

## 2. 技术选型与环境搭建 (Tech Stack)
*   **前端框架**: React + Vite (轻量、极速)
*   **样式库**: Tailwind CSS (现代、灵活)
*   **动画库**: Framer Motion (丝滑交互体验)
*   **AI 引擎**: 通义千问 (Qwen-Plus) via Dashscope API (符合中文语境，性价比高)
*   **部署平台**: Vercel (全球 CDN，免费 HTTPS，自动化 CI/CD)

## 3. 开发实施全流程 (Development Lifecycle)

### Phase 1: 核心功能开发 (MVP)
1.  **问卷系统构建**:
    *   将 50 个核心问题结构化 (JSON)。
    *   实现聊天式 UI (`ChatInterface.jsx`)，支持打字机效果、进度条。
2.  **交互体验优化**:
    *   增加“一键演示” (Demo Mode) 快速展示能力。
    *   增加“辅助答题” (Quick Options/Placeholders)，降低用户输入门槛。
    *   增加“提前生成”按钮，允许灵活中断。
3.  **AI 智能接入**:
    *   对接 Dashscope API，植入“叶明桂方法论” System Prompt。
    *   实现流式或异步生成，增加 Loading 氛围感动画。
4.  **报告可视化**:
    *   使用 Markdown 渲染富文本报告。
    *   设计卡片式排版，优化字间距与阅读体验。
    *   集成 `html2canvas` 实现一键导出长图功能。

### Phase 2: 部署与上线 (Deployment)
1.  **代码托管**:
    *   本地 Git 初始化 -> 推送至 GitHub 仓库 (`yaohuigrowthbrand`)。
2.  **云端构建**:
    *   Vercel 连接 GitHub，自动触发 Build 流水线。
    *   解决移动端加载白屏问题 (Vite 分包优化 `manualChunks`)。
3.  **域名配置**:
    *   购买独立域名 `yaohuigrowth.com`。
    *   阿里云配置 DNS 解析 (A记录 + CNAME)。
    *   Vercel 绑定域名并自动申请 SSL 证书。

## 4. 产品交付与未来规划 (Delivery & Roadmap)
*   **当前状态**: 产品已上线，全网可访问，支持微信内打开 (通过独立域名)。
*   **未来扩展**:
    *   **独立站转型**: 增加 Stripe/微信支付，售卖咨询套餐。
    *   **矩阵化**: 利用二级域名 (`shop.`, `blog.`) 拓展业务版图。

---

```mermaid
graph TD
    A[创意构思: 叶明桂品牌方法论数字化] --> B{技术选型};
    B -->|前端| C[React + Tailwind + Framer Motion];
    B -->|AI| D[通义千问 Qwen-Plus];
    B -->|部署| E[Vercel + GitHub];

    subgraph 开发阶段
    C --> F[聊天式问卷 UI];
    F --> G[辅助答题 & 行业适配];
    G --> H[API 对接 & Prompt 工程];
    H --> I[报告生成 & 图片导出];
    end

    subgraph 上线阶段
    I --> J[Git Push to GitHub];
    J --> K[Vercel 自动构建];
    K --> L[绑定独立域名 yaohuigrowth.com];
    L --> M[配置阿里云 DNS];
    end

    subgraph 交付与迭代
    M --> N[正式上线 (MVP)];
    N --> O[未来: 接入支付 & 独立站];
    end

    style N fill:#10b981,stroke:#059669,stroke-width:2px,color:white
    style A fill:#3b82f6,stroke:#2563eb,stroke-width:2px,color:white
```
