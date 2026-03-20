# Chat 消息通知功能实现方案

> 版本: v1.0.0
>
> 状态: 待实现

## 1. 需求概述

### 1.1 背景
当用户不在 chat 页面或 chat 页面在后台时，无法第一时间知道 AIRI 有新消息回复。

### 1.2 目标
在桌面端实现系统通知功能，当 AIRI 回复消息且用户不在 chat 页面时，弹出系统通知提醒用户。

### 1.3 采用方案
**方案一：桌面端系统通知 (Notification API)**

---

## 2. 技术方案

### 2.1 触发条件
- AIRI 产生新消息（Assistant 回复完成）
- 当前页面不是 chat 页面，或者 chat 页面不可见（最小化/后台）

### 2.2 通知内容
- 标题：`AIRI`
- 内容：消息摘要（截取前 100 字符）

### 2.3 用户交互
- 点击通知 → 跳转到 chat 页面并聚焦窗口

### 2.4 技术实现
- 使用 Electron 原生 `Notification` API
- 渲染进程检测页面状态，主进程发送通知

---

## 3. 实现步骤（最小改动原则）

### 3.1 步骤一：创建通知工具函数

**文件**: `packages/stage-ui/src/utils/notification.ts` (新建)

```typescript
export function showNotification(title: string, body: string, onClick?: () => void) {
  // 检查是否支持通知
  if (!('Notification' in window))
    return

  // 请求权限
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: '/icon.png',
    })

    if (onClick) {
      notification.onclick = onClick
    }
  }
  else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        showNotification(title, body, onClick)
      }
    })
  }
}
```

### 3.2 步骤二：订阅消息事件

**文件**: `packages/stage-ui/src/stores/chat.ts` (修改)

在 `useChatOrchestratorStore` 的 hook 中添加通知触发逻辑：

```typescript
// 在 return 之前添加
import { showNotification } from '../utils/notification'

// 检测是否在 chat 页面
const isInChatPage = computed(() => {
  // 需要从外部传入或通过 router 检测
  return true // TODO: 实现页面检测
})

// 订阅消息完成事件
onAssistantResponseEnd((message, context) => {
  // 只有不在 chat 页面时才发送通知
  if (!isInChatPage.value) {
    const content = message.content?.slice(0, 100) || '有新消息'
    showNotification('AIRI', content)
  }
})
```

### 3.3 步骤三：添加设置开关（可选）

**文件**: `packages/stage-ui/src/stores/settings/general.ts` (修改)

添加通知开关配置：

```typescript
const notificationEnabled = useLocalStorage('settings/general/notification-enabled', true)
```

---

## 4. 涉及文件清单

### 4.1 需要新建的文件
| 文件路径 | 说明 |
|---------|------|
| `packages/stage-ui/src/utils/notification.ts` | 通知工具函数 |

### 4.2 需要修改的文件
| 文件路径 | 说明 |
|---------|------|
| `packages/stage-ui/src/stores/chat.ts` | 添加消息完成事件监听 |
| `packages/stage-ui/src/stores/settings/general.ts` | 添加通知开关（可选） |

### 4.3 桌面端特有（可选）
| 文件路径 | 说明 |
|---------|------|
| `apps/stage-tamagotchi/src/main/services/electron/notification.ts` | Electron 主进程通知（需要 IPC） |

---

## 5. 最小改动实现路径

### 5.1 核心改动（必选）
1. 新建 `notification.ts` 工具文件
2. 在 `chat.ts` 中添加 5-10 行通知逻辑

### 5.2 完整功能（可选）
1. 添加用户设置开关
2. 添加 Electron 主进程通知支持（跨窗口）
3. 添加通知音效

---

## 6. 预估工作量

| 阶段 | 工作内容 | 预估时间 |
|------|---------|---------|
| 核心功能 | 工具函数 + 事件订阅 | 0.5 天 |
| 设置开关 | 用户配置 | 0.5 天 |
| 桌面端优化 | 主进程通知 | 1 天 |
| **总计** | | **1-2 天** |

---

## 7. 注意事项

1. **权限处理**: 需要用户授权通知权限，首次使用会弹出授权请求
2. **浏览器限制**: 在 Web 端需要 HTTPS 环境才能使用 Notification API
3. **最小改动**: 本方案遵循最小改动原则，核心功能仅需修改 2 个文件
4. **向后兼容**: 如果用户拒绝通知权限，程序应正常工作

---

## 8. 验收标准

- [ ] 当用户在非 chat 页面时，AIRI 回复消息后弹出系统通知
- [ ] 点击通知可以跳转到 chat 页面
- [ ] 用户可以关闭/开启通知功能（可选）
- [ ] 不影响现有聊天功能
