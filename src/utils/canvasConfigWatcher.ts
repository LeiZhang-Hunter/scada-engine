/**
 * 画布配置监听器
 * 负责监听画布配置变化并应用到 Graph 实例
 */

import type { Graph } from '@antv/x6'
import type { Ref } from 'vue'
import { canvasConfigManager } from '../scada-components/canvas'

/**
 * 画布配置监听器类
 */
export class CanvasConfigWatcher {
  private graph: Graph | null = null
  private containerRef: Ref<any> | null = null
  private calculateFitScale: (() => number) | null = null
  private updateContainerSizeFn: (() => void) | null = null

  /**
   * 初始化配置监听器
   */
  initialize(
    graph: Graph,
    containerRef: Ref<any>,
    calculateFitScale: () => number,
    updateContainerSizeFn?: () => void
  ): void {
    this.graph = graph
    this.containerRef = containerRef
    this.calculateFitScale = calculateFitScale
    this.updateContainerSizeFn = updateContainerSizeFn || null
  }

  /**
   * 应用配置变化到 Graph
   */
  applyConfigChanges(): void {
    if (!this.graph) return

    const config = canvasConfigManager.getConfig()

    // 更新背景颜色
    this.updateBackground(config.background)

    // 更新容器缩放和尺寸
    this.updateSizeAndScale(config.size, config.zoom.scale)

    // 更新网格
    this.updateGrid(config.grid)

    // 更新偏移
    this.graph.translate(config.offset.x, config.offset.y)
  }

  /**
   * 更新背景
   */
  private updateBackground(background: any): void {
    if (!this.graph) return

    if (background.image) {
      // 有背景图片时
      this.graph.drawBackground({
        color: background.color || '#1e293b',
        image: background.image,
        size: background.size || 'cover',
        repeat: background.repeat || 'no-repeat',
        position: 'center'
      })
    } else {
      // 无背景图片时
      this.graph.drawBackground({ color: background.color || '#1e293b' })
    }
  }

  /**
   * 更新尺寸和缩放
   */
  private updateSizeAndScale(size: any, zoomScale: number): void {
    if (!this.graph || !this.containerRef) return

    const container = this.containerRef.value?.containerRef
    if (!container) return

    // 更新 Graph 逻辑尺寸
    this.graph.resize(size.width, size.height)
    
    // 如果有外部提供的容器尺寸更新函数，使用它
    if (this.updateContainerSizeFn) {
      this.updateContainerSizeFn()
    } else {
      // 否则使用默认逻辑（兼容旧代码）
      container.style.width = `${size.width}px`
      container.style.height = `${size.height}px`
      
      if (this.calculateFitScale) {
        const fitScale = this.calculateFitScale()
        const finalScale = zoomScale > fitScale ? zoomScale : fitScale
        this.graph.scale(finalScale, finalScale)
        this.graph.centerContent()
      }
    }
    
    console.log('🔄 [Config Watcher] 更新尺寸和X6缩放', {
      size,
      zoomScale,
      containerTransform: container.style.transform || 'none',
      graphScale: this.graph.scale()
    })
  }

  /**
   * 更新网格
   */
  private updateGrid(grid: any): void {
    if (!this.graph) return

    if (grid.enabled) {
      this.graph.drawGrid({
        type: grid.type || 'dot',
        args: {
          color: grid.color || '#475569',
          thickness: 1
        }
      })
      this.graph.showGrid()

      // 更新网格大小
      if (grid.size) {
        this.graph.setGridSize(grid.size)
      }
    } else {
      this.graph.hideGrid()
    }
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.graph = null
    this.containerRef = null
    this.calculateFitScale = null
    this.updateContainerSizeFn = null
  }
}

/**
 * 导出配置监听器单例
 */
export const canvasConfigWatcher = new CanvasConfigWatcher()
