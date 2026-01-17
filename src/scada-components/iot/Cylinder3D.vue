<template>
  <div class="cylinder-3d-container">
    <svg viewBox="0 0 60 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- 气缸筒体渐变 -->
        <linearGradient :id="`cylinder-gradient-${nodeId}`" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#475569" />
          <stop offset="30%" stop-color="#94a3b8" />
          <stop offset="70%" stop-color="#cbd5e1" />
          <stop offset="100%" stop-color="#475569" />
        </linearGradient>
        
        <!-- 活塞杆渐变 -->
        <linearGradient :id="`rod-gradient-${nodeId}`" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#64748b" />
          <stop offset="50%" stop-color="#94a3b8" />
          <stop offset="100%" stop-color="#64748b" />
        </linearGradient>
        
        <!-- 端盖渐变 -->
        <radialGradient :id="`cap-gradient-${nodeId}`">
          <stop offset="0%" stop-color="#64748b" />
          <stop offset="70%" stop-color="#475569" />
          <stop offset="100%" stop-color="#334155" />
        </radialGradient>
      </defs>
      
      <!-- 后端盖 -->
      <ellipse 
        cx="30" 
        cy="80" 
        rx="15" 
        ry="8" 
        :fill="`url(#cap-gradient-${nodeId})`"
        stroke="#1e293b" 
        stroke-width="1"
      />
      
      <!-- 气缸筒体 -->
      <rect 
        x="15" 
        y="50" 
        width="30" 
        height="60" 
        :fill="`url(#cylinder-gradient-${nodeId})`"
        stroke="#334155" 
        stroke-width="1"
      />
      
      <!-- 气缸纹理 -->
      <g opacity="0.2">
        <line x1="15" y1="55" x2="45" y2="55" stroke="#1e293b" stroke-width="0.5"/>
        <line x1="15" y1="65" x2="45" y2="65" stroke="#1e293b" stroke-width="0.5"/>
        <line x1="15" y1="75" x2="45" y2="75" stroke="#1e293b" stroke-width="0.5"/>
        <line x1="15" y1="85" x2="45" y2="85" stroke="#1e293b" stroke-width="0.5"/>
        <line x1="15" y1="95" x2="45" y2="95" stroke="#1e293b" stroke-width="0.5"/>
        <line x1="15" y1="105" x2="45" y2="105" stroke="#1e293b" stroke-width="0.5"/>
      </g>
      
      <!-- 前端盖 -->
      <ellipse 
        cx="30" 
        cy="50" 
        rx="15" 
        ry="8" 
        :fill="`url(#cap-gradient-${nodeId})`"
        stroke="#1e293b" 
        stroke-width="1"
      />
      
      <!-- 活塞杆 -->
      <rect 
        x="26" 
        :y="rodY" 
        width="8" 
        :height="rodLength" 
        :fill="`url(#rod-gradient-${nodeId})`"
        stroke="#475569" 
        stroke-width="0.5"
      />
      
      <!-- 活塞杆端部 -->
      <ellipse 
        cx="30" 
        :cy="rodY" 
        rx="4" 
        ry="2" 
        fill="#94a3b8"
        stroke="#64748b" 
        stroke-width="0.5"
      />
      
      <!-- 活塞 -->
      <ellipse 
        cx="30" 
        :cy="pistonY" 
        rx="13" 
        ry="6" 
        fill="#64748b"
        stroke="#334155" 
        stroke-width="1"
      />
      
      <!-- 进气口 A -->
      <circle cx="48" cy="58" r="3" fill="#3b82f6" stroke="#1e40af" stroke-width="1"/>
      <text x="55" y="60" font-size="6" fill="#3b82f6" font-weight="bold">A</text>
      
      <!-- 排气口 B -->
      <circle cx="48" cy="102" r="3" fill="#ef4444" stroke="#991b1b" stroke-width="1"/>
      <text x="55" y="104" font-size="6" fill="#ef4444" font-weight="bold">B</text>
      
      <!-- 磁性开关（上限位） -->
      <rect 
        :x="isExtended ? 48 : 50" 
        y="52" 
        width="6" 
        height="4" 
        rx="1"
        :fill="isExtended ? '#22c55e' : '#64748b'"
        stroke="#334155" 
        stroke-width="0.5"
      />
      
      <!-- 磁性开关（下限位） -->
      <rect 
        :x="isRetracted ? 48 : 50" 
        y="104" 
        width="6" 
        height="4" 
        rx="1"
        :fill="isRetracted ? '#22c55e' : '#64748b'"
        stroke="#334155" 
        stroke-width="0.5"
      />
      
      <!-- 安装支架 -->
      <g>
        <rect x="5" y="78" width="8" height="4" rx="1" fill="#334155"/>
        <circle cx="7" cy="80" r="2" fill="#64748b" stroke="#1e293b" stroke-width="0.5"/>
        
        <rect x="47" y="78" width="8" height="4" rx="1" fill="#334155"/>
        <circle cx="53" cy="80" r="2" fill="#64748b" stroke="#1e293b" stroke-width="0.5"/>
      </g>
      
      <!-- 型号标识 -->
      <text x="30" y="125" font-size="5" fill="#64748b" text-anchor="middle" font-family="Arial">
        {{ stroke }}mm
      </text>
      
      <!-- 位置显示 -->
      <text x="30" y="18" font-size="8" fill="#22c55e" text-anchor="middle" font-family="monospace">
        {{ position }}mm
      </text>
    </svg>
    
    <!-- 状态文字 -->
    <div class="status-text" :class="statusClass">
      {{ statusText }}
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
const nodeId = computed(() => props.node?.id || `cylinder-${Math.random().toString(36).substr(2, 9)}`)

const getData = () => {
  if (!props.node) return {}
  const nodeData = props.node.getData ? props.node.getData() : props.node.data || {}
  return nodeData
}

const position = ref(0)  // 当前位置 (mm)
const stroke = ref(50)   // 行程 (mm)
const speed = ref(200)   // 速度 (mm/s)
const action = ref<'extend' | 'retract' | 'stop'>('stop')

const isExtended = computed(() => position.value >= stroke.value)
const isRetracted = computed(() => position.value <= 0)

const rodLength = computed(() => {
  // 活塞杆长度 = 基础长度 + 伸出长度
  const baseLength = 30
  const extendLength = (position.value / stroke.value) * 40
  return baseLength + extendLength
})

const rodY = computed(() => {
  // 活塞杆起始位置
  return 50 - rodLength.value
})

const pistonY = computed(() => {
  // 活塞位置在气缸内
  return 110 - (position.value / stroke.value) * 60
})

const statusText = computed(() => {
  if (isExtended.value) return '伸出到位'
  if (isRetracted.value) return '缩回到位'
  if (action.value === 'extend') return '正在伸出'
  if (action.value === 'retract') return '正在缩回'
  return '停止'
})

const statusClass = computed(() => {
  if (isExtended.value || isRetracted.value) return 'is-positioned'
  if (action.value !== 'stop') return 'is-moving'
  return ''
})

const animate = (deltaTime: number) => {
  const deltaTimeInSeconds = deltaTime / 1000  // 转换为秒
  
  if (action.value === 'extend' && position.value < stroke.value) {
    position.value = Math.min(stroke.value, position.value + speed.value * deltaTimeInSeconds)
  } else if (action.value === 'retract' && position.value > 0) {
    position.value = Math.max(0, position.value - speed.value * deltaTimeInSeconds)
  }
  
  // 四舍五入到整数
  position.value = Math.round(position.value)
}

const updateCylinder = () => {
  const data = getData()
  const newAction = data.action || 'stop'
  const isMoving = newAction !== 'stop'
  
  // 状态变化时启用/禁用动画
  if (newAction !== action.value) {
    animationScheduler.setEnabled(nodeId.value, isMoving)
  }
  
  action.value = newAction
  stroke.value = data.stroke || 50
  speed.value = data.speed || 200
  
  // 如果有明确的位置设置,直接设置位置
  if (typeof data.position === 'number') {
    position.value = Math.max(0, Math.min(stroke.value, data.position))
  }
}

watch(() => props.node, () => {
  updateCylinder()
}, { deep: true })

onMounted(() => {
  updateCylinder()
  
  // 注册动画，只在运动时启用
  animationScheduler.register(nodeId.value, animate)
  animationScheduler.setEnabled(nodeId.value, action.value !== 'stop')
  
  if (props.node && typeof props.node.on === 'function') {
    props.node.on('change:data', () => {
      updateCylinder()
    })
  }
})

onUnmounted(() => {
  animationScheduler.unregister(nodeId.value)
})
</script>

<style scoped>
.cylinder-3d-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.cylinder-3d-container svg {
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

.status-text.is-moving {
  color: #3b82f6;
}

.status-text.is-positioned {
  color: #22c55e;
}
</style>
