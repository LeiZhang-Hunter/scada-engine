import type { ComponentConfig } from '../types'
import { COMMON_ANIMATION_PROPS } from '../types'

/**
 * 仪表组件配置
 */
export const GaugeComponent: ComponentConfig = {
  metadata: {
    id: 'gauge',
    name: '仪表',
    category: 'iot',
    icon: '📊',
    description: 'IoT仪表盘数据展示组件',
    version: '1.0.0'
  },
  shape: 'circle',
  width: 100,
  height: 100,
  label: '📊',
  attrs: {
    body: {
      fill: '#8b5cf6',
      stroke: '#7c3aed',
      strokeWidth: 2
    },
    label: {
      fill: '#fff',
      fontSize: 32
    }
  },
  data: {
    type: 'gauge',
    deviceId: '',
    property: '',
    value: 0
  },
  // 接线柱配置 - 四个方向
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
      key: 'fill',
      label: '填充色',
      type: 'color',
      path: 'attrs.body.fill',
      defaultValue: '#8b5cf6',
      description: '仪表颜色'
    },
    {
      key: 'stroke',
      label: '边框色',
      type: 'color',
      path: 'attrs.body.stroke',
      defaultValue: '#7c3aed',
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
      key: 'value',
      label: '当前值',
      type: 'number',
      path: 'data.value',
      defaultValue: 0,
      min: 0,
      max: 100,
      description: '仪表当前显示值'
    },
    // 使用公共动画属性
    ...COMMON_ANIMATION_PROPS
  ]
}
