import type { ComponentConfig } from '../types'
import { COMMON_ANIMATION_PROPS } from '../types'

/**
 * 文本组件配置
 */
export const TextComponent: ComponentConfig = {
  metadata: {
    id: 'text',
    name: '文本',
    category: 'basic',
    icon: 'T',
    description: '文本标签组件',
    version: '1.0.0'
  },
  shape: 'rect',
  width: 100,
  height: 40,
  label: '文本',
  attrs: {
    body: {
      fill: 'transparent',
      stroke: '#64748b',
      strokeWidth: 1,
      strokeDasharray: '5 5'
    },
    label: {
      fill: '#e2e8f0',
      fontSize: 16
    }
  },
  props: [
    {
      key: 'label',
      label: '文本内容',
      type: 'text',
      path: 'attrs.label.text',
      defaultValue: '文本',
      description: '显示的文本内容'
    },
    {
      key: 'fontSize',
      label: '字体大小',
      type: 'number',
      path: 'attrs.label.fontSize',
      defaultValue: 16,
      min: 12,
      max: 48,
      description: '文本字体大小'
    },
    {
      key: 'fontColor',
      label: '字体颜色',
      type: 'color',
      path: 'attrs.label.fill',
      defaultValue: '#e2e8f0',
      description: '文本字体颜色'
    },
    {
      key: 'stroke',
      label: '边框色',
      type: 'color',
      path: 'attrs.body.stroke',
      defaultValue: '#64748b',
      description: '边框颜色'
    },
    // 使用公共动画属性
    ...COMMON_ANIMATION_PROPS
  ]
}
