<template>
  <div class="motor-3d-container">
    <svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- 电机外壳渐变 -->
        <linearGradient :id="`motor-body-${nodeId}`" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#94a3b8" />
          <stop offset="50%" stop-color="#64748b" />
          <stop offset="100%" stop-color="#475569" />
        </linearGradient>
        
        <!-- 转轴渐变 -->
        <linearGradient :id="`shaft-gradient-${nodeId}`" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#94a3b8" />
          <stop offset="50%" stop-color="#cbd5e1" />
          <stop offset="100%" stop-color="#64748b" />
        </linearGradient>
        
        <!-- 运行指示灯光晕 -->
        <filter :id="`indicator-glow-${nodeId}`">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- 底座 -->
      <rect x="20" y="70" width="80" height="25" rx="3" :fill="`url(#motor-body-${nodeId})`"/>
      <rect x="20" y="70" width="80" height="3" fill="#1e293b" opacity="0.3"/>
      
      <!-- 固定螺栓 -->
      <circle cx="30" cy="82" r="3" fill="#334155"/>
      <circle cx="30" cy="82" r="1.5" fill="#64748b"/>
      <circle cx="90" cy="82" r="3" fill="#334155"/>
      <circle cx="90" cy="82" r="1.5" fill="#64748b"/>
      
      <!-- 电机主体 -->
      <ellipse cx="60" cy="45" rx="35" ry="25" :fill="`url(#motor-body-${nodeId})`" stroke="#334155" stroke-width="1"/>
      
      <!-- 电机外壳纹理 -->
      <g opacity="0.3">
        <line x1="30" y1="30" x2="30" y2="60" stroke="#1e293b" stroke-width="1"/>
        <line x1="40" y1="25" x2="40" y2="65" stroke="#1e293b" stroke-width="1"/>
        <line x1="50" y1="22" x2="50" y2="68" stroke="#1e293b" stroke-width="1"/>
        <line x1="60" y1="20" x2="60" y2="70" stroke="#1e293b" stroke-width="1"/>
        <line x1="70" y1="22" x2="70" y2="68" stroke="#1e293b" stroke-width="1"/>
        <line x1="80" y1="25" x2="80" y2="65" stroke="#1e293b" stroke-width="1"/>
        <line x1="90" y1="30" x2="90" y2="60" stroke="#1e293b" stroke-width="1"/>
      </g>
      
      <!-- 散热片 -->
      <rect x="25" y="40" width="2" height="10" fill="#475569" opacity="0.6"/>
      <rect x="30" y="38" width="2" height="14" fill="#475569" opacity="0.6"/>
      <rect x="35" y="36" width="2" height="18" fill="#475569" opacity="0.6"/>
      
      <!-- 转轴 -->
      <rect x="95" y="42" width="20" height="6" rx="1" :fill="`url(#shaft-gradient-${nodeId})`" stroke="#475569" stroke-width="0.5"/>
      
      <!-- 风扇叶片（旋转） -->
      <g :transform="`rotate(${rotation} 105 45)`">
        <g opacity="0.8">
          <rect x="103" y="40" width="4" height="10" rx="1" fill="#94a3b8"/>
          <rect x="100" y="43" width="10" height="4" rx="1" fill="#94a3b8"/>
          <line x1="102" y1="42" x2="108" y2="48" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
          <line x1="108" y1="42" x2="102" y2="48" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
        </g>
      </g>
      
      <!-- 中心轴承 -->
      <circle cx="105" cy="45" r="3" fill="#334155" stroke="#64748b" stroke-width="1"/>
      
      <!-- 接线盒 -->
      <rect x="45" y="15" width="15" height="10" rx="1" fill="#334155" stroke="#475569" stroke-width="0.5"/>
      <circle cx="48" cy="20" r="1" fill="#dc2626"/>
      <circle cx="52" cy="20" r="1" fill="#22c55e"/>
      <circle cx="56" cy="20" r="1" fill="#3b82f6"/>
      
      <!-- 运行状态指示灯 -->
      <circle 
        cx="15" 
        cy="45" 
        r="4" 
        :fill="isRunning ? '#22c55e' : '#ef4444'"
        :filter="isRunning ? `url(#indicator-glow-${nodeId})` : 'none'"
      />
      <circle 
        cx="15" 
        cy="45" 
        r="2" 
        fill="#ffffff"
        :opacity="isRunning ? 0.6 : 0.2"
      />
      
      <!-- 铭牌 -->
      <rect x="40" y="55" width="40" height="8" rx="1" fill="#1e293b" opacity="0.7"/>
      <text x="60" y="61" font-size="4" fill="#cbd5e1" text-anchor="middle" font-family="monospace">
        {{ power }}kW {{ speed }}rpm
      </text>
    </svg>
    
    <!-- 状态文字 -->
    <div class="status-text" :class="{ 'is-running': isRunning }">
      {{ isRunning ? '运行中' : '已停止' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { animationScheduler } from '../../utils/animationScheduler'

interface Props {
  node?: any
}

const props = defineProps<Props>()
const nodeId = computed(() => props.node?.id || `motor-${Math.random().toString(36).substr(2, 9)}`)

const getData = () => {
  if (!props.node) return {}
  const nodeData = props.node.getData ? props.node.getData() : props.node.data || {}
  return nodeData
}

const isRunning = ref(false)
const speed = ref(1500)
const power = ref(7.5)
const rotation = ref(0)

// 旋转动画
const animate = (deltaTime: number) => {
  if (isRunning.value) {
    const rotationSpeed = (speed.value / 60) * (deltaTime / 1000) * 360
    rotation.value = (rotation.value + rotationSpeed) % 360
  }
}

const updateMotor = () => {
  const data = getData()
  const newRunning = data.state === 'running' || data.state === true
  
  if (newRunning !== isRunning.value) {
    animationScheduler.setEnabled(nodeId.value, newRunning)
  }
  
  isRunning.value = newRunning
  speed.value = data.speed || 1500
  power.value = data.power || 7.5
}

watch(() => props.node, () => {
  updateMotor()
}, { deep: true })

onMounted(() => {
  updateMotor()
  
  animationScheduler.register(nodeId.value, animate)
  animationScheduler.setEnabled(nodeId.value, isRunning.value)
  
  if (props.node && typeof props.node.on === 'function') {
    props.node.on('change:data', () => {
      updateMotor()
    })
  }
})

onUnmounted(() => {
  animationScheduler.unregister(nodeId.value)
})
</script>

<style scoped>
.motor-3d-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.motor-3d-container svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.status-text {
  position: absolute;
  bottom: -20px;
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
  transition: all 0.3s ease;
}

.status-text.is-running {
  color: #22c55e;
  text-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
}
</style>
