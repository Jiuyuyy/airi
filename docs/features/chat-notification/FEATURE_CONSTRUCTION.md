# AIRI 消息通知功能优化方案调研

> 版本: v1.0.0

## 需求背景

当前 AIRI 应用中，当用户不在 chat 页面或者 chat 页面在后台时，用户无法第一时间知道 AIRI 有新消息回复。需要提供一种机制，让用户在非 chat 场景下也能感知到新消息的到来。

---

## 方案调研

### 方案一：桌面端系统通知 (Notification API)

#### 实现方式
当 AIRI 产生新消息时，通过 Electron 调用系统原生通知：

```typescript
// 在 chat stream 结束时触发通知
const notification = new Notification('AIRI 给你发消息了', {
  body: messageContent,
  icon: '/path/to/icon.png'
})
```

#### 触发时机
- 在 `chat.ts` 的 `onAssistantResponseEnd` 或 `onChatTurnComplete` hook 中检测
- 判断当前 chat 页面是否可见（通过 Vue Router 或 visibility API）

#### 现有代码基础
- 项目已有 Notification API 的使用条件（浏览器环境）
- 托盘系统已实现 (`apps/stage-tamagotchi/src/main/tray/index.ts`)

#### 实现难度：⭐⭐ (简单)

| 方面 | 说明 |
|------|------|
| 工作量 | 1-2 天 |
| 技术难点 | 需要区分用户当前是否在 chat 页面可见 |
| 依赖 | Electron Notification API（已内置） |
| 注意事项 | 需要添加用户设置开关，避免打扰 |

#### 桌面端可行性

**✅ 完全支持**

Electron 提供原生的系统通知 API，在 Windows、macOS、Linux 上均可正常工作。

**通知样式示例：**

| 操作系统 | 通知样式 |
|---------|---------|
| Windows 10/11 | 右下角弹窗，可点击展开 |
| macOS | 右上角通知中心，支持点击跳转 |
| Linux (Ubuntu) | 右上角 OSD 通知 |

**触发效果：**
- 屏幕弹出系统通知（右下角/右上角）
- 显示 "AIRI" 作为标题
- 显示消息内容摘要作为正文
- 点击通知可跳转到 chat 页面

**现有参考：**
- 微信桌面版、Slack、Discord 等桌面应用的通知机制

#### 优点
- 覆盖范围广，不依赖窗口焦点
- 实现简单，系统原生支持
- 用户可以在任何时候收到通知

#### 缺点
- 可能被系统通知屏蔽
- 需要用户授权通知权限
- 纯文字形式，沉浸感较弱

---

### 方案二：任务栏/托盘图标状态变化

#### 实现方式
通过修改任务栏图标或托盘图标来提示用户有新消息：

1. **托盘图标徽章** - macOS Dock 角标 / Windows 任务栏 Overlay
2. **托盘气泡** - 托盘图标旁显示气泡
3. **托盘闪烁** - 图标持续闪烁

#### 触发时机
- 消息产生时立即更新图标状态
- 用户切换到 chat 页面时清除状态

#### 现有代码基础
- 托盘系统已完整实现 (`apps/stage-tamagotchi/src/main/tray/index.ts`)
- 已有 `appTray.setToolTip()` 方法

#### 实现难度：⭐⭐⭐ (中等)

| 方面 | 说明 |
|------|------|
| 工作量 | 2-3 天 |
| 技术难点 | 需要 IPC 通信到主进程，跨窗口状态同步 |
| 依赖 | Electron Tray API、app.setBadge() (macOS) |
| 平台差异 | Windows/macOS 实现方式不同 |

#### 桌面端可行性

**✅ 完全支持（桌面端独有）**

这是**桌面端专属**的能力，Web 端和移动端无法实现。

**具体表现形式：**

| 平台 | 实现方式 | 效果描述 |
|------|---------|---------|
| macOS | `app.dock.setBadge()` | Dock 图标右上角显示红色徽章数字 |
| macOS | `appTray.displayBalloon()` | 托盘图标旁弹出气泡提示 |
| Windows | `mainWindow.setOverlayIcon()` | 任务栏图标上覆盖一个小图标 |
| Windows | `appTray.displayBalloon()` | 托盘图标旁弹出气泡提示 |
| 通用 | 托盘图标闪烁 | 托盘图标交替显示/隐藏，引起注意 |

**触发效果：**
- macOS：Dock 栏图标右上角显示未读数量（如 "1"）
- Windows：任务栏图标显示覆盖层
- 托盘图标旁边弹出气泡提示
- 托盘图标持续闪烁

**注意事项：**
- 如果用户隐藏了托盘图标，则无法看到通知
- 需要主进程参与处理（通过 IPC 通信）

#### 核心代码示例

```typescript
// macOS - Dock 角标
app.dock.setBadge('1')

// Windows - 任务栏 Overlay
mainWindow.setOverlayIcon(icon, '有新消息')

// 托盘气泡提示
appTray.displayBalloon({
  title: 'AIRI',
  content: '有新消息啦！'
})

// 托盘图标闪烁 (需要定时器)
let flashInterval: NodeJS.Timeout
function startFlashing() {
  let visible = true
  flashInterval = setInterval(() => {
    appTray.setImage(visible ? icon : null)
    visible = !visible
  }, 500)
}
```

#### 优点
- 直观可见，用户容易感知
- 持续显示，直到用户查看消息
- 桌面端特有，契合产品形态

#### 缺点
- 桌面端专属，移动端/Web 端无法使用
- 平台差异大，需要分别适配
- 托盘图标可能被隐藏

---

### 方案三：Live2D/VRM 角色动画/表情变化

#### 实现方式
当有新消息时，让虚拟形象做出特定动作或表情变化来通知用户：

1. **播放特定动画** - 如举手、挥手等动作
2. **表情变化** - 切换到"有新消息"的表情
3. **视觉提示** - 角色周围显示气泡/闪光效果
4. **语音提示** - 播放提示音（可选）

#### 触发时机
- 在 `chat.ts` 的 stream hook 中检测
- 判断当前 chat 页面不可见时触发

#### 现有代码基础
- Live2D 支持：`packages/stage-ui-live2d`
- VRM 支持：`packages/stage-ui-three`
- 已有情绪系统：`constants/emotions.ts`
- 已有动作系统：支持 `playMotion()`

#### 实现难度：⭐⭐⭐⭐ (较难)

| 方面 | 说明 |
|------|------|
| 工作量 | 3-5 天 |
| 技术难点 | 需要在 chat.ts 的 stream hook 中触发，需要区分用户是否可见 |
| 依赖 | Live2D Cubism SDK / Three.js VRM |
| 注意事项 | 需要准备新的通知用动画/表情资源 |

#### 桌面端可行性

**✅ 完全支持**

桌面端已有完整的 Live2D 和 VRM 渲染支持。

**具体表现形式：**

| 渲染引擎 | 通知方式 | 效果描述 |
|---------|---------|---------|
| Live2D | 播放动画 | 角色做出挥手、举手等动作 |
| Live2D | 表情变化 | 切换到"有新消息"的表情 |
| VRM | 播放动画 | 3D 角色做出动作 |
| VRM | 表情变化 | 3D 角色表情改变 |
| 通用 | 视觉提示 | 角色周围显示气泡/闪光效果 |
| 通用 | 语音提示 | 播放简短的提示音 |

**触发效果：**
- 虚拟形象播放"挥手"或"举手"动画
- 切换到特定的通知表情
- 角色周围弹出消息气泡
- 播放简短的提示音效（可选）

**现有代码支持：**
- `packages/stage-ui-live2d` - Live2D 渲染引擎
- `packages/stage-ui-three` - VRM 3D 渲染
- `constants/emotions.ts` - 情绪系统
- `playMotion()` - 动作播放函数

**注意事项：**
- 如果用户使用纯背景模式（不显示虚拟形象），则无法看到通知
- 需要为 Live2D/VRM 模型准备专门的"通知"动画和表情资源

#### 核心代码示例

```typescript
// 在 chat store hook 中触发
import { useLive2d } from '@proj-airi/stage-ui/stores/live2d'
import { useConsciousnessStore } from '@proj-airi/stage-ui/stores/modules/consciousness'

const chatStore = useChatOrchestratorStore()
const live2dStore = useLive2d()
const consciousnessStore = useConsciousnessStore()

// 检测 chat 页面是否可见
const isChatVisible = computed(() => {
  return router.currentRoute.value.name === 'chat' && document.visibilityState === 'visible'
})

// 订阅消息完成事件
chatStore.onAssistantResponseEnd((message, context) => {
  if (!isChatVisible.value) {
    // 播放通知动画
    live2dStore.playMotion('wave') // 挥手动画
    live2dStore.setExpression('notification') // 通知表情

    // 可选：播放提示音
    playNotificationSound()
  }
})
```

#### 优点
- 符合 AIRI 产品定位和调性
- 沉浸感强，用户体验好
- 与虚拟形象交互自然

#### 缺点
- 实现复杂度较高
- 需要准备新的动画/表情资源
- 如果用户关闭了虚拟形象则无法感知

---

## 方案对比总结

| 方案 | 桌面端可行性 | 优点 | 缺点 | 推荐指数 | 预估工期 |
|------|-------------|------|------|---------|---------|
| 系统通知 | ✅ 完全支持 | 覆盖广、无需聚焦窗口 | 可能被系统屏蔽、需要权限 | ⭐⭐⭐⭐ | 1-2天 |
| 图标变化 | ✅ 完全支持（桌面端独有） | 直观、持续显示 | 平台差异大 | ⭐⭐⭐ | 2-3天 |
| 角色动画 | ✅ 完全支持 | 符合产品调性、沉浸感强 | 实现较复杂、需要资源 | ⭐⭐⭐⭐⭐ | 3-5天 |

---

## 桌面端可行性总结

**三种方案均可完全在桌面端（Electron）实现：**

| 方案 | 桌面端 | Web 端 | 移动端 |
|------|--------|--------|--------|
| 方案一：系统通知 | ✅ 支持 | ✅ 支持 | ✅ 支持 |
| 方案二：图标变化 | ✅ 支持（独有） | ❌ 不支持 | ❌ 不支持 |
| 方案三：角色动画 | ✅ 支持 | ✅ 支持 | ✅ 支持 |

**结论：**
- 方案二是**桌面端独有**的能力（Web/移动端无法实现）
- 方案一和三都是**跨平台**方案

---

## 推荐方案

### 首选：方案三（角色动画）
与 AIRI 的产品定位最契合，用户体验最好，可以让虚拟形象成为"有生命的伴侣"。

### 备选：方案一（系统通知）
如果需要快速上线验证，可以先实现方案一，后续再叠加方案三。

### 组合方案
可以同时实现方案一 + 方案二：
- 方案二作为基础提示（图标变化）
- 方案一作为补充（系统通知）

---

## 后续建议

1. **用户设置**
   - 提供通知开关配置
   - 支持选择通知方式
   - 支持免打扰时段

2. **消息过滤**
   - 区分不同类型的消息
   - 重要消息强制通知，普通消息可选

3. **多端同步**
   - Web 端使用 Web Push 通知
   - 移动端使用本地通知
