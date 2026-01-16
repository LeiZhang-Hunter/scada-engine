/**
 * 数据源管理服务
 * 统一管理多个数据源连接（MQTT、WebSocket、HTTP等）
 */

import { ref, reactive } from 'vue'
import { createMqttService, type MqttConfig } from './mqttService'

// 数据源类型定义
export interface DataSource {
  id: string
  name: string
  type: 'MQTT' | 'WebSocket' | 'HTTP' | 'SSE'
  enabled: boolean
  config: {
    // MQTT
    broker?: string
    topic?: string
    clientId?: string
    username?: string
    password?: string
    // WebSocket
    wsUrl?: string
    // HTTP
    url?: string
    method?: string
    pollInterval?: number
    headers?: Record<string, string>
    // SSE
    sseUrl?: string
    eventType?: string
    // 通用
    dataPath?: string
    retryCount?: number
  }
  status?: {
    connected: boolean
    lastUpdate?: string
    error?: string
  }
  devices: Array<{
    id: string
    name: string
    points: Array<{
      id: string
      value: any
      quality?: string
      timestamp?: string
    }>
  }>
}

// 数据源管理器类
export class DataSourceManager {
  private dataSources = reactive<Map<string, DataSource>>(new Map())
  private connections = new Map<string, any>() // 存储实际的连接实例
  private onDataCallbacks: Array<(dataSourceId: string, deviceData: any) => void> = []

  /**
   * 添加数据源
   */
  addDataSource(dataSource: DataSource): void {
    this.dataSources.set(dataSource.id, dataSource)
    
    // 如果启用，立即连接
    if (dataSource.enabled) {
      this.connectDataSource(dataSource.id)
    }
  }

  /**
   * 更新数据源
   */
  updateDataSource(id: string, updates: Partial<DataSource>): void {
    const dataSource = this.dataSources.get(id)
    if (!dataSource) return

    // 更新数据源配置
    Object.assign(dataSource, updates)

    // 如果配置变化，重新连接
    if (updates.config || updates.enabled !== undefined) {
      this.reconnectDataSource(id)
    }
  }

  /**
   * 删除数据源
   */
  removeDataSource(id: string): void {
    this.disconnectDataSource(id)
    this.dataSources.delete(id)
  }

  /**
   * 获取数据源
   */
  getDataSource(id: string): DataSource | undefined {
    return this.dataSources.get(id)
  }

  /**
   * 获取所有数据源
   */
  getAllDataSources(): DataSource[] {
    return Array.from(this.dataSources.values())
  }

  /**
   * 获取所有设备（来自所有数据源）
   */
  getAllDevices(): Array<{ dataSourceId: string; dataSourceName: string; device: any }> {
    const devices: Array<{ dataSourceId: string; dataSourceName: string; device: any }> = []
    
    this.dataSources.forEach((dataSource) => {
      dataSource.devices.forEach((device) => {
        devices.push({
          dataSourceId: dataSource.id,
          dataSourceName: dataSource.name,
          device
        })
      })
    })
    
    return devices
  }

  /**
   * 连接数据源
   */
  private async connectDataSource(id: string): Promise<void> {
    const dataSource = this.dataSources.get(id)
    if (!dataSource) return

    try {
      // 先断开已有连接
      this.disconnectDataSource(id)

      // 根据类型创建连接
      switch (dataSource.type) {
        case 'MQTT':
          await this.connectMqtt(id, dataSource)
          break
        case 'WebSocket':
          await this.connectWebSocket(id, dataSource)
          break
        case 'HTTP':
          await this.connectHttp(id, dataSource)
          break
        case 'SSE':
          await this.connectSSE(id, dataSource)
          break
      }

      // 更新状态
      if (dataSource.status) {
        dataSource.status.connected = true
        dataSource.status.error = undefined
      }
    } catch (error) {
      console.error(`[DataSource] 连接失败: ${dataSource.name}`, error)
      if (dataSource.status) {
        dataSource.status.connected = false
        dataSource.status.error = (error as Error).message
      }
    }
  }

  /**
   * 断开数据源连接
   */
  private disconnectDataSource(id: string): void {
    const connection = this.connections.get(id)
    if (!connection) return

    // 根据类型断开连接
    const dataSource = this.dataSources.get(id)
    if (!dataSource) return

    try {
      if (dataSource.type === 'MQTT') {
        connection.disconnect()
      } else if (dataSource.type === 'WebSocket') {
        connection.close()
      } else if (dataSource.type === 'HTTP') {
        if (connection.intervalId) {
          clearInterval(connection.intervalId)
        }
      } else if (dataSource.type === 'SSE') {
        connection.close()
      }
    } catch (error) {
      console.error(`[DataSource] 断开连接失败:`, error)
    }

    this.connections.delete(id)

    // 更新状态
    if (dataSource.status) {
      dataSource.status.connected = false
    }
  }

  /**
   * 重新连接数据源
   */
  private async reconnectDataSource(id: string): Promise<void> {
    const dataSource = this.dataSources.get(id)
    if (!dataSource) return

    if (dataSource.enabled) {
      await this.connectDataSource(id)
    } else {
      this.disconnectDataSource(id)
    }
  }

  /**
   * 连接 MQTT
   */
  private async connectMqtt(id: string, dataSource: DataSource): Promise<void> {
    const mqttService = createMqttService()

    // 设置数据接收回调
    mqttService.onData((deviceData) => {
      this.handleDeviceData(id, deviceData)
    })

    // 设置错误回调
    mqttService.onError((error) => {
      console.error(`[MQTT] 数据源 ${dataSource.name} 错误:`, error)
      if (dataSource.status) {
        dataSource.status.error = error.message
      }
    })

    // 连接
    const config: MqttConfig = {
      broker: dataSource.config.broker || '',
      topic: dataSource.config.topic || '',
      clientId: dataSource.config.clientId,
      username: dataSource.config.username,
      password: dataSource.config.password,
      dataPath: dataSource.config.dataPath,
      enabled: true,
      retryCount: dataSource.config.retryCount || 3
    }

    await mqttService.connect(config)
    this.connections.set(id, mqttService)
  }

  /**
   * 连接 WebSocket
   */
  private async connectWebSocket(id: string, dataSource: DataSource): Promise<void> {
    // TODO: 实现 WebSocket 连接
    console.log('[WebSocket] 连接功能待实现')
  }

  /**
   * 连接 HTTP
   */
  private async connectHttp(id: string, dataSource: DataSource): Promise<void> {
    // TODO: 实现 HTTP 轮询
    console.log('[HTTP] 轮询功能待实现')
  }

  /**
   * 连接 SSE
   */
  private async connectSSE(id: string, dataSource: DataSource): Promise<void> {
    // TODO: 实现 SSE 连接
    console.log('[SSE] 连接功能待实现')
  }

  /**
   * 处理接收到的设备数据
   */
  private handleDeviceData(dataSourceId: string, deviceData: any): void {
    const dataSource = this.dataSources.get(dataSourceId)
    if (!dataSource) return

    // 更新设备数据
    const existingIndex = dataSource.devices.findIndex((d) => d.id === deviceData.id)
    
    if (existingIndex >= 0) {
      // 更新现有设备
      const device = dataSource.devices[existingIndex]
      deviceData.points.forEach((newPoint: any) => {
        const pointIndex = device.points.findIndex((p) => p.id === newPoint.id)
        if (pointIndex >= 0) {
          device.points[pointIndex] = { ...device.points[pointIndex], ...newPoint }
        } else {
          device.points.push(newPoint)
        }
      })
      device.name = deviceData.name || device.name
    } else {
      // 添加新设备
      dataSource.devices.push({
        id: deviceData.id,
        name: deviceData.name || deviceData.id,
        points: deviceData.points
      })
    }

    // 更新最后更新时间
    if (dataSource.status) {
      dataSource.status.lastUpdate = new Date().toISOString()
    }

    // 触发回调
    this.onDataCallbacks.forEach((callback) => {
      callback(dataSourceId, deviceData)
    })
  }

  /**
   * 注册数据接收回调
   */
  onData(callback: (dataSourceId: string, deviceData: any) => void): void {
    this.onDataCallbacks.push(callback)
  }

  /**
   * 断开所有连接
   */
  disconnectAll(): void {
    this.dataSources.forEach((_, id) => {
      this.disconnectDataSource(id)
    })
  }

  /**
   * 获取数据源状态
   */
  getDataSourceStatus(id: string): { connected: boolean } | null {
    const dataSource = this.dataSources.get(id)
    return dataSource?.status || null
  }
}

// 导出单例
export const dataSourceManager = new DataSourceManager()
