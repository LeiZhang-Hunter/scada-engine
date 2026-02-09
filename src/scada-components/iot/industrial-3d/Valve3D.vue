<template>
  <div class="valve-3d-container">
    <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- 阀体渐变 -->
        <linearGradient :id="`valve-body-${nodeId}`" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#64748b" />
          <stop offset="50%" stop-color="#94a3b8" />
          <stop offset="100%" stop-color="#64748b" />
        </linearGradient>
        
        <!-- 手柄渐变 -->
        <linearGradient :id="`handle-gradient-${nodeId}`" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ef4444" />
          <stop offset="50%" stop-color="#dc2626" />
          <stop offset="100%" stop-color="#b91c1c" />
        </linearGradient>
      </defs>
      
      <!-- 下方管道 -->
      <rect x="40" y="85" width="20" height="30" :fill="`url(#valve-body-${nodeId})`" stroke="#475569" stroke-width="1"/>
      <ellipse cx="50" cy="85" rx="10" ry="5" fill="#94a3b8" stroke="#475569" stroke-width="1"/>
      <ellipse cx="50" cy="115" rx="10" ry="5" fill="#64748b" stroke="#475569" stroke-width="1"/>
      
      <!-- 阀体主体 -->
      <ellipse cx="50" cy="60" rx="25" ry="15" :fill="`url(#valve-body-${nodeId})`" stroke="#475569" stroke-width="1"/>
      <rect x="25" y="50" width="50" height="20" :fill="`url(#valve-body-${nodeId})`" stroke="#475569" stroke-width="1"/>
      <ellipse cx="50" cy="50" rx="25" ry="15" fill="#94a3b8" stroke="#475569" stroke-width="1"/>
      
      <!-- 法兰螺栓 -->
      <g>
        <circle cx="30" cy="55" r="2" fill="#334155"/>
        <circle cx="30" cy="65" r="2" fill="#334155"/>
        <circle cx="70" cy="55" r="2" fill="#334155"/>
        <circle cx="70" cy="65" r="2" fill="#334155"/>
      </g>
      
      <!-- 上方管道 -->
      <rect x="40" y="10" width="20" height="30" :fill="`url(#valve-body-${nodeId})`" stroke="#475569" stroke-width="1"/>
      <ellipse cx="50" cy="10" rx="10" ry="5" fill="#94a3b8" stroke="#475569" stroke-width="1"/>
      <ellipse cx="50" cy="40" rx="10" ry="5" fill="#64748b" stroke="#475569" stroke-width="1"/>
      
      <!-- 阀芯指示器 -->
      <g :transform="`translate(50, 60)`">
        <rect 
          x="-3" 
          y="-20" 
          width="6" 
          height="40" 
          rx="3"
          :fill="isOpen ? '#22c55e' : '#ef4444'"
          :transform="`rotate(${isOpen ? 0 : 90})`"
          style="transition: transform 0.5s ease"
        />
      </g>
      
      <!-- 阀芯轴 -->
      <rect x="47" y="40" width="6" height="40" rx="1" fill="#475569" stroke="#334155" stroke-width="0.5"/>
      
      <!-- 手轮 -->
      <g :transform="`rotate(${wheelRotation} 50 25)`" :style="{ transformOrigin: '50px 25px' }">
        <!-- 手轮主体 -->
        <circle cx="50" cy="25" r="15" :fill="`url(#handle-gradient-${nodeId})`" stroke="#991b1b" stroke-width="1"/>
        <circle cx="50" cy="25" r="12" fill="none" stroke="#7f1d1d" stroke-width="2"/>
        <circle cx="50" cy="25" r="5" fill="#7f1d1d"/>
        
        <!-- 辐条 -->
        <line x1="50" y1="25" x2="50" y2="12" stroke="#7f1d1d" stroke-width="2"/>
        <line x1="50" y1="25" x2="50" y2="38" stroke="#7f1d1d" stroke-width="2"/>
        <line x1="50" y1="25" x2="37" y2="25" stroke="#7f1d1d" stroke-width="2"/>
        <line x1="50" y1="25" x2="63" y2="25" stroke="#7f1d1d" stroke-width="2"/>
        
        <!-- 手柄 -->
        <rect x="63" y="23" width="8" height="4" rx="2" fill="#991b1b"/>
      </g>
      
      <!-- 状态指示标签 -->
      <g>
        <rect x="5" y="55" width="15" height="10" rx="2" :fill="isOpen ? '#22c55e' : '#ef4444'" opacity="0.9"/>
        <text x="12.5" y="62" font-size="6" fill="#ffffff" text-anchor="middle" font-weight="bold">
          {{ isOpen ? 'ON' : 'OFF' }}
        </text>
      </g>
      
      <!-- 开度百分比 -->
      <text x="85" y="62" font-size="8" fill="#cbd5e1" text-anchor="middle" font-family="monospace">
        {{ openness }}%
      </text>
    </svg>
    
    <!-- 状态文字 -->
    <div class="status-text" :class="{ 'is-open': isOpen }">
      {{ isOpen ? '开启' : '关闭' }} - {{ openness }}%
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

interface Props {
  node?: any
}

const props = defineProps<Props>()
const nodeId = ref(`valve-${Math.random().toString(36).substr(2, 9)}`)

const getData = () => {
  if (!props.node) return {}
  const nodeData = props.node.getData ? props.node.getData() : props.node.data || {}
  return nodeData
}

const isOpen = ref(false)
const openness = ref(0)
const wheelRotation = computed(() => (openness.value / 100) * 720) // 两圈

const updateValve = () => {
  const data = getData()
  isOpen.value = data.state === 'open' || data.state === true
  openness.value = data.openness !== undefined ? data.openness : (isOpen.value ? 100 : 0)
}

watch(() => props.node, () => {
  updateValve()
}, { deep: true })

onMounted(() => {
  updateValve()
  
  if (props.node && typeof props.node.on === 'function') {
    props.node.on('change:data', () => {
      updateValve()
    })
  }
})
</script>

<style scoped>
.valve-3d-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.valve-3d-container svg {
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

.status-text.is-open {
  color: #22c55e;
}
</style>
