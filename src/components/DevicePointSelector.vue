<template>
	<!-- 遮罩层 -->
	<div v-if="visible" class="modal-overlay" @click="handleClose">
		<div class="modal-container" @click.stop>
			<!-- 弹窗头部 -->
			<div class="modal-header">
				<h3>选择设备点位</h3>
				<button class="btn-close" @click="handleClose">✕</button>
			</div>
			
			<!-- 弹窗内容 -->
			<div class="device-point-selector">
				<!-- 左侧：设备列表 -->
				<div class="device-list-panel">
					<div class="panel-header">
						<h4>设备列表</h4>
						<span class="device-count">{{ devices.length }}</span>
					</div>
					<div class="search-box">
						<input 
							v-model="deviceSearchQuery" 
							type="text" 
							placeholder="搜索设备..."
							class="search-input"
						/>
					</div>
					<div class="device-list">
						<div
							v-for="device in filteredDevices"
							:key="device.id"
							:class="['device-item', { active: selectedDevice?.id === device.id, offline: device.status === 'offline' }]"
							@click="selectDevice(device)"
						>
							<div class="device-info">
								<div class="device-name">
									<span class="status-dot" :class="device.status"></span>
									{{ device.name }}
								</div>
								<div class="device-meta">
									<span class="device-code">{{ device.code }}</span>
									<span class="point-count">{{ device.points.length }} 点</span>
								</div>
							</div>
							<div class="device-arrow">›</div>
						</div>
						<div v-if="filteredDevices.length === 0" class="empty-hint">
							暂无设备
						</div>
					</div>
				</div>

				<!-- 右侧：点位列表 -->
				<div class="point-list-panel">
					<div class="panel-header">
						<h4>{{ selectedDevice ? selectedDevice.name : '点位列表' }}</h4>
						<span v-if="selectedDevice" class="point-count">{{ filteredPoints.length }}</span>
					</div>
					<div v-if="selectedDevice" class="search-box">
						<input 
							v-model="pointSearchQuery" 
							type="text" 
							placeholder="搜索点位..."
							class="search-input"
						/>
					</div>
					<div class="point-list">
						<div v-if="!selectedDevice" class="empty-hint">
							← 请先选择设备
						</div>
						<div v-else-if="filteredPoints.length === 0" class="empty-hint">
							暂无点位
						</div>
						<div
							v-else
							v-for="point in filteredPoints"
							:key="point.id"
							:class="['point-item', { 
								active: selectedPoint?.id === point.id,
								disabled: !point.enabled
							}]"
							@click="selectPoint(point)"
						>
							<div class="point-info">
								<div class="point-name">
									{{ point.name }}
									<span class="access-mode" :class="point.accessMode">
										{{ getAccessModeLabel(point.accessMode) }}
									</span>
								</div>
								<div class="point-meta">
									<span class="point-code">{{ point.code }}</span>
									<span v-if="point.unit" class="point-unit">{{ point.unit }}</span>
									<span class="point-type">{{ getDataTypeLabel(point.dataType) }}</span>
								</div>
								<div v-if="point.value !== undefined" class="point-value">
									当前值: <span class="value">{{ formatValue(point) }}</span>
									<span :class="['quality', point.quality]">{{ point.quality }}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			
			<!-- 弹窗底部 -->
			<div class="modal-footer">
				<button class="btn-cancel" @click="handleClose">取消</button>
				<button 
					class="btn-confirm" 
					:disabled="!selectedPoint"
					@click="handleConfirm"
				>
					确定
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { mockDevices } from '../mock/deviceData'
import type { Device, DevicePoint } from '../types/device'

const props = defineProps<{
	visible: boolean     // 是否显示弹窗
	modelValue?: string  // 格式: deviceId:pointId
}>()

const emit = defineEmits<{
	'update:visible': [value: boolean]
	'update:modelValue': [value: string]
	'confirm': [deviceId: string, pointId: string, device: Device, point: DevicePoint]
}>()

// 设备列表
const devices = ref(mockDevices)
const selectedDevice = ref<Device | null>(null)
const selectedPoint = ref<DevicePoint | null>(null)
const deviceSearchQuery = ref('')
const pointSearchQuery = ref('')

// 初始化选中状态
if (props.modelValue) {
	const [deviceId, pointId] = props.modelValue.split(':')
	const device = devices.value.find(d => d.id === deviceId)
	if (device) {
		selectedDevice.value = device
		selectedPoint.value = device.points.find(p => p.id === pointId) || null
	}
}

// 过滤设备
const filteredDevices = computed(() => {
	if (!deviceSearchQuery.value) return devices.value
	const query = deviceSearchQuery.value.toLowerCase()
	return devices.value.filter(device => 
		device.name.toLowerCase().includes(query) ||
		device.code.toLowerCase().includes(query)
	)
})

// 过滤点位
const filteredPoints = computed(() => {
	if (!selectedDevice.value) return []
	if (!pointSearchQuery.value) return selectedDevice.value.points
	const query = pointSearchQuery.value.toLowerCase()
	return selectedDevice.value.points.filter(point =>
		point.name.toLowerCase().includes(query) ||
		point.code.toLowerCase().includes(query)
	)
})

// 选择设备
const selectDevice = (device: Device) => {
	selectedDevice.value = device
	selectedPoint.value = null
	pointSearchQuery.value = ''
}

// 选择点位
const selectPoint = (point: DevicePoint) => {
	if (!point.enabled) return
	selectedPoint.value = point
}

// 关闭弹窗
const handleClose = () => {
	emit('update:visible', false)
}

// 确认选择
const handleConfirm = () => {
	if (!selectedDevice.value || !selectedPoint.value) return
	
	const value = `${selectedDevice.value.id}:${selectedPoint.value.id}`
	emit('update:modelValue', value)
	emit('confirm', selectedDevice.value.id, selectedPoint.value.id, selectedDevice.value, selectedPoint.value)
	emit('update:visible', false)
}

// 获取访问权限标签
const getAccessModeLabel = (mode: string) => {
	const labels: Record<string, string> = {
		read: '只读',
		write: '只写',
		readWrite: '读写'
	}
	return labels[mode] || mode
}

// 获取数据类型标签
const getDataTypeLabel = (type: string) => {
	const labels: Record<string, string> = {
		boolean: '布尔',
		number: '数值',
		string: '字符',
		json: 'JSON'
	}
	return labels[type] || type
}

// 格式化值显示
const formatValue = (point: DevicePoint) => {
	if (point.value === undefined || point.value === null) return '-'
	if (point.dataType === 'boolean') return point.value ? '是' : '否'
	if (point.dataType === 'number' && point.precision !== undefined) {
		return Number(point.value).toFixed(point.precision)
	}
	return String(point.value)
}
</script>

<style scoped>
/* 遮罩层 */
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.6);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999;
	animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

/* 弹窗容器 */
.modal-container {
	width: 800px;
	max-width: 90vw;
	max-height: 85vh;
	background: #0f172a;
	border-radius: 8px;
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
	display: flex;
	flex-direction: column;
	animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

/* 弹窗头部 */
.modal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20px 24px;
	border-bottom: 1px solid #334155;
}

.modal-header h3 {
	margin: 0;
	font-size: 18px;
	font-weight: 600;
	color: #e2e8f0;
}

.btn-close {
	width: 32px;
	height: 32px;
	background: transparent;
	border: none;
	border-radius: 4px;
	color: #94a3b8;
	font-size: 20px;
	cursor: pointer;
	transition: all 0.2s;
	display: flex;
	align-items: center;
	justify-content: center;
}

.btn-close:hover {
	background: #1e293b;
	color: #e2e8f0;
}

/* 选择器主体 */
.device-point-selector {
	display: grid;
	grid-template-columns: 1fr 1.5fr;
	gap: 12px;
	height: 500px;
	padding: 16px 24px;
	overflow: hidden;
}

/* 弹窗底部 */
.modal-footer {
	display: flex;
	justify-content: flex-end;
	gap: 12px;
	padding: 16px 24px;
	border-top: 1px solid #334155;
}

.btn-cancel,
.btn-confirm {
	padding: 8px 24px;
	border-radius: 4px;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s;
	border: none;
}

.btn-cancel {
	background: #1e293b;
	color: #e2e8f0;
}

.btn-cancel:hover {
	background: #334155;
}

.btn-confirm {
	background: #3b82f6;
	color: #fff;
}

.btn-confirm:hover {
	background: #2563eb;
}

.btn-confirm:disabled {
	background: #334155;
	color: #64748b;
	cursor: not-allowed;
}

/* 面板通用样式 */
.device-list-panel,
.point-list-panel {
	display: flex;
	flex-direction: column;
	background: #1e293b;
	border: 1px solid #334155;
	border-radius: 6px;
	overflow: hidden;
}

.panel-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 12px 16px;
	background: #334155;
	border-bottom: 1px solid #475569;
}

.panel-header h4 {
	margin: 0;
	font-size: 14px;
	font-weight: 600;
	color: #e2e8f0;
}

.device-count,
.point-count {
	font-size: 12px;
	color: #94a3b8;
	background: #1e293b;
	padding: 2px 8px;
	border-radius: 10px;
}

/* 搜索框 */
.search-box {
	padding: 12px 16px;
	border-bottom: 1px solid #334155;
}

.search-input {
	width: 100%;
	padding: 8px 12px;
	background: #0f172a;
	border: 1px solid #334155;
	border-radius: 4px;
	color: #e2e8f0;
	font-size: 13px;
	transition: all 0.2s;
}

.search-input:focus {
	outline: none;
	border-color: #3b82f6;
	box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-input::placeholder {
	color: #64748b;
}

/* 列表容器 */
.device-list,
.point-list {
	flex: 1;
	overflow-y: auto;
	padding: 8px;
}

/* 设备项 */
.device-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 12px;
	margin-bottom: 4px;
	background: #0f172a;
	border: 1px solid #334155;
	border-radius: 4px;
	cursor: pointer;
	transition: all 0.2s;
}

.device-item:hover {
	background: #1e293b;
	border-color: #3b82f6;
}

.device-item.active {
	background: rgba(59, 130, 246, 0.1);
	border-color: #3b82f6;
}

.device-item.offline {
	opacity: 0.6;
}

.device-info {
	flex: 1;
}

.device-name {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 13px;
	font-weight: 500;
	color: #e2e8f0;
	margin-bottom: 4px;
}

.status-dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: #64748b;
}

.status-dot.online {
	background: #10b981;
	box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
}

.status-dot.offline {
	background: #64748b;
}

.status-dot.error {
	background: #ef4444;
	box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
}

.device-meta {
	display: flex;
	gap: 12px;
	font-size: 11px;
	color: #94a3b8;
}

.device-code {
	font-family: monospace;
}

.device-arrow {
	font-size: 18px;
	color: #64748b;
	transition: all 0.2s;
}

.device-item:hover .device-arrow {
	color: #3b82f6;
	transform: translateX(2px);
}

/* 点位项 */
.point-item {
	padding: 12px;
	margin-bottom: 4px;
	background: #0f172a;
	border: 1px solid #334155;
	border-radius: 4px;
	cursor: pointer;
	transition: all 0.2s;
}

.point-item:hover {
	background: #1e293b;
	border-color: #3b82f6;
}

.point-item.active {
	background: rgba(59, 130, 246, 0.1);
	border-color: #3b82f6;
}

.point-item.disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.point-info {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.point-name {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 13px;
	font-weight: 500;
	color: #e2e8f0;
}

.access-mode {
	font-size: 10px;
	padding: 2px 6px;
	border-radius: 3px;
	font-weight: 400;
}

.access-mode.read {
	background: rgba(59, 130, 246, 0.2);
	color: #60a5fa;
}

.access-mode.write {
	background: rgba(239, 68, 68, 0.2);
	color: #f87171;
}

.access-mode.readWrite {
	background: rgba(16, 185, 129, 0.2);
	color: #34d399;
}

.point-meta {
	display: flex;
	gap: 12px;
	font-size: 11px;
	color: #94a3b8;
}

.point-code {
	font-family: monospace;
}

.point-unit {
	color: #3b82f6;
}

.point-type {
	background: #334155;
	padding: 2px 6px;
	border-radius: 3px;
}

.point-value {
	font-size: 12px;
	color: #94a3b8;
}

.point-value .value {
	color: #e2e8f0;
	font-weight: 500;
	margin: 0 4px;
}

.quality {
	font-size: 10px;
	padding: 2px 6px;
	border-radius: 3px;
	margin-left: 8px;
}

.quality.good {
	background: rgba(16, 185, 129, 0.2);
	color: #34d399;
}

.quality.bad {
	background: rgba(239, 68, 68, 0.2);
	color: #f87171;
}

.quality.uncertain {
	background: rgba(245, 158, 11, 0.2);
	color: #fbbf24;
}

/* 空状态 */
.empty-hint {
	text-align: center;
	padding: 40px 20px;
	color: #64748b;
	font-size: 13px;
}

/* 滚动条样式 */
.device-list::-webkit-scrollbar,
.point-list::-webkit-scrollbar {
	width: 6px;
}

.device-list::-webkit-scrollbar-track,
.point-list::-webkit-scrollbar-track {
	background: #0f172a;
}

.device-list::-webkit-scrollbar-thumb,
.point-list::-webkit-scrollbar-thumb {
	background: #334155;
	border-radius: 3px;
}

.device-list::-webkit-scrollbar-thumb:hover,
.point-list::-webkit-scrollbar-thumb:hover {
	background: #475569;
}
</style>
