<template>
	<div class="event-card">
		<div class="event-card-header" @click="$emit('toggle-collapse')">
			<div class="header-left">
				<span class="collapse-icon">{{ isCollapsed ? '▶' : '▼' }}</span>
				<span class="event-title">绑定{{ index + 1 }}</span>
			</div>
			<button 
				class="btn-remove" 
				@click.stop="$emit('remove')" 
				title="删除绑定"
			>🗑</button>
		</div>

		<!-- 绑定配置内容 -->
		<div v-show="!isCollapsed" class="event-card-body">
			<!-- 设备点位选择（触发器） -->
			<div class="property-item">
				<label>设备点位</label>
				<div class="point-selector-trigger" @click="showSelector = true">
					<div v-if="selectedPointInfo" class="selected-point">
						<div class="point-main">
							<span class="device-name">{{ selectedPointInfo.deviceName }}</span>
							<span class="point-name">{{ selectedPointInfo.pointName }}</span>
						</div>
						<div class="point-details">
							<span class="point-code">{{ selectedPointInfo.pointCode }}</span>
							<span v-if="selectedPointInfo.pointUnit" class="point-unit">{{ selectedPointInfo.pointUnit }}</span>
						</div>
					</div>
					<div v-else class="placeholder">
						点击选择设备点位
					</div>
					<span class="selector-arrow">›</span>
				</div>
			</div>
			
			<!-- 设备点位选择弹窗 -->
			<DevicePointSelector
				v-model:visible="showSelector"
				v-model="bindingValue"
				:device-data="deviceDataComputed"
				@confirm="handlePointSelect"
			/>
			<div class="property-item">
				<label>目标属性</label>
				<select :value="binding.targetProperty || ''" @change="$emit('update-field', 'targetProperty', $event)">
					<option value="">选择属性</option>
					<option v-for="prop in nodeProperties" :key="prop.key" :value="prop.key">
						{{ prop.label }}
					</option>
				</select>
			</div>
			
			<!-- 映射配置（触发器） -->
			<div class="property-item">
				<label>值映射配置</label>
				<div class="mapping-trigger" @click="showMappingConfig = true">
					<div v-if="localMapping.type !== 'direct'" class="mapping-summary">
						<span class="mapping-type-label">{{ getMappingTypeLabel(localMapping.type) }}</span>
						<span class="mapping-detail">{{ getMappingSummary() }}</span>
					</div>
					<div v-else class="placeholder">
						点击配置值映射
					</div>
					<span class="selector-arrow">›</span>
				</div>
			</div>
			
			<!-- 映射配置弹窗 -->
			<MappingConfigurator 
				v-model:visible="showMappingConfig"
				v-model="localMapping"
				@confirm="handleMappingUpdate"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import DevicePointSelector from './DevicePointSelector.vue'
import MappingConfigurator from './MappingConfigurator.vue'
import { getDeviceById as getMockDeviceById, getPointById as getMockPointById } from '../mock/deviceData'
import type { Device, DevicePoint } from '../types/device'
import { MappingType, ValueType, type BindingConfig, type MappingConfig } from '../types/binding'

interface NodeProperty {
	key: string
	label: string
	type: string
}

const props = defineProps<{
	binding: BindingConfig
	index: number
	isCollapsed: boolean
	nodeProperties: NodeProperty[]
	deviceData?: any
}>()

const emit = defineEmits<{
	'toggle-collapse': []
	'remove': []
	'update-field': [field: string, event: Event]
}>()

// 绑定值
const bindingValue = ref(props.binding.devicePointId || '')
const showSelector = ref(false)
const showMappingConfig = ref(false)
const localMapping = ref<MappingConfig>(props.binding.mapping || { 
	type: MappingType.DIRECT,
	valueType: ValueType.NUMBER
})

// 使用传递的设备数据
const deviceDataComputed = computed(() => {
	return props.deviceData || {}
})

// 监听外部变化
watch(() => props.binding.devicePointId, (newVal) => {
	bindingValue.value = newVal || ''
})

watch(() => props.binding.mapping, (newVal) => {
	if (newVal) {
		localMapping.value = newVal
	}
}, { deep: true })

// 解析选中的点位信息（用于显示）
const selectedPointInfo = computed(() => {
	if (!bindingValue.value) return null
	
	const [deviceId, pointId] = bindingValue.value.split(':')
	if (!deviceId || !pointId) return null
	
	// 优先使用传递的设备数据，如果不存在则使用mock数据
	let device = null
	let point = null
	
	if (props.deviceData && props.deviceData.devices) {
		device = props.deviceData.devices.find((d: any) => d.id === deviceId)
		if (device) {
			point = device.points?.find((p: any) => p.id === pointId) || null
		}
	}
	
	// 如果在传递的设备数据中没找到，尝试使用mock数据
	if (!device) {
		device = getMockDeviceById(deviceId)
		if (device) {
			point = getMockPointById(deviceId, pointId)
		}
	}
	
	if (!device || !point) return null
	
	return {
		deviceName: device.name,
		pointName: point.name,
		pointCode: point.code,
		pointUnit: point.unit
	}
})

// 处理点位选择
const handlePointSelect = (deviceId: string, pointId: string, device: Device, point: DevicePoint) => {
	// 更新设备点位
	const event = new Event('change')
	Object.defineProperty(event, 'target', {
		value: { value: `${deviceId}:${pointId}` },
		writable: false
	})
	emit('update-field', 'devicePointId', event)
	
	console.log('选择了点位:', {
		device: device.name,
		point: point.name,
		dataType: point.dataType,
		accessMode: point.accessMode
	})
}

// 处理映射配置更新
const handleMappingUpdate = (mapping: MappingConfig) => {
	const event = new Event('change')
	Object.defineProperty(event, 'target', {
		value: { value: mapping },
		writable: false
	})
	emit('update-field', 'mapping', event)
}

// 获取映射类型标签
const getMappingTypeLabel = (type: string) => {
	const labels: Record<string, string> = {
		direct: '直接映射',
		boolean: '布尔映射',
		range: '范围映射',
		enum: '枚举映射'
	}
	return labels[type] || type
}

// 获取映射摘要
const getMappingSummary = () => {
	const mapping = localMapping.value
	
	if (mapping.type === 'boolean') {
		return `True:${mapping.trueValue || 'true'} / False:${mapping.falseValue || 'false'}`
	}
	
	if (mapping.type === 'range' && mapping.rangeRules) {
		return `${mapping.rangeRules.length} 个范围规则`
	}
	
	if (mapping.type === 'enum' && mapping.enumMappings) {
		return `${Object.keys(mapping.enumMappings).length} 个枚举映射`
	}
	
	return ''
}
</script>

<style scoped>
.event-card {
	background: #0f172a;
	border: 1px solid #334155;
	border-radius: 6px;
	padding: 12px;
	transition: all 0.2s;
}

.event-card:hover {
	border-color: #3b82f6;
}

.event-card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12px;
	padding-bottom: 8px;
	border-bottom: 1px solid #1e293b;
	cursor: pointer;
	user-select: none;
	transition: all 0.2s;
}

.event-card-header:hover {
	background: rgba(59, 130, 246, 0.05);
	margin: -4px -8px 8px -8px;
	padding: 4px 8px 12px 8px;
	border-radius: 4px;
}

.header-left {
	display: flex;
	align-items: center;
	gap: 8px;
}

.collapse-icon {
	font-size: 10px;
	color: #64748b;
	transition: transform 0.2s;
	display: inline-block;
	width: 12px;
}

.event-title {
	font-size: 14px;
	font-weight: 600;
	color: #e2e8f0;
}

.btn-remove {
	width: 24px;
	height: 24px;
	background: transparent;
	border: 1px solid #475569;
	border-radius: 4px;
	color: #94a3b8;
	cursor: pointer;
	font-size: 18px;
	line-height: 1;
	transition: all 0.2s;
	display: flex;
	align-items: center;
	justify-content: center;
}

.btn-remove:hover {
	background: #ef4444;
	border-color: #ef4444;
	color: #fff;
}

.event-card-body {
	animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
	from {
		opacity: 0;
		max-height: 0;
		overflow: hidden;
	}
	to {
		opacity: 1;
		max-height: 2000px;
	}
}

.property-item {
	margin-bottom: 12px;
}

.property-item:last-child {
	margin-bottom: 0;
}

.property-item label {
	display: block;
	font-size: 12px;
	color: #cbd5e1;
	margin-bottom: 6px;
}

.property-item select {
	width: 100%;
	padding: 8px 12px;
	background: #0f172a;
	border: 1px solid #334155;
	border-radius: 4px;
	color: #e2e8f0;
	font-size: 13px;
	transition: all 0.2s;
}

.property-item select:focus {
	outline: none;
	border-color: #3b82f6;
	box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* 点位选择触发器 */
.point-selector-trigger {
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	padding: 10px 12px;
	background: #0f172a;
	border: 1px solid #334155;
	border-radius: 4px;
	cursor: pointer;
	transition: all 0.2s;
	min-height: 42px;
}

.point-selector-trigger:hover {
	border-color: #3b82f6;
	background: #1e293b;
}

.selected-point {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.point-main {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 13px;
}

.device-name {
	color: #94a3b8;
	font-size: 12px;
}

.point-name {
	color: #e2e8f0;
	font-weight: 500;
}

.point-details {
	display: flex;
	gap: 8px;
	font-size: 11px;
	color: #64748b;
}

.point-code {
	font-family: monospace;
}

.point-unit {
	color: #3b82f6;
}

.placeholder {
	color: #64748b;
	font-size: 13px;
}

.selector-arrow {
	font-size: 18px;
	color: #64748b;
	transition: all 0.2s;
}

.point-selector-trigger:hover .selector-arrow {
	color: #3b82f6;
	transform: translateX(2px);
}

/* 映射配置触发器 */
.mapping-trigger {
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	padding: 10px 12px;
	background: #0f172a;
	border: 1px solid #334155;
	border-radius: 4px;
	cursor: pointer;
	transition: all 0.2s;
	min-height: 42px;
}

.mapping-trigger:hover {
	border-color: #3b82f6;
	background: #1e293b;
}

.mapping-summary {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.mapping-type-label {
	font-size: 13px;
	color: #e2e8f0;
	font-weight: 500;
}

.mapping-detail {
	font-size: 11px;
	color: #64748b;
}

.mapping-trigger .placeholder {
	color: #64748b;
	font-size: 13px;
}

.mapping-trigger:hover .selector-arrow {
	color: #3b82f6;
	transform: translateX(2px);
}
</style>
