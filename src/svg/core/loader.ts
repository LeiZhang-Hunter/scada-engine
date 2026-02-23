/**
 * SVG 组件加载器
 * 负责加载 SVG 文件并注册到组件注册表
 */

import { defineComponent, h } from 'vue'
import { componentRegistry } from '../../scada-components/registry'
import { SVGParser } from './parser'
import SVGRenderer from '../rendering/SVGRenderer.vue'
import type { ComponentConfig, ComponentPoint } from '../../scada-components/types'
import type { SVGComponentConfig } from './types'

// 端口样式常量
const PORT_RADIUS = 4
const PORT_STROKE = '#31d0c6'
const PORT_FILL = '#fff'
const PORT_STROKE_WIDTH = 2

// 动画常量
const DEFAULT_TRANSITION_MS = 300

/**
 * SVG 组件加载器类
 */
export class SVGLoader {
  /**
   * 从字符串加载 SVG 组件
   * @param svgContent SVG 文件内容
   * @param fileName 文件名（可选）
   * @returns 是否加载成功
   */
  loadFromString(svgContent: string, fileName?: string): boolean {
    try {
      // 1. 解析 SVG
      const svgConfig = SVGParser.parse(svgContent, fileName)
      if (!svgConfig) {
        console.error('[SVGLoader] SVG 解析失败')
        return false
      }
      
      // 2. 验证配置
      const validation = SVGParser.validate(svgConfig)
      if (!validation.valid) {
        console.error('[SVGLoader] SVG 配置验证失败:', validation.errors)
        return false
      }
      
      // 3. 转换为 ComponentConfig
      const componentConfig = this.convertToComponentConfig(svgConfig)
      
      // 4. 注册组件
      componentRegistry.register(componentConfig)
      return true
    } catch (error) {
      console.error('[SVGLoader] 加载失败:', error)
      return false
    }
  }
  
  /**
   * 从文件加载 SVG 组件
   * @param file File 对象
   * @returns Promise<boolean>
   */
  async loadFromFile(file: File): Promise<boolean> {
    try {
      const content = await this.readFileAsText(file)
      return this.loadFromString(content, file.name)
    } catch (error) {
      console.error('[SVGLoader] 读取文件失败:', error)
      return false
    }
  }
  
  /**
   * 批量加载 SVG 组件
   * @param files File 对象数组
   * @returns Promise<加载成功的数量>
   */
  async loadBatch(files: File[]): Promise<number> {
    let successCount = 0
    
    for (const file of files) {
      const success = await this.loadFromFile(file)
      if (success) {
        successCount++
      }
    }
    
    console.log(`[SVGLoader] 批量加载完成: ${successCount}/${files.length}`)
    
    return successCount
  }
  
  /**
   * 从 URL 加载 SVG 组件
   * @param url SVG 文件 URL
   * @returns Promise<boolean>
   */
  async loadFromUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const content = await response.text()
      const fileName = url.split('/').pop() || 'remote.svg'
      
      return this.loadFromString(content, fileName)
    } catch (error) {
      console.error('[SVGLoader] 从 URL 加载失败:', error)
      return false
    }
  }
  
  /**
   * 转换 SVGComponentConfig 为 ComponentConfig
   */
  private convertToComponentConfig(svgConfig: SVGComponentConfig): ComponentConfig {
    // 创建一个包装 SVGRenderer 的 Vue 组件
    const WrapperComponent = defineComponent({
      name: `SVG_${svgConfig.metadata.id}`,
      props: {
        node: {
          type: Object,
          required: false
        }
      },
      setup(props) {
        return () => h(SVGRenderer, {
          node: props.node,
          config: svgConfig
        })
      }
    })
    
    // 从 presetBindings 生成默认的 internalAnimations 和驱动字段默认值
    const defaultInternalAnimations = this.generateInternalAnimations(svgConfig)
    const defaultDriverValues = this.generateDefaultDriverValues(svgConfig)
    
    // 构建 ComponentConfig
    const componentConfig: ComponentConfig = {
      metadata: {
        id: svgConfig.metadata.id,
        name: svgConfig.metadata.name,
        category: svgConfig.metadata.category,
        icon: svgConfig.metadata.icon,
        description: svgConfig.metadata.description,
        version: svgConfig.metadata.version,
        author: svgConfig.metadata.author
      },
      shape: `svg-${svgConfig.metadata.id}`,
      width: svgConfig.size.width,
      height: svgConfig.size.height,
      label: svgConfig.metadata.name,
      attrs: {
        body: {
          fill: 'transparent',
          stroke: 'transparent'
        }
      },
      data: {
        type: 'svg',
        svgComponentId: svgConfig.metadata.id,
        parts: svgConfig.parts,
        internalAnimations: defaultInternalAnimations,
        presetBindings: svgConfig.presetBindings || [],
        // 添加默认的驱动字段值
        ...defaultDriverValues,
        ...svgConfig.defaultData
      },
      props: this.generateProps(svgConfig),
      // 从 SVG 配置生成组件点位定义，供数据绑定使用
      points: this.generatePoints(svgConfig, defaultDriverValues),
      component: WrapperComponent,
      ports: this.generatePorts(svgConfig)
    }
    
    return componentConfig
  }
  
  /**
   * 从 presetBindings 生成 InternalAnimations
   */
  private generateInternalAnimations(svgConfig: SVGComponentConfig): any[] {
    if (!svgConfig.presetBindings || svgConfig.presetBindings.length === 0) {
      return []
    }
    
    return svgConfig.presetBindings.map((preset, index) => ({
      id: `anim-${index + 1}`,
      partId: preset.partId,
      driverProperty: preset.suggestedDriverProperty,
      templateType: preset.suggestedTemplate,
      templateParams: preset.suggestedParams,
      enabled: true,
      transitionDuration: DEFAULT_TRANSITION_MS,
      easing: 'ease-out'
    }))
  }
  
  /**
   * 生成默认的驱动字段值
   */
  private generateDefaultDriverValues(svgConfig: SVGComponentConfig): Record<string, any> {
    const defaultValues: Record<string, any> = {}
    
    if (!svgConfig.presetBindings || svgConfig.presetBindings.length === 0) {
      return defaultValues
    }
    
    // 为每个驱动字段设置默认值
    svgConfig.presetBindings.forEach(preset => {
      const driverProperty = preset.suggestedDriverProperty
      
      // 根据模板类型设置合适的默认值
      switch (preset.suggestedTemplate) {
        case 'opening-rotate':
          defaultValues[driverProperty] = 0 // 关闭状态
          break
        case 'level-height':
          defaultValues[driverProperty] = 50 // 50% 液位
          break
        case 'status-color':
          defaultValues[driverProperty] = 0 // 正常状态
          break
        case 'value-position':
          defaultValues[driverProperty] = 0.5 // 中间位置
          break
        case 'speed-flow':
          defaultValues[driverProperty] = 0 // 停止
          break
        case 'value-opacity':
          defaultValues[driverProperty] = 0 // 默认完全透明（关闭状态）
          break
        case 'value-text':
          defaultValues[driverProperty] = (preset.suggestedParams as any)?.defaultText ?? ''
          break
        default:
          defaultValues[driverProperty] = 0
      }
    })
    
    return defaultValues
  }
  
  /**
   * 生成接线柱配置
   * 接线柱向组件内侧偏移（dx/dy）使圆心落在组件边界上，避免显示在组件外
   */
  private generatePorts(svgConfig: SVGComponentConfig): any {
    const defaultGroups = {
      top: {
        position: { name: 'top' as const, args: { dy: PORT_RADIUS } },
        attrs: {
          circle: {
            r: PORT_RADIUS,
            magnet: true,
            stroke: PORT_STROKE,
            strokeWidth: PORT_STROKE_WIDTH,
            fill: PORT_FILL
          }
        }
      },
      bottom: {
        position: { name: 'bottom' as const, args: { dy: -PORT_RADIUS } },
        attrs: {
          circle: {
            r: PORT_RADIUS,
            magnet: true,
            stroke: PORT_STROKE,
            strokeWidth: PORT_STROKE_WIDTH,
            fill: PORT_FILL
          }
        }
      },
      left: {
        position: { name: 'left' as const, args: { dx: PORT_RADIUS } },
        attrs: {
          circle: {
            r: PORT_RADIUS,
            magnet: true,
            stroke: PORT_STROKE,
            strokeWidth: PORT_STROKE_WIDTH,
            fill: PORT_FILL
          }
        }
      },
      right: {
        position: { name: 'right' as const, args: { dx: -PORT_RADIUS } },
        attrs: {
          circle: {
            r: PORT_RADIUS,
            magnet: true,
            stroke: PORT_STROKE,
            strokeWidth: PORT_STROKE_WIDTH,
            fill: PORT_FILL
          }
        }
      }
    }
    
    // 如果 SVG 配置中有自定义的 ports，使用自定义配置
    if (svgConfig.ports && svgConfig.ports.length > 0) {
      const items = svgConfig.ports.map(port => ({
        id: port.id,
        group: port.group,
        args: port.args
      }))
      
      return {
        groups: defaultGroups,
        items
      }
    }
    
    // 否则使用默认的 4 个接线柱
    return {
      groups: defaultGroups,
      items: [
        { id: 'port-top', group: 'top' },
        { id: 'port-bottom', group: 'bottom' },
        { id: 'port-left', group: 'left' },
        { id: 'port-right', group: 'right' }
      ]
    }
  }
  
  /**
   * 生成组件属性配置
   * 多个 presetBinding 共享同一 driverProperty 时只生成一个 prop（去重）
   */
  private generateProps(svgConfig: SVGComponentConfig): any[] {
    const props: any[] = []
    const seenDriverKeys = new Set<string>()
    
    // 根据预设绑定生成属性（按 driverProperty 去重）
    if (svgConfig.presetBindings && svgConfig.presetBindings.length > 0) {
      svgConfig.presetBindings.forEach((preset) => {
        const driverKey = preset.suggestedDriverProperty
        if (seenDriverKeys.has(driverKey)) return // 已存在同一驱动字段，跳过
        seenDriverKeys.add(driverKey)
        
        const propLabel = preset.label || driverKey

        // 字段值类型：number / boolean / string / color
        const valueType = preset.valueType || 'number'
        let uiType: string
        if (valueType === 'boolean') {
          uiType = 'boolean'
        } else if (valueType === 'color') {
          uiType = 'color'
        } else if (valueType === 'string') {
          uiType = 'text'
        } else {
          uiType = 'number'
        }

        const prop: any = {
          key: driverKey,
          label: propLabel,
          type: uiType,
          path: `data.${driverKey}`,
          bindable: true,
          description: `驱动 ${preset.partId} 的数据字段`
        }

        // 如果是布尔型并提供了备选值列表，挂到 options 上（供下游 UI 使用）
        if (valueType === 'boolean' && preset.booleanOptions && preset.booleanOptions.length > 0) {
          prop.options = preset.booleanOptions.map((opt) => ({
            label: opt.label,
            value: opt.value
          }))
        }
        
        // 从 SVG 的 suggestedParams 读取 min/max/step/defaultValue（优先），否则使用模板默认值
        const params = preset.suggestedParams as Record<string, any> | undefined
        const inputRange = params?.inputRange as { min?: number; max?: number } | undefined
        
        if (uiType === 'number' && inputRange && typeof inputRange.min === 'number' && typeof inputRange.max === 'number') {
          prop.min = inputRange.min
          prop.max = inputRange.max
          prop.defaultValue = params?.defaultValue ?? inputRange.min
          prop.step = params?.step ?? this.inferStep(inputRange.min, inputRange.max)
        } else if (uiType === 'number') {
          prop.min = 0
          prop.max = 1
          prop.defaultValue = 0
          prop.step = 0.1
        } else if (uiType === 'color' && params?.defaultColor) {
          prop.defaultValue = params.defaultColor
        } else if (uiType !== 'boolean') {
          prop.defaultValue = ''
        }
        
        props.push(prop)
      })
    }
    
    // 添加通用的组件名称属性
    props.push({
      key: 'componentName',
      label: '组件名称',
      type: 'text',
      path: 'data.componentName',
      defaultValue: svgConfig.metadata.name,
      bindable: false
    })
    
    return props
  }
  /**
   * 根据数值范围推断合理的 step
   */
  private inferStep(min: number, max: number): number {
    const range = max - min
    if (range <= 0) return 0.1
    if (range <= 1) return 0.1
    if (range <= 10) return 0.5
    if (range <= 100) return 1
    return Math.max(1, Math.pow(10, Math.floor(Math.log10(range)) - 1))
  }

  /**
   * 根据 SVG 配置生成组件点位定义
   * 主要用于数据绑定面板中的“组件数据点位”列表
   * 多个 presetBinding 共享同一 driverProperty 时只生成一个点位（去重）
   */
  private generatePoints(svgConfig: SVGComponentConfig, defaultValues: Record<string, any>): ComponentPoint[] {
    const points: ComponentPoint[] = []
    const seenDriverKeys = new Set<string>()
  
    if (!svgConfig.presetBindings || svgConfig.presetBindings.length === 0) {
      return points
    }
  
    svgConfig.presetBindings.forEach((preset) => {
      const driverKey = preset.suggestedDriverProperty
      if (seenDriverKeys.has(driverKey)) return
      seenDriverKeys.add(driverKey)
      const label = preset.label || driverKey
  
      // 推断数据类型
      const valueType = preset.valueType || 'number'
      let dataType: 'boolean' | 'number' | 'string' | 'json' = 'number'
      if (valueType === 'boolean') {
        dataType = 'boolean'
      } else if (valueType === 'string' || valueType === 'color') {
        dataType = 'string'
      }
  
      const point: ComponentPoint = {
        id: driverKey,
        name: label,
        description: `驱动部件 ${preset.partId} 的数据点`,
        dataType,
        defaultValue: defaultValues[driverKey],
        required: true
      }
  
      points.push(point)
    })
  
    return points
  }

  /**
   * 读取文件为文本
   */
  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const content = e.target?.result
        if (typeof content === 'string') {
          resolve(content)
        } else {
          reject(new Error('文件内容不是文本格式'))
        }
      }
      
      reader.onerror = () => {
        reject(new Error('读取文件失败'))
      }
      
      reader.readAsText(file, 'UTF-8')
    })
  }
}

// 导出单例
export const svgLoader = new SVGLoader()
