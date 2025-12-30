import { reactive } from 'vue'
import type { CanvasConfig } from './types'
import { defaultCanvasConfig, sizePresetMap } from './config'

/**
 * 画布配置管理器
 */
class CanvasConfigManager {
  private config: CanvasConfig

  constructor() {
    this.config = reactive({ ...defaultCanvasConfig }) as CanvasConfig
  }

  /**
   * 获取完整配置
   */
  getConfig(): CanvasConfig {
    return this.config
  }

  /**
   * 更新配置
   */
  updateConfig(updates: Partial<CanvasConfig>): void {
    Object.assign(this.config, updates)
  }

  /**
   * 通过路径更新配置值
   */
  updateByPath(path: string, value: any): void {
    const keys = path.split('.')
    let target: any = this.config

    for (let i = 0; i < keys.length - 1; i++) {
      target = target[keys[i]]
    }

    target[keys[keys.length - 1]] = value

    // 特殊处理：更新尺寸预设时同步宽高
    if (path === 'size.preset' && value in sizePresetMap) {
      const { width, height } = sizePresetMap[value]
      this.config.size.width = width
      this.config.size.height = height
    }
  }

  /**
   * 通过路径获取配置值
   */
  getByPath(path: string): any {
    const keys = path.split('.')
    let value: any = this.config

    for (const key of keys) {
      value = value?.[key]
    }

    return value
  }

  /**
   * 设置画布尺寸
   */
  setSize(width: number, height: number, preset?: string): void {
    this.config.size.width = width
    this.config.size.height = height
    if (preset) {
      this.config.size.preset = preset as any
    }
  }

  /**
   * 更新画布尺寸（别名）
   */
  updateSize(size: { width: number; height: number }): void {
    this.config.size.width = size.width
    this.config.size.height = size.height
  }

  /**
   * 设置缩放
   */
  setZoom(scale: number): void {
    const { min = 0.1, max = 5 } = this.config.zoom
    this.config.zoom.scale = Math.max(min, Math.min(max, scale))
  }

  /**
   * 设置偏移
   */
  setOffset(x: number, y: number): void {
    this.config.offset.x = x
    this.config.offset.y = y
  }

  /**
   * 设置背景颜色
   */
  setBackgroundColor(color: string): void {
    this.config.background.color = color
  }

  /**
   * 更新背景配置（别名）
   */
  updateBackground(bg: { color?: string; image?: string; size?: string; repeat?: string }): void {
    if (bg.color !== undefined) this.config.background.color = bg.color
    if (bg.image !== undefined) this.config.background.image = bg.image
    if (bg.size !== undefined) this.config.background.size = bg.size as any
    if (bg.repeat !== undefined) this.config.background.repeat = bg.repeat as any
  }

  /**
   * 设置背景图片
   */
  setBackgroundImage(url: string): void {
    this.config.background.image = url
  }

  /**
   * 切换网格显示
   */
  toggleGrid(enabled?: boolean): void {
    this.config.grid.enabled = enabled ?? !this.config.grid.enabled
  }

  /**
   * 设置网格大小
   */
  setGridSize(size: number): void {
    this.config.grid.size = size
  }

  /**
   * 切换对齐
   */
  toggleSnap(enabled?: boolean): void {
    this.config.snap.enabled = enabled ?? !this.config.snap.enabled
  }

  /**
   * 切换参考线
   */
  toggleGuides(enabled?: boolean): void {
    this.config.guides.enabled = enabled ?? !this.config.guides.enabled
  }

  /**
   * 切换吸附
   */
  toggleMagnetism(enabled?: boolean): void {
    this.config.magnetism.enabled = enabled ?? !this.config.magnetism.enabled
  }

  /**
   * 重置配置
   */
  reset(): void {
    Object.assign(this.config, defaultCanvasConfig)
  }

  /**
   * 导出配置
   */
  export(): string {
    return JSON.stringify(this.config, null, 2)
  }

  /**
   * 导入配置
   */
  import(configJson: string): void {
    try {
      const imported = JSON.parse(configJson)
      Object.assign(this.config, imported)
    } catch (error) {
      console.error('导入画布配置失败:', error)
    }
  }
}

// 导出单例
export const canvasConfigManager = new CanvasConfigManager()
