<template>
  <div class="conveyor-3d-container">
    <svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- 传送带表面渐变 -->
        <linearGradient :id="`belt-gradient-${nodeId}`" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#1e293b" />
          <stop offset="50%" stop-color="#334155" />
          <stop offset="100%" stop-color="#1e293b" />
        </linearGradient>
        
        <!-- 滚轮渐变 -->
        <radialGradient :id="`roller-gradient-${nodeId}`">
          <stop offset="0%" stop-color="#64748b" />
          <stop offset="70%" stop-color="#475569" />
          <stop offset="100%" stop-color="#334155" />
        </radialGradient>
        
        <!-- 物料渐变 -->
        <linearGradient :id="`cargo-gradient-${nodeId}`" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#3b82f6" />
          <stop offset="50%" stop-color="#60a5fa" />
          <stop offset="100%" stop-color="#3b82f6" />
        </linearGradient>
      </defs>
      
      <!-- 传送带底座 -->
      <rect x="10" y="45" width="180" height="25" rx="3" fill="#0f172a" stroke="#475569" stroke-width="1"/>
      
      <!-- 左侧滚轮 -->
      <circle 
        cx="25" 
        cy="50" 
        r="12" 
        :fill="`url(#roller-gradient-${nodeId})`" 
        stroke="#1e293b" 
        stroke-width="2"
        :transform="`rotate(${rollerRotation}, 25, 50)`"
      />
      <!-- 滚轮纹理 -->
      <g v-for="i in 8" :key="`left-${i}`">
        <line 
          :x1="25" 
          :y1="38" 
          :x2="25" 
          :y2="42" 
          stroke="#1e293b" 
          stroke-width="1.5"
          :transform="`rotate(${rollerRotation + i * 45}, 25, 50)`"
        />
      </g>
      
      <!-- 右侧滚轮 -->
      <circle 
        cx="175" 
        cy="50" 
        r="12" 
        :fill="`url(#roller-gradient-${nodeId})`" 
        stroke="#1e293b" 
        stroke-width="2"
        :transform="`rotate(${rollerRotation}, 175, 50)`"
      />
      <!-- 滚轮纹理 -->
      <g v-for="i in 8" :key="`right-${i}`">
        <line 
          :x1="175" 
          :y1="38" 
          :x2="175" 
          :y2="42" 
          stroke="#1e293b" 
          stroke-width="1.5"
          :transform="`rotate(${rollerRotation + i * 45}, 175, 50)`"
        />
      </g>
      
      <!-- 传送带表面 -->
      <rect 
        x="25" 
        y="38" 
        width="150" 
        height="24" 
        :fill="`url(#belt-gradient-${nodeId})`"
      />
      
      <!-- 传送带纹理线条 -->
      <g v-for="i in 10" :key="`line-${i}`">
        <line 
          :x1="25 + (i * 15) + beltOffset" 
          :y1="38" 
          :x2="25 + (i * 15) + beltOffset" 
          :y2="62" 
          stroke="#475569" 
          stroke-width="1.5"
          opacity="0.5"
        />
      </g>
      
      <!-- 物料（运行时显示） -->
      <rect 
        v-if="isRunning"
        :x="cargoX" 
        y="30" 
        width="30" 
        height="20" 
        rx="2"
        :fill="`url(#cargo-gradient-${nodeId})`"
        stroke="#2563eb" 
        stroke-width="1"
        opacity="0.9"
      />
      
      <!-- 支撑腿 -->
      <g>
        <rect x="20" y="68" width="4" height="8" fill="#475569"/>
        <rect x="96" y="68" width="4" height="8" fill="#475569"/>
        <rect x="172" y="68" width="4" height="8" fill="#475569"/>
        <rect x="18" y="74" width="8" height="2" rx="1" fill="#64748b"/>
        <rect x="94" y="74" width="8" height="2" rx="1" fill="#64748b"/>
        <rect x="170" y="74" width="8" height="2" rx="1" fill="#64748b"/>
      </g>
      
      <!-- 电机 -->
      <rect x="180" y="52" width="15" height="18" rx="2" fill="#334155" stroke="#475569" stroke-width="1"/>
      <circle cx="187.5" cy="61" r="3" fill="#64748b"/>
      
      <!-- 运行指示灯 -->
      <circle 
        cx="15" 
        cy="55" 
        r="3" 
        :fill="isRunning ? '#22c55e' : '#ef4444'"
        :opacity="isRunning ? 1 : 0.5"
      >
        <animate 
          v-if="isRunning"
          attributeName="opacity" 
          values="1;0.4;1" 
          dur="1s" 
          repeatCount="indefinite"
        />
      </circle>
      
      <!-- 速度显示 -->
      <text x="100" y="20" font-size="10" fill="#94a3b8" text-anchor="middle" font-family="monospace">
        {{ speed }} m/min
      </text>
    </svg>
    
    <!-- 状态文字 -->
    <div class="status-text" :class="{ 'is-running': isRunning }">
      {{ isRunning ? '运行中' : '停止' }} | {{ speed }} m/min
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

interface Props {
  node?: any
}

const props = defineProps<Props>()
const nodeId = ref(`conveyor-${Math.random().toString(36).substr(2, 9)}`)

const getData = () => {
  if (!props.node) return {}
  const nodeData = props.node.getData ? props.node.getData() : props.node.data || {}
  return nodeData
}

const isRunning = ref(false)
const speed = ref(10)
const direction = ref<'forward' | 'reverse'>('forward')

const rollerRotation = ref(0)
const beltOffset = ref(0)
const cargoX = ref(30)

let animationId: number | null = null

const animate = () => {
  if (isRunning.value) {
    const rotationSpeed = speed.value / 10
    const moveSpeed = speed.value / 5
    
    if (direction.value === 'forward') {
      rollerRotation.value = (rollerRotation.value + rotationSpeed) % 360
      beltOffset.value = (beltOffset.value + moveSpeed) % 15
      cargoX.value = cargoX.value + moveSpeed
      if (cargoX.value > 180) cargoX.value = 20
    } else {
      rollerRotation.value = (rollerRotation.value - rotationSpeed + 360) % 360
      beltOffset.value = (beltOffset.value - moveSpeed + 15) % 15
      cargoX.value = cargoX.value - moveSpeed
      if (cargoX.value < 20) cargoX.value = 180
    }
  }
  
  animationId = requestAnimationFrame(animate)
}

const updateConveyor = () => {
  const data = getData()
  isRunning.value = data.state === 'running' || data.state === true
  speed.value = data.speed || 10
  direction.value = data.direction || 'forward'
}

watch(() => props.node, () => {
  updateConveyor()
}, { deep: true })

onMounted(() => {
  updateConveyor()
  animate()
  
  if (props.node && typeof props.node.on === 'function') {
    props.node.on('change:data', () => {
      updateConveyor()
    })
  }
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<style scoped>
.conveyor-3d-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.conveyor-3d-container svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.status-text {
  position: absolute;
  bottom: -20px;
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
  transition: all 0.3s ease;
}

.status-text.is-running {
  color: #22c55e;
  text-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
}
</style>
