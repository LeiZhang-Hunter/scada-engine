/**
 * 数据处理 Worker
 * 在后台线程处理复杂数据转换,避免阻塞主线程
 */

// Worker 消息类型
export enum WorkerMessageType {
  PARSE_DEVICE_DATA = 'PARSE_DEVICE_DATA',
  TRANSFORM_BINDING_DATA = 'TRANSFORM_BINDING_DATA',
  BATCH_CALCULATE = 'BATCH_CALCULATE',
  ERROR = 'ERROR'
}

export interface WorkerMessage {
  id: string
  type: WorkerMessageType
  payload: any
}

export interface WorkerResponse {
  id: string
  type: WorkerMessageType
  result?: any
  error?: string
}

// Worker 内部实现
self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { id, type, payload } = event.data
  
  try {
    let result: any
    
    switch (type) {
      case WorkerMessageType.PARSE_DEVICE_DATA:
        result = parseDeviceData(payload)
        break
        
      case WorkerMessageType.TRANSFORM_BINDING_DATA:
        result = transformBindingData(payload)
        break
        
      case WorkerMessageType.BATCH_CALCULATE:
        result = batchCalculate(payload)
        break
        
      default:
        throw new Error(`未知的消息类型: ${type}`)
    }
    
    // 返回结果
    const response: WorkerResponse = {
      id,
      type,
      result
    }
    self.postMessage(response)
    
  } catch (error) {
    // 返回错误
    const response: WorkerResponse = {
      id,
      type: WorkerMessageType.ERROR,
      error: (error as Error).message
    }
    self.postMessage(response)
  }
}

/**
 * 解析设备数据
 */
function parseDeviceData(rawData: any): any {
  // 示例:处理多设备格式
  if (Array.isArray(rawData.devices)) {
    return rawData.devices.map((device: any) => ({
      id: device.id || device.deviceId,
      name: device.name || device.deviceName,
      points: parsePoints(device.points || device.data || [])
    }))
  }
  
  // 简化点位数组
  if (Array.isArray(rawData)) {
    return [{
      id: 'default',
      name: 'Default Device',
      points: rawData.map((point: any) => ({
        id: point.id,
        value: point.value,
        quality: point.quality || 'good',
        timestamp: point.timestamp || new Date().toISOString()
      }))
    }]
  }
  
  return rawData
}

/**
 * 解析点位数据
 */
function parsePoints(points: any[]): any[] {
  return points.map((point: any) => {
    if (typeof point === 'object' && point.id !== undefined) {
      return {
        id: point.id,
        value: point.value,
        dataType: inferDataType(point.value),
        quality: point.quality || 'good',
        timestamp: point.timestamp || new Date().toISOString()
      }
    }
    return point
  })
}

/**
 * 推断数据类型
 */
function inferDataType(value: any): string {
  if (typeof value === 'number') return 'number'
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'string') return 'string'
  return 'unknown'
}

/**
 * 转换绑定数据
 */
function transformBindingData(payload: {
  bindings: any[]
  deviceData: any
}): any[] {
  const { bindings, deviceData } = payload
  const results: any[] = []
  
  bindings.forEach(binding => {
    const pointValue = extractPointValue(deviceData, binding.devicePointId)
    
    if (pointValue !== undefined) {
      const mappedValue = applyMapping(pointValue, binding.mapping)
      
      results.push({
        nodeId: binding.nodeId,
        targetProperty: binding.targetProperty,
        value: mappedValue
      })
    }
  })
  
  return results
}

/**
 * 提取点位值
 */
function extractPointValue(data: any, pointId: string): any {
  // 简化点位数组
  if (Array.isArray(data)) {
    const point = data.find((p: any) => p.id === pointId)
    return point?.value
  }
  
  // 直接对象
  if (data[pointId] !== undefined) {
    return data[pointId]
  }
  
  // 嵌套设备结构
  if (data.devices && Array.isArray(data.devices)) {
    for (const device of data.devices) {
      if (device.points && Array.isArray(device.points)) {
        const point = device.points.find((p: any) => p.id === pointId)
        if (point) return point.value
      }
    }
  }
  
  return undefined
}

/**
 * 应用值映射
 */
function applyMapping(value: any, mapping?: any): any {
  if (!mapping || mapping.type === 'DIRECT') {
    return value
  }
  
  switch (mapping.type) {
    case 'BOOLEAN':
      return Boolean(value) ? mapping.trueValue : mapping.falseValue
      
    case 'RANGE':
      const numValue = Number(value)
      if (mapping.rangeRules && Array.isArray(mapping.rangeRules)) {
        for (const rule of mapping.rangeRules) {
          const min = rule.min !== undefined ? Number(rule.min) : -Infinity
          const max = rule.max !== undefined ? Number(rule.max) : Infinity
          if (numValue >= min && numValue <= max) {
            return rule.value
          }
        }
      }
      return value
      
    case 'ENUM':
      const strValue = String(value)
      return mapping.enumMappings?.[strValue] ?? value
      
    default:
      return value
  }
}

/**
 * 批量计算
 */
function batchCalculate(payload: {
  calculations: Array<{ type: string; params: any }>
}): any[] {
  const { calculations } = payload
  
  return calculations.map(calc => {
    switch (calc.type) {
      case 'average':
        return calculateAverage(calc.params.values)
        
      case 'sum':
        return calculateSum(calc.params.values)
        
      case 'interpolate':
        return interpolate(calc.params.from, calc.params.to, calc.params.t)
        
      default:
        return null
    }
  })
}

function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, val) => sum + val, 0) / values.length
}

function calculateSum(values: number[]): number {
  return values.reduce((sum, val) => sum + val, 0)
}

function interpolate(from: number, to: number, t: number): number {
  return from + (to - from) * Math.max(0, Math.min(1, t))
}
