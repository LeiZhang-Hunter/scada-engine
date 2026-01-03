<template>
  <div class="pump-3d-container">
    <svg viewBox="0 0 140 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- 泵体渐变 -->
        <radialGradient :id="`pump-body-${nodeId}`" cx="50%" cy="50%">
          <stop offset="0%" stop-color="#cbd5e1" />
          <stop offset="70%" stop-color="#94a3b8" />
          <stop offset="100%" stop-color="#64748b" />
        </radialGradient>
        
        <!-- 电机渐变 -->
        <linearGradient :id="`motor-gradient-${nodeId}`" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#94a3b8" />
          <stop offset="50%" stop-color="#64748b" />
          <stop offset="100%" stop-color="#475569" />
        </linearGradient>
        
        <!-- 水流动画 -->
        <linearGradient :id="`flow-gradient-${nodeId}`" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.3"/>
          <stop offset="50%" stop-color="#60a5fa" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.3"/>
          <animate 
            v-if="isRunning"
            attributeName="x1" 
            values="-100%;100%" 
            dur="1s" 
            repeatCount="indefinite"
          />
          <animate 
            v-if="isRunning"
            attributeName="x2" 
            values="0%;200%" 
            dur="1s" 
            repeatCount="indefinite"
          />
        </linearGradient>
      </defs>
      
      <!-- 底座 -->
      <rect x="30" y="75" width="60" height="20" rx="2" :fill="`url(#motor-gradient-${nodeId})`"/>
      <rect x="30" y="75" width="60" height="2" fill="#1e293b" opacity="0.4"/>
      
      <!-- 固定螺栓 -->
      <circle cx="35" cy="85" r="2" fill="#334155"/>
      <circle cx="85" cy="85" r="2" fill="#334155"/>
      
      <!-- 泵体主体 -->
      <ellipse cx="60" cy="50" rx="28" ry="25" :fill="`url(#pump-body-${nodeId})`" stroke="#475569" stroke-width="1.5"/>
      
      <!-- 泵体法兰 -->
      <g>
        <circle cx="40" cy="40" r="3" fill="#334155"/>
        <circle cx="40" cy="60" r="3" fill="#334155"/>
        <circle cx="80" cy="40" r="3" fill="#334155"/>
        <circle cx="80" cy="60" r="3" fill="#334155"/>
      </g>
      
      <!-- 进水管 -->
      <g>
        <rect x="5" y="45" width="28" height="10" rx="2" fill="#64748b" stroke="#475569" stroke-width="1"/>
        <ellipse cx="5" cy="50" rx="5" ry="5" fill="#94a3b8" stroke="#475569" stroke-width="1"/>
        
        <!-- 进水流动 -->
        <rect 
          v-if="isRunning"
          x="5" 
          y="46" 
          width="28" 
          height="8" 
          :fill="`url(#flow-gradient-${nodeId})`"
          opacity="0.7"
        />
      </g>
      
      <!-- 出水管 -->
      <g>
        <rect x="87" y="45" width="48" height="10" rx="2" fill="#64748b" stroke="#475569" stroke-width="1"/>
        <ellipse cx="135" cy="50" rx="5" ry="5" fill="#94a3b8" stroke="#475569" stroke-width="1"/>
        
        <!-- 出水流动 -->
        <rect 
          v-if="isRunning"
          x="87" 
          y="46" 
          width="48" 
          height="8" 
          :fill="`url(#flow-gradient-${nodeId})`"
          opacity="0.7"
        />
      </g>
      
      <!-- 叶轮中心（旋转） -->
      <g :transform="`rotate(${rotation} 60 50)`">
        <circle cx="60" cy="50" r="15" fill="#475569" opacity="0.6"/>
        <!-- 叶片 -->
        <path d="M 60 50 L 70 35 Q 75 40 70 50 Z" fill="#64748b"/>
        <path d="M 60 50 L 75 50 Q 75 55 65 60 Z" fill="#64748b"/>
        <path d="M 60 50 L 60 65 Q 55 65 50 60 Z" fill="#64748b"/>
        <path d="M 60 50 L 45 50 Q 45 45 50 40 Z" fill="#64748b"/>
      </g>
      
      <!-- 轴心 -->
      <circle cx="60" cy="50" r="5" fill="#334155" stroke="#64748b" stroke-width="1"/>
      
      <!-- 电机外壳 -->
      <rect x="50" y="20" width="20" height="10" rx="2" :fill="`url(#motor-gradient-${nodeId})`" stroke="#475569" stroke-width="1"/>
      
      <!-- 传动轴 -->
      <rect x="58" y="30" width="4" height="20" fill="#475569"/>
      
      <!-- 压力表 -->
      <g transform="translate(100, 25)">
        <circle cx="0" cy="0" r="10" fill="#1e293b" stroke="#475569" stroke-width="1"/>
        <circle cx="0" cy="0" r="8" fill="none" stroke="#64748b" stroke-width="0.5"/>
        <text x="0" y="2" font-size="5" fill="#22c55e" text-anchor="middle">{{ pressure }}</text>
        <text x="0" y="6" font-size="2.5" fill="#94a3b8" text-anchor="middle">bar</text>
      </g>
      
      <!-- 流量计 -->
      <g transform="translate(115, 35)">
        <rect x="-8" y="-6" width="16" height="12" rx="1" fill="#1e293b" stroke="#475569" stroke-width="0.5"/>
        <text x="0" y="1" font-size="4" fill="#3b82f6" text-anchor="middle">{{ flowRate }}</text>
        <text x="0" y="4.5" font-size="2" fill="#94a3b8" text-anchor="middle">m³/h</text>
      </g>
      
      <!-- 状态指示灯 -->
      <circle 
        cx="25" 
        cy="30" 
        r="4" 
        :fill="isRunning ? '#22c55e' : '#ef4444'"
      />
      <circle 
        cx="25" 
        cy="30" 
        r="2" 
        fill="#ffffff"
        :opacity="isRunning ? 0.6 : 0.2"
      />
      
      <!-- 铭牌 -->
      <rect x="45" y="62" width="30" height="8" rx="1" fill="#1e293b" opacity="0.7"/>
      <text x="60" y="68" font-size="4" fill="#cbd5e1" text-anchor="middle" font-family="monospace">
        {{ power }}kW {{ speed }}rpm
      </text>
    </svg>
    
    <!-- 状态文字 -->
    <div class="status-text" :class="{ 'is-running': isRunning }">
      {{ isRunning ? '运行中' : '已停止' }} | {{ flowRate }}m³/h
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

interface Props {
  node?: any
}

const props = defineProps<Props>()
const nodeId = ref(`pump-${Math.random().toString(36).substr(2, 9)}`)

const getData = () => {
  if (!props.node) return {}
  const nodeData = props.node.getData ? props.node.getData() : props.node.data || {}
  return nodeData
}

const isRunning = ref(false)
const speed = ref(2900)
const power = ref(5.5)
const flowRate = ref(0)
const pressure = ref(0)
const rotation = ref(0)
let animationId: number | null = null

const animate = () => {
  if (isRunning.value) {
    // 根据转速动态调整旋转速度，转速越高旋转越快
    const rotationSpeed = (speed.value / 360) // 2900rpm -> 8度/帧
    rotation.value = (rotation.value + rotationSpeed) % 360
  }
  animationId = requestAnimationFrame(animate)
}

const updatePump = () => {
  const data = getData()
  isRunning.value = data.state === 'running' || data.state === true
  speed.value = data.speed || 2900
  power.value = data.power || 5.5
  flowRate.value = isRunning.value ? (data.flowRate || 15) : 0
  pressure.value = isRunning.value ? (data.pressure || 3.5).toFixed(1) : 0
}

watch(() => props.node, () => {
  updatePump()
}, { deep: true })

onMounted(() => {
  updatePump()
  
  // 只在运行状态下启动动画
  if (isRunning.value) {
    animate()
  }
  
  if (props.node && typeof props.node.on === 'function') {
    props.node.on('change:data', () => {
      const wasRunning = isRunning.value
      updatePump()
      
      // 状态变化时控制动画
      if (isRunning.value && !wasRunning) {
        animate()
      } else if (!isRunning.value && wasRunning) {
        if (animationId) {
          cancelAnimationFrame(animationId)
          animationId = null
        }
      }
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
.pump-3d-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.pump-3d-container svg {
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
