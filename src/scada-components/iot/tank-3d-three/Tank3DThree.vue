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
	<div 
		ref="containerRef" 
		class="tank-3d-three-container"
		:style="{ width: `${width}px`, height: `${height}px` }"
	>
		<!-- 数值显示 - 底部居中 -->
		<div class="tank-info">
			<span class="tank-level">{{ level.toFixed(1) }}%</span>
			<span class="tank-capacity">{{ capacity }}L</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import * as THREE from 'three'

// Props 定义 - X6 会传递 node 对象
interface Props {
	node?: any
}

const props = defineProps<Props>()

// 从 node.data 中获取数据
const getData = () => {
	if (!props.node) return {}
	const nodeData = props.node.getData ? props.node.getData() : props.node.data || {}
	return nodeData
}

// 使用 ref 存储状态（而不是 computed，确保能正确响应变化）
const nodeData = ref(getData())
const width = ref(200)
const height = ref(200)
const level = ref(50)
const capacity = ref(1000)
const liquidColor = ref('#3b82f6')
const tankColor = ref('#64748b')

// 更新所有状态
const updateComponentData = () => {
	const data = getData()
	width.value = props.node?.size?.width || 200
	height.value = props.node?.size?.height || 200
	level.value = data.level ?? 50
	capacity.value = data.capacity ?? 1000
	liquidColor.value = data.liquidColor || '#3b82f6'
	tankColor.value = data.tankColor || '#64748b'
}

const containerRef = ref<HTMLElement>()

// Three.js 对象
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let tankMesh: THREE.Mesh
let liquidMesh: THREE.Mesh
let animationId: number

// 动画相关
let currentLevel = level.value // 当前液位
let targetLevel = level.value  // 目标液位
const animationSpeed = 0.05    // 动画速度（0-1之间，值越大越快）

onMounted(() => {
	updateComponentData() // 初始化数据
	initThreeJS()
	animate()
	
	// 监听 X6 节点的 data 变化事件
	if (props.node && typeof props.node.on === 'function') {
		props.node.on('change:data', () => {
			updateComponentData() // 数据变化时更新
		})
	}
})

onUnmounted(() => {
	cleanup()
})

const initThreeJS = () => {
	if (!containerRef.value) return

	// 创建场景
	scene = new THREE.Scene()
	scene.background = new THREE.Color(0x0f172a)

	// 创建相机
	camera = new THREE.PerspectiveCamera(
		45,
		width.value / height.value,
		0.1,
		1000
	)
	camera.position.set(3, 3, 5)
	camera.lookAt(0, 0, 0)

	// 创建渲染器
	renderer = new THREE.WebGLRenderer({ 
		antialias: true,
		alpha: true
	})
	renderer.setSize(width.value, height.value)
	renderer.setPixelRatio(window.devicePixelRatio)
	containerRef.value.appendChild(renderer.domElement)

	// 创建罐体（半透明圆柱体）
	const tankGeometry = new THREE.CylinderGeometry(1, 1, 3, 32)
	const tankMaterial = new THREE.MeshPhongMaterial({
		color: tankColor.value,
		transparent: true,
		opacity: 0.3,
		side: THREE.DoubleSide,
		shininess: 100
	})
	tankMesh = new THREE.Mesh(tankGeometry, tankMaterial)
	scene.add(tankMesh)

	// 创建液体（实心圆柱体）
	const liquidGeometry = new THREE.CylinderGeometry(0.95, 0.95, 3, 32)
	const liquidMaterial = new THREE.MeshPhongMaterial({
		color: liquidColor.value,
		transparent: true,
		opacity: 0.8,
		shininess: 80
	})
	liquidMesh = new THREE.Mesh(liquidGeometry, liquidMaterial)
	updateLiquidLevel()
	scene.add(liquidMesh)

	// 添加底座
	const baseGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.2, 32)
	const baseMaterial = new THREE.MeshPhongMaterial({
		color: 0x475569,
		shininess: 50
	})
	const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial)
	baseMesh.position.y = -1.6
	scene.add(baseMesh)

	// 添加顶盖
	const topGeometry = new THREE.CylinderGeometry(1.1, 1.1, 0.2, 32)
	const topMaterial = new THREE.MeshPhongMaterial({
		color: 0x475569,
		shininess: 50
	})
	const topMesh = new THREE.Mesh(topGeometry, topMaterial)
	topMesh.position.y = 1.6
	scene.add(topMesh)

	// 添加环境光
	const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
	scene.add(ambientLight)

	// 添加方向光
	const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
	directionalLight.position.set(5, 10, 5)
	directionalLight.castShadow = true
	scene.add(directionalLight)

	// 添加补光
	const fillLight = new THREE.DirectionalLight(0xffffff, 0.3)
	fillLight.position.set(-5, 5, -5)
	scene.add(fillLight)

	// 添加网格辅助线（可选，调试用）
	// const gridHelper = new THREE.GridHelper(10, 10)
	// scene.add(gridHelper)
}

// 更新液位（使用当前动画值）
const updateLiquidLevel = () => {
	if (!liquidMesh) return
	
	const scale = Math.max(0.01, currentLevel / 100) // 最小保持 0.01，避免消失
	liquidMesh.scale.y = scale
	// 调整位置，使液体从底部开始填充
	liquidMesh.position.y = -1.5 + (scale * 1.5)
}

// 动画循环
const animate = () => {
	animationId = requestAnimationFrame(animate)
	
	// 平滑过渡液位
	if (Math.abs(currentLevel - targetLevel) > 0.1) {
		// 使用插值实现平滑过渡
		currentLevel += (targetLevel - currentLevel) * animationSpeed
		updateLiquidLevel()
	} else if (currentLevel !== targetLevel) {
		// 当差值很小时，直接设置为目标值
		currentLevel = targetLevel
		updateLiquidLevel()
	}
	
	// 缓慢旋转罐体（可选）
	if (tankMesh) {
		tankMesh.rotation.y += 0.005
	}
	if (liquidMesh) {
		liquidMesh.rotation.y += 0.005
	}
	
	renderer.render(scene, camera)
}

// 监听属性变化
watch(() => level.value, (newLevel: number) => {
	// 设置目标液位，让动画循环自动过渡
	targetLevel = newLevel
})

watch(() => liquidColor.value, (newColor: string) => {
	if (liquidMesh) {
		(liquidMesh.material as THREE.MeshPhongMaterial).color.set(newColor)
	}
})

watch(() => tankColor.value, (newColor: string) => {
	if (tankMesh) {
		(tankMesh.material as THREE.MeshPhongMaterial).color.set(newColor)
	}
})

watch([() => width.value, () => height.value], () => {
	if (renderer && camera) {
		renderer.setSize(width.value, height.value)
		camera.aspect = width.value / height.value
		camera.updateProjectionMatrix()
	}
})

// 清理资源
const cleanup = () => {
	if (animationId) {
		cancelAnimationFrame(animationId)
	}
	
	if (renderer) {
		renderer.dispose()
	}
	
	if (scene) {
		scene.traverse((object) => {
			if (object instanceof THREE.Mesh) {
				object.geometry.dispose()
				if (Array.isArray(object.material)) {
					object.material.forEach(material => material.dispose())
				} else {
					object.material.dispose()
				}
			}
		})
		scene.clear()
	}
}
</script>

<style scoped>
.tank-3d-three-container {
	position: relative;
	overflow: hidden;
	border-radius: 8px;
	background: #0f172a;
}

.tank-3d-three-container :deep(canvas) {
	display: block;
}

.tank-info {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	background: linear-gradient(to top, rgba(15, 23, 42, 0.95), transparent);
	backdrop-filter: blur(4px);
	padding: 4px 8px;
	color: #e2e8f0;
	font-family: 'Courier New', monospace;
	pointer-events: none;
	display: flex;
	gap: 8px;
	justify-content: center;
	align-items: center;
	font-size: 11px;
}

.tank-level {
	font-size: 12px;
	font-weight: bold;
	color: #3b82f6;
}

.tank-capacity {
	font-size: 11px;
	color: #94a3b8;
}
</style>
