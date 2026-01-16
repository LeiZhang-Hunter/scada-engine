import type { ComponentConfig } from '../types'
import Conveyor3D from './Conveyor3D.vue'
import AlarmLight3D from './AlarmLight3D.vue'
import TemperatureSensor3D from './TemperatureSensor3D.vue'
import Cylinder3D from './Cylinder3D.vue'

/**
 * 3D传送带组件配置
 */
export const Conveyor3DComponent: ComponentConfig = {
  metadata: {
    id: 'conveyor-3d',
    name: '3D传送带',
    category: 'iot',
    icon: '🔄',
    description: '3D仿真传送带组件，支持正反转和速度控制',
    version: '1.0.0'
  },
  shape: 'conveyor-3d-vue',
  component: Conveyor3D,
  width: 220,
  height: 100,
  label: '',
  attrs: {
    body: {
      fill: 'transparent',
      stroke: 'transparent'
    }
  },
  data: {
    type: 'conveyor',
    state: false,
    speed: 10,
    direction: 'forward',
    deviceId: '',
    property: ''
  },
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
      label: '运行状态',
      type: 'select',
      path: 'data.state',
      defaultValue: false,
      options: [
        { label: '停止', value: false },
        { label: '运行', value: 'running' }
      ],
      description: '传送带运行状态'
    },
    {
      key: 'speed',
      label: '速度(m/min)',
      type: 'number',
      path: 'data.speed',
      defaultValue: 10,
      min: 0,
      max: 100,
      description: '传送带运行速度'
    },
    {
      key: 'direction',
      label: '运行方向',
      type: 'select',
      path: 'data.direction',
      defaultValue: 'forward',
      options: [
        { label: '正向', value: 'forward' },
        { label: '反向', value: 'reverse' }
      ],
      description: '传送带运行方向'
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

/**
 * 3D报警灯组件配置
 */
export const AlarmLight3DComponent: ComponentConfig = {
  metadata: {
    id: 'alarm-light-3d',
    name: '3D报警灯',
    category: 'iot',
    icon: '🚨',
    description: '3D仿真报警灯组件，支持旋转、闪烁、持续三种模式',
    version: '1.0.0'
  },
  shape: 'alarm-light-3d-vue',
  component: AlarmLight3D,
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
    type: 'alarm-light',
    state: false,
    mode: 'rotating',
    color: '#ef4444',
    deviceId: '',
    property: ''
  },
  ports: {
    groups: {
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
      }
    },
    items: [
      { id: 'port-bottom', group: 'bottom' }
    ]
  },
  props: [
    {
      key: 'state',
      label: '报警状态',
      type: 'select',
      path: 'data.state',
      defaultValue: false,
      options: [
        { label: '正常', value: false },
        { label: '报警', value: 'active' }
      ],
      description: '报警灯激活状态'
    },
    {
      key: 'mode',
      label: '报警模式',
      type: 'select',
      path: 'data.mode',
      defaultValue: 'rotating',
      options: [
        { label: '旋转', value: 'rotating' },
        { label: '闪烁', value: 'flashing' },
        { label: '持续', value: 'steady' }
      ],
      description: '报警灯工作模式'
    },
    {
      key: 'color',
      label: '灯光颜色',
      type: 'color',
      path: 'data.color',
      defaultValue: '#ef4444',
      description: '报警灯颜色'
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

/**
 * 3D温度传感器组件配置
 */
export const TemperatureSensor3DComponent: ComponentConfig = {
  metadata: {
    id: 'temperature-sensor-3d',
    name: '3D温度传感器',
    category: 'iot',
    icon: '🌡️',
    description: '3D仿真温度传感器，支持温度显示和报警',
    version: '1.0.0'
  },
  shape: 'temperature-sensor-3d-vue',
  component: TemperatureSensor3D,
  width: 100,
  height: 140,
  label: '',
  attrs: {
    body: {
      fill: 'transparent',
      stroke: 'transparent'
    }
  },
  data: {
    type: 'temperature-sensor',
    temperature: 25,
    maxTemp: 100,
    minTemp: 0,
    alarmHighLimit: 80,
    alarmLowLimit: 10,
    deviceId: '',
    property: ''
  },
  ports: {
    groups: {
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
      }
    },
    items: [
      { id: 'port-bottom', group: 'bottom' }
    ]
  },
  props: [
    {
      key: 'temperature',
      label: '当前温度(°C)',
      type: 'number',
      path: 'data.temperature',
      defaultValue: 25,
      description: '当前测量温度值'
    },
    {
      key: 'maxTemp',
      label: '最大量程(°C)',
      type: 'number',
      path: 'data.maxTemp',
      defaultValue: 100,
      description: '传感器最大测量温度'
    },
    {
      key: 'minTemp',
      label: '最小量程(°C)',
      type: 'number',
      path: 'data.minTemp',
      defaultValue: 0,
      description: '传感器最小测量温度'
    },
    {
      key: 'alarmHighLimit',
      label: '高温报警(°C)',
      type: 'number',
      path: 'data.alarmHighLimit',
      defaultValue: 80,
      description: '高温报警阈值'
    },
    {
      key: 'alarmLowLimit',
      label: '低温报警(°C)',
      type: 'number',
      path: 'data.alarmLowLimit',
      defaultValue: 10,
      description: '低温报警阈值'
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

/**
 * 3D气缸组件配置
 */
export const Cylinder3DComponent: ComponentConfig = {
  metadata: {
    id: 'cylinder-3d',
    name: '3D气缸',
    category: 'iot',
    icon: '🔩',
    description: '3D仿真气缸组件，支持伸缩动作和位置显示',
    version: '1.0.0'
  },
  shape: 'cylinder-3d-vue',
  component: Cylinder3D,
  width: 80,
  height: 160,
  label: '',
  attrs: {
    body: {
      fill: 'transparent',
      stroke: 'transparent'
    }
  },
  data: {
    type: 'cylinder',
    action: 'stop',
    position: 0,
    stroke: 50,
    speed: 200,
    deviceId: '',
    property: ''
  },
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
      key: 'action',
      label: '动作指令',
      type: 'select',
      path: 'data.action',
      defaultValue: 'stop',
      options: [
        { label: '停止', value: 'stop' },
        { label: '伸出', value: 'extend' },
        { label: '缩回', value: 'retract' }
      ],
      description: '气缸动作指令'
    },
    {
      key: 'position',
      label: '当前位置(mm)',
      type: 'number',
      path: 'data.position',
      defaultValue: 0,
      min: 0,
      description: '活塞杆当前位置'
    },
    {
      key: 'stroke',
      label: '行程(mm)',
      type: 'number',
      path: 'data.stroke',
      defaultValue: 50,
      min: 10,
      max: 200,
      description: '气缸最大行程'
    },
    {
      key: 'speed',
      label: '速度(mm/s)',
      type: 'number',
      path: 'data.speed',
      defaultValue: 200,
      min: 10,
      max: 1000,
      description: '活塞杆运动速度'
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
