/**
 * 画布配置系统统一导出
 */

// 导出类型
export type {
  CanvasConfig,
  CanvasConfigItem,
  CanvasSizePreset,
  BackgroundSize,
  BackgroundRepeat
} from './types'

// 导出配置
export {
  defaultCanvasConfig,
  canvasConfigItems,
  sizePresetMap
} from './config'

// 导出管理器
export { canvasConfigManager } from './manager'
