<template>
	<div class="tab-pane">
		<!-- 数据来源 -->
		<div class="property-section">
			<h4>数据来源</h4>
			
			<div class="property-item-inline">
				<label>来源类型</label>
				<select :value="dataSource.type" @change="updateSourceType">
					<option value="none">无数据源</option>
					<option value="mqtt">MQTT</option>
					<option value="websocket">WebSocket</option>
					<option value="http">HTTP</option>
					<option value="sse">SSE</option>
					<option value="static">静态数据</option>
				</select>
			</div>
		</div>
		
		<!-- MQTT配置 -->
		<div v-if="dataSource.type === 'mqtt'" class="property-section">
			<h4>MQTT配置</h4>
			
			<div class="property-item-inline">
				<label>服务器</label>
				<input
					type="text"
					:value="dataSource.broker || ''"
					@input="updateField('broker', $event)"
					placeholder="mqtt://localhost:1883"
				/>
			</div>
			
			<div class="property-item-inline">
				<label>客户端ID</label>
				<input
					type="text"
					:value="dataSource.clientId || ''"
					@input="updateField('clientId', $event)"
					placeholder="自动生成"
				/>
			</div>
			
			<div class="property-item-inline">
				<label>订阅主题</label>
				<input
					type="text"
					:value="dataSource.topic || ''"
					@input="updateField('topic', $event)"
					placeholder="例如: sensor/temperature"
				/>
			</div>
			
			<div class="property-item-inline">
				<label>用户名</label>
				<input
					type="text"
					:value="dataSource.username || ''"
					@input="updateField('username', $event)"
					placeholder="可选"
				/>
			</div>
			
			<div class="property-item-inline">
				<label>密码</label>
				<input
					type="password"
					:value="dataSource.password || ''"
					@input="updateField('password', $event)"
					placeholder="可选"
				/>
			</div>
			
			<div class="property-item-inline">
				<label>数据路径</label>
				<input
					type="text"
					:value="dataSource.dataPath || ''"
					@input="updateField('dataPath', $event)"
					placeholder="例如: value"
				/>
			</div>
		</div>
		
		<!-- HTTP配置 -->
		<div v-if="dataSource.type === 'http'" class="property-section">
			<h4>HTTP配置</h4>
			
			<div class="property-item-inline">
				<label>接口地址</label>
				<input
					type="text"
					:value="dataSource.url || ''"
					@input="updateField('url', $event)"
					placeholder="https://api.example.com/data"
				/>
			</div>
			
			<div class="property-item-inline">
				<label>请求方法</label>
				<select :value="dataSource.method || 'GET'" @change="updateField('method', $event)">
					<option value="GET">GET</option>
					<option value="POST">POST</option>
					<option value="PUT">PUT</option>
					<option value="DELETE">DELETE</option>
				</select>
			</div>
			
			<div class="property-item-inline">
				<label>请求头</label>
				<input
					type="text"
					:value="dataSource.headers || ''"
					@input="updateField('headers', $event)"
					placeholder="JSON格式"
				/>
			</div>
			
			<div class="property-item-inline">
				<label>请求体</label>
				<input
					type="text"
					:value="dataSource.body || ''"
					@input="updateField('body', $event)"
					placeholder="POST/PUT请求的数据"
				/>
			</div>
			
			<div class="property-item-inline">
				<label>数据路径</label>
				<input
					type="text"
					:value="dataSource.dataPath || ''"
					@input="updateField('dataPath', $event)"
					placeholder="例如: data.value"
				/>
			</div>
			
			<div class="property-item-inline">
				<label>轮询间隔(ms)</label>
				<input
					type="number"
					:value="dataSource.pollInterval || 5000"
					@input="updateField('pollInterval', $event)"
					min="1000"
					step="1000"
				/>
			</div>
		</div>
		
		<!-- SSE配置 -->
		<div v-if="dataSource.type === 'sse'" class="property-section">
			<h4>SSE配置</h4>
			
			<div class="property-item-inline">
				<label>服务地址</label>
				<input
					type="text"
					:value="dataSource.sseUrl || ''"
					@input="updateField('sseUrl', $event)"
					placeholder="https://api.example.com/events"
				/>
			</div>
			
			<div class="property-item-inline">
				<label>事件类型</label>
				<input
					type="text"
					:value="dataSource.eventType || ''"
					@input="updateField('eventType', $event)"
					placeholder="留空表示所有事件"
				/>
			</div>
			
			<div class="property-item-inline">
				<label>请求头</label>
				<input
					type="text"
					:value="dataSource.headers || ''"
					@input="updateField('headers', $event)"
					placeholder="JSON格式"
				/>
			</div>
			
			<div class="property-item-inline">
				<label>数据路径</label>
				<input
					type="text"
					:value="dataSource.dataPath || ''"
					@input="updateField('dataPath', $event)"
					placeholder="例如: data.value"
				/>
			</div>
			
			<div class="property-item-inline">
				<label>自动重连</label>
				<div class="checkbox-wrapper">
					<input
						type="checkbox"
						:checked="dataSource.autoReconnect !== false"
						@change="updateCheckbox('autoReconnect', $event)"
					/>
					<span class="checkbox-label">{{ dataSource.autoReconnect !== false ? '是' : '否' }}</span>
				</div>
			</div>
		</div>
		
		<!-- WebSocket配置 -->
		<div v-if="dataSource.type === 'websocket'" class="property-section">
			<h4>WebSocket配置</h4>
			
			<div class="property-item-inline">
				<label>服务地址</label>
				<input
					type="text"
					:value="dataSource.wsUrl || ''"
					@input="updateField('wsUrl', $event)"
					placeholder="ws://localhost:8080"
				/>
			</div>
			
			<div class="property-item-inline">
				<label>订阅主题</label>
				<input
					type="text"
					:value="dataSource.topic || ''"
					@input="updateField('topic', $event)"
					placeholder="例如: device/status"
				/>
			</div>
			
			<div class="property-item-inline">
				<label>数据路径</label>
				<input
					type="text"
					:value="dataSource.dataPath || ''"
					@input="updateField('dataPath', $event)"
					placeholder="例如: payload.value"
				/>
			</div>
		</div>
		
		<!-- 静态数据配置 -->
		<div v-if="dataSource.type === 'static'" class="property-section">
			<h4>静态数据配置</h4>
			
			<div class="property-item-inline">
				<label>数据值</label>
				<input
					type="text"
					:value="dataSource.value || ''"
					@input="updateField('value', $event)"
					placeholder="请输入数据值"
				/>
			</div>
			
			<div class="property-item-inline">
				<label>数据类型</label>
				<select :value="dataSource.valueType || 'string'" @change="updateField('valueType', $event)">
					<option value="string">字符串</option>
					<option value="number">数字</option>
					<option value="boolean">布尔值</option>
					<option value="json">JSON对象</option>
				</select>
			</div>
		</div>
		
		<!-- 公共配置 -->
		<div v-if="dataSource.type !== 'none'" class="property-section">
			<h4>通用配置</h4>
			
			<div class="property-item-inline">
				<label>启用状态</label>
				<div class="checkbox-wrapper">
					<input
						type="checkbox"
						:checked="dataSource.enabled !== false"
						@change="updateEnabled"
					/>
					<span class="checkbox-label">{{ dataSource.enabled !== false ? '启用' : '禁用' }}</span>
				</div>
			</div>
			
			<div class="property-item-inline">
				<label>错误重试</label>
				<input
					type="number"
					:value="dataSource.retryCount || 3"
					@input="updateField('retryCount', $event)"
					min="0"
					max="10"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Node } from '@antv/x6'

interface DataSource {
	type: string
	// MQTT
	broker?: string
	clientId?: string
	topic?: string
	username?: string
	password?: string
	// WebSocket
	wsUrl?: string
	// HTTP
	url?: string
	method?: string
	headers?: string
	body?: string
	pollInterval?: number
	// SSE
	sseUrl?: string
	eventType?: string
	autoReconnect?: boolean
	// 公共
	dataPath?: string
	// 静态数据
	value?: string
	valueType?: string
	// 公共配置
	enabled?: boolean
	retryCount?: number
}

interface Props {
	selectedNode: Node
}

const props = defineProps<Props>()

const emit = defineEmits<{
	'update-data-source': [source: DataSource]
}>()

// 数据源配置
const dataSource = ref<DataSource>({
	type: 'none',
	enabled: true,
	retryCount: 3
})

// 从节点数据初始化
watch(() => props.selectedNode, (node) => {
	if (node) {
		const nodeData = node.getData()
		if (nodeData?.dataSource) {
			dataSource.value = { ...nodeData.dataSource }
		} else {
			dataSource.value = {
				type: 'none',
				enabled: true,
				retryCount: 3
			}
		}
	}
}, { immediate: true })

// 更新来源类型
const updateSourceType = (event: Event) => {
	const value = (event.target as HTMLSelectElement).value
	// 根据类型设置默认配置
	let defaultConfig: Partial<DataSource> = {
		type: value,
		enabled: true,
		retryCount: 3
	}
	
	if (value === 'http') {
		defaultConfig.pollInterval = 5000
		defaultConfig.method = 'GET'
	} else if (value === 'sse') {
		defaultConfig.autoReconnect = true
	}
	
	dataSource.value = defaultConfig as DataSource
	emitUpdate()
}

// 更新字段
const updateField = (field: string, event: Event) => {
	const target = event.target as HTMLInputElement | HTMLSelectElement
	let value: any
	
	if (target.type === 'number') {
		value = Number(target.value)
	} else {
		value = target.value
	}
	
	dataSource.value = {
		...dataSource.value,
		[field]: value
	}
	emitUpdate()
}

// 更新复选框
const updateCheckbox = (field: string, event: Event) => {
	const checked = (event.target as HTMLInputElement).checked
	dataSource.value = {
		...dataSource.value,
		[field]: checked
	}
	emitUpdate()
}

// 更新启用状态
const updateEnabled = (event: Event) => {
	const checked = (event.target as HTMLInputElement).checked
	dataSource.value = {
		...dataSource.value,
		enabled: checked
	}
	emitUpdate()
}

// 发送更新事件
const emitUpdate = () => {
	emit('update-data-source', dataSource.value)
}
</script>

<style scoped>
.tab-pane {
	animation: fadeIn 0.2s;
}

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(-4px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.property-section {
	margin-bottom: 16px;
}

.property-section h4 {
	font-size: 12px;
	color: #94a3b8;
	margin-bottom: 8px;
	font-weight: 600;
}

/* 单行显示样式 */
.property-item-inline {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 8px;
}

.property-item-inline label {
	flex-shrink: 0;
	width: 70px;
	font-size: 11px;
	color: #cbd5e1;
	margin-bottom: 0;
}

.property-item-inline input,
.property-item-inline select {
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

.property-item-inline input:focus,
.property-item-inline select:focus {
	outline: none;
	border-color: #3b82f6;
	box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.property-item-inline input:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

/* 复选框样式 */
.property-item-inline .checkbox-wrapper {
	flex: 1;
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 0;
}

.checkbox-wrapper input[type="checkbox"] {
	width: 18px;
	height: 18px;
	cursor: pointer;
	accent-color: #3b82f6;
}

.checkbox-label {
	font-size: 12px;
	color: #cbd5e1;
}
</style>
