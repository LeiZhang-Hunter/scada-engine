/**
 * SVG 解析器
 * 负责解析 SVG 文件，提取元数据和内部部件
 */

import type { SVGComponentConfig, SVGFileMetadata, SVGPart } from './types'

/**
 * SVG 解析器类
 */
export class SVGParser {
  /**
   * 解析 SVG 字符串
   * @param svgContent SVG 文件内容
   * @param fileName 文件名（可选）
   * @returns 解析后的组件配置
   */
  static parse(svgContent: string, fileName?: string): SVGComponentConfig | null {
    try {
      // 1. 使用 DOMParser 解析 SVG
      const parser = new DOMParser()
      const doc = parser.parseFromString(svgContent, 'image/svg+xml')
      
      // 检查解析错误
      const parseError = doc.querySelector('parsererror')
      if (parseError) {
        console.error('[SVGParser] SVG 解析失败:', parseError.textContent)
        return null
      }
      
      const svgElement = doc.documentElement as unknown as SVGSVGElement
      if (svgElement.tagName.toLowerCase() !== 'svg') {
        console.error('[SVGParser] 不是有效的 SVG 文件')
        return null
      }
      
      // 2. 提取元数据
      const metadata = this.extractMetadata(svgElement, fileName)
      if (!metadata) {
        console.error('[SVGParser] 无法提取组件元数据')
        return null
      }
      
      // 3. 提取尺寸信息
      const size = this.extractSize(svgElement)
      
      // 4. 提取内部部件（自动扫描 id 以 part- 开头的元素）
      const parts = this.extractParts(svgElement)
      
      // 5. 清理 SVG 内容（移除 metadata 标签）
      const cleanedSvgContent = this.cleanSvgContent(svgElement)
      
      // 6. 构建组件配置
      const config: SVGComponentConfig = {
        metadata: {
          id: metadata.component.id,
          name: metadata.component.name,
          category: (metadata.component.category as any) || 'custom',
          icon: metadata.component.icon || '🎨',
          description: metadata.component.description,
          version: metadata.component.version || '1.0.0',
          author: metadata.component.author,
          svgSource: {
            fileName: fileName,
            uploadTime: new Date().toISOString()
          }
        },
        size: {
          width: metadata.size?.width || size.width || 120,
          height: metadata.size?.height || size.height || 120
        },
        svgContent: cleanedSvgContent,
        parts: parts,
        internalAnimations: [],
        presetBindings: metadata.presetBindings || [],
        ports: metadata.ports // 从 SVG metadata 中读取 ports 配置
      }
      
      return config
    } catch (error) {
      console.error('[SVGParser] 解析异常:', error)
      return null
    }
  }
  
  /**
   * 提取元数据（从 <metadata><scada-config> 中）
   */
  private static extractMetadata(svgElement: SVGSVGElement, fileName?: string): SVGFileMetadata | null {
    const metadataElement = svgElement.querySelector('metadata')
    if (!metadataElement) {
      // 如果没有 metadata，尝试生成默认配置
      return this.generateDefaultMetadata(svgElement, fileName)
    }
    
    const scadaConfigElement = metadataElement.querySelector('scada-config')
    if (!scadaConfigElement) {
      return this.generateDefaultMetadata(svgElement, fileName)
    }
    
    try {
      // 解析 JSON 配置
      const jsonText = scadaConfigElement.textContent?.trim() || '{}'
      const metadata: SVGFileMetadata = JSON.parse(jsonText)
      
      // 验证必需字段
      if (!metadata.component?.id || !metadata.component?.name) {
        console.warn('[SVGParser] 元数据缺少必需字段，使用默认值')
        return this.generateDefaultMetadata(svgElement, fileName)
      }
      
      return metadata
    } catch (error) {
      console.error('[SVGParser] 元数据 JSON 解析失败:', error)
      return this.generateDefaultMetadata(svgElement, fileName)
    }
  }
  
  /**
   * 生成默认元数据（当 SVG 没有配置时）
   */
  private static generateDefaultMetadata(svgElement: SVGSVGElement, fileName?: string): SVGFileMetadata {
    const id = fileName 
      ? fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase()
      : `svg-${Date.now()}`
    
    const name = fileName 
      ? fileName.replace(/\.[^/.]+$/, '')
      : 'SVG 组件'
    
    return {
      component: {
        id: id,
        name: name,
        category: 'custom',
        icon: '🎨',
        description: '自定义 SVG 组件',
        version: '1.0.0'
      }
    }
  }
  
  /**
   * 提取尺寸信息
   */
  private static extractSize(svgElement: SVGSVGElement): { width: number; height: number } {
    // 优先从 viewBox 提取
    const viewBox = svgElement.getAttribute('viewBox')
    if (viewBox) {
      const values = viewBox.split(/\s+/).map(Number)
      if (values.length === 4) {
        return {
          width: values[2] - values[0],
          height: values[3] - values[1]
        }
      }
    }
    
    // 其次从 width/height 属性
    const width = svgElement.getAttribute('width')
    const height = svgElement.getAttribute('height')
    if (width && height) {
      return {
        width: parseFloat(width),
        height: parseFloat(height)
      }
    }
    
    // 默认尺寸
    return { width: 120, height: 120 }
  }
  
  /**
   * 提取内部部件（自动扫描 id="part-*" 的元素）
   */
  private static extractParts(svgElement: SVGSVGElement): SVGPart[] {
    const parts: SVGPart[] = []
    
    // 查找所有有 id 属性的元素
    const elementsWithId = svgElement.querySelectorAll('[id]')
    
    elementsWithId.forEach(element => {
      const id = element.getAttribute('id')
      if (!id || !id.startsWith('part-')) {
        return
      }
      
      // 提取部件名称（去掉 part- 前缀，转为可读格式）
      const name = id
        .replace(/^part-/, '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
      
      const part: SVGPart = {
        id: id,
        name: name,
        elementType: element.tagName.toLowerCase() as any,
        description: element.getAttribute('data-description') || undefined
      }
      
      parts.push(part)
    })
    return parts
  }
  
  /**
   * 清理 SVG 内容（移除 metadata 等不需要渲染的标签）
   */
  private static cleanSvgContent(svgElement: SVGSVGElement): string {
    // 克隆元素避免修改原始 DOM
    const cloned = svgElement.cloneNode(true) as SVGSVGElement
    
    // 移除 metadata 标签
    const metadataElements = cloned.querySelectorAll('metadata')
    metadataElements.forEach(el => el.remove())
    
    // 确保有 viewBox
    if (!cloned.getAttribute('viewBox')) {
      const width = cloned.getAttribute('width') || '120'
      const height = cloned.getAttribute('height') || '120'
      cloned.setAttribute('viewBox', `0 0 ${width} ${height}`)
    }
    
    // 移除可能存在的 width/height 属性（让容器控制尺寸）
    cloned.removeAttribute('width')
    cloned.removeAttribute('height')
    
    // 添加必要的样式属性
    cloned.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    
    return cloned.outerHTML
  }
  
  /**
   * 验证 SVG 配置
   */
  static validate(config: SVGComponentConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!config.metadata?.id) {
      errors.push('缺少组件 ID')
    }
    
    if (!config.metadata?.name) {
      errors.push('缺少组件名称')
    }
    
    if (!config.svgContent) {
      errors.push('缺少 SVG 内容')
    }
    
    if (!config.size?.width || !config.size?.height) {
      errors.push('缺少尺寸信息')
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    }
  }
}
