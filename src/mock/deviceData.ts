/**
 * 设备点位模拟数据
 */

import type { Device, DeviceList } from '../types/device'
import { DeviceType, DeviceStatus, PointDataType, PointAccessMode } from '../types/device'

/**
 * 模拟设备数据
 */
export const mockDevices: Device[] = [
  // 1号温控设备
  {
    id: 'device_001',
    name: '1号温控设备',
    code: 'TC-001',
    type: DeviceType.PLC,
    description: '车间1号温控PLC',
    status: DeviceStatus.ONLINE,
    ipAddress: '192.168.1.101',
    port: 502,
    protocol: 'Modbus TCP',
    enabled: true,
    tags: ['车间1', '温控', 'PLC'],
    points: [
      {
        id: 'point_001_01',
        name: '当前温度',
        code: '40001',
        description: '实时温度采集',
        dataType: PointDataType.NUMBER,
        accessMode: PointAccessMode.READ,
        value: 25.5,
        unit: '°C',
        minValue: -20,
        maxValue: 100,
        precision: 1,
        enabled: true,
        quality: 'good',
        updateTime: '2025-12-17 08:15:00'
      },
      {
        id: 'point_001_02',
        name: '设定温度',
        code: '40002',
        description: '目标温度设定值',
        dataType: PointDataType.NUMBER,
        accessMode: PointAccessMode.READ_WRITE,
        value: 28.0,
        unit: '°C',
        minValue: 0,
        maxValue: 50,
        precision: 1,
        enabled: true,
        quality: 'good',
        updateTime: '2025-12-17 08:15:00'
      },
      {
        id: 'point_001_03',
        name: '加热状态',
        code: '40003',
        description: '加热器运行状态',
        dataType: PointDataType.BOOLEAN,
        accessMode: PointAccessMode.READ,
        value: true,
        enabled: true,
        quality: 'good',
        updateTime: '2025-12-17 08:15:00'
      },
      {
        id: 'point_001_04',
        name: '告警状态',
        code: '40004',
        description: '设备告警状态',
        dataType: PointDataType.BOOLEAN,
        accessMode: PointAccessMode.READ,
        value: false,
        enabled: true,
        quality: 'good',
        updateTime: '2025-12-17 08:15:00'
      }
    ],
    createTime: '2025-01-01 00:00:00',
    updateTime: '2025-12-17 08:15:00'
  },

  // 压力传感器
  {
    id: 'device_002',
    name: '主管道压力传感器',
    code: 'PS-001',
    type: DeviceType.SENSOR,
    description: '主管道压力监测',
    status: DeviceStatus.ONLINE,
    ipAddress: '192.168.1.102',
    port: 502,
    protocol: 'Modbus TCP',
    enabled: true,
    tags: ['管道', '压力', '传感器'],
    points: [
      {
        id: 'point_002_01',
        name: '当前压力',
        code: '40001',
        description: '实时压力值',
        dataType: PointDataType.NUMBER,
        accessMode: PointAccessMode.READ,
        value: 1.25,
        unit: 'MPa',
        minValue: 0,
        maxValue: 5,
        precision: 2,
        enabled: true,
        quality: 'good',
        updateTime: '2025-12-17 08:15:00'
      },
      {
        id: 'point_002_02',
        name: '压力上限',
        code: '40002',
        description: '压力告警上限',
        dataType: PointDataType.NUMBER,
        accessMode: PointAccessMode.READ_WRITE,
        value: 2.0,
        unit: 'MPa',
        minValue: 0,
        maxValue: 5,
        precision: 2,
        enabled: true,
        quality: 'good',
        updateTime: '2025-12-17 08:15:00'
      },
      {
        id: 'point_002_03',
        name: '压力下限',
        code: '40003',
        description: '压力告警下限',
        dataType: PointDataType.NUMBER,
        accessMode: PointAccessMode.READ_WRITE,
        value: 0.5,
        unit: 'MPa',
        minValue: 0,
        maxValue: 5,
        precision: 2,
        enabled: true,
        quality: 'good',
        updateTime: '2025-12-17 08:15:00'
      }
    ],
    createTime: '2025-01-01 00:00:00',
    updateTime: '2025-12-17 08:15:00'
  },

  // 电机控制器
  {
    id: 'device_003',
    name: '1号电机控制器',
    code: 'MC-001',
    type: DeviceType.ACTUATOR,
    description: '主传送带电机控制',
    status: DeviceStatus.ONLINE,
    ipAddress: '192.168.1.103',
    port: 502,
    protocol: 'Modbus TCP',
    enabled: true,
    tags: ['电机', '控制器', '传送带'],
    points: [
      {
        id: 'point_003_01',
        name: '运行状态',
        code: '40001',
        description: '电机运行状态',
        dataType: PointDataType.BOOLEAN,
        accessMode: PointAccessMode.READ,
        value: true,
        enabled: true,
        quality: 'good',
        updateTime: '2025-12-17 08:15:00'
      },
      {
        id: 'point_003_02',
        name: '启动命令',
        code: '40002',
        description: '电机启动控制',
        dataType: PointDataType.BOOLEAN,
        accessMode: PointAccessMode.WRITE,
        value: false,
        enabled: true,
        quality: 'good',
        updateTime: '2025-12-17 08:15:00'
      },
      {
        id: 'point_003_03',
        name: '停止命令',
        code: '40003',
        description: '电机停止控制',
        dataType: PointDataType.BOOLEAN,
        accessMode: PointAccessMode.WRITE,
        value: false,
        enabled: true,
        quality: 'good',
        updateTime: '2025-12-17 08:15:00'
      },
      {
        id: 'point_003_04',
        name: '当前转速',
        code: '40004',
        description: '电机实时转速',
        dataType: PointDataType.NUMBER,
        accessMode: PointAccessMode.READ,
        value: 1450,
        unit: 'RPM',
        minValue: 0,
        maxValue: 3000,
        precision: 0,
        enabled: true,
        quality: 'good',
        updateTime: '2025-12-17 08:15:00'
      },
      {
        id: 'point_003_05',
        name: '设定转速',
        code: '40005',
        description: '目标转速设定',
        dataType: PointDataType.NUMBER,
        accessMode: PointAccessMode.READ_WRITE,
        value: 1500,
        unit: 'RPM',
        minValue: 0,
        maxValue: 3000,
        precision: 0,
        enabled: true,
        quality: 'good',
        updateTime: '2025-12-17 08:15:00'
      },
      {
        id: 'point_003_06',
        name: '电流',
        code: '40006',
        description: '电机运行电流',
        dataType: PointDataType.NUMBER,
        accessMode: PointAccessMode.READ,
        value: 12.5,
        unit: 'A',
        minValue: 0,
        maxValue: 50,
        precision: 1,
        enabled: true,
        quality: 'good',
        updateTime: '2025-12-17 08:15:00'
      }
    ],
    createTime: '2025-01-01 00:00:00',
    updateTime: '2025-12-17 08:15:00'
  },

  // 流量计
  {
    id: 'device_004',
    name: '进水流量计',
    code: 'FM-001',
    type: DeviceType.METER,
    description: '进水管道流量监测',
    status: DeviceStatus.OFFLINE,
    ipAddress: '192.168.1.104',
    port: 502,
    protocol: 'Modbus TCP',
    enabled: true,
    tags: ['流量', '仪表', '进水'],
    points: [
      {
        id: 'point_004_01',
        name: '瞬时流量',
        code: '40001',
        description: '当前流量值',
        dataType: PointDataType.NUMBER,
        accessMode: PointAccessMode.READ,
        value: 0,
        unit: 'm³/h',
        minValue: 0,
        maxValue: 100,
        precision: 2,
        enabled: true,
        quality: 'bad',
        updateTime: '2025-12-17 07:30:00'
      },
      {
        id: 'point_004_02',
        name: '累计流量',
        code: '40002',
        description: '累计流量统计',
        dataType: PointDataType.NUMBER,
        accessMode: PointAccessMode.READ,
        value: 12345.67,
        unit: 'm³',
        minValue: 0,
        maxValue: 999999,
        precision: 2,
        enabled: true,
        quality: 'bad',
        updateTime: '2025-12-17 07:30:00'
      }
    ],
    createTime: '2025-01-01 00:00:00',
    updateTime: '2025-12-17 07:30:00'
  }
]

/**
 * 模拟设备列表
 */
export const mockDeviceList: DeviceList = {
  devices: mockDevices,
  total: mockDevices.length
}

/**
 * 根据设备ID获取设备
 */
export const getDeviceById = (deviceId: string): Device | undefined => {
  return mockDevices.find(device => device.id === deviceId)
}

/**
 * 根据设备ID和点位ID获取点位
 */
export const getPointById = (deviceId: string, pointId: string) => {
  const device = getDeviceById(deviceId)
  if (!device) return undefined
  return device.points.find(point => point.id === pointId)
}

/**
 * 获取所有点位（扁平化）
 */
export const getAllPoints = () => {
  return mockDevices.flatMap(device => 
    device.points.map(point => ({
      ...point,
      deviceId: device.id,
      deviceName: device.name
    }))
  )
}
