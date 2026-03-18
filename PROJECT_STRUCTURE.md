# AIRI 项目结构

> 版本: v0.9.0-alpha.16

## 目录结构

```
airi/
├── apps/                    # 应用入口
│   ├── stage-web           # Web 版 (PWA)
│   ├── stage-tamagotchi   # 桌面版 (Electron + Tauri)
│   ├── stage-pocket       # 移动端 (Capacitor)
│   ├── server             # 后端服务
│   └── component-calling  # 组件调用
│
├── packages/               # 核心包 (39个)
│   ├── core-character     # 角色核心
│   ├── server-runtime     # WebSocket 运行时
│   ├── server-sdk         # 服务端 SDK
│   ├── server-schema      # 服务端 schema
│   ├── server-shared      # 服务端共享
│   ├── stage-ui           # UI 组件库
│   ├── stage-ui-live2D    # Live2D 支持
│   ├── stage-ui-three     # 3D 支持
│   ├── ui                 # 基础 UI
│   ├── ui-transitions     # 过渡动画
│   ├── ui-loading-screens # 加载页面
│   ├── audio              # 音频处理
│   ├── audio-pipelines    # 音频管线
│   ├── pipelines-audio    # 音频流水线
│   ├── plugin-sdk         # 插件 SDK
│   ├── plugin-protocol    # 插件协议
│   ├── memory-pgvector    # 向量记忆 (PGVector)
│   ├── duckdb-wasm        # 浏览器数据库
│   ├── drizzle-duckdb-wasm# Drizzle ORM
│   ├── i18n               # 国际化
│   ├── tauri-plugin-mcp   # MCP 插件
│   ├── stream-kit         # 流处理
│   ├── model-driver-*     # 模型驱动 (嘴唇同步 / MediaPipe)
│   ├── electron-*         # Electron 集成
│   └── font-*             # 字体资源
│
├── services/               # 对接服务
│   ├── telegram-bot       # Telegram 机器人
│   ├── discord-bot        # Discord 机器人
│   ├── minecraft          # Minecraft 机器人
│   ├── satori-bot         # Satori 机器人
│   └── twitter-services   # Twitter 服务
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
└── integrations/          # 集成
```

---

## 架构简图

```
        ┌─────────────────────────────────────────┐
        │              services                    │
        │  (Telegram / Discord / Minecraft / ...) │
        └────────────────┬────────────────────────┘
                         │
        ┌────────────────▼────────────────────────┐
        │            server-runtime                │
        │         (WebSocket 核心)                 │
        └────────────────┬────────────────────────┘
                         │
    ┌────────────────────┼────────────────────┐
    │                    │                    │
    ▼                    ▼                    ▼
stage-web          stage-tamagotchi      stage-pocket
(浏览器)            (桌面 Electron)        (移动端)
```

---

## 启动命令

| 应用 | 命令 |
|------|------|
| Web 版 | `pnpm dev` |
| 桌面版 | `pnpm dev:tamagotchi` |
| 移动端 iOS | `pnpm dev:pocket:ios` |
| 移动端 Android | `pnpm dev:pocket:android` |
| 文档 | `pnpm dev:docs` |
| UI 组件 | `pnpm dev:ui` |

---

## 部署方式

| 端 | 操作系统 | 安装方式 |
|---|---------|---------|
| PC | Windows | EXE / Scoop |
| PC | macOS | DMG |
| PC | Linux | DEB / RPM |
| 浏览器 | 跨平台 | Web (PWA) |
| 移动端 | iOS | Capacitor (开发中) |
| 移动端 | Android | Capacitor (开发中) |

---

## 核心技术栈

- **前端**: Vue 3 + TypeScript + Vite
- **桌面**: Electron + Tauri
- **移动端**: Capacitor
- **后端**: Node.js + WebSocket
- **Rust**: 核心插件 (MCP, 音频处理)
- **AI**: 支持 20+ LLM 提供商
