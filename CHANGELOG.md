# 版本更新历史

## [1.1.30] - 2025-02-09

### ✨ 新功能
- 预览模式使用 X6 画布引擎，支持显示连线和动画效果
- 预览窗口尺寸自动匹配画布配置（如 1920×1080）
- 点击预览按钮自动保存画布数据到 localStorage

### 🎨 样式优化
- 预览模式继承编辑模式的主题样式（`data-scada-theme="dark"`）
- 实现预览与编辑模式的样式完全一致（字体、颜色、布局）
- 真正实现"所见即所得"的预览效果

### 🔨 重构
- 移除预览模式的多余容器层（`.canvas-area`）
- 简化预览布局结构，画布直接填充窗口
- 优化预览窗口打开逻辑，从配置读取尺寸

### 💾 功能优化
- **保存**功能：只保存到 localStorage，不下载文件
- **导出**功能：下载 JSON 文件到本地
- 功能职责清晰分离，提升用户体验

---

## [1.1.29] - 2025-01-17

### 🐛 修复
- 修复 `canvasElementService.ts` 中 `getComponent` 异步方法的 Promise 类型错误
- 将 `getElements`、`getElementById`、`searchElements` 方法改为异步方法
- 更新 `GetPropertyConfig.vue` 和 `SetPropertyConfig.vue` 中的调用方法，添加 await 关键字

### 🔨 重构
- 创建独立的类型文件 `element.ts`，解决从 Vue 文件导出类型的 TypeScript 限制
- 将 `ElementInfo` 接口从 `ElementSelector.vue` 迁移到 `types/element.ts`
- 统一所有工作流图元相关组件的类型导入方式

---

## [1.1.28] - 2025-01-16

### 🐛 修复
- 修复数据绑定服务中空点位ID和目标属性的验证逻辑
- 修复 `dataSourceManager` 数据格式解析顺序，优先判断多设备格式
- 移除数据解析过程中的误报警告

### ⚡ 性能优化
- MQTT 连接超时时间从 8 秒延长到 15 秒，提高连接成功率
- 添加 MQTT 客户端 `connectTimeout`（30秒）和 `keepalive`（60秒）配置
- 优化网络波动环境下的连接稳定性

### 🔨 重构
- 移除 `dataBindingService`、`mqttService`、`dataSourceManager`、`ScadaCanvas.vue` 中的调试日志
- 简化数据绑定更新逻辑，静默处理缺失数据
- 优化 MQTT 连接配置和错误处理逻辑

---

## [1.1.27] - 2025-01-16

### 🐛 修复
- 修复 `ScadaCanvas.vue` 中 `calculateContainerSize` 函数的 TypeScript 类型声明
- 为函数添加明确的返回类型注解，消除 TS6133 警告

---

## [1.1.26] - 2025-01-16

### 📝 文档
- 创建版本更新历史记录文档 CHANGELOG.md
- 建立版本发布规范和记录模板

---

## 版本记录模板

```markdown
## [版本号] - YYYY-MM-DD

### ✨ 新增功能
- 功能描述

### 🐛 修复
- Bug 描述及修复方案

### 🔨 重构
- 重构内容说明

### 📝 文档
- 文档更新内容

### ⚡ 性能优化
- 优化描述

### 💥 破坏性变更
- 不兼容的变更说明

### 🗑️ 废弃
- 标记为废弃的功能

### 🔧 配置变更
- 配置文件或依赖版本变更
```

---

## 历史版本

### [1.1.25] 及更早版本
初始版本发布，包含核心 SCADA 组态引擎功能
