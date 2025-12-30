import type { ComponentConfig } from '../types'
import { COMMON_ANIMATION_PROPS } from '../types'

/**
 * 开关组件配置
 */
export const SwitchComponent: ComponentConfig = {
  metadata: {
    id: 'switch',
    name: '开关',
    category: 'iot',
    icon: '🔘',
    description: 'IoT开关控制组件',
    version: '1.0.0'
  },
  shape: 'rect',
  width: 100,
  height: 50,
  label: '开关',
  attrs: {
    body: {
      fill: '#64748b',
      stroke: '#475569',
      strokeWidth: 2,
      rx: 25,
      ry: 25
    },
    label: {
      fill: '#fff',
      fontSize: 14
    }
  },
  data: {
    type: 'switch',
    deviceId: '',
    property: '',
    state: false
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
      defaultValue: '#64748b',
      description: '开关颜色'
    },
    {
      key: 'stroke',
      label: '边框色',
      type: 'color',
      path: 'attrs.body.stroke',
      defaultValue: '#475569',
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
    {
      key: 'state',
      label: '开关状态',
      type: 'boolean',
      path: 'data.state',
      defaultValue: false,
      description: '开关当前状态'
    },
    // 使用公共动画属性
    ...COMMON_ANIMATION_PROPS
  ]
}
