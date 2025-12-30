import type { ComponentConfig } from '../types'
import { COMMON_ANIMATION_PROPS } from '../types'

/**
 * 灯泡组件配置
 */
export const LightComponent: ComponentConfig = {
  metadata: {
    id: 'light',
    name: '灯泡',
    category: 'iot',
    icon: '💡',
    description: 'IoT灯泡控制组件',
    version: '1.0.0'
  },
  shape: 'circle',
  width: 60,
  height: 60,
  label: '💡',
  attrs: {
    body: {
      fill: '#fbbf24',
      stroke: '#f59e0b',
      strokeWidth: 2
    },
    label: {
      fill: '#fff',
      fontSize: 24
    }
  },
  data: {
    type: 'light',
    deviceId: '',
    property: ''
  },
  // 接线柱配置 - 左右两侧
  ports: {
    groups: {
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
      }
    },
    items: [
      { id: 'port-left', group: 'left' },
      { id: 'port-right', group: 'right' }
    ]
  },
  props: [
    {
      key: 'fill',
      label: '填充色',
      type: 'color',
      path: 'attrs.body.fill',
      defaultValue: '#fbbf24',
      description: '灯泡颜色'
    },
    {
      key: 'stroke',
      label: '边框色',
      type: 'color',
      path: 'attrs.body.stroke',
      defaultValue: '#f59e0b',
      description: '边框颜色'
    },
    {
      key: 'deviceId',
      label: '设备ID',
      type: 'text',
      path: 'data.deviceId',
      defaultValue: '',
      description: '绑定的设备ID'
    },
    {
      key: 'property',
      label: '设备属性',
      type: 'text',
      path: 'data.property',
      defaultValue: '',
      description: '绑定的设备属性名称'
    },
    // 使用公共动画属性
    ...COMMON_ANIMATION_PROPS
  ]
}
