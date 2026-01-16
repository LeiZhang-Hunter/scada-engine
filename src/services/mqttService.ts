/**
 * MQTT 服务模块
 * 负责 MQTT 连接管理和数据接收
 */

import mqtt, { MqttClient } from 'mqtt'

/**
 * MQTT 配置接口
 */
export interface MqttConfig {
  /** 服务器地址 */
  broker: string
  /** 客户端ID（可选，自动生成） */
  clientId?: string
  /** 订阅主题 */
  topic: string
  /** 用户名（可选） */
  username?: string
  /** 密码（可选） */
  password?: string
  /** 数据路径（用于解析嵌套数据，例如：value） */
  dataPath?: string
  /** 启用状态 */
  enabled?: boolean
  /** 错误重试次数 */
  retryCount?: number
}

/**
 * 设备点位数据接口
 */
export interface DevicePointData {
  /** 点位 ID */
  id: string
  /** 点位名称 */
  name?: string
  /** 点位编码 */
  code?: string
  /** 数据类型 */
  dataType?: 'boolean' | 'number' | 'string'
  /** 访问权限 */
  accessMode?: 'read' | 'write' | 'readWrite'
  /** 点位值 */
  value: any
  /** 数据质量 */
  quality?: 'good' | 'bad' | 'uncertain'
  /** 时间戳 */
  timestamp?: string
  /** 单位 */
  unit?: string
  /** 是否启用 */
  enabled?: boolean
  /** 精度 */
  precision?: number
}

/**
 * 设备数据接口
 */
export interface DeviceData {
  /** 设备ID */
  id: string
  /** 设备名称 */
  name?: string
  /** 点位数据 */
  points: DevicePointData[]
}

/**
 * MQTT 服务类
 */
export class MqttService {
  private client: MqttClient | null = null
  private config: MqttConfig | null = null
  private onDataCallback: ((data: DeviceData) => void) | null = null
  private onErrorCallback: ((error: Error) => void) | null = null
  private isConnected = false

  /**
   * 连接 MQTT 服务器
   */
  connect(config: MqttConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!config.enabled) {
        reject(new Error('MQTT 连接未启用'))
        return
      }

      this.config = config

      // 处理浏览器环境下的 MQTT 地址
      let brokerUrl = config.broker
      
      // 如果是 mqtt:// 协议，在浏览器中需要转换为 ws:// 或 wss://
      if (brokerUrl.startsWith('mqtt://')) {
        // 提取主机名
        const host = brokerUrl.replace('mqtt://', '')
        // 对于 EMQX 公共服务器，使用 WebSocket 端口
        if (host.includes('broker.emqx.io')) {
          brokerUrl = `ws://broker.emqx.io:8083/mqtt`
        } else {
          // 其他服务器，尝试使用默认 WebSocket 端口
          brokerUrl = `ws://${host}:8083/mqtt`
        }
      } else if (brokerUrl.startsWith('mqtts://')) {
        const host = brokerUrl.replace('mqtts://', '')
        if (host.includes('broker.emqx.io')) {
          brokerUrl = `wss://broker.emqx.io:8084/mqtt`
        } else {
          brokerUrl = `wss://${host}:8084/mqtt`
        }
      } else if (!brokerUrl.startsWith('ws://') && !brokerUrl.startsWith('wss://')) {
        // 如果没有协议前缀，默认使用 ws://
        brokerUrl = `ws://${brokerUrl}:8083/mqtt`
      }

      // 连接选项
      const options: mqtt.IClientOptions = {
        clientId: config.clientId || `scada_${Math.random().toString(16).substring(2, 8)}`,
        clean: true,
        reconnectPeriod: 0,  // 禁用自动重连，由我们手动控制
      }

      // 添加认证信息（仅当提供了用户名时）
      // EMQX 公共服务器支持匿名访问，不需要认证
      if (config.username && config.username.trim()) {
        options.username = config.username
      }
      
      if (config.password && config.password.trim()) {
        options.password = config.password
      }

      try {
        // 创建 MQTT 客户端
        this.client = mqtt.connect(brokerUrl, options)

        // 连接成功
        this.client.on('connect', (connack) => {
          this.isConnected = true
          
          // 订阅主题
          if (this.client && config.topic) {
            this.client.subscribe(config.topic, (err) => {
              if (err) {
                console.error('[MQTT] 订阅失败:', err)
                reject(err)
              } else {
                resolve()
              }
            })
          }
        })

        // 接收消息
        this.client.on('message', (topic, payload) => {
          try {
            const message = payload.toString()
            
            // 解析 JSON 数据
            const data = JSON.parse(message)
            
            // 处理数据路径
            let actualData = data
            if (config.dataPath) {
              const paths = config.dataPath.split('.')
              for (const path of paths) {
                actualData = actualData?.[path]
              }
            }
            
            // 转换为设备数据格式
            const deviceData = this.parseDeviceData(actualData)
            
            // 触发回调
            if (this.onDataCallback && deviceData) {
              this.onDataCallback(deviceData)
            }
          } catch (error) {
            console.error('[MQTT] 消息解析失败:', error)
            if (this.onErrorCallback) {
              this.onErrorCallback(error as Error)
            }
          }
        })

        // 连接错误
        this.client.on('error', (error) => {
          console.error('[MQTT] 连接错误:', error)
          this.isConnected = false
          if (this.onErrorCallback) {
            this.onErrorCallback(error)
          }
        })

        // 连接断开
        this.client.on('close', () => {
          console.warn('[MQTT] 连接断开 - 可能原因：认证失败、clientId冲突、权限不足或服务器主动断开')
          this.isConnected = false
        })

        // 离线事件
        this.client.on('offline', () => {
          console.warn('[MQTT] 客户端离线')
        })

        // 结束事件
        this.client.on('end', () => {
          console.log('[MQTT] 连接已结束')
        })

      } catch (error) {
        console.error('[MQTT] 创建客户端失败:', error)
        reject(error)
      }
    })
  }

  /**
   * 解析设备数据
   * 支持多种数据格式
   */
  private parseDeviceData(data: any): DeviceData | null {
    if (!data) return null

    // 格式1: 标准设备数据格式
    // { deviceId: "xxx", points: [{id: "xxx", value: xxx}] }
    if (data.deviceId && Array.isArray(data.points)) {
      return {
        id: data.deviceId,
        name: data.deviceName || data.deviceId,
        points: data.points.map((p: any) => ({
          id: p.id || p.pointId,
          name: p.name || p.id || p.pointId, // 使用名称，如果没有则使用 id
          code: p.code || p.id || p.pointId, // 使用编码，如果没有则使用 id
          dataType: p.dataType || (typeof p.value === 'boolean' ? 'boolean' : typeof p.value === 'number' ? 'number' : 'string'), // 根据 value 类型推断
          accessMode: p.accessMode || 'readWrite', // 默认读写
          value: p.value,
          quality: p.quality || 'good',
          timestamp: p.timestamp || new Date().toISOString(),
          unit: p.unit,
          enabled: p.enabled !== false // 默认启用
        }))
      }
    }

    // 格式2: 单点位数据
    // { deviceId: "xxx", pointId: "xxx", value: xxx }
    if (data.deviceId && data.pointId && data.value !== undefined) {
      return {
        id: data.deviceId,
        name: data.deviceName || data.deviceId,
        points: [{
          id: data.pointId,
          name: data.pointName || data.pointId,
          code: data.pointCode || data.pointId,
          dataType: data.dataType || (typeof data.value === 'boolean' ? 'boolean' : typeof data.value === 'number' ? 'number' : 'string'),
          accessMode: data.accessMode || 'readWrite',
          value: data.value,
          quality: data.quality || 'good',
          timestamp: data.timestamp || new Date().toISOString(),
          unit: data.unit,
          enabled: data.enabled !== false
        }]
      }
    }

    // 格式3: 扁平化数据（自动推断）
    // { deviceId: "xxx", temperature: 25.5, pressure: 1.2 }
    if (data.deviceId) {
      const points: DevicePointData[] = []
      for (const key in data) {
        if (key !== 'deviceId' && key !== 'deviceName' && key !== 'timestamp') {
          const value = data[key]
          points.push({
            id: key,
            name: key, // 使用 key 作为名称
            code: key, // 使用 key 作为编码
            dataType: typeof value === 'boolean' ? 'boolean' : typeof value === 'number' ? 'number' : 'string',
            accessMode: 'readWrite',
            value: value,
            quality: 'good',
            timestamp: data.timestamp || new Date().toISOString(),
            enabled: true
          })
        }
      }
      if (points.length > 0) {
        return {
          id: data.deviceId,
          name: data.deviceName || data.deviceId,
          points
        }
      }
    }

    return null
  }

  /**
   * 设置数据接收回调
   */
  onData(callback: (data: DeviceData) => void): void {
    this.onDataCallback = callback
  }

  /**
   * 设置错误回调
   */
  onError(callback: (error: Error) => void): void {
    this.onErrorCallback = callback
  }

  /**
   * 发布消息
   */
  publish(topic: string, message: string | object): void {
    if (!this.client || !this.isConnected) {
      console.warn('[MQTT] 未连接，无法发布消息')
      return
    }

    const payload = typeof message === 'string' ? message : JSON.stringify(message)
    this.client.publish(topic, payload, (error) => {
      if (error) {
        console.error('[MQTT] 消息发布失败:', error)
      } else {
        console.log('[MQTT] 消息发布成功:', topic)
      }
    })
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.client) {
      console.log('[MQTT] 断开连接')
      
      try {
        // 移除所有事件监听器
        this.client.removeAllListeners()
        // 强制关闭，不等待
        this.client.end(true)
      } catch (error) {
        console.warn('[MQTT] 断开连接时出错:', error)
      }
      
      this.client = null
      this.isConnected = false
    }
  }

  /**
   * 获取连接状态
   */
  getConnectionStatus(): boolean {
    return this.isConnected
  }

  /**
   * 获取当前配置
   */
  getConfig(): MqttConfig | null {
    return this.config
  }
}

/**
 * 创建 MQTT 服务实例
 */
export function createMqttService(): MqttService {
  return new MqttService()
}
