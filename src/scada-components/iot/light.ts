import type { ComponentConfig } from '../types'

/**
 * 灯泡组件配置（使用3D仿真效果）
 */
export const LightComponent: ComponentConfig = {
  metadata: {
    id: 'light',
    name: '3D灯泡',
    category: 'iot',
    icon: '💡',
    description: '3D仿真IoT灯泡控制组件',
    version: '2.0.0'
  },
  shape: 'light-3d-vue',
  width: 100,
  height: 120,
  label: '',
  attrs: {
    body: {
      fill: 'transparent',
      stroke: 'transparent'
    }
  },
  data: {
    type: 'light',
    state: false,
    color: '#fbbf24',
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
      key: 'state',
      label: '灯泡状态',
      type: 'select',
      path: 'data.state',
      defaultValue: false,
      options: [
        { label: '关闭', value: false },
        { label: '开启', value: true }
      ],
      description: '灯泡开关状态'
    },
    {
      key: 'color',
      label: '灯光颜色',
      type: 'color',
      path: 'data.color',
      defaultValue: '#fbbf24',
      description: '灯泡发光颜色'
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
    }
  ]
}
