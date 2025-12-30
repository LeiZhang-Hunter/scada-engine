<template>
	<div class="event-card">
		<div class="event-card-header" @click="$emit('toggle-collapse')">
			<div class="header-left">
				<span class="collapse-icon">{{ isCollapsed ? '▶' : '▼' }}</span>
				<span class="event-title">事件{{ index + 1 }}</span>
			</div>
			<button 
				class="btn-remove" 
				@click.stop="$emit('remove')" 
				title="删除事件"
			>🗑</button>
		</div>

		<!-- 事件配置内容 -->
		<div v-show="!isCollapsed" class="event-card-body">
			<!-- 事件名称 -->
			<div class="event-field">
				<label>事件名称</label>
				<input
					type="text"
					:value="event.name || ''"
					@input="$emit('update-field', 'name', $event)"
					placeholder="输入事件名称，如：温度报警、湿度预警"
				/>
			</div>
			
			<!-- 事件类型 -->
			<div class="event-field">
				<label>事件类型</label>
				<select :value="event.type" @change="$emit('update-field', 'type', $event)">
					<option value="click">单击</option>
					<option value="dblclick">双击</option>
					<option value="mouseenter">鼠标移入</option>
					<option value="mouseleave">鼠标移出</option>
					<option value="focus">获取焦点</option>
					<option value="blur">失去焦点</option>
					<option value="input">输入</option>
					<option value="change">值变化</option>
				</select>
			</div>

			<!-- 事件行为 -->
			<div class="event-field">
				<label>事件行为</label>
				<select :value="event.action" @change="$emit('update-field', 'action', $event)">
					<option value="attributeChange">更改属性</option>
					<option value="customCode">自定义代码</option>
					<option value="callProcess">调用流程</option>
				</select>
			</div>

			<!-- 形参配置 -->
			<div class="section-title">形参配置</div>
			<div class="field-hint">（不填直接触发）</div>
			
			<!-- 触发规则 -->
			<div class="section-title">触发规则</div>
			<div class="field-hint">（不填写条件则直接触发，填写后按条件触发）</div>
			
			<!-- 条件配置 -->
			<div class="condition-config">
				<div class="condition-label">当</div>
				
				<div class="condition-label">当前节点属性</div>
				<select class="condition-select" :value="event.condition?.attribute || ''" @change="$emit('update-condition', 'attribute', $event)">
					<option value="">选择属性</option>
					<option v-for="attr in nodeProperties" :key="attr.key" :value="attr.key">
						{{ attr.label }}
					</option>
				</select>
				
				<div class="condition-label">运算符</div>
				<select class="condition-select" :value="event.condition?.operator || '=='" @change="$emit('update-condition', 'operator', $event)">
					<option value="==">等于</option>
					<option value="!=">不等于</option>
					<option value=">">大于</option>
					<option value=">=">大于等于</option>
					<option value="<">小于</option>
					<option value="<=">小于等于</option>
					<option value="contains">包含</option>
				</select>
				
				<div class="condition-label">值</div>
				<input 
					type="text" 
					class="condition-input"
					:value="event.condition?.value || ''"
					@input="$emit('update-condition', 'value', $event)"
					placeholder="输入值"
				/>
				
				<div class="condition-label">时</div>
				<div class="condition-label">触发该事件</div>
			</div>

			<!-- 更改属性配置 -->
			<div v-if="event.action === 'attributeChange'" class="config-section">
				<div class="section-title">属性更改</div>
				<button class="btn-config" @click="$emit('open-attribute-config')">点击配置</button>
			</div>

			<!-- 自定义代码配置 -->
			<div v-if="event.action === 'customCode'" class="config-section">
				<div class="section-title">自定义代码</div>
				<button class="btn-config" @click="$emit('open-custom-code')">点击配置</button>
			</div>

			<!-- 调用流程配置 -->
			<div v-if="event.action === 'callProcess'" class="config-section">
				<div class="section-title">调用流程</div>
				<button class="btn-config" @click="$emit('open-workflow-selector')">选择流程</button>
				<div v-if="event.params?.processId" class="selected-workflow-info">
					<div class="info-row">
						<span class="info-label">已选择:</span>
						<span class="info-value">{{ event.params?.processName || event.params?.processId }}</span>
					</div>
					<div class="event-field">
						<label>传入参数</label>
						<textarea
							:value="event.params?.processParams || ''"
							@input="$emit('update-params', 'processParams', $event)"
							placeholder='JSON格式: {"param1":"value1","param2":"value2"}'
							rows="3"
						></textarea>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
interface EventConfig {
	name?: string
	type: string
	conditionType: string
	triggerRule?: string
	condition?: {
		attribute?: string
		operator?: string
		value?: string
		[key: string]: any
	}
	action: string
	params?: {
		processId?: string
		processName?: string
		processParams?: string
		[key: string]: any
	}
}

interface NodeProperty {
	key: string
	label: string
	type: string
}

defineProps<{
	event: EventConfig
	index: number
	isCollapsed: boolean
	nodeProperties: NodeProperty[]
}>()

defineEmits<{
	'toggle-collapse': []
	'remove': []
	'update-field': [field: string, event: Event]
	'update-condition': [field: string, event: Event]
	'update-params': [field: string, event: Event]
	'open-attribute-config': []
	'open-custom-code': []
	'open-workflow-selector': []
}>()
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

.event-field {
	display: flex;
	flex-direction: column;
	gap: 6px;
	margin-bottom: 12px;
}

.event-field:last-child {
	margin-bottom: 0;
}

.event-field label {
	font-size: 12px;
	color: #cbd5e1;
	font-weight: 500;
}

.event-field input,
.event-field select,
.event-field textarea {
	width: 100%;
	padding: 8px 12px;
	background: #1e293b;
	border: 1px solid #334155;
	border-radius: 4px;
	color: #e2e8f0;
	font-size: 13px;
	transition: all 0.2s;
}

.event-field input:focus,
.event-field select:focus,
.event-field textarea:focus {
	outline: none;
	border-color: #3b82f6;
	box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.section-title {
	font-size: 12px;
	color: #94a3b8;
	margin-top: 12px;
	margin-bottom: 8px;
	font-weight: 500;
}

.section-title:first-child {
	margin-top: 0;
}

.field-hint {
	font-size: 11px;
	color: #64748b;
	margin-top: 2px;
}

.condition-config {
	display: flex;
	flex-direction: column;
	gap: 8px;
	margin-top: 8px;
	padding: 12px;
	background: #1e293b;
	border-radius: 4px;
}

.condition-label {
	font-size: 12px;
	color: #cbd5e1;
}

.condition-select,
.condition-input {
	width: 100%;
	padding: 8px 12px;
	background: #0f172a;
	border: 1px solid #334155;
	border-radius: 4px;
	color: #e2e8f0;
	font-size: 13px;
	transition: all 0.2s;
}

.condition-select:focus,
.condition-input:focus {
	outline: none;
	border-color: #3b82f6;
	box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.config-section {
	margin-top: 16px;
	padding: 12px;
	background: #0f172a;
	border-radius: 4px;
}

.btn-config {
	width: 100%;
	padding: 8px 12px;
	background: #1e293b;
	border: 1px solid #334155;
	border-radius: 4px;
	color: #e2e8f0;
	cursor: pointer;
	font-size: 13px;
	transition: all 0.2s;
}

.btn-config:hover {
	background: #334155;
	border-color: #3b82f6;
}

.selected-workflow-info {
	margin-top: 12px;
	padding: 12px;
	background: #1e293b;
	border-radius: 4px;
}

.info-row {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 12px;
}

.info-label {
	font-size: 12px;
	color: #94a3b8;
}

.info-value {
	font-size: 13px;
	color: #10b981;
	font-weight: 500;
}
</style>
