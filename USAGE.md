# SCADA 演示项目使用说明

这是一个基于 `@nywqs/scada-engine` 的 SCADA 可视化系统演示项目，提供了完整的编辑器和预览功能。

## 📋 目录

- [快速开始](#快速开始)
- [功能概览](#功能概览)
- [编辑模式使用](#编辑模式使用)
- [预览模式使用](#预览模式使用)
- [自定义 SVG 组件](#自定义-svg-组件)
- [数据持久化](#数据持久化)
- [技术架构](#技术架构)
- [常见问题](#常见问题)

---

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173/` 即可使用编辑器。

### 构建生产版本

```bash
npm run build
```

---

## 🎯 功能概览

### 核心功能

- ✅ **可视化编辑器**：拖拽式组件编辑，支持实时预览
- ✅ **组件库**：内置 7+ 种 SVG 组件（圆形、矩形、管道、阀门等）
- ✅ **预览模式**：独立窗口预览，纯净的画布显示
- ✅ **自动保存**：编辑内容自动保存到 localStorage
- ✅ **自定义组件**：支持加载自定义 SVG 组件
- ✅ **数据绑定**：支持组件属性与数据源绑定
- ✅ **动画效果**：支持连线流动动画、组件状态动画

### 组件类型

#### 基础组件 (Basic)
- **圆形 (Circle)**：带标签的圆形组件
- **矩形 (Rect)**：带标签的矩形组件
- **文本 (Text)**：纯文本显示

#### 图表组件 (Chart)
- **折线图 (Line Chart)**
- **柱状图 (Bar Chart)**
- **饼图 (Pie Chart)**

#### 工业组件 (IoT)
- **阀门 (Valve)**：可旋转的阀门组件
- **管道 (Pipeline)**：连接线，支持流动动画
- **泵 (Pump)**：带动画的泵组件

---

## 🖊️ 编辑模式使用

### 启动编辑器

直接访问 `http://localhost:5173/` 即可进入编辑模式。

### 基本操作

#### 1. 添加组件

1. 点击左侧**组件库**按钮
2. 浏览可用组件（基础、图表、工业）
3. 点击组件图标添加到画布

#### 2. 选择和移动组件

- **选择**：单击组件即可选中
- **移动**：拖拽组件到目标位置
- **多选**：按住 Shift + 拖拽框选

#### 3. 编辑组件属性

1. 选中组件
2. 右侧**属性面板**显示可编辑属性
3. 修改属性值（文本、颜色、尺寸等）
4. 实时查看效果

#### 4. 连接组件

1. 点击组件边缘的**连接点**（蓝色圆点）
2. 拖拽到目标组件的连接点
3. 松开鼠标完成连接

#### 5. 删除组件

- **单个删除**：选中组件 → 按 `Delete` 或 `Backspace` 键
- **批量删除**：框选多个组件 → 按 `Delete`

#### 6. 画布操作

- **平移**：按住 `Shift` + 拖拽画布
- **缩放**：按住 `Ctrl/Cmd` + 鼠标滚轮
- **重置视图**：工具栏 → 重置按钮

#### 7. 保存画布

- **自动保存**：编辑时自动保存到 localStorage
- **手动保存**：工具栏 → 保存按钮

---

## 👁️ 预览模式使用

### 打开预览

1. 在编辑模式下完成画布设计
2. 点击工具栏的**预览**按钮
3. 自动在新窗口打开预览模式

### 预览特点

- **纯净视图**：只显示画布内容，无编辑工具
- **动态尺寸**：预览窗口尺寸根据画布配置自动调整
- **禁用交互**：无法编辑或移动组件
- **实时数据**：如果配置了数据源，将显示实时数据

### 窗口尺寸

预览窗口尺寸规则：
```
窗口宽度 = 画布宽度 + 16px（浏览器边框）
窗口高度 = 画布高度 + 100px（标题栏 + 地址栏）
```

默认画布尺寸：`1920 x 1080`

### URL 访问

也可以直接通过 URL 访问预览模式：
```
http://localhost:5173/?mode=preview
```

---

## 🎨 自定义 SVG 组件

### 组件自动加载

项目支持自动加载自定义 SVG 组件，只需将 SVG 文件放入指定目录即可。

#### 目录位置

```
src/assets/svg-components/
```

#### SVG 文件格式要求

自定义 SVG 组件必须符合以下格式：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <!-- 元数据：组件配置 -->
  <metadata>
    <scada-config><![CDATA[
    {
      "component": {
        "id": "custom-component-id",
        "name": "组件名称",
        "category": "iot",
        "icon": "🔧",
        "description": "组件描述",
        "version": "1.0.0",
        "author": "作者名"
      },
      "size": {
        "width": 100,
        "height": 100
      },
      "presetBindings": [
        {
          "partId": "part-handle",
          "suggestedDriverProperty": "rotate",
          "label": "旋转角度",
          "valueType": "number",
          "suggestedTemplate": "value-rotate"
        }
      ]
    }
    ]]></scada-config>
  </metadata>

  <!-- 可动画部件，ID 必须以 "part-" 开头 -->
  <g id="part-handle" transform-origin="50 50">
    <rect x="40" y="10" width="20" height="80" fill="#10b981"/>
  </g>

  <!-- 静态部件 -->
  <circle cx="50" cy="50" r="30" fill="#1e293b"/>
</svg>
```

#### 配置说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `component.id` | string | 组件唯一标识 |
| `component.name` | string | 显示名称 |
| `component.category` | string | 分类：`basic`、`chart`、`iot` |
| `component.icon` | string | 组件库中的图标（emoji） |
| `size.width/height` | number | 组件默认尺寸 |
| `presetBindings` | array | 预设数据绑定配置 |

#### 动画部件规则

- **ID 前缀**：可动画部件的 ID 必须以 `part-` 开头
- **transform-origin**：旋转中心点（对于旋转动画）
- **支持属性**：`rotate`（旋转）、`fill`（填充色）、`text`（文本内容）等

#### 示例：阀门组件

项目已包含一个示例组件：
```
src/assets/svg-components/example-tank.svg
```

参考此文件创建自己的组件。

#### 加载流程

1. 项目启动时自动扫描 `src/assets/svg-components/` 目录
2. 解析所有 `.svg` 文件
3. 注册到组件库
4. 可在编辑器中使用

#### 调试信息

查看浏览器控制台，可以看到加载日志：
```
[AutoLoad] 🚀 开始自动加载自定义 SVG 组件...
[AutoLoad] 📄 正在加载: example-tank.svg
[AutoLoad] ✅ example-tank.svg 加载成功
[AutoLoad] ✅ 自动加载完成: 1 个成功，0 个失败
```

---

## 💾 数据持久化

### localStorage 存储

项目使用浏览器的 localStorage 保存画布数据：

#### 存储键

- **画布数据**：`scada-canvas-data`
- **数据源配置**：`scada-data-sources`

#### 数据格式

```json
{
  "version": "1.0.0",
  "timestamp": "2026-02-23 19:50:00",
  "config": {
    "width": 1920,
    "height": 1080,
    "background": {
      "color": "#1e293b",
      "image": ""
    },
    "grid": {
      "enabled": true,
      "size": 10,
      "color": "#475569"
    }
  },
  "cells": [
    {
      "id": "node-uuid",
      "shape": "svg-circle",
      "position": { "x": 360, "y": 341 },
      "size": { "width": 80, "height": 80 },
      "data": { "text": "圆形", "fill": "#10b981" }
    }
  ],
  "nodes": [...],
  "edges": [...]
}
```

#### 清空数据

如果需要清空画布：
```javascript
// 打开浏览器控制台执行
localStorage.removeItem('scada-canvas-data')
```

---

## 🏗️ 技术架构

### 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **Vue** | 3.4 | 前端框架 |
| **Vite** | 7.3 | 构建工具 |
| **TypeScript** | 5.x | 类型系统 |
| **@nywqs/scada-engine** | latest | SCADA 引擎 |
| **@antv/x6** | latest | 图编辑框架 |
| **Pinia** | latest | 状态管理 |

### 项目结构

```
scada-demo/
├── src/
│   ├── assets/
│   │   └── svg-components/      # 自定义 SVG 组件目录
│   │       ├── example-tank.svg # 示例组件
│   │       └── README.md        # 组件格式说明
│   ├── components/              # Vue 组件（已移除）
│   ├── utils/
│   │   └── autoLoadSvg.ts       # SVG 自动加载工具
│   ├── App.vue                  # 主应用组件
│   ├── main.ts                  # 应用入口
│   └── style.css                # 全局样式
├── public/                      # 静态资源
├── package.json                 # 依赖配置
└── vite.config.ts              # Vite 配置
```

### 核心模块

#### 1. App.vue
主应用组件，负责：
- 检测预览/编辑模式
- 渲染 ScadaCanvas 或 Preview 组件
- 处理预览窗口打开逻辑

#### 2. main.ts
应用初始化，负责：
- 安装 ScadaEngine 插件
- 加载内置 SVG 组件（等待 300ms）
- 加载自定义 SVG 组件
- 挂载 Vue 应用

#### 3. autoLoadSvg.ts
自动加载工具，负责：
- 使用 Vite 的 `import.meta.glob` 扫描 SVG 文件
- 解析 SVG 元数据
- 注册到 scada-engine 组件库

### 组件加载顺序

```
1. app.use(ScadaEngine)
   └─> 异步加载内置 SVG 组件 (svg-circle, svg-rect 等)

2. await 300ms
   └─> 等待内置组件加载完成

3. autoLoadSvgComponents()
   └─> 加载 src/assets/svg-components/ 下的自定义组件

4. app.mount('#app')
   └─> 挂载应用，所有组件已注册完成
```

**重要**：必须等待所有组件注册完成后再挂载应用，否则 Preview 组件加载数据时会因找不到 shape 而报错。

---

## ❓ 常见问题

### 1. 预览时组件位置不对？

**原因**：浏览器窗口尺寸与画布尺寸不匹配。

**解决**：
- 检查画布配置的尺寸（右侧属性面板 → 画布设置）
- 预览窗口会自动调整，但浏览器可能限制最大窗口尺寸

### 2. 预览显示空白？

**原因**：
- localStorage 中没有保存的数据
- 数据格式错误

**解决**：
- 在编辑模式下先保存画布
- 检查浏览器控制台是否有错误日志
- 清空 localStorage 重新创建：
  ```javascript
  localStorage.removeItem('scada-canvas-data')
  ```

### 3. 自定义组件不显示？

**原因**：
- SVG 格式不正确
- category 不在支持列表中
- 动画部件 ID 未使用 `part-` 前缀

**解决**：
- 检查 SVG 格式是否符合要求
- category 只能是 `basic`、`chart`、`iot`
- 参考 `example-tank.svg` 示例
- 查看控制台日志：
  ```
  [AutoLoad] ❌ xxx.svg 加载失败: 错误原因
  ```

### 4. 预览时报错 "shape should be specified"？

**原因**：组件未在预览模式下正确注册。

**解决**：
- 确保 main.ts 中有 300ms 等待时间
- 检查组件加载顺序
- 清空 localStorage 重新保存画布

### 5. 连线没有流动动画？

**原因**：连线动画未启用。

**解决**：
1. 选中连线
2. 右侧属性面板 → 动画设置
3. 启用流动动画
4. 调整动画参数（速度、颜色等）

### 6. 如何修改画布尺寸？

1. 编辑模式下点击**画布设置**按钮（右上角齿轮图标）
2. 修改宽度和高度
3. 保存后预览窗口会自动适应新尺寸

### 7. 如何导出画布数据？

```javascript
// 打开浏览器控制台
const data = localStorage.getItem('scada-canvas-data')
console.log(JSON.parse(data))

// 或者保存到文件
const blob = new Blob([data], { type: 'application/json' })
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = 'scada-data.json'
a.click()
```

### 8. 如何导入画布数据？

```javascript
// 打开浏览器控制台
const jsonData = '...' // 你的 JSON 数据
localStorage.setItem('scada-canvas-data', jsonData)
location.reload()
```

---

## 📞 技术支持

### 相关链接

- **SCADA Engine 文档**：查看引擎源码 `g:\scada-engine\`
- **@antv/x6 文档**：https://x6.antv.antgroup.com/
- **Vue 3 文档**：https://vuejs.org/
- **Vite 文档**：https://vitejs.dev/

### 调试技巧

1. **查看组件注册情况**：
   ```javascript
   import('@nywqs/scada-engine').then(m => {
     console.log(m.componentRegistry.getAllComponents())
   })
   ```

2. **查看已注册的 X6 shapes**：
   ```javascript
   import { Graph } from '@antv/x6'
   console.log(Graph.registry.getNodes())
   ```

3. **启用详细日志**：
   打开浏览器控制台，筛选器设置为 `[AutoLoad]` 或 `[SCADA]`

---

## 🔄 更新日志

### v1.0.0 (2026-02-23)

- ✅ 实现基础编辑器功能
- ✅ 实现预览模式
- ✅ 支持自定义 SVG 组件自动加载
- ✅ 优化组件加载顺序，修复预览模式 shape 错误
- ✅ 预览窗口尺寸根据画布配置动态调整

---

## 📄 许可证

MIT License

---

**祝你使用愉快！** 🎉

如有问题，请检查浏览器控制台的错误日志，或参考常见问题章节。
