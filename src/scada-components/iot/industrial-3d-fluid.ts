import type { ComponentConfig } from '../types'

/**
 * 3D管道组件配置
 */
export const Pipe3DComponent: ComponentConfig = {
  metadata: {
    id: 'pipe-3d',
    name: '3D管道',
    category: 'iot',
    icon: '🔧',
    description: '3D仿真管道组件，支持横向/纵向和流体动画',
    version: '1.0.0'
  },
  shape: 'pipe-3d-vue',
  width: 220,
  height: 60,
  label: '',
  attrs: {
    body: {
      fill: 'transparent',
      stroke: 'transparent'
    }
  },
  data: {
    type: 'pipe',
    state: false,
    flowRate: 10,
    direction: 'horizontal',
    fluidColor: '#3b82f6',
    diameter: 40,
    length: 200,
    deviceId: '',
    property: ''
  },
  ports: {
    groups: {
      left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#31d0c6', strokeWidth: 2, fill: '#fff' } } },
      right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#31d0c6', strokeWidth: 2, fill: '#fff' } } }
    },
    items: [
      { id: 'port-left', group: 'left' },
      { id: 'port-right', group: 'right' }
    ]
  },
  props: [
    { key: 'state', label: '流动状态', type: 'select', path: 'data.state', defaultValue: false, options: [{ label: '停止', value: false }, { label: '流动', value: 'flowing' }], description: '管道流体状态' },
    { key: 'flowRate', label: '流量(m³/h)', type: 'number', path: 'data.flowRate', defaultValue: 10, min: 0, description: '流体流量' },
    { key: 'direction', label: '管道方向', type: 'select', path: 'data.direction', defaultValue: 'horizontal', options: [{ label: '横向', value: 'horizontal' }, { label: '纵向', value: 'vertical' }], description: '管道布置方向' },
    { key: 'fluidColor', label: '流体颜色', type: 'color', path: 'data.fluidColor', defaultValue: '#3b82f6', description: '流体显示颜色' },
    { key: 'diameter', label: '管径(mm)', type: 'number', path: 'data.diameter', defaultValue: 40, min: 20, max: 100, description: '管道直径' },
    { key: 'length', label: '长度(mm)', type: 'number', path: 'data.length', defaultValue: 200, min: 100, max: 500, description: '管道长度' },
    { key: 'deviceId', label: '设备ID', type: 'text', path: 'data.deviceId', defaultValue: '', description: '绑定的设备ID' },
    { key: 'property', label: '设备属性', type: 'text', path: 'data.property', defaultValue: '', description: '绑定的设备属性名称' }
  ]
}

export const Filter3DComponent: ComponentConfig = { metadata: { id: 'filter-3d', name: '3D过滤器', category: 'iot', icon: '🧹', description: '3D仿真过滤器，支持堵塞度和压差显示', version: '1.0.0' }, shape: 'filter-3d-vue', width: 140, height: 120, label: '', attrs: { body: { fill: 'transparent', stroke: 'transparent' } }, data: { type: 'filter', clogLevel: 20, pressureDrop: 5, diameter: 50, alarmThreshold: 70, deviceId: '', property: '' }, ports: { groups: { left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#31d0c6', strokeWidth: 2, fill: '#fff' } } }, right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#31d0c6', strokeWidth: 2, fill: '#fff' } } } }, items: [{ id: 'port-left', group: 'left' }, { id: 'port-right', group: 'right' }] }, props: [{ key: 'clogLevel', label: '堵塞度(%)', type: 'number', path: 'data.clogLevel', defaultValue: 20, min: 0, max: 100, description: '滤芯堵塞程度' }, { key: 'pressureDrop', label: '压差(kPa)', type: 'number', path: 'data.pressureDrop', defaultValue: 5, min: 0, description: '过滤器压差' }, { key: 'diameter', label: '口径(mm)', type: 'number', path: 'data.diameter', defaultValue: 50, min: 20, max: 100, description: '过滤器口径' }, { key: 'alarmThreshold', label: '报警阈值(%)', type: 'number', path: 'data.alarmThreshold', defaultValue: 70, min: 0, max: 100, description: '堵塞度报警阈值' }, { key: 'deviceId', label: '设备ID', type: 'text', path: 'data.deviceId', defaultValue: '', description: '绑定的设备ID' }, { key: 'property', label: '设备属性', type: 'text', path: 'data.property', defaultValue: '', description: '绑定的设备属性名称' }] }

export const HeatExchanger3DComponent: ComponentConfig = { metadata: { id: 'heat-exchanger-3d', name: '3D换热器', category: 'iot', icon: '🔥', description: '3D仿真换热器，支持热冷流体交换和效率显示', version: '1.0.0' }, shape: 'heat-exchanger-3d-vue', width: 160, height: 140, label: '', attrs: { body: { fill: 'transparent', stroke: 'transparent' } }, data: { type: 'heat-exchanger', state: false, hotTempIn: 80, hotTempOut: 50, coldTempIn: 20, coldTempOut: 40, heatTransferArea: 10, deviceId: '', property: '' }, ports: { groups: { top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#31d0c6', strokeWidth: 2, fill: '#fff' } } }, bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#31d0c6', strokeWidth: 2, fill: '#fff' } } }, left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#31d0c6', strokeWidth: 2, fill: '#fff' } } }, right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#31d0c6', strokeWidth: 2, fill: '#fff' } } } }, items: [{ id: 'port-top', group: 'top' }, { id: 'port-bottom', group: 'bottom' }, { id: 'port-left', group: 'left' }, { id: 'port-right', group: 'right' }] }, props: [{ key: 'state', label: '运行状态', type: 'select', path: 'data.state', defaultValue: false, options: [{ label: '停止', value: false }, { label: '运行', value: 'working' }], description: '换热器运行状态' }, { key: 'hotTempIn', label: '热侧进口(°C)', type: 'number', path: 'data.hotTempIn', defaultValue: 80, description: '热流体进口温度' }, { key: 'hotTempOut', label: '热侧出口(°C)', type: 'number', path: 'data.hotTempOut', defaultValue: 50, description: '热流体出口温度' }, { key: 'coldTempIn', label: '冷侧进口(°C)', type: 'number', path: 'data.coldTempIn', defaultValue: 20, description: '冷流体进口温度' }, { key: 'coldTempOut', label: '冷侧出口(°C)', type: 'number', path: 'data.coldTempOut', defaultValue: 40, description: '冷流体出口温度' }, { key: 'heatTransferArea', label: '换热面积(m²)', type: 'number', path: 'data.heatTransferArea', defaultValue: 10, min: 1, description: '换热器换热面积' }, { key: 'deviceId', label: '设备ID', type: 'text', path: 'data.deviceId', defaultValue: '', description: '绑定的设备ID' }, { key: 'property', label: '设备属性', type: 'text', path: 'data.property', defaultValue: '', description: '绑定的设备属性名称' }] }

export const Tee3DComponent: ComponentConfig = { metadata: { id: 'tee-3d', name: '3D三通', category: 'iot', icon: '⛓️', description: '3D仿真三通管件，支持流体分流和汇流', version: '1.0.0' }, shape: 'tee-3d-vue', width: 120, height: 120, label: '', attrs: { body: { fill: 'transparent', stroke: 'transparent' } }, data: { type: 'tee', state: false, fluidColor: '#3b82f6', topFlowEnabled: true, bottomFlowEnabled: true, deviceId: '', property: '' }, ports: { groups: { left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#31d0c6', strokeWidth: 2, fill: '#fff' } } }, right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#31d0c6', strokeWidth: 2, fill: '#fff' } } }, top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#31d0c6', strokeWidth: 2, fill: '#fff' } } }, bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#31d0c6', strokeWidth: 2, fill: '#fff' } } } }, items: [{ id: 'port-left', group: 'left' }, { id: 'port-right', group: 'right' }, { id: 'port-top', group: 'top' }, { id: 'port-bottom', group: 'bottom' }] }, props: [{ key: 'state', label: '流动状态', type: 'select', path: 'data.state', defaultValue: false, options: [{ label: '关闭', value: false }, { label: '流动', value: 'flowing' }], description: '三通管件流动状态' }, { key: 'fluidColor', label: '流体颜色', type: 'color', path: 'data.fluidColor', defaultValue: '#3b82f6', description: '流体显示颜色' }, { key: 'topFlowEnabled', label: '上方分流', type: 'boolean', path: 'data.topFlowEnabled', defaultValue: true, description: '是否启用上方分流' }, { key: 'bottomFlowEnabled', label: '下方分流', type: 'boolean', path: 'data.bottomFlowEnabled', defaultValue: true, description: '是否启用下方分流' }, { key: 'deviceId', label: '设备ID', type: 'text', path: 'data.deviceId', defaultValue: '', description: '绑定的设备ID' }, { key: 'property', label: '设备属性', type: 'text', path: 'data.property', defaultValue: '', description: '绑定的设备属性名称' }] }
