# SCADA 组件系统架构

## 📁 目录结构

```
scada-components/
├── types.ts              # 类型定义
├── registry.ts           # 组件注册管理器
├── index.ts             # 统一导出
├── basic/               # 基础组件
│   ├── rect.ts         # 矩形组件
│   ├── circle.ts       # 圆形组件
│   ├── text.ts         # 文本组件
│   └── index.ts        # 基础组件导出
└── iot/                # IoT组件
    ├── light.ts        # 灯泡组件
    ├── switch.ts       # 开关组件
    ├── gauge.ts        # 仪表组件
    └── index.ts        # IoT组件导出
```

## 🎯 核心概念

### 1. 组件配置 (ComponentConfig)
每个组件都有独立的配置文件，包含：
- **metadata**: 组件元数据（ID、名称、分类、图标等）
- **shape**: X6 图形类型
- **width/height**: 默认尺寸
- **attrs**: 节点属性（样式）
- **data**: 组件数据（IoT 绑定等）
- **props**: 属性配置列表

### 2. 组件注册表 (ComponentRegistry)
统一管理所有组件的注册、查询、注销

### 3. 组件分类
- `basic`: 基础图形组件
- `iot`: 物联网组件
- `chart`: 图表组件（扩展）
- `custom`: 自定义组件（扩展）

## 🚀 使用示例

### 创建新组件

```typescript
// scada-components/iot/temperature.ts
import type { ComponentConfig } from '../types'

export const TemperatureComponent: ComponentConfig = {
  metadata: {
    id: 'temperature',
    name: '温度计',
    category: 'iot',
    icon: '🌡️',
    description: '温度传感器组件',
    version: '1.0.0'
  },
  shape: 'rect',
  width: 80,
  height: 120,
  label: '25°C',
  attrs: {
    body: {
      fill: '#ef4444',
      stroke: '#dc2626',
      strokeWidth: 2
    },
    label: {
      fill: '#fff',
      fontSize: 18
    }
  },
  data: {
    type: 'temperature',
    deviceId: '',
    property: 'temperature',
    value: 25,
    unit: '°C'
  },
  props: [
    {
      key: 'deviceId',
      label: '设备ID',
      type: 'text',
      path: 'data.deviceId',
      defaultValue: ''
    },
    {
      key: 'value',
      label: '当前温度',
      type: 'number',
      path: 'data.value',
      defaultValue: 25,
      min: -50,
      max: 150
    }
  ]
}
```

### 注册组件

```typescript
// scada-components/iot/index.ts
export { TemperatureComponent } from './temperature'

// scada-components/registry.ts
import { TemperatureComponent } from './iot'

// 在 registerDefaultComponents 中添加
this.register(TemperatureComponent)
```

### 使用组件

```typescript
// 获取单个组件
const component = componentRegistry.getComponent('temperature')

// 按分类获取组件
const iotComponents = componentRegistry.getComponentsByCategory('iot')

// 获取所有组件
const allComponents = componentRegistry.getAllComponents()

// 动态注册组件
componentRegistry.register(MyCustomComponent)

// 批量注册
componentRegistry.registerBatch([Component1, Component2])
```

## 📝 组件配置说明

### PropType 支持的类型
- `text`: 文本输入
- `number`: 数字输入
- `color`: 颜色选择器
- `boolean`: 开关
- `select`: 下拉选择
- `slider`: 滑块

### 属性路径 (path)
使用点号分隔的路径访问嵌套属性：
- `attrs.body.fill`: 访问 attrs.body.fill
- `data.deviceId`: 访问 data.deviceId

## 🎨 最佳实践

1. **模块化**: 每个组件独立文件
2. **类型安全**: 使用 TypeScript 类型定义
3. **统一注册**: 通过注册表管理组件
4. **元数据完整**: 提供完整的组件描述信息
5. **默认值**: 为所有属性提供合理默认值

## 🔧 扩展指南

### 添加新分类

```typescript
// types.ts
export type ComponentCategory = 'basic' | 'iot' | 'chart' | 'custom' | 'newCategory'
```

### 创建新分类目录

```bash
mkdir scada-components/chart
touch scada-components/chart/index.ts
```

### 添加自定义属性类型

```typescript
// types.ts
export type PropType = 'text' | 'number' | 'color' | 'boolean' | 'select' | 'slider' | 'customType'
```

## 📦 API 参考

### ComponentRegistry 方法

- `register(config)`: 注册单个组件
- `registerBatch(configs)`: 批量注册组件
- `getComponent(id)`: 获取组件配置
- `getAllComponents()`: 获取所有组件
- `getComponentsByCategory(category)`: 按分类获取
- `getComponentList()`: 获取组件列表
- `hasComponent(id)`: 检查组件是否存在
- `unregister(id)`: 注销组件
- `getCount()`: 获取组件数量
- `clear()`: 清空注册表
