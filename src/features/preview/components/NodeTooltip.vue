<template>
	<div 
		v-if="visible" 
		class="component-tooltip"
		:style="tooltipStyle"
	>
		<!-- 插槽：允许用户完全自定义内容 -->
		<slot 
			:node="node"
			:data="nodeData"
			:properties="properties"
		>
			<!-- 默认内容：如果用户不提供插槽，显示默认样式 -->
			<div class="tooltip-title">{{ title }}</div>
			<div class="tooltip-content">
				<div v-for="item in properties" :key="item.label" class="tooltip-item">
					<span class="tooltip-label">{{ item.label }}:</span>
					<span class="tooltip-value">{{ item.value }}</span>
				</div>
			</div>
		</slot>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Node } from '@antv/x6'

interface Props {
	visible: boolean
	node: Node | null
	x: number
	y: number
	offset?: { x: number; y: number }
}

const props = withDefaults(defineProps<Props>(), {
	offset: () => ({ x: 15, y: 15 })
})

// 获取节点数据
const nodeData = computed(() => props.node?.getData() || {})

// 标题
const title = computed(() => {
	return nodeData.value?.name || nodeData.value?.type || '组件属性'
})

// 收集属性
const properties = computed(() => {
	const data = nodeData.value
	const result: Array<{ label: string; value: any }> = []
	
	if (!data) return result
	
	// ID
	if (data.id) {
		result.push({ label: 'ID', value: data.id })
	}
	
	// 名称
	if (data.name) {
		result.push({ label: '名称', value: data.name })
	}
	
	// 类型
	if (data.type) {
		result.push({ label: '类型', value: data.type })
	}
	
	// SVG 组件的填充色
	if (data.fill !== undefined) {
		result.push({ label: '填充色', value: data.fill })
	}
	
	// SVG 组件的边框色
	if (data.stroke !== undefined) {
		result.push({ label: '边框色', value: data.stroke })
	}
	
	// 数据源
	if (data.dataSource) {
		result.push({ label: '数据源', value: data.dataSource })
	}
	
	// 绑定配置
	if (data.bindings && data.bindings.length > 0) {
		result.push({ label: '绑定数量', value: data.bindings.length })
	}
	
	// 其他自定义属性（过滤掉已显示的和内部属性）
	const excludeKeys = ['id', 'name', 'type', 'fill', 'stroke', 'dataSource', 'bindings', 
		'presetBindings', 'internalAnimations', 'shape', 'ports', 'component']
	Object.keys(data).forEach(key => {
		if (!excludeKeys.includes(key) && data[key] !== undefined && data[key] !== null) {
			let value = data[key]
			if (typeof value === 'object') {
				value = JSON.stringify(value)
			}
			result.push({ label: key, value })
		}
	})
	
	return result
})

// 提示框样式
const tooltipStyle = computed(() => ({
	left: `${props.x + props.offset.x}px`,
	top: `${props.y + props.offset.y}px`
}))
</script>

<style scoped>
/* 组件属性提示框 */
.component-tooltip {
	position: fixed;
	background: rgba(15, 23, 42, 0.95);
	border: 1px solid #334155;
	border-radius: 8px;
	padding: 12px;
	min-width: 200px;
	max-width: 400px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
	z-index: 10000;
	pointer-events: none;
	backdrop-filter: blur(10px);
}

.tooltip-title {
	font-size: 14px;
	font-weight: 600;
	color: #f1f5f9;
	margin-bottom: 8px;
	padding-bottom: 8px;
	border-bottom: 1px solid #334155;
}

.tooltip-content {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.tooltip-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 12px;
	gap: 12px;
}

.tooltip-label {
	color: #94a3b8;
	white-space: nowrap;
}

.tooltip-value {
	color: #e2e8f0;
	font-weight: 500;
	text-align: right;
	word-break: break-all;
	max-width: 250px;
}
</style>
