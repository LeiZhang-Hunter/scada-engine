/**
 * SVG 组件系统统一导出
 */

// 导出类型
export * from './core/types'

// 导出核心功能
export { SVGParser } from './core/parser'
export { svgLoader, SVGLoader } from './core/loader'
export { animationTemplateEngine, AnimationTemplateEngine } from './rendering/animationTemplates'

// 导出 Vue 组件
export { default as SVGRenderer } from './rendering/SVGRenderer.vue'

// 导出工具函数
export {
  loadExampleSvgComponents,
  getAnimationTemplateName,
  getAnimationTemplateDescription,
  createDefaultTemplateParams,
  validateInternalAnimation
} from './helpers/utils'

