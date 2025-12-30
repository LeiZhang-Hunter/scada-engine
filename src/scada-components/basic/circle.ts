import type { ComponentConfig } from '../types'
import { COMMON_ANIMATION_PROPS } from '../types'

/**
 * 圆形组件配置
 */
export const CircleComponent: ComponentConfig = {
  metadata: {
    id: 'circle',
    name: '圆形',
    category: 'basic',
    icon: '○',
    description: '基础圆形图形组件',
    version: '1.0.0'
  },
  shape: 'circle',
  width: 80,
  height: 80,
  label: '圆形',
  attrs: {
    body: {
      fill: '#10b981',
      stroke: '#059669',
      strokeWidth: 2
    },
    label: {
      fill: '#fff',
      fontSize: 14
    }
  },
  // 添加接线桩配置
  ports: {
    groups: {
      top: {
        position: 'top',
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: '#31d0c6',
            strokeWidth: 2,
            fill: '#fff'
          }
        }
      },
      right: {
        position: 'right',
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: '#31d0c6',
            strokeWidth: 2,
            fill: '#fff'
          }
        }
      },
      bottom: {
        position: 'bottom',
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: '#31d0c6',
            strokeWidth: 2,
            fill: '#fff'
          }
        }
      },
      left: {
        position: 'left',
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: '#31d0c6',
            strokeWidth: 2,
            fill: '#fff'
          }
        }
      }
    },
    items: [
      { id: 'port-top', group: 'top' },
      { id: 'port-right', group: 'right' },
      { id: 'port-bottom', group: 'bottom' },
      { id: 'port-left', group: 'left' }
    ]
  },
  props: [
    {
      key: 'text',
      label: '初始文本',
      type: 'text',
      path: 'attrs.label.text',
      defaultValue: '圆形',
      description: '圆形初始文本'
    },
    {
      key: 'fill',
      label: '填充色',
      type: 'color',
      path: 'attrs.body.fill',
      defaultValue: '#10b981',
      description: '圆形填充颜色'
    },
    {
      key: 'stroke',
      label: '边框色',
      type: 'color',
      path: 'attrs.body.stroke',
      defaultValue: '#059669',
      description: '圆形边框颜色'
    },
    {
      key: 'strokeWidth',
      label: '边框宽度',
      type: 'number',
      path: 'attrs.body.strokeWidth',
      defaultValue: 2,
      min: 0,
      max: 10,
      description: '圆形边框宽度'
    },
    {
      key: 'opacity',
      label: '透明度',
      type: 'slider',
      path: 'attrs.body.opacity',
      defaultValue: 1,
      min: 0,
      max: 1,
      step: 0.1,
      description: '圆形透明度'
    },
    // 使用公共动画属性
    ...COMMON_ANIMATION_PROPS
  ]
}
