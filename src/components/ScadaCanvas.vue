<!--
/**
 * Copyright (c) 2025 leoncheng
 * 
 * This source code is licensed under the proprietary license found in the
 * LICENSE file in the root directory of this source tree.
 * 
 * @author leoncheng
 * @email nywqs@outlook.com
 */
-->
<template>
	<div class="scada-layout" data-scada-theme="dark">
		<!-- 编辑模式下显示 Header -->
		<Header
			v-if="!props.previewMode"
			:selected-nodes-count="selectedNodesCount"
			@save="handleSave"
			@import="handleImport"
			@workflow="handleWorkflow"
			@data-source="handleDataSource"
			@preview="handlePreview"
			@export="handleExport"
			@zoom-in="zoomIn"
			@zoom-out="zoomOut"
			@clear-all="clearAll"
			@align-left="alignLeft"
			@align-center="alignCenter"
			@align-right="alignRight"
			@align-top="alignTop"
			@align-middle="alignMiddle"
			@align-bottom="alignBottom"
			@distribute-horizontal="distributeHorizontal"
			@distribute-vertical="distributeVertical"
		/>

		<!-- 隐藏的文件输入框，用于导入 -->
		<input
			v-if="!props.previewMode"
			ref="fileInputRef"
			type="file"
			accept=".json"
			style="display: none"
			@change="handleFileSelect"
		/>

		<!-- 主体区域 -->
		<div class="scada-canvas-container">
			<!-- 左侧组件库（仅编辑模式） -->
			<ComponentLibrary
				v-if="!props.previewMode"
				:is-collapsed="leftPanelCollapsed"
				@update:collapsed="leftPanelCollapsed = $event"
				@add-component="handleAddNode"
			/>

			<!-- 中间画布区域 -->
			<CanvasArea
				ref="canvasAreaRef"
			/>

			<!-- 右侧属性面板（仅编辑模式） -->
			<PropertyPanel
				v-if="!props.previewMode"
				ref="propertyPanelRef"
				:selected-node="selectedNode"
				:selected-edge="selectedEdge"
				:device-data="mergedDeviceData"
				:is-collapsed="rightPanelCollapsed"
				@update:collapsed="rightPanelCollapsed = $event"
				@update-node="handleUpdateNode"
				@delete-node="handleDeleteNode"
				@update-edge="handleUpdateEdge"
				@delete-edge="handleDeleteEdge"
			/>
		</div>
		
		<!-- 底部 -->
		<Footer :auth-code="authCode" :custom-footer="customFooter" />
		
		<!-- 流程编排弹窗（仅编辑模式） -->
		<WorkflowDialog 
			v-if="!props.previewMode"
			v-model:visible="showWorkflowDialog"
			:scada-graph="graph"
			@close="showWorkflowDialog = false"
		/>
		
		<!-- 数据源管理对话框（仅编辑模式） -->
		<DataSourceDialog
			v-if="showDataSourceDialog && !props.previewMode"
			:data-sources="dataSources"
			@close="showDataSourceDialog = false"
			@add="handleAddDataSource"
			@save="handleSaveDataSource"
			@delete="handleDeleteDataSource"
		/>
		
		<!-- 右键菜单（仅编辑模式） -->
		<ContextMenu
			v-if="!props.previewMode"
			v-model:visible="contextMenu.visible"
			:position="contextMenu.position"
			:menu-items="contextMenu.items"
			@menu-click="handleContextMenuClick"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed, provide } from 'vue'
import { Graph } from '@antv/x6'
import { Selection } from '@antv/x6-plugin-selection'
import { Snapline } from '@antv/x6-plugin-snapline'
import { register } from '@antv/x6-vue-shape'
import Header from './Header.vue'
import ComponentLibrary from './ComponentLibrary.vue'
import CanvasArea from './CanvasArea.vue'
import PropertyPanel from './PropertyPanel.vue'
import Footer from './Footer.vue'
import WorkflowDialog from '../views/workflow/WorkflowDialog.vue'
import DataSourceDialog from './DataSourceDialog.vue'
import ContextMenu from './ContextMenu.vue'
import type { MenuItem } from './ContextMenu.vue'
import { componentRegistry, canvasConfigManager } from '../scada-components'
import {
	saveToLocal,
	loadFromLocal,
	removeFromLocal,
	STORAGE_KEYS,
	exportToJSON,
	showMessage,
	randomPosition,
	formatTimestamp,
	getCurrentTimestamp
} from '../utils'
import { animationEngine } from '../utils/animationEngine'
import { dataSourceManager, type DataSource } from '../services/dataSourceManager'

// 明确组件选项
defineOptions({
	name: 'ScadaCanvas',
	inheritAttrs: true
})

// 定义接口类型
interface CustomFooterConfig {
	copyright?: string
	license?: string
	contact?: string
}

interface ScadaCanvasProps {
	authCode?: string // 软件授权码
	customFooter?: CustomFooterConfig // 自定义 Footer 配置
	previewMode?: boolean // 预览模式
	onSave?: (() => void) | (() => Promise<void>) // 自定义保存回调
	deviceData?: any // 设备数据
	dataSource?: any // 数据源配置
}

const props = withDefaults(defineProps<ScadaCanvasProps>(), {
	authCode: '',
	customFooter: undefined,
	previewMode: false,
	onSave: undefined,
	deviceData: () => ({}),
	dataSource: () => ({})
})

// 定义 emit 事件
const emit = defineEmits(['preview'])

const canvasAreaRef = ref<any>(null)
const selectedNode = ref<any>(null)
const selectedEdge = ref<any>(null)
const selectedNodesCount = ref<number>(0) // 选中节点数量
const fileInputRef = ref<HTMLInputElement | null>(null)
const showWorkflowDialog = ref(false)
const showDataSourceDialog = ref(false)  // 数据源管理对话框
const leftPanelCollapsed = ref(false)  // 左侧面板折叠状态
const rightPanelCollapsed = ref(false) // 右侧面板折叠状态
let graph: Graph | null = null

// 右键菜单状态
const contextMenu = ref<{
	visible: boolean
	position: { x: number; y: number }
	items: MenuItem[]
	targetCell: any
}>({
	visible: false,
	position: { x: 0, y: 0 },
	items: [],
	targetCell: null
})

// 数据源列表
const dataSources = ref<DataSource[]>([])

// 合并外部和数据源的 deviceData
const mergedDeviceData = computed(() => {
	// 优先使用外部传入的 deviceData
	if (props.deviceData && Object.keys(props.deviceData).length > 0) {
		return props.deviceData
	}
	
	// 否则使用数据源管理器中的数据
	const devices = dataSourceManager.getAllDevices().map(item => ({
		...item.device,
		_dataSourceId: item.dataSourceId,
		_dataSourceName: item.dataSourceName
	}))
	
	return { devices }
})

// 自动计算适合的缩放比例
const calculateFitScale = () => {
	const canvasArea = canvasAreaRef.value?.containerRef?.parentElement
	if (!canvasArea) return 1
	
	const canvasConfig = canvasConfigManager.getConfig()
	const canvasWidth = canvasConfig.size.width
	const canvasHeight = canvasConfig.size.height
	
	const areaWidth = canvasArea.clientWidth
	const areaHeight = canvasArea.clientHeight
	
	// 留出一些边距（40px）
	const padding = 40
	const availableWidth = areaWidth - padding
	const availableHeight = areaHeight - padding
	
	// 计算宽度和高度的缩放比例
	const scaleX = availableWidth / canvasWidth
	const scaleY = availableHeight / canvasHeight
	
	// 取较小的比例，确保画布完全可见
	const autoScale = Math.min(scaleX, scaleY, 1) // 最大不超过1（100%）
	
	return autoScale
}

onMounted(() => {
	if (!canvasAreaRef.value?.containerRef) return

	// 获取画布配置
	const canvasConfig = canvasConfigManager.getConfig()

	// 响应式处理：小屏幕时默认折叠侧边栏
	const handlePanelResize = () => {
		const width = window.innerWidth
		if (width < 1024) {
			// 小屏幕：自动折叠两侧面板
			leftPanelCollapsed.value = true
			rightPanelCollapsed.value = true
		} else if (width < 1440) {
			// 中等屏幕：只折叠左侧面板
			leftPanelCollapsed.value = true
			rightPanelCollapsed.value = false
		}
		// 大屏幕：保持当前状态
	}

	// 初始化时检查屏幕尺寸
	handlePanelResize()

	// 监听窗口大小变化
	window.addEventListener('resize', handlePanelResize)

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

	// ========== 动态注册 Vue 组件 ==========
	// 遍历组件注册表，自动注册所有包含 Vue 组件的配置
	const allComponents = componentRegistry.getAllComponents()
	Object.values(allComponents).forEach((config) => {
		// 只注册包含 component 字段的组件（Vue Shape）
		if (config.component) {
			register({
				shape: config.shape,
				width: config.width,
				height: config.height,
				component: config.component,
				ports: config.ports
			})
		}
	})

	// 初始化 X6 画布
	const container = canvasAreaRef.value.containerRef
	
	// 使用配置中的画布尺寸
	const canvasWidth = canvasConfig.size.width
	const canvasHeight = canvasConfig.size.height
	
	// 设置容器尺寸和缩放
	const updateContainerTransform = (scale: number) => {
		// 设置容器的基础尺寸
		container.style.width = `${canvasWidth}px`
		container.style.height = `${canvasHeight}px`
		// 使用 transform 缩放
		container.style.transform = `scale(${scale})`
		container.style.transformOrigin = 'center center'
		// 同步更新配置中的缩放值
		canvasConfigManager.updateByPath('zoom.scale', Number(scale.toFixed(2)))
	}
	
	// 应用初始自适应缩放
	const initialScale = calculateFitScale()
	updateContainerTransform(initialScale)
	
	// 监听窗口大小变化，自动调整缩放
	const handleResize = () => {
		const fitScale = calculateFitScale()
		updateContainerTransform(fitScale)
	}
	
	window.addEventListener('resize', handleResize)
	
	// 创建画布实例
	graph = new Graph({
		container: container,
		// 使用配置中的画布尺寸
		width: canvasWidth,
		height: canvasHeight,
		background: canvasConfig.background.image ? {
			color: canvasConfig.background.color || '#1e293b',
			image: canvasConfig.background.image,
			size: canvasConfig.background.size || 'cover',
			repeat: canvasConfig.background.repeat || 'no-repeat',
			position: 'center'
		} : {
			color: canvasConfig.background.color || '#1e293b'
		},
		grid: canvasConfig.grid.enabled ? {
			size: canvasConfig.grid.size,
			visible: true,
			type: canvasConfig.grid.type || 'dot',
			args: {
				color: canvasConfig.grid.color || '#475569',
				thickness: 1
			}
		} : false,
		// 启用节点交互（预览模式下禁止编辑）
		interacting: {
			nodeMovable: !props.previewMode // 预览模式不允许移动节点
		},
		panning: {
			enabled: true,
			modifiers: 'shift'
		},
		mousewheel: {
			enabled: true,
			modifiers: ['ctrl', 'meta']
		},
		connecting: {
			router: {
				name: 'orth',
				args: {
					padding: 10
				}
			},
			connector: {
				name: 'rounded',
				args: {
					radius: 8
				}
			},
			snap: canvasConfig.magnetism.enabled ? {
				radius: canvasConfig.magnetism.threshold || 10
			} : false,
			allowBlank: false,
			allowLoop: false,
			allowNode: false,
			allowEdge: false,
			highlight: true,
			// 创建连线时的样式
			createEdge() {
				return graph!.createEdge({
					shape: 'animated-edge',
					zIndex: 0
				})
			},
			validateConnection({ targetMagnet }) {
				return !!targetMagnet
			}
		}
	})

	// 使用插件:选择插件（仅编辑模式）
	if (!props.previewMode) {
		graph.use(
			new Selection({
				enabled: true,
				movable: true, // 允许选中的节点移动
				rubberband: true, // 启用框选
				showNodeSelectionBox: false, // 不显示选择框
				showEdgeSelectionBox: false, // 不显示默认的边选择框（使用自定义样式）
				multiple: true, // 多选模式
				pointerEvents: 'none' // 不阻止鼠标事件
			})
		)
	}

	// 使用插件：对齐参考线
	if (canvasConfig.guides.enabled) {
		graph.use(
			new Snapline({
				enabled: true,
				sharp: true,
				clean: true
			})
		)
	}

	// 不需要再应用初始缩放，因为容器已经根据 scale 调整了尺寸

	// 尝试恢复之前保存的画布数据（仅编辑模式）
	if (!props.previewMode) {
		const savedCanvasData = loadFromLocal(STORAGE_KEYS.SCADA_EDITOR_DATA)
		if (savedCanvasData?.cells?.length > 0) {
			try {
				// 清理可能损坏的数据
				const cleanedCells = savedCanvasData.cells.map((cell: any) => {
					if (cell.position && typeof cell.position === 'object') {
						// 确保 position 是有效的坐标对象
						if (typeof cell.position.x !== 'number' || typeof cell.position.y !== 'number') {
							cell.position = { x: 100, y: 100 }
						}
					}
					// 修正连线路由算法：将 manhattan 改为 orth
					if (cell.shape === 'edge' || cell.shape === 'animated-edge') {
						if (cell.router === 'manhattan' || cell.router?.name === 'manhattan') {
							cell.router = {
								name: 'orth',
								args: {
									padding: 10
								}
							}
						}
					}
					return cell
				})
				graph.fromJSON({ cells: cleanedCells })
				
				// 恢复后，对所有启用了动画的连线应用动画
				graph.getEdges().forEach((edge: any) => {
					const edgeData = edge.getData()
					if (edgeData?.animation?.enabled) {
						applyEdgeAnimation(edge, edgeData.animation)
					}
				})
			} catch (error) {
				console.error('恢复画布数据失败，清空缓存:', error)
				// 清空损坏的数据
				removeFromLocal(STORAGE_KEYS.SCADA_EDITOR_DATA)
			}
		}
		
		// 从 localStorage 恢复数据源配置（持久化存储）
		try {
			const savedDataSources = localStorage.getItem('scada-data-sources')
			if (savedDataSources) {
				const dataSourcesConfig = JSON.parse(savedDataSources)
				if (Array.isArray(dataSourcesConfig) && dataSourcesConfig.length > 0) {
					// 添加数据源到管理器
					dataSourcesConfig.forEach((dsConfig: any) => {
						const newDataSource: DataSource = {
							id: dsConfig.id,
							name: dsConfig.name,
							type: dsConfig.type,
							enabled: dsConfig.enabled,
							config: dsConfig.config,
							devices: [],
							status: { connected: false }
						}
						dataSourceManager.addDataSource(newDataSource)
					})
					
					// 延迟更新，等待连接建立
					setTimeout(() => {
						dataSources.value = dataSourceManager.getAllDataSources()
					}, 1500)
				}
			}
		} catch (error) {
			console.error('恢复数据源失败:', error)
		}
	}

	// 监听 Selection 插件的选中变化事件
	graph.on('selection:changed', ({ selected }: any) => {
		// 统计选中的节点数量
		const selectedNodes = selected ? selected.filter((cell: any) => cell.isNode()) : []
		selectedNodesCount.value = selectedNodes.length
		
		if (selected && selected.length > 0) {
			const cell = selected[0]
			// 判断是节点还是连线
			if (cell.isNode()) {
				selectedNode.value = cell
				selectedEdge.value = null
			} else if (cell.isEdge()) {
				// 选中连线，应用高亮样式
				selectedEdge.value = cell
				selectedNode.value = null
				// 保存原始样式
				const originalAttrs = cell.getAttrs()
				cell.data = { ...cell.data, originalAttrs }
				// 应用选中样式：只改变颜色，不改变粗细
				cell.attr('line/stroke', '#3b82f6') // 蓝色高亮
			}
		} else {
			// 取消选中，恢复连线原始样式
			if (selectedEdge.value && selectedEdge.value.data?.originalAttrs) {
				const originalAttrs = selectedEdge.value.data.originalAttrs
				selectedEdge.value.attr('line/stroke', originalAttrs.line?.stroke || '#10b981')
			}
			selectedNode.value = null
			selectedEdge.value = null
		}
	})
	
	// 监听连线点击事件
	graph.on('edge:click', ({ edge }: any) => {
		// 选中连线 - 使用 Selection 插件选中
		graph!.select(edge)
	})
	
	// 监听画布点击，取消连线选中
	graph.on('blank:click', () => {
		selectedEdge.value = null
		selectedNode.value = null
	})
	
	// 监听节点移动事件 - 实时更新属性面板
	graph.on('node:change:position', () => {
		// 节点位置改变时，Vue 的 watch 会自动处理更新
	})

	// 监听节点尺寸变化事件
	graph.on('node:change:size', () => {
		// 节点尺寸改变时,Vue 的 watch 会自动处理更新
	})
	
	// 监听右键菜单事件
	graph.on('cell:contextmenu', ({ e, cell }: any) => {
		e.preventDefault()
		
		// 保存目标元素
		contextMenu.value.targetCell = cell
		
		// 设置菜单位置
		contextMenu.value.position = { x: e.clientX, y: e.clientY }
		
		// 根据元素类型生成菜单项
		if (cell.isNode()) {
			contextMenu.value.items = [
				{ key: 'delete', label: '删除', icon: '❌', hotkey: 'Delete' },
				{ key: 'copy', label: '复制', icon: '📋', hotkey: 'Ctrl+C' },
				{ key: 'divider1', divider: true },
				{ key: 'to-front', label: '置于顶层', icon: '⬆️' },
				{ key: 'to-back', label: '置于底层', icon: '⬇️' }
			]
		} else if (cell.isEdge()) {
			contextMenu.value.items = [
				{ key: 'delete', label: '删除', icon: '❌', hotkey: 'Delete' },
				{ key: 'divider1', divider: true },
				{ key: 'to-front', label: '置于顶层', icon: '⬆️' },
				{ key: 'to-back', label: '置于底层', icon: '⬇️' }
			]
		}
		
		contextMenu.value.visible = true
	})
	
	// 监听画布右键菜单，显示画布操作菜单
	graph.on('blank:contextmenu', ({ e }: any) => {
		e.preventDefault()
		
		contextMenu.value.targetCell = null
		contextMenu.value.position = { x: e.clientX, y: e.clientY }
		contextMenu.value.items = [
			{ key: 'paste', label: '粘贴', icon: '📋', hotkey: 'Ctrl+V', disabled: true },
			{ key: 'divider1', divider: true },
			{ key: 'select-all', label: '全选', icon: '✅', hotkey: 'Ctrl+A' },
			{ key: 'clear-all', label: '清空画布', icon: '🗑️' }
		]
		contextMenu.value.visible = true
	})
	
	// 监听节点数据变化 - 检测动画配置变化并启动动画
	graph.on('node:change:data', ({ node }: any) => {
		const nodeData = node.getData()
		if (nodeData.animation) {
			// 检查是否启用动画
			if (nodeData.animation.enabled === true) {
				const animationConfig = {
					type: nodeData.animation.type || 'none',
					duration: nodeData.animation.duration || 1000,
					loop: nodeData.animation.loop !== false
				}
				// 启动或更新动画
				animationEngine.startAnimation(node, animationConfig)
			} else {
				// 如果禁用了动画，停止动画
				animationEngine.stopAnimation(node.id)
			}
		}
	})
	
	// 监听连线数据变化 - 检测动画配置变化并应用动画
	graph.on('edge:change:data', ({ edge }: any) => {
		const edgeData = edge.getData()
		if (edgeData?.animation) {
			applyEdgeAnimation(edge, edgeData.animation)
		}
	})

	// 监听键盘事件 - Delete 键删除节点或连线
	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Delete' && graph) {
			if (selectedNode.value) {
				// 删除节点
				const nodeId = selectedNode.value.id
				// 停止动画
				animationEngine.stopAnimation(nodeId)
				graph.removeNode(nodeId)
				selectedNode.value = null
			} else if (selectedEdge.value) {
				// 删除连线
				const edgeId = selectedEdge.value.id
				graph.removeEdge(edgeId)
				selectedEdge.value = null
			}
		}
	}
	document.addEventListener('keydown', handleKeyDown)

	// ========== 添加数据绑定同步逻辑 ==========
	// 监听数据源数据更新，自动同步到绑定的组件
	dataSourceManager.onData((dataSourceId: string, deviceData: any) => {
		if (!graph) return
			
		// 遍历所有节点，查找绑定了该设备的节点
		const nodes = graph.getNodes()
		nodes.forEach(node => {
			const nodeData = node.getData()
			if (!nodeData || !nodeData.dataBinding) return
				
			// 检查是否绑定了该数据源和设备
			if (nodeData.dataBinding.dataSourceId === dataSourceId && 
			    nodeData.dataBinding.deviceId === deviceData.id) {
					
				// 检查是否有点位绑定
				if (nodeData.bindings && Array.isArray(nodeData.bindings)) {
					let updated = false
						
					// 遍历所有绑定
					nodeData.bindings.forEach((binding: any) => {
						if (!binding.devicePointId) return
							
						// 解析 devicePointId (deviceId:pointId 格式)
						const parts = binding.devicePointId.split(':')
						const pointId = parts.length === 2 ? parts[1] : binding.devicePointId
							
						// 查找对应的点位数据
						const point = deviceData.points?.find((p: any) => p.id === pointId)
						if (!point || point.value === undefined) return
							
						// 应用映射（如果有）
						let mappedValue = point.value
						if (binding.mapping) {
							mappedValue = applyMapping(point.value, binding.mapping)
						}
							
						// 更新节点属性
						if (binding.targetProperty === 'value') {
							nodeData.value = mappedValue
							updated = true
						} else {
							nodeData[binding.targetProperty] = mappedValue
							updated = true
						}
					})
						
					// 如果有更新，触发节点数据更新
					if (updated) {
						// 创建新对象以确保引用变化
						const newData = JSON.parse(JSON.stringify(nodeData))
						node.setData(newData, { overwrite: true })
							
						// 手动触发 X6 的 change:data 事件
						node.trigger('change:data', { current: newData, previous: nodeData })
					}
				}
			}
		})
	})
	
	// 映射函数：根据映射配置转换值
	const applyMapping = (value: any, mapping: any) => {
		if (!mapping || mapping.type === 'direct') {
			return value
		}
		
		switch (mapping.type) {
			case 'boolean':
				return value ? (mapping.trueValue ?? true) : (mapping.falseValue ?? false)
				
			case 'range':
				if (mapping.rangeRules && Array.isArray(mapping.rangeRules)) {
					for (const rule of mapping.rangeRules) {
						const numValue = Number(value)
						if (numValue >= rule.min && numValue <= rule.max) {
							return rule.value
						}
					}
				}
				return value
				
			case 'enum':
				if (mapping.enumMappings) {
					return mapping.enumMappings[String(value)] ?? value
				}
				return value
				
			default:
				return value
		}
	}

	// 清理监听器
	onUnmounted(() => {
		document.removeEventListener('keydown', handleKeyDown)
		window.removeEventListener('resize', handleResize)
		window.removeEventListener('resize', handlePanelResize)
	})
})

onUnmounted(() => {
	// 断开所有数据源连接
	dataSourceManager.disconnectAll()
	
	if (graph) {
		// 清空所有动画
		animationEngine.clearAll()
		
		// 在销毁前保存画布数据
		const canvasData = {
			cells: graph.toJSON().cells,
			// 保存数据源配置
			dataSources: dataSourceManager.getAllDataSources().map(ds => ({
				id: ds.id,
				name: ds.name,
				type: ds.type,
				enabled: ds.enabled,
				config: ds.config
			}))
		}
		saveToLocal(STORAGE_KEYS.SCADA_EDITOR_DATA, canvasData)
		
		graph.dispose()
	}
})

// 监听画布配置变化
watch(
	() => canvasConfigManager.getConfig(),
	(config) => {
		if (!graph) return

		// 更新背景颜色
		if (config.background.image) {
			// 有背景图片时
			graph.drawBackground({
				color: config.background.color || '#1e293b',
				image: config.background.image,
				size: config.background.size || 'cover',
				repeat: config.background.repeat || 'no-repeat',
				position: 'center'
			})
		} else {
			// 无背景图片时
			graph.drawBackground({ color: config.background.color || '#1e293b' })
		}

		// 更新容器缩放和尺寸
		const container = canvasAreaRef.value?.containerRef
		if (container) {
			// 更新 Graph 尺寸
			graph.resize(config.size.width, config.size.height)
			// 同时更新容器基础尺寸
			container.style.width = `${config.size.width}px`
			container.style.height = `${config.size.height}px`
			// 如果用户手动修改了缩放，使用用户设置的值；否则重新计算自适应缩放
			const fitScale = calculateFitScale()
			const finalScale = config.zoom.scale > fitScale ? config.zoom.scale : fitScale
			container.style.transform = `scale(${finalScale})`
			container.style.transformOrigin = 'center center'
		}

		// 更新网格
		if (config.grid.enabled) {
			graph.drawGrid({
				type: config.grid.type || 'dot',
				args: {
					color: config.grid.color || '#475569',  // 使用明显的网格颜色
					thickness: 1
				}
			})
			graph.showGrid()
		} else {
			graph.hideGrid()
		}

		// 更新网格大小
		if (config.grid.enabled && config.grid.size) {
			graph.setGridSize(config.grid.size)
		}

		// 更新偏移
		graph.translate(config.offset.x, config.offset.y)

		// 更新吸附和参考线需要重新创建 Graph，这里只提示
	},
	{ deep: true }
)

// 计数器，用于生成唯一名称
const componentCounters = ref<Record<string, number>>({})

// 生成组件默认名称
const generateComponentName = (componentType: string, componentName: string): string => {
	if (!componentCounters.value[componentType]) {
		componentCounters.value[componentType] = 0
	}
	componentCounters.value[componentType]++
	return `${componentName}_${componentCounters.value[componentType]}`
}

// 添加节点（根据类型）
const handleAddNode = (type: string) => {
	if (!graph) return

	const config = componentRegistry.getComponent(type)
	if (!config) {
		console.error(`未找到组件配置: ${type}`)
		return
	}

	// 生成默认名称
	const defaultName = generateComponentName(type, config.metadata.name)

	// 初始化默认动画配置
	const defaultAnimation = {
		enabled: false,  // 默认禁用动画，用户需要手动启用
		type: 'none',
		duration: 1000,
		loop: true
	}

	// 生成随机位置
	const position = randomPosition(50, 50, 400, 300)

	const nodeConfig: any = {
		x: position.x,
		y: position.y,
		shape: config.shape,
		width: config.width,
		height: config.height,
		label: config.label,
		attrs: config.attrs,
		ports: config.ports,  // 添加接线桩配置
		data: {
			...config.data,
			componentType: type,
			componentName: defaultName,  // 添加默认名称
			props: config.props,
			animation: defaultAnimation,  // 添加默认动画配置
			// 保存原始样式用于恢复选中效果
			originalStroke: config.attrs?.body?.stroke || '#2563eb',
			originalStrokeWidth: config.attrs?.body?.strokeWidth || 2
		}
	}

	const node = graph.addNode(nodeConfig)
	console.log('[Node] 添加节点:', config.shape, node.id, nodeConfig)
	
	// 先取消所有选中，再选中新添加的节点
	graph.cleanSelection()
	graph.select(node)
	
	// 自动保存到 localStorage
	saveToLocal(STORAGE_KEYS.SCADA_EDITOR_DATA, graph.toJSON())
}

// 更新节点属性
const handleUpdateNode = (data: any) => {
	if (!selectedNode.value) return
	
	// 使用 attr() 方法单独设置属性，避免覆盖其他属性
	if (data.attrs) {
		// 遍历属性，逐个设置
		Object.keys(data.attrs).forEach(key => {
			const attrValue = data.attrs[key]
			if (typeof attrValue === 'object') {
				// 如果是对象，遍历子属性
				Object.keys(attrValue).forEach(subKey => {
					selectedNode.value!.attr(`${key}/${subKey}`, attrValue[subKey])
				})
			} else {
				selectedNode.value!.attr(key, attrValue)
			}
		})
	}
	
	// 验证并设置 position
	if (data.position) {
		if (typeof data.position.x === 'number' && typeof data.position.y === 'number') {
			selectedNode.value.setPosition(data.position)
		} else {
			console.error('position 数据格式错误:', data.position)
		}
	}
	
	// 验证并设置 size
	if (data.size) {
		if (typeof data.size.width === 'number' && typeof data.size.height === 'number') {
			selectedNode.value.setSize(data.size)
		} else {
			console.error('size 数据格式错误:', data.size)
		}
	}
	
	// 更新 data 时，不要包含 position 和 size
	if (data.data) {
		// 从 data.data 中移除 position 和 size 字段（如果存在）
		const cleanedData = { ...data.data }
		delete cleanedData.position
		delete cleanedData.size
		// 使用 setData 方法，这样会触发 change:data 事件
		selectedNode.value.setData(cleanedData)
	}
	
	// 自动保存到 localStorage
	if (graph) {
		saveToLocal(STORAGE_KEYS.SCADA_EDITOR_DATA, graph.toJSON())
	}
}

// 删除节点
const handleDeleteNode = () => {
	if (!selectedNode.value || !graph) return
	const nodeId = selectedNode.value.id
	// 停止动画
	animationEngine.stopAnimation(nodeId)
	graph.removeNode(nodeId)
	selectedNode.value = null
	
	// 自动保存到 localStorage
	saveToLocal(STORAGE_KEYS.SCADA_EDITOR_DATA, graph.toJSON())
}

// 更新连线属性
const handleUpdateEdge = (data: any) => {
	if (!selectedEdge.value) return
	
	// 更新属性
	if (data.attrs) {
		Object.keys(data.attrs).forEach(key => {
			const attrValue = data.attrs[key];
			if (typeof attrValue === 'object') {
				// 如果是对象，遍历子属性
				Object.keys(attrValue).forEach(subKey => {
					selectedEdge.value!.attr(`${key}/${subKey}`, attrValue[subKey]);
					// 更新保存的原始样式
					if (selectedEdge.value!.data?.originalAttrs?.[key]) {
						selectedEdge.value!.data.originalAttrs[key][subKey] = attrValue[subKey];
					}
				});
			} else {
				selectedEdge.value!.attr(key, attrValue);
			}
		});
		
		// 重新应用选中高亮效果（只改变颜色）
		const currentAttrs = selectedEdge.value.getAttrs();
		const newData = Object.assign({}, selectedEdge.value.data, { originalAttrs: currentAttrs });
		selectedEdge.value.setData(newData);
		selectedEdge.value.attr('line/stroke', '#3b82f6');
	}
	
	// 更新路由
	if (data.router) {
		selectedEdge.value.setRouter(data.router)
	}
	
	// 更新连接器
	if (data.connector) {
		selectedEdge.value.setConnector(data.connector)
	}
	
	// 更新动画配置
	if (data.animation) {
		applyEdgeAnimation(selectedEdge.value, data.animation)
	}
	
	// 更新data
	if (data.data) {
		selectedEdge.value.setData(Object.assign({}, selectedEdge.value.data, data.data))
	}
}

// 删除连线
const handleDeleteEdge = () => {
	if (!selectedEdge.value || !graph) return
	graph.removeEdge(selectedEdge.value.id)
	selectedEdge.value = null
}

// 处理右键菜单点击
const handleContextMenuClick = (key: string) => {
	if (!graph) return
	
	const targetCell = contextMenu.value.targetCell
	
	switch (key) {
		case 'delete':
			if (targetCell) {
				if (targetCell.isNode()) {
					// 删除节点
					animationEngine.stopAnimation(targetCell.id)
					graph.removeNode(targetCell.id)
					if (selectedNode.value?.id === targetCell.id) {
						selectedNode.value = null
					}
				} else if (targetCell.isEdge()) {
					// 删除连线
					graph.removeEdge(targetCell.id)
					if (selectedEdge.value?.id === targetCell.id) {
						selectedEdge.value = null
					}
				}
				// 自动保存到 localStorage（永久保存）
				// 保存画布数据和数据源配置
				const canvasData = {
					cells: graph.toJSON().cells,
					dataSources: dataSourceManager.getAllDataSources().map(ds => ({
						id: ds.id,
						name: ds.name,
						type: ds.type,
						enabled: ds.enabled,
						config: ds.config
					}))
				}
				saveToLocal(STORAGE_KEYS.SCADA_EDITOR_DATA, canvasData)
			}
			break
			
		case 'copy':
			if (targetCell?.isNode()) {
				// 复制节点（简单实现：克隆并偏移位置）
				const clonedNode = targetCell.clone()
				clonedNode.translate(20, 20)
				graph.addNode(clonedNode)
				graph.cleanSelection()
				graph.select(clonedNode)
				// 自动保存到 localStorage（永久保存）
				// 保存画布数据和数据源配置
				const canvasData = {
					cells: graph.toJSON().cells,
					dataSources: dataSourceManager.getAllDataSources().map(ds => ({
						id: ds.id,
						name: ds.name,
						type: ds.type,
						enabled: ds.enabled,
						config: ds.config
					}))
				}
				saveToLocal(STORAGE_KEYS.SCADA_EDITOR_DATA, canvasData)
			}
			break
			
		case 'to-front':
			if (targetCell) {
				targetCell.toFront()
				// 自动保存到 localStorage（永久保存）
				// 保存画布数据和数据源配置
				const canvasData = {
					cells: graph.toJSON().cells,
					dataSources: dataSourceManager.getAllDataSources().map(ds => ({
						id: ds.id,
						name: ds.name,
						type: ds.type,
						enabled: ds.enabled,
						config: ds.config
					}))
				}
				saveToLocal(STORAGE_KEYS.SCADA_EDITOR_DATA, canvasData)
			}
			break
			
		case 'to-back':
			if (targetCell) {
				targetCell.toBack()
				// 自动保存到 localStorage（永久保存）
				// 保存画布数据和数据源配置
				const canvasData = {
					cells: graph.toJSON().cells,
					dataSources: dataSourceManager.getAllDataSources().map(ds => ({
						id: ds.id,
						name: ds.name,
						type: ds.type,
						enabled: ds.enabled,
						config: ds.config
					}))
				}
				saveToLocal(STORAGE_KEYS.SCADA_EDITOR_DATA, canvasData)
			}
			break
			
		case 'select-all':
			graph.select(graph.getNodes())
			break
			
		case 'clear-all':
			clearAll()
			break
	}
}

// 应用连线动画
const applyEdgeAnimation = (edge: any, animation: any) => {
	// 安全检查：确保 edge 存在且是有效对象
	if (!edge || typeof edge.attr !== 'function') {
		console.warn('applyEdgeAnimation: edge 对象无效', edge)
		return
	}
	
	if (!animation || !animation.enabled) {
		// 关闭动画
		edge.attr('line/strokeDasharray', undefined)
		if (typeof edge.removeAttr === 'function') {
			edge.removeAttr('line/class')
		}
		// 移除光点
		edge.attr('circle', undefined)
		if (typeof edge.stopTransition === 'function') {
			edge.stopTransition('attrs/circle/atConnectionRatio')
		}
		return
	}
	
	// 使用光点流动动画
	const duration = animation.duration || 2000 // 默认2秒
	
	// 设置光点样式
	edge.attr('circle', {
		r: 4,
		atConnectionRatio: 0,
		fill: {
			type: 'radialGradient',
			stops: [
				{ offset: '0%', color: '#FFF' },
				{ offset: '100%', color: edge.attr('line/stroke') || '#10b981' }
			]
		},
		stroke: edge.attr('line/stroke') || '#10b981',
		strokeWidth: 1
	})
	
	// 开始动画
	const startAnimation = () => {
		edge.attr('circle/atConnectionRatio', 0, { silent: true })
		edge.transition('attrs/circle/atConnectionRatio', 1, {
			delay: 0,
			duration: duration,
			timing: 'linear',
			complete: () => {
				// 循环动画
				startAnimation()
			}
		})
	}
	startAnimation()
}

// 清空画布
const clearAll = () => {
	if (!graph) return
	if (confirm('确定要清空画布吗？')) {
		// 清空所有动画
		animationEngine.clearAll()
		// 清空画布元素
		graph.clearCells()
		// 清除选中节点
		selectedNode.value = null
		// 清除 localStorage 中的缓存数据
		removeFromLocal(STORAGE_KEYS.SCADA_EDITOR_DATA)
		showMessage('画布已清空', 'success')
	}
}

// 放大
const zoomIn = () => {
	if (!graph) return
	const currentScale = canvasConfigManager.getConfig().zoom.scale
	const newScale = Math.min(5, currentScale + 0.1)
	canvasConfigManager.setZoom(newScale)
}

// 缩小
const zoomOut = () => {
	if (!graph) return
	const currentScale = canvasConfigManager.getConfig().zoom.scale
	const newScale = Math.max(0.1, currentScale - 0.1)
	canvasConfigManager.setZoom(newScale)
}

// 左对齐
const alignLeft = () => {
	if (!graph) return
	const selectedCells = graph.getSelectedCells().filter(cell => cell.isNode())
	if (selectedCells.length < 2) {
		showMessage('请选择至少两个节点', 'warning')
		return
	}
	const minX = Math.min(...selectedCells.map(node => node.getPosition().x))
	selectedCells.forEach(node => {
		node.setPosition({ x: minX, y: node.getPosition().y })
	})
}

// 水平居中
const alignCenter = () => {
	if (!graph) return
	const selectedCells = graph.getSelectedCells().filter(cell => cell.isNode())
	if (selectedCells.length < 2) {
		showMessage('请选择至少两个节点', 'warning')
		return
	}
	const centerXs = selectedCells.map(node => node.getPosition().x + node.getSize().width / 2)
	const avgCenterX = centerXs.reduce((sum, x) => sum + x, 0) / centerXs.length
	selectedCells.forEach(node => {
		const newX = avgCenterX - node.getSize().width / 2
		node.setPosition({ x: newX, y: node.getPosition().y })
	})
}

// 右对齐
const alignRight = () => {
	if (!graph) return
	const selectedCells = graph.getSelectedCells().filter(cell => cell.isNode())
	if (selectedCells.length < 2) {
		showMessage('请选择至少两个节点', 'warning')
		return
	}
	const maxRight = Math.max(...selectedCells.map(node => node.getPosition().x + node.getSize().width))
	selectedCells.forEach(node => {
		const newX = maxRight - node.getSize().width
		node.setPosition({ x: newX, y: node.getPosition().y })
	})
}

// 顶部对齐
const alignTop = () => {
	if (!graph) return
	const selectedCells = graph.getSelectedCells().filter(cell => cell.isNode())
	if (selectedCells.length < 2) {
		showMessage('请选择至少两个节点', 'warning')
		return
	}
	const minY = Math.min(...selectedCells.map(node => node.getPosition().y))
	selectedCells.forEach(node => {
		node.setPosition({ x: node.getPosition().x, y: minY })
	})
}

// 垂直居中
const alignMiddle = () => {
	if (!graph) return
	const selectedCells = graph.getSelectedCells().filter(cell => cell.isNode())
	if (selectedCells.length < 2) {
		showMessage('请选择至少两个节点', 'warning')
		return
	}
	const centerYs = selectedCells.map(node => node.getPosition().y + node.getSize().height / 2)
	const avgCenterY = centerYs.reduce((sum, y) => sum + y, 0) / centerYs.length
	selectedCells.forEach(node => {
		const newY = avgCenterY - node.getSize().height / 2
		node.setPosition({ x: node.getPosition().x, y: newY })
	})
}

// 底部对齐
const alignBottom = () => {
	if (!graph) return
	const selectedCells = graph.getSelectedCells().filter(cell => cell.isNode())
	if (selectedCells.length < 2) {
		showMessage('请选择至少两个节点', 'warning')
		return
	}
	const maxBottom = Math.max(...selectedCells.map(node => node.getPosition().y + node.getSize().height))
	selectedCells.forEach(node => {
		const newY = maxBottom - node.getSize().height
		node.setPosition({ x: node.getPosition().x, y: newY })
	})
}

// 横向分布
const distributeHorizontal = () => {
	if (!graph) return
	const selectedCells = graph.getSelectedCells().filter(cell => cell.isNode())
	if (selectedCells.length < 3) {
		showMessage('请选择至少三个节点', 'warning')
		return
	}
	// 按X坐标排序
	const sorted = selectedCells.sort((a, b) => a.getPosition().x - b.getPosition().x)
	const first = sorted[0]
	const last = sorted[sorted.length - 1]
	const totalWidth = last.getPosition().x - first.getPosition().x
	const gap = totalWidth / (sorted.length - 1)
	
	sorted.forEach((node, index) => {
		if (index === 0 || index === sorted.length - 1) return // 保持首尾不动
		const newX = first.getPosition().x + gap * index
		node.setPosition({ x: newX, y: node.getPosition().y })
	})
}

// 纵向分布
const distributeVertical = () => {
	if (!graph) return
	const selectedCells = graph.getSelectedCells().filter(cell => cell.isNode())
	if (selectedCells.length < 3) {
		showMessage('请选择至少三个节点', 'warning')
		return
	}
	// 按Y坐标排序
	const sorted = selectedCells.sort((a, b) => a.getPosition().y - b.getPosition().y)
	const first = sorted[0]
	const last = sorted[sorted.length - 1]
	const totalHeight = last.getPosition().y - first.getPosition().y
	const gap = totalHeight / (sorted.length - 1)
	
	sorted.forEach((node, index) => {
		if (index === 0 || index === sorted.length - 1) return // 保持首尾不动
		const newY = first.getPosition().y + gap * index
		node.setPosition({ x: node.getPosition().x, y: newY })
	})
}

// 头部操作
const handleSave = async () => {
	if (!graph) {
		showMessage('画布未初始化', 'error')
		return
	}
	
	try {
		console.log('[ScadaCanvas] handleSave 被调用')
		console.log('[ScadaCanvas] props.onSave:', props.onSave)
		
		// 如果有自定义保存回调，优先使用
		if (props.onSave) {
			console.log('[ScadaCanvas] 调用自定义 onSave 回调')
			const result = props.onSave()
			if (result instanceof Promise) {
				await result
			}
			console.log('[ScadaCanvas] 自定义 onSave 回调执行完成')
			return
		}
		
		console.log('[ScadaCanvas] 没有自定义回调，执行默认下载')
		// 默认下载 JSON 文件
		const scadaData = {
			version: '1.0.0',
			timestamp: new Date().toISOString(),
			config: {
				size: canvasConfigManager.getConfig().size,
				background: canvasConfigManager.getConfig().background,
				grid: canvasConfigManager.getConfig().grid,
				guides: canvasConfigManager.getConfig().guides,
				magnetism: canvasConfigManager.getConfig().magnetism,
				zoom: canvasConfigManager.getConfig().zoom
			},
			cells: graph.toJSON().cells,
			// 添加数据源配置
			dataSources: dataSourceManager.getAllDataSources().map(ds => ({
				id: ds.id,
				name: ds.name,
				type: ds.type,
				enabled: ds.enabled,
				config: ds.config
				// 不保存 devices 和 status，这些是运行时数据
			}))
		}
		
		// 下载为 JSON 文件
		const blob = new Blob([JSON.stringify(scadaData, null, 2)], { type: 'application/json' })
		const url = URL.createObjectURL(blob)
		const link = document.createElement('a')
		const filename = `scada-canvas-${new Date().getTime()}.json`
		link.href = url
		link.download = filename
		link.click()
		URL.revokeObjectURL(url)
		
		showMessage('保存成功', 'success')
	} catch (error) {
		console.error('保存失败', error)
		showMessage('保存失败，请查看控制台', 'error')
	}
}

// 导入功能
const handleImport = () => {
	// 触发文件选择
	if (fileInputRef.value) {
		fileInputRef.value.click()
	}
}

// 处理文件选择
const handleFileSelect = (event: Event) => {
	const target = event.target as HTMLInputElement
	const file = target.files?.[0]
	
	if (!file) {
		showMessage('请选择文件', 'error')
		return
	}
	
	const reader = new FileReader()
	reader.onload = (e) => {
		try {
			const importData = JSON.parse(e.target?.result as string)
			
			// 验证数据结构
			if (!importData.cells) {
				showMessage('无效的JSON文件格式', 'error')
				return
			}
			
			if (!confirm('导入将清空当前画布,是否继续?')) {
				return
			}
			
			// 清空当前画布
			if (graph) {
				graph.clearCells()
				
				// 加载导入的数据
				graph.fromJSON({ cells: importData.cells })
				
				// 导入后，对所有启用了动画的连线应用动画
				graph.getEdges().forEach((edge: any) => {
					const edgeData = edge.getData()
					if (edgeData?.animation?.enabled) {
						applyEdgeAnimation(edge, edgeData.animation)
					}
				})
				
				// 如果有配置信息，应用配置
				if (importData.config) {
					canvasConfigManager.updateConfig(importData.config)
				}
				
				// 导入数据源配置
				if (importData.dataSources && Array.isArray(importData.dataSources)) {
					// 清空现有数据源
					dataSourceManager.disconnectAll()
					dataSourceManager.getAllDataSources().forEach(ds => {
						dataSourceManager.removeDataSource(ds.id)
					})
					
					// 添加导入的数据源
					importData.dataSources.forEach((dsConfig: any) => {
						const newDataSource: DataSource = {
							id: dsConfig.id,
							name: dsConfig.name,
							type: dsConfig.type,
							enabled: dsConfig.enabled,
							config: dsConfig.config,
							devices: [],
							status: { connected: false }
						}
						dataSourceManager.addDataSource(newDataSource)
					})
					
					// 更新数据源列表
					dataSources.value = dataSourceManager.getAllDataSources()
					console.log(`[ScadaCanvas] 已导入 ${importData.dataSources.length} 个数据源`)
				}
				
				// 导入流程数据
				if (importData.workflows && Array.isArray(importData.workflows) && importData.workflows.length > 0) {
					try {
						const stored = localStorage.getItem('saved-workflows')
						const existingWorkflows = stored ? JSON.parse(stored) : []
						
						let importedCount = 0
						let updatedCount = 0
						
						// 合并流程数据
						importData.workflows.forEach((newWf: any) => {
							const existIndex = existingWorkflows.findIndex((wf: any) => wf.id === newWf.id)
							if (existIndex >= 0) {
								// 更新现有流程
								existingWorkflows[existIndex] = {
									...newWf,
									updatedAt: Date.now()
								}
								updatedCount++
							} else {
								// 添加新流程
								existingWorkflows.push(newWf)
								importedCount++
							}
						})
						
						// 保存回 localStorage
						localStorage.setItem('saved-workflows', JSON.stringify(existingWorkflows))
												
						showMessage(`导入成功 画布已加载，流程: 新增${importedCount}个，更新${updatedCount}个`, 'success')
					} catch (error) {
						console.error('导入流程数据失败:', error)
						showMessage('画布导入成功, 但流程数据导入失败', 'warning')
					}
				} else {
					showMessage('导入成功', 'success')
				}
				
				// 清空文件选择,允许重复导入同一文件
				if (fileInputRef.value) {
					fileInputRef.value.value = ''
				}
			}
		} catch (error) {
			console.error('导入失败', error)
			showMessage('导入失败，JSON格式错误', 'error')
			// 清空文件选择
			if (fileInputRef.value) {
				fileInputRef.value.value = ''
			}
		}
	}
	
	reader.readAsText(file)
}

const handlePreview = () => {
	console.log('🎬 [ScadaCanvas] handlePreview 被调用')
	if (!graph) {
		console.error('⚠️ [ScadaCanvas] graph 不存在')
		return
	}
	
	// 获取画布数据
	const canvasData = {
		cells: graph.toJSON().cells,
		config: {
			width: canvasConfigManager.getConfig().size.width,
			height: canvasConfigManager.getConfig().size.height,
			background: canvasConfigManager.getConfig().background,
			grid: canvasConfigManager.getConfig().grid
		}
	}
	
	// 将数据存储到 localStorage
	saveToLocal(STORAGE_KEYS.SCADA_PREVIEW_DATA, canvasData)
	console.log('✅ [ScadaCanvas] 数据已保存到 localStorage')
	
	// 触发预览事件，由父组件处理路由跳转
	console.log('📤 [ScadaCanvas] 即将触发 preview 事件')
	emit('preview')
	console.log('✅ [ScadaCanvas] preview 事件已触发')
}

const handleWorkflow = () => {
	// 打开流程编排弹窗
	showWorkflowDialog.value = true
}

// 数据源管理
const handleDataSource = () => {
	// 打开数据源管理对话框
	showDataSourceDialog.value = true
	// 同步数据源列表
	dataSources.value = dataSourceManager.getAllDataSources()
	
	// 定时刷新状态
	const statusInterval = setInterval(() => {
		if (!showDataSourceDialog.value) {
			clearInterval(statusInterval)
			return
		}
		dataSources.value = dataSourceManager.getAllDataSources()
	}, 1000)
}

// 保存数据源配置到 localStorage
const saveDataSourcesToLocalStorage = () => {
	try {
		const dataSourcesConfig = dataSourceManager.getAllDataSources().map(ds => ({
			id: ds.id,
			name: ds.name,
			type: ds.type,
			enabled: ds.enabled,
			config: ds.config
		}))
		localStorage.setItem('scada-data-sources', JSON.stringify(dataSourcesConfig))
		console.log('[ScadaCanvas] 数据源配置已保存到 localStorage')
	} catch (error) {
		console.error('保存数据源失败:', error)
	}
}

const handleAddDataSource = (config: Omit<DataSource, 'id' | 'devices' | 'status'>) => {
	const newDataSource: DataSource = {
		id: 'ds_' + Date.now(),
		...config,
		devices: [],
		status: { connected: false }
	}
	
	console.log('[ScadaCanvas] 添加数据源:', newDataSource)
	dataSourceManager.addDataSource(newDataSource)
	
	// 延迟一下刷新，等待连接建立
	setTimeout(() => {
		dataSources.value = dataSourceManager.getAllDataSources()
		console.log('[ScadaCanvas] 数据源列表已更新:', dataSources.value)
		// 保存到 localStorage
		saveDataSourcesToLocalStorage()
	}, 1000)
	
	showMessage(`数据源 "${newDataSource.name}" 创建成功`, 'success')
}

const handleSaveDataSource = (dataSource: DataSource) => {
	dataSourceManager.updateDataSource(dataSource.id, dataSource)
	dataSources.value = dataSourceManager.getAllDataSources()
	// 保存到 localStorage
	saveDataSourcesToLocalStorage()
	showMessage(`数据源 "${dataSource.name}" 更新成功`, 'success')
}

const handleDeleteDataSource = (id: string) => {
	const ds = dataSourceManager.getDataSource(id)
	dataSourceManager.removeDataSource(id)
	dataSources.value = dataSourceManager.getAllDataSources()
	// 保存到 localStorage
	saveDataSourcesToLocalStorage()
	showMessage(`数据源 "${ds?.name}" 已删除`, 'success')
}

const handleExport = () => {
	if (!graph) {
		showMessage('画布未初始化', 'error')
		return
	}
	
	try {
		// 获取画布数据
		const exportData = {
			version: '1.0.0',
			timestamp: formatTimestamp(getCurrentTimestamp()),
			config: {
				size: canvasConfigManager.getConfig().size,
				background: canvasConfigManager.getConfig().background,
				grid: canvasConfigManager.getConfig().grid,
				guides: canvasConfigManager.getConfig().guides,
				magnetism: canvasConfigManager.getConfig().magnetism,
				zoom: canvasConfigManager.getConfig().zoom
			},
			cells: graph.toJSON().cells,
			nodes: graph.getNodes().map(node => ({
				id: node.id,
				type: node.shape,
				position: node.getPosition(),
				size: node.getSize(),
				label: node.attr('label/text'),
				data: node.getData()
			})),
			edges: graph.getEdges().map(edge => ({
				id: edge.id,
				source: edge.getSourceCellId(),
				target: edge.getTargetCellId()
			})),
			workflows: [] // 收集所有被引用的流程
		}
		
		// 收集所有节点中引用的流程ID
		const referencedWorkflowIds = new Set<string>()
		graph.getNodes().forEach(node => {
			const nodeData = node.getData()
			// 检查事件配置中是否引用了流程
			if (nodeData?.events && Array.isArray(nodeData.events)) {
				nodeData.events.forEach((event: any) => {
					if (event.action === 'callProcess' && event.params?.processId) {
						referencedWorkflowIds.add(event.params.processId)
					}
				})
			}
		})
		
		// 从localStorage加载被引用的流程数据
		if (referencedWorkflowIds.size > 0) {
			try {
				const stored = localStorage.getItem('saved-workflows')
				if (stored) {
					const allWorkflows = JSON.parse(stored)
					// 只打包被引用的流程
					exportData.workflows = allWorkflows.filter((wf: any) => 
						referencedWorkflowIds.has(wf.id)
					)
				}
			} catch (error) {
				console.error('加载流程数据失败:', error)
			}
		}
		
		const filename = exportToJSON(exportData, 'scada-export')
		
		showMessage(`已导出为 ${filename}`, 'success')
	} catch (error) {
		console.error('导出失败', error)
		showMessage('导出失败，请查看控制台', 'error')
	}
}

// 暴露核心方法给外部使用
defineExpose({
	// === 文件操作 ===
	/** 保存画布数据到 localStorage */
	save: handleSave,
	/** 触发文件选择，导入 JSON 数据 */
	importFile: handleImport,
	/** 导出画布数据为 JSON 文件 */
	exportFile: handleExport,
	
	// === 视图操作 ===
	/** 跳转到预览页面 */
	preview: handlePreview,
	/** 打开流程编排弹窗 */
	workflow: handleWorkflow,
	
	// === 画布操作 ===
	/** 放大画布 */
	zoomIn,
	/** 缩小画布 */
	zoomOut,
	/** 清空画布所有元素 */
	clearAll,
	
	// === 对齐和分布 ===
	/** 左对齐选中节点 */
	alignLeft,
	/** 水平居中选中节点 */
	alignCenter,
	/** 右对齐选中节点 */
	alignRight,
	/** 顶部对齐选中节点 */
	alignTop,
	/** 垂直居中选中节点 */
	alignMiddle,
	/** 底部对齐选中节点 */
	alignBottom,
	/** 横向分布选中节点 */
	distributeHorizontal,
	/** 纵向分布选中节点 */
	distributeVertical,
	
	// === 节点操作 ===
	/** 添加节点 */
	addNode: handleAddNode,
	/** 更新节点 */
	updateNode: handleUpdateNode,
	/** 删除节点 */
	deleteNode: handleDeleteNode,
	/** 获取当前选中的节点 */
	getSelectedNode: () => selectedNode.value,
	/** 选中节点 */
	selectNode: (nodeId: string) => {
		if (!graph) return false
		const node = graph.getCellById(nodeId)
		if (node) {
			graph.select(node)
			return true
		}
		return false
	},
	/** 取消选中 */
	clearSelection: () => {
		if (!graph) return
		graph.unselect(graph.getSelectedCells())
		selectedNode.value = null
	},
	
	// === 数据访问 ===
	/** 获取 X6 Graph 实例 */
	getGraph: () => graph,
	/** 获取画布完整数据 */
	getCanvasData: () => {
		if (!graph) return null
		return {
			version: '1.0.0',
			timestamp: formatTimestamp(getCurrentTimestamp()),
			config: canvasConfigManager.getConfig(),
			cells: graph.toJSON().cells,
			nodes: graph.getNodes().map(node => ({
				id: node.id,
				type: node.shape,
				position: node.getPosition(),
				size: node.getSize(),
				label: node.attr('label/text'),
				data: node.getData()
			})),
			edges: graph.getEdges().map(edge => ({
				id: edge.id,
				source: edge.getSourceCellId(),
				target: edge.getTargetCellId()
			}))
		}
	},
	/** 加载画布数据 */
	loadCanvasData: (data: any) => {
		if (!graph) return false
		try {
			graph.clearCells()
			graph.fromJSON({ cells: data.cells })
			if (data.config) {
				canvasConfigManager.updateConfig(data.config)
			}
			
			// 加载后，对所有启用了动画的连线应用动画
			graph.getEdges().forEach((edge: any) => {
				const edgeData = edge.getData()
				if (edgeData?.animation?.enabled) {
					applyEdgeAnimation(edge, edgeData.animation)
				}
			})
			
			return true
		} catch (error) {
			console.error('加载画布数据失败:', error)
			return false
		}
	},
	/** 获取所有节点 */
	getAllNodes: () => {
		if (!graph) return []
		return graph.getNodes().map(node => ({
			id: node.id,
			type: node.shape,
			position: node.getPosition(),
			size: node.getSize(),
			label: node.attr('label/text'),
			data: node.getData()
		}))
	},
	/** 根据ID获取节点 */
	getNodeById: (nodeId: string) => {
		if (!graph) return null
		const cell = graph.getCellById(nodeId)
		if (!cell || !cell.isNode()) return null
		const node = cell as any
		return {
			id: node.id,
			type: node.shape,
			position: node.getPosition(),
			size: node.getSize(),
			label: node.attr('label/text'),
			data: node.getData()
		}
	},
	
	// === 画布配置 ===
	/** 获取画布配置管理器 */
	getConfigManager: () => canvasConfigManager,
	/** 更新画布配置 */
	updateCanvasConfig: (config: any) => {
		canvasConfigManager.updateConfig(config)
	},
	/** 设置画布缩放 */
	setZoom: (scale: number) => {
		canvasConfigManager.setZoom(scale)
	},
	/** 设置画布大小 */
	setCanvasSize: (width: number, height: number) => {
		canvasConfigManager.updateSize({ width, height })
	},
	/** 设置背景颜色 */
	setBackgroundColor: (color: string) => {
		canvasConfigManager.updateBackground({ color })
	},
	
	// === 数据集成 ===
	/** 更新设备数据 */
	updateDeviceData: (deviceData: any) => {
		// 更新节点上的设备数据
		if (graph && deviceData?.devices) {
			deviceData.devices.forEach((device: any) => {
				device.points?.forEach((point: any) => {
					// 遍历画布上的所有节点，查找与设备点位绑定的节点
					if (graph) {
						graph.getNodes().forEach((node: any) => {
							const nodeData = node.getData()
							// 检查节点是否有绑定配置
							if (nodeData?.bindings) {
								Object.entries(nodeData.bindings).forEach(([attribute, binding]: [string, any]) => {
									if (binding.deviceId === device.id && binding.dataPoint === point.id) {
										// 更新节点的相应属性
										const value = point.value
																
										// 特殊处理文本节点
										if (attribute === 'attrs/text/text') {
											node.attr('text/text', value)
										}
										// 特殊处理颜色节点
										else if (attribute === 'attrs/body/fill') {
											node.attr('body/fill', value)
										}
										// 其他属性更新
										else {
											// 根据绑定的属性路径更新节点
											const keys = attribute.split('.')
											let target: any = node
											for (let i = 0; i < keys.length - 1; i++) {
												target = target[keys[i]]
											}
											const lastKey = keys[keys.length - 1]
											if (target && lastKey) {
												target[lastKey] = value
											}
										}
									}
								})
							}
						})
					}
				})
			})
		}
	},
	
	// === 动画控制 ===
	/** 获取动画引擎 */
	getAnimationEngine: () => animationEngine
})
</script>

<style scoped>
.scada-layout {
	width: 100%;
	height: 100vh;
	max-height: 100vh;
	display: flex;
	flex-direction: column;
	background: #1a1a2e;
}

.scada-canvas-container {
	flex: 1;
	display: flex;
	background: #0f172a;
	overflow: hidden;
	min-height: 0;
}

/* X6 选中样式增强 - 不改变边框,使用外部轮廓 */
:deep(.x6-node-selected) {
	/* 外部轮廓 */
	outline: 2px solid #3b82f6;
	outline-offset: 2px;
	/* 外部光晕 */
	box-shadow: 
		0 0 0 4px rgba(59, 130, 246, 0.15),
		0 0 12px rgba(59, 130, 246, 0.3);
	/* 平滑过渡 */
	transition: outline 0.15s ease, box-shadow 0.15s ease;
}

/* 不改变节点自身的边框样式 */
:deep(.x6-node-selected rect),
:deep(.x6-node-selected circle),
:deep(.x6-node-selected ellipse) {
	/* 保持原有边框不变 */
	filter: brightness(1.05);
}

/* 提示消息样式 */
:global(.scada-toast) {
	position: fixed;
	top: 20px;
	left: 50%;
	transform: translateX(-50%) translateY(-100px);
	padding: 12px 24px;
	border-radius: 6px;
	color: #fff;
	font-size: 14px;
	font-weight: 500;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	z-index: 9999;
	opacity: 0;
	transition: all 0.3s ease;
	pointer-events: none;
}

:global(.scada-toast.show) {
	transform: translateX(-50%) translateY(0);
	opacity: 1;
}

:global(.scada-toast-success) {
	background: linear-gradient(135deg, #10b981, #059669);
}

:global(.scada-toast-error) {
	background: linear-gradient(135deg, #ef4444, #dc2626);
}

:global(.scada-toast-warning) {
	background: linear-gradient(135deg, #f59e0b, #d97706);
}

/* 连线流动动画 */
@keyframes edge-flow {
	0% {
		stroke-dashoffset: 0;
	}
	100% {
		stroke-dashoffset: -100;
	}
}

/* 全局样式，应用到X6连线上 */
:deep(.x6-edge path) {
	transition: stroke 0.3s ease, stroke-width 0.3s ease;
}

/* 慢速流动 */
:deep(.edge-flow-slow) {
	animation: edge-flow 4s linear infinite;
}

/* 正常速度流动 */
:deep(.edge-flow-normal) {
	animation: edge-flow 2s linear infinite;
}

/* 快速流动 */
:deep(.edge-flow-fast) {
	animation: edge-flow 1s linear infinite;
}
</style>
