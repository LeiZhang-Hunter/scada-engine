

# @nywqs/scada-engine

基于 AntV X6 + Vue 3 的自研 SCADA 组态引擎。旨在为工业物联网（IIoT）提供高性能、可扩展的可视化组态解决方案，支持拖拽式界面设计、实时数据绑定及复杂的流程编排。

## 特性

- 🛠 **可视化编辑器**：基于 AntV X6 构建的专业级图形编辑能力，支持节点拖拽、连线编排、框选复制等操作。
- 📦 **丰富组件库**：
  - **基础组件**：矩形、圆形、文本等基础矢量图形。
  - **IoT 组件**：支持 ECharts 图表（仪表盘、折线图）、3D 设备模型（电机、管道、阀门、储罐等）、指示灯、开关等工业控件。
- 🔗 **多源数据集成**：内置服务层，支持 WebSocket、MQTT、HTTP 请求及 SSE（Server-Sent Events）等多种实时数据接入方式。
- 🎨 **动画引擎**：内置独立的动画调度器（AnimationScheduler）与动画引擎（AnimationEngine），支持脉冲、闪烁、旋转等节点特效。
- ⚙️ **流程编排**：内置可视化工作流编辑器（Workflow Editor），支持通过逻辑节点（条件判断、定时器、HTTP 请求、自定义代码）编排复杂业务流程。
- 🔐 **授权与安全**：基于 ECDSA P-256 + SHA-256 的数字签名授权机制，保障软件使用安全。
- 🚀 **性能优化**：支持视口裁剪（Viewport Culling）技术，在保证视觉效果的同时优化大数据量场景下的渲染性能。

## 安装

### 环境要求

确保你的项目中已安装以下依赖：

```bash
npm install vue@^3.4.0 vue-router@^4.6.0 @antv/x6@^2.18.0 echarts@^5.5.0 pinia@^2.1.0
```

### 安装引擎

```bash
npm install @nywqs/scada-engine
# 或
pnpm add @nywqs/scada-engine
# 或
yarn add @nywqs/scada-engine
```

## 快速开始

### 1. 全局注册

在你的应用入口文件（如 `main.ts`）中引入并注册组件：

```typescript
import { createApp } from 'vue'
import ScadaEngine from '@nywqs/scada-engine'
import '@nywqs/scada-engine/dist/scada-engine.css' // 引入样式
import App from './App.vue'

const app = createApp(App)
app.use(ScadaEngine)
app.mount('#app')
```

### 2. 在组件中使用

最核心的组件是 `ScadaCanvas`，它承载了画布编辑器和预览功能。

```vue
<template>
  <div class="scada-container">
    <ScadaCanvas 
      ref="canvasRef"
      :auth-code="authCode"
      @node-click="handleNodeClick"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ScadaCanvas } from '@nywqs/scada-engine'

const canvasRef = ref()
const authCode = '你的授权码' // 商业版本需要

const handleNodeClick = (node) => {
  console.log('点击了节点:', node.id)
}
</script>
```

## 目录结构

项目采用了清晰的模块划分：

```
src/
├── components/          # 核心 UI 组件
│   ├── Header.vue       # 顶部工具栏
│   ├── Footer.vue       # 底部版权栏
│   ├── ScadaCanvas.vue  # 核心画布组件
│   └── ...
├── scada-components/    # 业务组件库
│   ├── basic/           # 基础图形组件 (rect, circle, text)
│   ├── iot/             # IoT 设备组件 (gauge, motor, tank...)
│   ├── canvas/          # 画布配置管理
│   └── registry.ts      # 组件注册表
├── views/workflow/      # 流程编排模块
├── services/            # 数据服务层
│   ├── websocketService.ts
│   ├── mqttService.ts
│   └── ...
├── utils/               # 工具函数与引擎核心
│   ├── animationEngine.ts   # 动画引擎
│   ├── authCrypto.ts        # 授权加密模块
│   └── viewportCulling.ts   # 视口优化
└── styles/              # 样式文件
```

## 核心概念

### 画布 (ScadaCanvas)

画布是整个系统的核心，提供以下能力：
- **编辑模式**：用于设计组态画面。
- **预览模式**：用于运行展示，隐藏编辑 UI。
- **数据绑定**：支持将设备点位（Point）绑定到组件属性，实时更新显示。

### 组件注册系统 (ComponentRegistry)

引擎使用了懒加载注册机制来优化性能。
- 支持按分类（`basic`, `iot`）获取组件列表。
- 支持动态注册新组件。

### 数据服务 (Data Services)

引擎不强制绑定特定后端，提供了灵活的数据接入适配器：
- **WebSocket**：适用于高频实时数据。
- **MQTT**：适用于物联网消息订阅。
- **HTTP**：适用于请求-响应式查询。
- **SSE**：适用于服务器推送事件。

### 流程引擎 (Workflow Engine)

内置的可视化脚本系统，允许用户在画布上通过图形化节点编写逻辑，无需编写大量代码即可实现：
- 定时触发任务
- 条件判断分支
- HTTP 外部请求
- 自定义 JavaScript 代码执行

## API 参考

### ScadaCanvas 方法

通过 `ref` 可以直接调用画布的操作方法：

| 方法 | 说明 |
|------|------|
| `save()` | 保存当前画布数据到 LocalStorage |
| `export()` | 导出当前画布为 JSON 文件 |
| `import()` | 触发文件选择器导入 JSON |
| `getCanvasData()` | 获取画布完整数据对象（包含节点、连线和配置） |
| `zoomIn()` / `zoomOut()` | 放大/缩小画布 |
| `clearAll()` | 清空画布 |

### 数据结构示例

`getCanvasData()` 返回的结构大致如下：

```json
{
  "version": "1.0",
  "config": {
    "width": 1920,
    "height": 1080,
    "grid": true
  },
  "cells": [
    {
      "id": "node-1",
      "type": "rect",
      "x": 100,
      "y": 100,
      "label": "电机",
      "data": { "binding": "device_01_status" }
    }
  ]
}
```

## 许可证

本项目采用 MIT 许可证。内置的组件库和引擎功能可以免费用于学习和非商业项目。

**商业授权**：如需将本引擎用于商业产品并隐藏底部版权标识，请联系作者获取数字签名授权。

## 作者

- **nywqs**

如有问题或建议，欢迎提交 Issue 或联系作者。
