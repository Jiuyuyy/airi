# Chat 消息通知功能

## 概述

本目录包含 AIRI 聊天消息通知功能的方案设计文档。

## 文档列表

| 文档 | 说明 |
|------|------|
| [调研报告](./FEATURE_CONSTRUCTION.md) | 三种方案的技术调研与可行性分析 |
| [实现方案](./IMPLEMENTATION_PLAN.md) | 方案一的详细实现步骤 |

## 快速导航

### 需求背景
当用户不在 chat 页面或 chat 页面在后台时，无法第一时间知道 AIRI 有新消息回复。

### 采用方案
**方案一：桌面端系统通知 (Notification API)**

### 核心优势
- 实现简单（1-2 天）
- 跨平台支持
- 最小改动原则

---

## 相关资源

- Chat Store: `packages/stage-ui/src/stores/chat.ts`
- 通知工具: `packages/stage-ui/src/utils/notification.ts` (待创建)
