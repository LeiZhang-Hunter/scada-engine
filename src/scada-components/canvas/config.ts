import type { CanvasConfig, CanvasConfigItem } from './types'

/**
 * 默认画布配置
 */
export const defaultCanvasConfig: CanvasConfig = {
  size: {
    width: 1920,
    height: 1080,
    preset: '1920*1080'
  },
  zoom: {
    scale: 1,
    min: 0.1,
    max: 5
  },
  offset: {
    x: 0,
    y: 0
  },
  background: {
    color: '#1e293b',  // 画布背景色（比外层深色背景浅一些）
    size: 'origin',
    repeat: 'repeat'
  },
  grid: {
    enabled: true,
    size: 10,
    color: '#475569',  // 网格颜色（比背景色明显）
    type: 'dot'
  },
  snap: {
    enabled: true,
    threshold: 10
  },
  guides: {
    enabled: false,  // 默认禁用参考线
    color: '#3b82f6'
  },
  magnetism: {
    enabled: true,
    threshold: 10
  }
}

/**
 * 画布配置项定义
 */
export const canvasConfigItems: CanvasConfigItem[] = [
  // 基础配置
  {
    key: 'sizePreset',
    label: '画布尺寸',
    type: 'select',
    category: 'basic',
    path: 'size.preset',
    defaultValue: '1920*1080',
    options: [
      { label: '1920*1080', value: '1920*1080' },
      { label: '1366*768', value: '1366*768' },
      { label: '1280*720', value: '1280*720' },
      { label: '800*600', value: '800*600' }
    ],
    description: '预设画布尺寸'
  },
  
  // 变换配置
  {
    key: 'scale',
    label: '缩放倍数',
    type: 'slider',
    category: 'transform',
    path: 'zoom.scale',
    defaultValue: 1,
    min: 0.1,
    max: 5,
    step: 0.1,
    description: '画布缩放比例'
  },
  {
    key: 'offsetX',
    label: '画布X轴偏移',
    type: 'number',
    category: 'transform',
    path: 'offset.x',
    defaultValue: 0,
    description: 'X轴偏移量'
  },
  {
    key: 'offsetY',
    label: '画布Y轴偏移',
    type: 'number',
    category: 'transform',
    path: 'offset.y',
    defaultValue: 0,
    description: 'Y轴偏移量'
  },

  // 背景配置
  {
    key: 'backgroundColor',
    label: '背景颜色',
    type: 'color',
    category: 'background',
    path: 'background.color',
    defaultValue: '#1e293b',  // 与默认配置保持一致
    description: '画布背景颜色'
  },
  {
    key: 'backgroundImage',
    label: '背景图片',
    type: 'image',
    category: 'background',
    path: 'background.image',
    defaultValue: '',
    description: '背景图片URL'
  },
  {
    key: 'backgroundSize',
    label: '背景大小',
    type: 'select',
    category: 'background',
    path: 'background.size',
    defaultValue: 'origin',
    options: [
      { label: '原始', value: 'origin' },
      { label: '包含', value: 'contain' },
      { label: '覆盖', value: 'cover' },
      { label: '拉伸', value: 'stretch' }
    ],
    description: '背景图片尺寸模式'
  },
  {
    key: 'backgroundRepeat',
    label: '图像重复',
    type: 'select',
    category: 'background',
    path: 'background.repeat',
    defaultValue: 'repeat',
    options: [
      { label: '重复', value: 'repeat' },
      { label: 'X轴重复', value: 'repeat-x' },
      { label: 'Y轴重复', value: 'repeat-y' },
      { label: '不重复', value: 'no-repeat' }
    ],
    description: '背景图片重复模式'
  },

  // 辅助配置
  {
    key: 'gridEnabled',
    label: '网格',
    type: 'boolean',
    category: 'assist',
    path: 'grid.enabled',
    defaultValue: true,
    description: '显示网格'
  },
  {
    key: 'gridSize',
    label: '网格大小',
    type: 'number',
    category: 'assist',
    path: 'grid.size',
    defaultValue: 10,
    min: 5,
    max: 50,
    description: '网格单元格大小'
  },
  {
    key: 'snapEnabled',
    label: '网格对齐',
    type: 'boolean',
    category: 'assist',
    path: 'snap.enabled',
    defaultValue: true,
    description: '启用网格对齐'
  },
  {
    key: 'guidesEnabled',
    label: '参考线',
    type: 'boolean',
    category: 'assist',
    path: 'guides.enabled',
    defaultValue: true,
    description: '显示参考线'
  },
  {
    key: 'magnetismEnabled',
    label: '吸附',
    type: 'boolean',
    category: 'assist',
    path: 'magnetism.enabled',
    defaultValue: true,
    description: '启用吸附功能'
  }
]

/**
 * 尺寸预设映射
 */
export const sizePresetMap: Record<string, { width: number; height: number }> = {
  '1920*1080': { width: 1920, height: 1080 },
  '1366*768': { width: 1366, height: 768 },
  '1280*720': { width: 1280, height: 720 },
  '800*600': { width: 800, height: 600 }
}
