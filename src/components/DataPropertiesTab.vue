<template>
	<div class="compact-data-binding">
		<!-- 数据源选择 -->
		<div class="compact-row">
			<label>数据源</label>
			<select :value="selectedDataSourceId" @change="handleDataSourceChange" class="compact-select">
				<option value="">无</option>
				<option 
					v-for="ds in dataSources" 
					:key="ds.id" 
					:value="ds.id"
				>
					{{ ds.name }}
				</option>
			</select>
			<span v-if="selectedDataSourceId" :class="['status-dot', currentDataSource?.status?.connected ? 'connected' : 'disconnected']" :title="currentDataSource?.status?.connected ? '已连接' : '未连接'"></span>
		</div>
		
		<!-- 设备选择 -->
		<div v-if="selectedDataSourceId && availableDevices.length > 0" class="compact-row">
			<label>选择设备</label>
			<select :value="selectedDeviceId" @change="handleDeviceChange" class="compact-select">
				<option value="">请选择</option>
				<option 
					v-for="device in availableDevices" 
					:key="device.id" 
					:value="device.id"
				>
					{{ device.name }} ({{ device.points.length }})
				</option>
			</select>
		</div>
		
		<!-- 提示信息 -->
		<div v-if="!selectedDataSourceId" class="compact-hint">
			💡 请先配置数据源
		</div>
		
		<div v-else-if="availableDevices.length === 0" class="compact-hint">
			ℹ️ 该数据源尚无设备数据
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch, inject } from 'vue'
import type { Node } from '@antv/x6'
import { dataSourceManager, type DataSource } from '../services/dataSourceManager'

interface Props {
	selectedNode: Node
}

const props = defineProps<Props>()

const emit = defineEmits<{
	'update-data-source': [config: { dataSourceId: string; deviceId: string }]
}>()

// 获取所有数据源
const dataSources = computed(() => dataSourceManager.getAllDataSources())

// 当前选择的数据源ID
const selectedDataSourceId = ref<string>('')

// 当前选择的设备ID
const selectedDeviceId = ref<string>('')

// 当前数据源
const currentDataSource = computed(() => {
	if (!selectedDataSourceId.value) return null
	return dataSourceManager.getDataSource(selectedDataSourceId.value)
})

// 可用设备列表
const availableDevices = computed(() => {
	if (!currentDataSource.value) return []
	return currentDataSource.value.devices || []
})

// 当前设备
const currentDevice = computed(() => {
	if (!selectedDeviceId.value || !availableDevices.value) return null
	return availableDevices.value.find(d => d.id === selectedDeviceId.value)
})

// 从节点数据初始化
watch(() => props.selectedNode, (node) => {
	if (node) {
		const nodeData = node.getData()
		if (nodeData?.dataBinding) {
			selectedDataSourceId.value = nodeData.dataBinding.dataSourceId || ''
			selectedDeviceId.value = nodeData.dataBinding.deviceId || ''
		} else {
			selectedDataSourceId.value = ''
			selectedDeviceId.value = ''
		}
	}
}, { immediate: true })

// 处理数据源变化
const handleDataSourceChange = (event: Event) => {
	const value = (event.target as HTMLSelectElement).value
	selectedDataSourceId.value = value
	selectedDeviceId.value = '' // 清空设备选择
	emitUpdate()
}

// 处理设备变化
const handleDeviceChange = (event: Event) => {
	const value = (event.target as HTMLSelectElement).value
	selectedDeviceId.value = value
	emitUpdate()
}

// 发送更新事件
const emitUpdate = () => {
	emit('update-data-source', {
		dataSourceId: selectedDataSourceId.value,
		deviceId: selectedDeviceId.value
	})
}
</script>

<style scoped>
/* 紧凑布局 */
.compact-data-binding {
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: 0;
}

.compact-row {
	display: flex;
	align-items: center;
	gap: 8px;
}

.compact-row label {
	flex-shrink: 0;
	width: 70px;
	font-size: 11px;
	color: #cbd5e1;
	font-weight: 500;
}

.compact-select {
	flex: 1;
	min-width: 0;
	padding: 6px 10px;
	background: #0f172a;
	border: 1px solid #334155;
	border-radius: 4px;
	color: #e2e8f0;
	font-size: 12px;
	transition: all 0.2s;
}

.compact-select:focus {
	outline: none;
	border-color: #3b82f6;
	box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* 状态点 */
.status-dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	flex-shrink: 0;
	cursor: help;
}

.status-dot.connected {
	background: #22c55e;
	box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
}

.status-dot.disconnected {
	background: #ef4444;
	box-shadow: 0 0 8px rgba(239, 68, 68, 0.3);
}

/* 提示信息 */
.compact-hint {
	padding: 8px 12px;
	background: rgba(59, 130, 246, 0.1);
	border: 1px solid rgba(59, 130, 246, 0.2);
	border-radius: 4px;
	font-size: 11px;
	color: #94a3b8;
	text-align: center;
}
</style>
