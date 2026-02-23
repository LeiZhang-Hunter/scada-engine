<template>
	<!-- 使用与编辑模式完全相同的主题，画布尺寸使用配置值 -->
	<div class="scada-layout" data-scada-theme="dark" :style="layoutStyle">
		<div 
			class="canvas-container" 
			ref="canvasContainer"
			:style="containerStyle"
		>
			<!-- 空状态提示 -->
			<div v-if="!hasData" class="empty-state">
				<div class="empty-icon">📭</div>
				<div class="empty-text">暂无内容</div>
				<div class="empty-hint">请先在编辑模式下添加组件并保存</div>
			</div>
			
			<!-- 组件属性提示框（支持插槽自定义） -->
			<NodeTooltip
				:visible="tooltip.visible"
				:node="tooltip.node"
				:x="tooltip.x"
				:y="tooltip.y"
			>
				<!-- 用户可以在这里自定义提示框内容 -->
				<!-- 例如：
				<template #default="{ node, data, properties }">
					<div class="custom-tooltip">
						<h3>{{ data.name }}</h3>
						<p>{{ data.type }}</p>
					</div>
				</template>
				-->
			</NodeTooltip>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Graph } from '@antv/x6'
import { register } from '@antv/x6-vue-shape'
import * as ScadaComponents from '../../scada-components'
import type { ComponentConfig } from '../../scada-components/types'
import { applyEdgeAnimation } from '../../shared/utils/edgeAnimationUtils'
import NodeTooltip from './components/NodeTooltip.vue'

const canvasContainer = ref<HTMLElement>()
const hasData = ref(false)
const canvasConfig = ref<any>({
	width: 1920,
	height: 1080,
	background: {
		color: '#1e293b'
	}
})

// 提示框状态
const tooltip = ref<{
	visible: boolean
	node: any
	x: number
	y: number
}>({
	visible: false,
	node: null,
	x: 0,
	y: 0
})

let graph: Graph | null = null

// 动态计算样式，使用配置的画布尺寸
const layoutStyle = computed(() => ({
	width: `${canvasConfig.value.width}px`,
	height: `${canvasConfig.value.height}px`
}))

const containerStyle = computed(() => ({
	width: `${canvasConfig.value.width}px`,
	height: `${canvasConfig.value.height}px`
}))

onMounted(async () => {
	if (!canvasContainer.value) return
	
	// 预加载所有组件,确保组件已注册
	await ScadaComponents.componentRegistry.preloadAllComponents()
	console.log('组件预加载完成')
	
	// 注册所有 Vue Shape
	const allComponents = ScadaComponents.componentRegistry.getAllComponents()
	Object.values(allComponents).forEach((config) => {
		const componentConfig = config as ComponentConfig
		if (componentConfig.component) {
			try {
				register({
					shape: componentConfig.shape,
					width: componentConfig.width,
					height: componentConfig.height,
					component: componentConfig.component,
					ports: componentConfig.ports
				})
			} catch (error) {
				// 忽略重复注册错误
			}
		}
	})
	
	// 注册支持流动动画的边
	Graph.registerEdge('animated-edge', {
		inherit: 'edge',
		markup: [
			{
				tagName: 'path',
				selector: 'line',
				attrs: {
					fill: 'none'
				}
			},
			{
				tagName: 'path',
				selector: 'wrap',
				attrs: {
					fill: 'none',
					stroke: 'rgba(0,0,0,0)',
					strokeWidth: 20
				}
			},
			{
				tagName: 'circle',
				selector: 'circle'
			}
		],
		attrs: {
			line: {
				connection: true,
				stroke: '#10b981',
				strokeWidth: 2,
				targetMarker: {
					name: 'block',
					width: 8,
					height: 6
				}
			},
			wrap: {
				connection: true,
				strokeLinecap: 'round',
				strokeLinejoin: 'round'
			}
		}
	}, true)
	
	// 注册管道样式的边（具有立体感的管道效果）
	Graph.registerEdge('pipeline-edge', {
		inherit: 'edge',
		markup: [
			{
				tagName: 'path',
				selector: 'shadow',
				attrs: {
					fill: 'none'
				}
			},
			{
				tagName: 'path',
				selector: 'line',
				attrs: {
					fill: 'none'
				}
			},
			{
				tagName: 'path',
				selector: 'highlight',
				attrs: {
					fill: 'none'
				}
			},
			{
				tagName: 'path',
				selector: 'wrap',
				attrs: {
					fill: 'none',
					stroke: 'rgba(0,0,0,0)',
					strokeWidth: 20
				}
			},
			{
				tagName: 'circle',
				selector: 'circle'
			}
		],
		attrs: {
			shadow: {
				connection: true,
				stroke: '#1e293b',
				strokeWidth: 10,
				strokeLinecap: 'butt',
				strokeLinejoin: 'miter'
			},
			line: {
				connection: true,
				stroke: '#475569',
				strokeWidth: 8,
				strokeLinecap: 'butt',
				strokeLinejoin: 'miter',
				targetMarker: {
					name: 'block',
					width: 10,
					height: 8,
					fill: '#475569'
				}
			},
			highlight: {
				connection: true,
				stroke: '#94a3b8',
				strokeWidth: 3,
				strokeLinecap: 'butt',
				strokeLinejoin: 'miter',
				strokeDasharray: '0',
				strokeDashoffset: 0
			},
			wrap: {
				connection: true,
				strokeLinecap: 'butt',
				strokeLinejoin: 'miter'
			}
		}
	}, true)
	
	// 加载画布数据
	loadCanvasData()
})

const loadCanvasData = () => {
	try {
		const savedData = localStorage.getItem('scada-canvas-data')
		if (!savedData) {
			console.warn('localStorage 中没有找到画布数据')
			return
		}
		
		const data = JSON.parse(savedData)
		console.log('加载的原始数据:', data)
		
		// 加载画布配置
		if (data.config) {
			canvasConfig.value = {
				...canvasConfig.value,
				...data.config
			}
			console.log('画布配置:', canvasConfig.value)
		}
		
		// 创建 X6 画布实例
		if (!canvasContainer.value) return
		
		graph = new Graph({
			container: canvasContainer.value,
			width: canvasConfig.value.width,
			height: canvasConfig.value.height,
			background: canvasConfig.value.background.image ? {
				color: canvasConfig.value.background.color || '#1e293b',
				image: canvasConfig.value.background.image,
				size: canvasConfig.value.background.size || 'cover',
				repeat: canvasConfig.value.background.repeat || 'no-repeat',
				position: 'center'
			} : {
				color: canvasConfig.value.background.color || '#1e293b'
			},
			grid: canvasConfig.value.grid?.enabled ? {
				size: canvasConfig.value.grid.size,
				visible: true,
				type: canvasConfig.value.grid.type || 'dot',
				args: {
					color: canvasConfig.value.grid.color || '#475569',
					thickness: 1
				}
			} : false,
			// 预览模式：禁用编辑交互，但保留鼠标事件
			interacting: {
				nodeMovable: false,      // 禁止拖动节点
				edgeMovable: false,      // 禁止移动连线
				edgeLabelMovable: false, // 禁止移动连线标签
				arrowheadMovable: false, // 禁止移动箭头
				vertexMovable: false,    // 禁止移动路径点
				vertexAddable: false,    // 禁止添加路径点
				vertexDeletable: false   // 禁止删除路径点
			},
			panning: false,
			mousewheel: false
		})
			
		// 监听鼠标事件显示组件属性
		graph.on('node:mouseenter', ({ node, e }) => {
			console.log('[Preview] 鼠标进入组件:', node.id)
			const nodeData = node.getData()
			const properties: Array<{ label: string; value: any }> = []
					
			// 收集组件属性
			if (nodeData) {
				// ID
				if (nodeData.id) {
					properties.push({ label: 'ID', value: nodeData.id })
				}
						
				// 名称
				if (nodeData.name) {
					properties.push({ label: '名称', value: nodeData.name })
				}
						
				// 类型
				if (nodeData.type) {
					properties.push({ label: '类型', value: nodeData.type })
				}
						
				// SVG 组件的填充色
				if (nodeData.fill !== undefined) {
					properties.push({ label: '填充色', value: nodeData.fill })
				}
						
				// SVG 组件的边框色
				if (nodeData.stroke !== undefined) {
					properties.push({ label: '边框色', value: nodeData.stroke })
				}
						
				// 数据源
				if (nodeData.dataSource) {
					properties.push({ label: '数据源', value: nodeData.dataSource })
				}
						
				// 绑定配置
				if (nodeData.bindings && nodeData.bindings.length > 0) {
					properties.push({ label: '绑定数量', value: nodeData.bindings.length })
				}
						
				// 其他自定义属性（过滤掉已显示的和内部属性）
				const excludeKeys = ['id', 'name', 'type', 'fill', 'stroke', 'dataSource', 'bindings', 
					'presetBindings', 'internalAnimations', 'shape', 'ports', 'component']
				Object.keys(nodeData).forEach(key => {
					if (!excludeKeys.includes(key) && nodeData[key] !== undefined && nodeData[key] !== null) {
						let value = nodeData[key]
						if (typeof value === 'object') {
							value = JSON.stringify(value)
						}
						properties.push({ label: key, value })
					}
				})
			}
						
			console.log('[Preview] 显示属性:', { node: node.id, x: e.clientX, y: e.clientY })
					
			// 更新提示框
			tooltip.value = {
				visible: true,
				node: node,
				x: e.clientX,
				y: e.clientY
			}
		})
			
		// 鼠标移动时更新位置
		graph.on('node:mousemove', ({ e }) => {
			if (tooltip.value.visible) {
				tooltip.value.x = e.clientX
				tooltip.value.y = e.clientY
			}
		})
			
		// 鼠标离开时隐藏提示框
		graph.on('node:mouseleave', () => {
			tooltip.value.visible = false
		})
		
		// 清洗和验证 cells 数据
		if (data.cells && data.cells.length > 0) {
			console.log('🔍 完整的 cells 数据:', data.cells)
			
			// 验证每个 cell是否有 shape
			const validCells = data.cells.filter((cell: any, index: number) => {
				if (!cell.shape) {
					console.error(`Cell ${index} 缺少 shape 字段:`, cell)
					return false
				}
				console.log(`Cell ${index}:`, cell)
				return true
			})
			
			if (validCells.length === 0) {
				console.error('所有 cells 都缺少 shape 字段')
				return
			}
			
			graph.fromJSON({ cells: validCells })
			hasData.value = true
			console.log('画布数据加载成功，节点数:', graph.getNodes().length, '连线数:', graph.getEdges().length)
			
			// 恢复后，对所有启用了动画的连线应用动画
			graph.getEdges().forEach((edge: any) => {
				const edgeData = edge.getData()
				if (edgeData?.animation?.enabled) {
					applyEdgeAnimation(edge, edgeData.animation)
				}
			})
		}
	} catch (error) {
		console.error('加载画布数据失败:', error)
	}
}
</script>

<style scoped>
/* 预览模式：使用编辑模式的主题，画布尺寸由配置决定 */

/* 主容器 - 尺寸由 JS 动态设置（通过 layoutStyle） */
.scada-layout {
	display: flex;
	background: #0f172a;
	overflow: hidden;
}

/* 画布容器 - 尺寸由 JS 动态设置（通过 containerStyle） */
.canvas-container {
	position: relative;
	/* 预览模式：去掉编辑模式的边框和阴影 */
}

/* 空状态提示 */
.empty-state {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	text-align: center;
	color: #64748b;
}

.empty-icon {
	font-size: 64px;
	margin-bottom: 16px;
}

.empty-text {
	font-size: 18px;
	font-weight: 600;
	color: #94a3b8;
	margin-bottom: 8px;
}

.empty-hint {
	font-size: 14px;
	color: #64748b;
}
</style>
