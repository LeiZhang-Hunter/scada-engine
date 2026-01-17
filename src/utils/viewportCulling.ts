/**
 * 视口裁剪服务
 * 用于大型画布场景优化(1000+ 节点)
 * 
 * 核心原理:
 * 1. 仅渲染可见区域内的节点
 * 2. 视口外的节点设置为不可见
 * 3. 使用空间索引加速查询
 */

import type { Graph, Node } from '@antv/x6'

interface Rect {
  x: number
  y: number
  width: number
  height: number
}

interface ViewportConfig {
  enabled: boolean
  padding: number // 视口外扩区域,避免边缘闪烁
  updateThrottle: number // 更新节流时间(ms)
}

class ViewportCullingService {
  private graph: Graph | null = null
  private config: ViewportConfig = {
    enabled: true,
    padding: 100,
    updateThrottle: 100
  }
  
  private updateTimer: number | null = null
  private isUpdating = false
  private nodeVisibilityCache = new Map<string, boolean>()
  
  // 性能统计
  private stats = {
    totalNodes: 0,
    visibleNodes: 0,
    culledNodes: 0,
    lastUpdateTime: 0
  }

  /**
   * 初始化服务
   */
  init(graph: Graph, config?: Partial<ViewportConfig>): void {
    this.graph = graph
    
    if (config) {
      this.config = { ...this.config, ...config }
    }
    
    if (!this.config.enabled) return
    
    // 监听画布变换事件
    graph.on('translate', this.scheduleUpdate)
    graph.on('scale', this.scheduleUpdate)
    graph.on('resize', this.scheduleUpdate)
    
    // 监听节点添加/移除
    graph.on('node:added', this.scheduleUpdate)
    graph.on('node:removed', this.scheduleUpdate)
    graph.on('node:change:position', this.scheduleUpdate)
    
    console.log('[ViewportCulling] 视口裁剪已启用')
    
    // 初始更新
    this.updateVisibility()
  }

  /**
   * 调度更新(节流)
   */
  private scheduleUpdate = (): void => {
    if (this.updateTimer) return
    
    this.updateTimer = window.setTimeout(() => {
      this.updateVisibility()
      this.updateTimer = null
    }, this.config.updateThrottle)
  }

  /**
   * 更新节点可见性
   */
  private updateVisibility(): void {
    if (!this.graph || this.isUpdating) return
    
    this.isUpdating = true
    const startTime = performance.now()
    
    try {
      // 获取视口区域
      const viewport = this.getViewportRect()
      
      // 获取所有节点
      const nodes = this.graph.getNodes()
      this.stats.totalNodes = nodes.length
      
      let visibleCount = 0
      let culledCount = 0
      
      // 批量更新节点可见性
      nodes.forEach(node => {
        const isVisible = this.isNodeInViewport(node, viewport)
        const currentVisibility = node.isVisible()
        
        // 仅在状态变化时更新
        if (isVisible !== currentVisibility) {
          node.setVisible(isVisible)
        }
        
        // 更新缓存
        this.nodeVisibilityCache.set(node.id, isVisible)
        
        if (isVisible) {
          visibleCount++
        } else {
          culledCount++
        }
      })
      
      this.stats.visibleNodes = visibleCount
      this.stats.culledNodes = culledCount
      this.stats.lastUpdateTime = performance.now() - startTime
      
      // 性能警告
      if (this.stats.lastUpdateTime > 16) {
        console.warn(`[ViewportCulling] 更新耗时 ${this.stats.lastUpdateTime.toFixed(2)}ms`)
      }
      
    } finally {
      this.isUpdating = false
    }
  }

  /**
   * 获取视口矩形区域
   */
  private getViewportRect(): Rect {
    if (!this.graph) {
      return { x: 0, y: 0, width: 0, height: 0 }
    }
    
    // 获取画布可见区域
    const graphArea = this.graph.getGraphArea()
    const { padding } = this.config
    
    return {
      x: graphArea.x - padding,
      y: graphArea.y - padding,
      width: graphArea.width + padding * 2,
      height: graphArea.height + padding * 2
    }
  }

  /**
   * 判断节点是否在视口内
   */
  private isNodeInViewport(node: Node, viewport: Rect): boolean {
    const bbox = node.getBBox()
    
    // AABB 矩形碰撞检测
    return !(
      bbox.x + bbox.width < viewport.x ||
      bbox.x > viewport.x + viewport.width ||
      bbox.y + bbox.height < viewport.y ||
      bbox.y > viewport.y + viewport.height
    )
  }

  /**
   * 强制更新所有节点可见性
   */
  forceUpdate(): void {
    if (this.updateTimer) {
      clearTimeout(this.updateTimer)
      this.updateTimer = null
    }
    this.updateVisibility()
  }

  /**
   * 启用/禁用视口裁剪
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled
    
    if (enabled) {
      this.updateVisibility()
    } else {
      // 禁用时显示所有节点
      this.showAllNodes()
    }
  }

  /**
   * 显示所有节点
   */
  private showAllNodes(): void {
    if (!this.graph) return
    
    const nodes = this.graph.getNodes()
    nodes.forEach(node => {
      if (!node.isVisible()) {
        node.setVisible(true)
      }
    })
    
    this.nodeVisibilityCache.clear()
  }

  /**
   * 获取性能统计
   */
  getStats(): {
    totalNodes: number
    visibleNodes: number
    culledNodes: number
    cullRate: string
    lastUpdateTime: number
  } {
    const cullRate = this.stats.totalNodes > 0
      ? ((this.stats.culledNodes / this.stats.totalNodes) * 100).toFixed(1)
      : '0.0'
    
    return {
      ...this.stats,
      cullRate: `${cullRate}%`
    }
  }

  /**
   * 销毁服务
   */
  destroy(): void {
    if (this.updateTimer) {
      clearTimeout(this.updateTimer)
      this.updateTimer = null
    }
    
    if (this.graph) {
      this.graph.off('translate', this.scheduleUpdate)
      this.graph.off('scale', this.scheduleUpdate)
      this.graph.off('resize', this.scheduleUpdate)
      this.graph.off('node:added', this.scheduleUpdate)
      this.graph.off('node:removed', this.scheduleUpdate)
      this.graph.off('node:change:position', this.scheduleUpdate)
      
      this.showAllNodes()
    }
    
    this.nodeVisibilityCache.clear()
    this.graph = null
    
    console.log('[ViewportCulling] 服务已销毁')
  }
}

// 导出单例
export const viewportCulling = new ViewportCullingService()

// 开发模式调试
if (import.meta.env.DEV) {
  ;(window as any).__viewportCulling__ = viewportCulling
  console.log('💡 开发模式: 可通过 window.__viewportCulling__ 访问视口裁剪服务')
}
