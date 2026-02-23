/**
 * SVG 内部动画模板引擎
 * 提供预设的业务语义动画模板
 */

import {
  AnimationTemplateType,
  type AnimationTemplateParams,
  type OpeningRotateParams,
  type LevelHeightParams,
  type StatusColorParams,
  type ValuePositionParams,
  type SpeedFlowParams,
  type ValueOpacityParams,
  type ValueTextParams
} from '../core/types'

/**
 * 动画状态（用于平滑插值）
 */
interface AnimationState {
  /** 当前值 */
  currentValue: number
  /** 目标值 */
  targetValue: number
  /** 上次更新时间 */
  lastUpdateTime: number
}

/**
 * 动画模板引擎类
 */
export class AnimationTemplateEngine {
  private states = new Map<string, AnimationState>()
  
  /**
   * 应用动画模板
   * @param element SVG 元素
   * @param templateType 模板类型
   * @param params 模板参数
   * @param driverValue 驱动值（来自 node.data）
   * @param options 动画选项
   */
  applyTemplate(
    element: SVGGraphicsElement,
    templateType: AnimationTemplateType,
    params: AnimationTemplateParams,
    driverValue: any,
    options?: {
      transitionDuration?: number
      easing?: string
      stateKey?: string
    }
  ): void {
    if (!element) return
    // VALUE_TEXT 允许 driverValue 为 null/undefined，会显示 defaultText
    if (driverValue == null && templateType !== AnimationTemplateType.VALUE_TEXT) return
    
    try {
      switch (templateType) {
        case AnimationTemplateType.OPENING_ROTATE:
          this.applyOpeningRotate(element, params as OpeningRotateParams, driverValue, options)
          break
        
        case AnimationTemplateType.LEVEL_HEIGHT:
          this.applyLevelHeight(element, params as LevelHeightParams, driverValue, options)
          break
        
        case AnimationTemplateType.STATUS_COLOR:
          this.applyStatusColor(element, params as StatusColorParams, driverValue)
          break
        
        case AnimationTemplateType.VALUE_POSITION:
          this.applyValuePosition(element, params as ValuePositionParams, driverValue, options)
          break
        
        case AnimationTemplateType.SPEED_FLOW:
          this.applySpeedFlow(element, params as SpeedFlowParams, driverValue, options)
          break
        
        case AnimationTemplateType.VALUE_OPACITY:
          this.applyValueOpacity(element, params as ValueOpacityParams, driverValue, options)
          break
        
        case AnimationTemplateType.VALUE_TEXT:
          this.applyValueText(element, params as ValueTextParams, driverValue)
          break
        
        default:
          console.warn(`[AnimationTemplateEngine] 未实现的模板类型: ${templateType}`)
      }
    } catch (error) {
      console.error('[AnimationTemplateEngine] 应用模板失败:', error)
    }
  }
  
  /**
   * 开度 → 旋转
   */
  private applyOpeningRotate(
    element: SVGGraphicsElement,
    params: OpeningRotateParams,
    driverValue: number,
    options?: any
  ): void {
    // 参数验证
    if (!params.inputRange || !params.outputRange) {
      console.error('[AnimationTemplateEngine] OpeningRotate 参数不完整:', params)
      return
    }
    
    // 映射输入值到角度
    const angle = this.mapRange(
      driverValue,
      params.inputRange.min,
      params.inputRange.max,
      params.outputRange.min,
      params.outputRange.max
    )
    
    // 获取旋转中心
    const origin = this.getTransformOrigin(element, params.origin || 'center')
    
    // 应用旋转变换
    if (options?.transitionDuration) {
      // 平滑过渡
      element.style.transition = `transform ${options.transitionDuration}ms ${options.easing || 'ease-out'}`
    }
    
    element.style.transformOrigin = origin
    element.style.transform = `rotate(${angle}deg)`
  }
  
  /**
   * 液位 → 高度
   */
  private applyLevelHeight(
    element: SVGGraphicsElement,
    params: LevelHeightParams,
    driverValue: number,
    options?: any
  ): void {
    // 参数验证
    if (!params.inputRange) {
      console.error('[AnimationTemplateEngine] LevelHeight 参数不完整:', params)
      return
    }
    
    // 映射输入值到百分比
    const percentage = this.mapRange(
      driverValue,
      params.inputRange.min,
      params.inputRange.max,
      0,
      100
    )
    
    const direction = params.direction || 'bottom-up'
    
    // 根据元素类型应用不同策略
    const tagName = element.tagName.toLowerCase()
    
    if (tagName === 'rect') {
      this.applyLevelToRect(element as SVGRectElement, percentage, direction, options)
    } else if (tagName === 'path') {
      this.applyLevelToPath(element as SVGPathElement, percentage, direction, options)
    } else {
      // 使用 clip-path
      this.applyLevelWithClipPath(element, percentage, direction, options)
    }
  }
  
  /**
   * 对矩形应用液位
   */
  private applyLevelToRect(
    rect: SVGRectElement,
    percentage: number,
    direction: string,
    options?: any
  ): void {
    const originalHeight = parseFloat(rect.getAttribute('data-original-height') || rect.getAttribute('height') || '100')
    const originalY = parseFloat(rect.getAttribute('data-original-y') || rect.getAttribute('y') || '0')
    
    // 保存原始值
    if (!rect.hasAttribute('data-original-height')) {
      rect.setAttribute('data-original-height', String(originalHeight))
      rect.setAttribute('data-original-y', String(originalY))
    }
    
    const newHeight = (originalHeight * percentage) / 100
    
    if (options?.transitionDuration) {
      rect.style.transition = `height ${options.transitionDuration}ms ${options.easing || 'ease-out'}, y ${options.transitionDuration}ms ${options.easing || 'ease-out'}`
    }
    
    if (direction === 'bottom-up') {
      rect.setAttribute('height', String(newHeight))
      rect.setAttribute('y', String(originalY + originalHeight - newHeight))
    } else if (direction === 'top-down') {
      rect.setAttribute('height', String(newHeight))
      rect.setAttribute('y', String(originalY))
    }
  }
  
  /**
   * 对路径应用液位（使用 clip-path）
   */
  private applyLevelToPath(
    path: SVGPathElement,
    percentage: number,
    direction: string,
    options?: any
  ): void {
    // 路径元素使用 clip-path 实现
    this.applyLevelWithClipPath(path, percentage, direction, options)
  }
  
  /**
   * 使用 clip-path 应用液位
   */
  private applyLevelWithClipPath(
    element: SVGGraphicsElement,
    percentage: number,
    direction: string,
    options?: any
  ): void {
    // 获取元素边界
    const bbox = element.getBBox()
    
    let clipPath: string
    if (direction === 'bottom-up') {
      const clipHeight = (bbox.height * percentage) / 100
      const clipY = bbox.y + bbox.height - clipHeight
      clipPath = `inset(${bbox.height - clipHeight}px 0px 0px 0px)`
    } else if (direction === 'top-down') {
      const clipHeight = (bbox.height * percentage) / 100
      clipPath = `inset(0px 0px ${bbox.height - clipHeight}px 0px)`
    } else {
      clipPath = 'none'
    }
    
    if (options?.transitionDuration) {
      element.style.transition = `clip-path ${options.transitionDuration}ms ${options.easing || 'ease-out'}`
    }
    
    element.style.clipPath = clipPath
  }
  
  /**
   * 状态 → 颜色
   */
  private applyStatusColor(
    element: SVGGraphicsElement,
    params: StatusColorParams,
    driverValue: any
  ): void {
    // 参数验证
    if (!params.colorMap) {
      console.error('[AnimationTemplateEngine] StatusColor 参数不完整:', params)
      return
    }
    
    const strValue = String(driverValue)
    // 若传入值为十六进制颜色，直接使用
    const isHexColor = typeof driverValue === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(driverValue)
    const color = isHexColor ? driverValue : (params.colorMap[strValue] || params.defaultColor || FALLBACK_STATUS_COLOR)
    
    const applyTo = params.applyTo || 'fill'
    
    if (applyTo === 'fill' || applyTo === 'both') {
      element.setAttribute('fill', color)
    }
    
    if (applyTo === 'stroke' || applyTo === 'both') {
      element.setAttribute('stroke', color)
    }
  }
  
  /**
   * 数值 → 位置
   */
  private applyValuePosition(
    element: SVGGraphicsElement,
    params: ValuePositionParams | any,
    driverValue: number,
    options?: any
  ): void {
    // 参数验证和兼容性处理
    // 兼容旧格式：{ axis, distance } 和新格式：{ movement: { axis, distance } }
    let movement: { axis: 'x' | 'y'; distance: number }
    
    if (params.movement && typeof params.movement.distance === 'number') {
      // 新格式：movement 是嵌套对象
      movement = params.movement
    } else if (params.axis && typeof params.distance === 'number') {
      // 旧格式：axis 和 distance 直接在顶层
      movement = {
        axis: params.axis,
        distance: params.distance
      }
    } else {
      console.error('[AnimationTemplateEngine] ValuePosition 参数不完整:', params)
      return
    }
    
    // 映射输入值到位移距离
    const offset = this.mapRange(
      driverValue,
      params.inputRange.min,
      params.inputRange.max,
      0,
      movement.distance
    )
    
    if (options?.transitionDuration) {
      element.style.transition = `transform ${options.transitionDuration}ms ${options.easing || 'ease-out'}`
    }
    
    if (movement.axis === 'x') {
      element.style.transform = `translateX(${offset}px)`
    } else {
      element.style.transform = `translateY(${offset}px)`
    }
  }
  
  /**
   * 速度 → 流动
   */
  private applySpeedFlow(
    element: SVGGraphicsElement,
    params: SpeedFlowParams,
    driverValue: number,
    options?: any
  ): void {
    // 参数验证
    if (!params.inputRange || !params.speedRange) {
      console.error('[AnimationTemplateEngine] SpeedFlow 参数不完整:', params)
      return
    }
    
    const speed = this.mapRange(
      driverValue,
      params.inputRange.min,
      params.inputRange.max,
      params.speedRange.min,
      params.speedRange.max
    )
    
    // 应用虚线动画
    const dashLength = params.dashLength || 10
    element.setAttribute('stroke-dasharray', `${dashLength} ${dashLength}`)
    
    if (speed > 0) {
      const animationDuration = (dashLength * 2) / speed // 秒
      element.style.animation = `dash-flow ${animationDuration}s linear infinite`
    } else {
      element.style.animation = 'none'
    }
    
    // 确保有 CSS 动画定义
    this.ensureFlowAnimation()
  }
  
  /**
   * 透明度映射
   */
  private applyValueOpacity(
    element: SVGGraphicsElement,
    params: ValueOpacityParams,
    driverValue: number,
    options?: any
  ): void {
    // 参数验证
    if (!params.inputRange || !params.outputRange) {
      console.error('[AnimationTemplateEngine] ValueOpacity 参数不完整:', params)
      return
    }
    
    const opacity = this.mapRange(
      driverValue,
      params.inputRange.min,
      params.inputRange.max,
      params.outputRange.min,
      params.outputRange.max
    )
    
    if (options?.transitionDuration) {
      element.style.transition = `opacity ${options.transitionDuration}ms ${options.easing || 'ease-out'}`
    }
    
    element.style.opacity = String(Math.max(0, Math.min(1, opacity)))
  }
  
  /**
   * 字符串 → 文本内容
   */
  private applyValueText(
    element: SVGGraphicsElement,
    params: ValueTextParams,
    driverValue: any
  ): void {
    const text = driverValue != null && driverValue !== '' ? String(driverValue) : (params.defaultText ?? '')
    element.textContent = text
  }
  
  /**
   * 值映射（线性插值）
   */
  private mapRange(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
  ): number {
    // 限制输入范围
    const clampedValue = Math.max(inMin, Math.min(inMax, value))
    
    // 线性映射
    const ratio = (clampedValue - inMin) / (inMax - inMin)
    return outMin + ratio * (outMax - outMin)
  }
  
  /**
   * 获取变换原点
   */
  private getTransformOrigin(element: SVGGraphicsElement, origin: string): string {
    if (origin === 'center') {
      return 'center center'
    }
    
    // 解析预设值
    const presets: Record<string, string> = {
      'top-left': '0% 0%',
      'top-right': '100% 0%',
      'bottom-left': '0% 100%',
      'bottom-right': '100% 100%'
    }
    
    return presets[origin] || origin
  }
  
  /**
   * 确保流动动画的 CSS 已定义
   */
  private ensureFlowAnimation(): void {
    if (document.getElementById('svg-flow-animation-style')) {
      return
    }
    
    const style = document.createElement('style')
    style.id = 'svg-flow-animation-style'
    style.textContent = `
      @keyframes dash-flow {
        to {
          stroke-dashoffset: -20;
        }
      }
    `
    document.head.appendChild(style)
  }
  
  /**
   * 清理状态
   */
  clearState(stateKey: string): void {
    this.states.delete(stateKey)
  }
  
  /**
   * 清理所有状态
   */
  clearAllStates(): void {
    this.states.clear()
  }
}

// 导出单例
export const animationTemplateEngine = new AnimationTemplateEngine()
