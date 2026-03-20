# AIRI 项目结构

> 版本: v0.9.0-alpha.18

## 项目概述

AIRI (AI Remote Intelligence) 是一个多平台 AI 角色交互应用，核心功能包括：
- **语音对话**: 支持多种 TTS (Text-to-Speech) 提供商，实现 AI 角色的语音输出
- **视觉识别**: 通过摄像头捕获画面，识别用户手势、环境物体等
- **实时交互**: 基于 WebSocket 的实时通信，支持多端同步
- **插件系统**: 支持 MCP (Model Context Protocol) 插件扩展
- **多平台支持**: 桌面 (Electron)、Web (PWA)、移动端 (Capacitor)
- **外部集成**: 支持 Telegram、Discord、Minecraft 等第三方平台集成

---

## 目录结构

```
airi/
├── apps/                    # 应用入口
│   ├── stage-web           # Web 版 (Vue 3 + Vite + PWA)
│   ├── stage-tamagotchi   # 桌面版 (Electron + Vue 3)
│   ├── stage-pocket       # 移动端 (Capacitor + Vue 3)
│   ├── server             # 后端服务 (Node.js + H3 + WebSocket)
│   └── component-calling  # 组件调用示例
│
├── packages/               # 核心包 (39个)
│   ├── stage-ui           # ★ 核心业务组件库 (stores, composables, components)
│   ├── stage-ui-three     # Three.js 3D 渲染支持
│   ├── stage-ui-live2d   # Live2D 虚拟形象支持
│   ├── stage-shared      # 跨应用共享逻辑
│   ├── stage-pages       # 共享页面基类
│   ├── stage-layouts     # 布局组件
│   ├── ui                # 基础 UI 组件 (基于 reka-ui)
│   ├── ui-transitions    # 过渡动画
│   ├── ui-loading-screens# 加载页面
│   ├── server-runtime    # ★ WebSocket 运行时 (模块注册/路由/心跳)
│   ├── server-sdk        # 客户端 SDK
│   ├── server-schema     # 服务端类型定义
│   ├── server-shared     # 服务端共享类型
│   ├── plugin-sdk        # ★ 插件 SDK (本地/远程插件支持)
│   ├── plugin-protocol   # 插件协议定义
│   ├── core-character    # 角色核心逻辑
│   ├── audio             # 音频处理基础
│   ├── pipelines-audio   # 音频流水线
│   ├── audio-pipelines-transcribe # 音频转录
│   ├── memory-pgvector   # 向量记忆 (PGVector)
│   ├── duckdb-wasm       # 浏览器端数据库
│   ├── drizzle-duckdb-wasm# Drizzle ORM WASM
│   ├── i18n              # ★ 国际化 (多语言支持)
│   ├── model-driver-lipsync  # 嘴唇同步驱动
│   ├── model-driver-mediapipe # MediaPipe 驱动
│   ├── stream-kit        # 流处理工具
│   ├── electron-*        # Electron 集成包
│   ├── tauri-plugin-mcp  # Tauri MCP 插件
│   ├── cap-vite          # Capacitor Vite 配置
│   ├── ccc               # 通用组件集合
│   ├── vite-plugin-warpdrive # 构建优化插件
│   ├── unocss-preset-fonts   # 字体预设
│   └── font-*            # 字体资源包
│
├── services/               # 对接服务 (独立部署)
│   ├── telegram-bot       # Telegram 机器人
│   ├── discord-bot        # Discord 机器人
│   ├── minecraft          # Minecraft 机器人
│   ├── satori-bot         # Satori 协议机器人
│   └── twitter-services   # Twitter/X 服务
│
├── crates/                 # Rust 核心 (6个)
│   ├── tauri-plugin-mcp
│   ├── tauri-plugin-ipc-audio-transcription-ort
│   ├── tauri-plugin-ipc-audio-vad-ort
│   ├── tauri-plugin-rdev
│   └── tauri-plugin-window-*
│
├── docs/                   # 文档
├── scripts/                # 脚本
├── plugins/               # 插件目录
└── integrations/          # 第三方集成
```

---

## 核心模块详解

### 1. stage-ui (packages/stage-ui)

**核心业务组件库**，是 AIRI 的大脑，包含：

- **Stores (状态管理)**
  - `stores/modules/` - AIRI 编排模块
    - `speech.ts` - 语音合成 (20+ TTS 提供商)
    - `hearing.ts` - 听力/语音识别
    - `vision.ts` - 视觉识别 (手势、物体、环境)
    - `consciousness.ts` - 意识/记忆模块
    - `discord.ts` - Discord 集成
    - `twitter.ts` - Twitter/X 集成
    - `gaming-minecraft.ts` - Minecraft 游戏集成
    - `gaming-factorio.ts` - Factorio 游戏集成
    - `airi-card.ts` - AIRI 卡片组件
  - `stores/providers/` - AI 提供商配置 (OpenAI, Anthropic, Google, Azure, Ollama 等 20+ 提供商)
  - `stores/chat/` - 聊天会话管理
  - `stores/settings/` - 设置管理
  - `stores/character/` - 角色编排器

- **Composables (组合式函数)**
  - 音频处理 (`audio/`)
  - 视觉推理 (`vision/`)
  - 工具函数

- **Components (组件)**
  - 业务组件 (`components/`)
  - 场景组件 (`components/scenarios/`)

- **Workers (Web Workers)**
  - `vad/` - 语音活动检测 (Voice Activity Detection)
  - `kokoro/` - Kokoro TTS 引擎

### 2. server-runtime (packages/server-runtime)

**WebSocket 运行时**，负责：
- 模块注册与发现
- 消息路由与转发
- 心跳保活
- 认证授权

核心事件类型：
- `module:announce` - 模块注册
- `module:authenticate` - 认证
- `transport:connection:heartbeat` - 心跳
- `registry:modules:sync` - 模块列表同步

### 3. plugin-sdk (packages/plugin-sdk)

**插件系统**，支持：
- 本地插件 (Node.js 运行时)
- 远程插件 (WebSocket)
- 插件生命周期管理
- 资源与权限控制

### 4. i18n (packages/i18n)

**国际化系统**：
- 多语言支持 (中文、英文等)
- 基于 `vue-i18n`
- 翻译文件在 `packages/i18n/src/locales/`

---

## 架构交互图

```
┌──────────────────────────────────────────────────────────────────────┐
│                         External Services                             │
│   (Telegram / Discord / Minecraft / Twitter / MCP Servers)          │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────────────┐
│                         server-runtime                                │
│                  (WebSocket / 模块注册 / 消息路由)                    │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
   ┌─────────┐           ┌─────────┐           ┌─────────┐
   │ stage-  │           │ stage-  │           │ stage-  │
   │ web     │           │tamagotchi│           │ pocket  │
   │(浏览器)  │           │(桌面)    │           │(移动端) │
   └────┬────┘           └────┬────┘           └────┬────┘
        │                    │                      │
        └────────────────────┼──────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   stage-ui      │
                    │  (核心业务逻辑)  │
                    ├─────────────────┤
                    │ • stores/modules│
                    │ • speech/hearing│
                    │ • vision        │
                    │ • consciousness │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                      ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────────┐
│stage-ui-three│    │stage-ui-live2d│    │  providers/     │
│  (3D渲染)    │    │ (Live2D)     │    │  (20+ AI厂商)   │
└──────────────┘    └──────────────┘    └──────────────────┘
```

---

## 模块间通信模式

### 1. WebSocket 通信 (server-runtime)
- 客户端通过 WebSocket 连接到服务端
- 使用 SuperJSON 序列化消息
- 支持模块注册、消息路由、心跳保活

### 2. Eventa IPC/RPC
- 使用 `@moeru/eventa` 进行类型安全的 IPC
- 定义契约在 `apps/*/src/shared/` 目录
- 桌面端示例：`apps/stage-tamagotchi/src/main/services/electron`

### 3. Pinia 状态管理
- `stage-ui` 使用 Pinia 进行前端状态管理
- Stores 分为业务模块 (modules) 和功能模块 (providers, chat, settings)

### 4. 依赖注入 (injeca)
- 桌面应用使用 `injeca` 进行依赖注入
- 示例：`apps/stage-tamagotchi/src/main/index.ts`

---

## 启动命令

| 应用 | 命令 |
|------|------|
| Web 版 | `pnpm dev` |
| 桌面版 | `pnpm dev:tamagotchi` |
| 移动端 iOS | `pnpm dev:pocket:ios` |
| 移动端 Android | `pnpm dev:pocket:android` |
| 文档 | `pnpm dev:docs` |
| UI 组件 Storybook | `pnpm -F @proj-airi/stage-ui story:dev` |
| 服务端 | `pnpm -F @proj-airi/server dev` |

---

## 部署方式

| 端 | 操作系统 | 安装方式 |
|---|---------|---------|
| PC | Windows | EXE / Scoop |
| PC | macOS | DMG |
| PC | Linux | DEB / RPM |
| 浏览器 | 跨平台 | Web (PWA) / Netlify |
| 移动端 | iOS | Capacitor (开发中) |
| 移动端 | Android | Capacitor (开发中) |
| 服务端 | 跨平台 | Docker / Railway |

---

## 核心技术栈

- **前端**: Vue 3 + TypeScript + Vite + Pinia + VueUse + UnoCSS
- **桌面**: Electron + Vue 3
- **移动端**: Capacitor + Vue 3
- **后端**: Node.js + H3 + WebSocket + Drizzle ORM
- **Rust**: 核心插件 (MCP, 音频处理, VAD)
- **AI**: xsai 库 + 20+ LLM/TTS/STT 提供商支持
- **3D/2D**: Three.js + Live2D Cubism SDK
- **数据库**: DuckDB WASM + PostgreSQL (PGVector)
