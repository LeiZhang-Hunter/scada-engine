/**
 * SCADA 组件系统统一导出
 */

// 导出组件注册系统
export { componentRegistry } from './registry'

// 导出画布配置系统
export * from './canvas'

// 导出类型定义
export type {
  ComponentConfig,
  ComponentRegistry,
  ComponentCategory,
  ComponentMetadata,
  ComponentProp,
  ComponentData,
  NodeAttrs,
  PropType
} from './types'

// 导出IoT组件
export * as IoTComponents from './chart'
