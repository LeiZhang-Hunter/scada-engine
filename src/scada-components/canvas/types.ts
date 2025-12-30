/**
 * 画布配置类型定义
 */

/**
 * 画布尺寸预设
 */
export type CanvasSizePreset = '1920*1080' | '1366*768' | '1280*720' | '800*600' | 'custom'

/**
 * 背景尺寸模式
 */
export type BackgroundSize = 'origin' | 'contain' | 'cover' | 'stretch'

/**
 * 图像重复模式
 */
export type BackgroundRepeat = 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat'

/**
 * 画布配置接口
 */
export interface CanvasConfig {
  // 基础配置
  size: {
    width: number                    // 画布宽度
    height: number                   // 画布高度
    preset?: CanvasSizePreset        // 预设尺寸
  }

  // 缩放配置
  zoom: {
    scale: number                    // 缩放倍数
    min?: number                     // 最小缩放
    max?: number                     // 最大缩放
  }

  // 偏移配置
  offset: {
    x: number                        // X轴偏移
    y: number                        // Y轴偏移
  }

  // 背景配置
  background: {
    color?: string                   // 背景颜色
    image?: string                   // 背景图片URL
    size?: BackgroundSize            // 背景尺寸
    repeat?: BackgroundRepeat        // 图像重复
  }

  // 网格配置
  grid: {
    enabled: boolean                 // 启用网格
    size: number                     // 网格大小
    color?: string                   // 网格颜色
    type?: 'dot' | 'mesh'           // 网格类型
  }

  // 对齐配置
  snap: {
    enabled: boolean                 // 启用对齐
    threshold?: number               // 对齐阈值
  }

  // 参考线配置
  guides: {
    enabled: boolean                 // 启用参考线
    color?: string                   // 参考线颜色
  }

  // 吸附配置
  magnetism: {
    enabled: boolean                 // 启用吸附
    threshold?: number               // 吸附阈值
  }
}

/**
 * 画布配置项定义
 */
export interface CanvasConfigItem {
  key: string                        // 配置键
  label: string                      // 配置标签
  type: 'select' | 'number' | 'color' | 'boolean' | 'slider' | 'image'
  category: 'basic' | 'transform' | 'background' | 'assist'  // 配置分类
  path: string                       // 配置路径
  defaultValue: any                  // 默认值
  options?: Array<{ label: string, value: any }>  // 选项列表
  min?: number                       // 最小值
  max?: number                       // 最大值
  step?: number                      // 步长
  description?: string               // 描述信息
}
