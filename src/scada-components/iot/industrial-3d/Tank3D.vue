<template>
  <div class="tank-3d-container">
    <svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- 储罐外壳渐变 -->
        <linearGradient :id="`tank-body-${nodeId}`" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#64748b" />
          <stop offset="50%" stop-color="#cbd5e1" />
          <stop offset="100%" stop-color="#64748b" />
        </linearGradient>
        
        <!-- 液体渐变 -->
        <linearGradient :id="`liquid-${nodeId}`" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" :stop-color="liquidColor" stop-opacity="0.9"/>
          <stop offset="100%" :stop-color="liquidColor" stop-opacity="0.7"/>
        </linearGradient>
        
        <!-- 液面波动效果 -->
        <filter :id="`wave-${nodeId}`">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" result="turbulence"/>
          <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="2" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
      </defs>
      
      <!-- 罐顶 -->
      <ellipse cx="50" cy="20" rx="30" ry="8" fill="#94a3b8" stroke="#475569" stroke-width="1"/>
      <ellipse cx="50" cy="20" rx="25" ry="6" fill="#cbd5e1"/>
      
      <!-- 罐体 -->
      <rect x="20" y="20" width="60" height="90" :fill="`url(#tank-body-${nodeId})`" stroke="#475569" stroke-width="1"/>
      
      <!-- 液位刻度 -->
      <g opacity="0.6">
        <line x1="15" y1="30" x2="20" y2="30" stroke="#94a3b8" stroke-width="1"/>
        <text x="12" y="32" font-size="5" fill="#94a3b8" text-anchor="end">100%</text>
        
        <line x1="15" y1="52.5" x2="20" y2="52.5" stroke="#94a3b8" stroke-width="1"/>
        <text x="12" y="54.5" font-size="5" fill="#94a3b8" text-anchor="end">75%</text>
        
        <line x1="15" y1="75" x2="20" y2="75" stroke="#94a3b8" stroke-width="1"/>
        <text x="12" y="77" font-size="5" fill="#94a3b8" text-anchor="end">50%</text>
        
        <line x1="15" y1="97.5" x2="20" y2="97.5" stroke="#94a3b8" stroke-width="1"/>
        <text x="12" y="99.5" font-size="5" fill="#94a3b8" text-anchor="end">25%</text>
        
        <line x1="15" y1="110" x2="20" y2="110" stroke="#94a3b8" stroke-width="1"/>
        <text x="12" y="112" font-size="5" fill="#94a3b8" text-anchor="end">0%</text>
      </g>
      
      <!-- 液体 -->
      <rect 
        x="20" 
        :y="liquidY" 
        width="60" 
        :height="liquidHeight" 
        :fill="`url(#liquid-${nodeId})`"
        :filter="`url(#wave-${nodeId})`"
        opacity="0.85"
      />
      
      <!-- 液面 -->
      <ellipse 
        v-if="level > 0"
        cx="50" 
        :cy="liquidY" 
        rx="30" 
        ry="5" 
        :fill="liquidColor"
        opacity="0.6"
      />
      
      <!-- 罐底 -->
      <ellipse cx="50" cy="110" rx="30" ry="8" :fill="`url(#tank-body-${nodeId})`" stroke="#475569" stroke-width="1"/>
      
      <!-- 支撑腿 -->
      <g>
        <rect x="23" y="110" width="4" height="15" fill="#475569"/>
        <rect x="73" y="110" width="4" height="15" fill="#475569"/>
        <rect x="20" y="123" width="10" height="3" rx="1" fill="#64748b"/>
        <rect x="70" y="123" width="10" height="3" rx="1" fill="#64748b"/>
      </g>
      
      <!-- 进料口 -->
      <rect x="45" y="12" width="10" height="8" rx="1" fill="#64748b" stroke="#475569" stroke-width="0.5"/>
      <ellipse cx="50" cy="12" rx="5" ry="3" fill="#94a3b8"/>
      
      <!-- 出料口 -->
      <rect x="75" y="105" width="8" height="4" rx="1" fill="#64748b" stroke="#475569" stroke-width="0.5"/>
      
      <!-- 液位传感器 -->
      <rect x="82" y="30" width="6" height="80" rx="1" fill="#334155" opacity="0.7"/>
      <rect x="84" y="32" width="2" :height="76 * (level / 100)" fill="#22c55e"/>
      
      <!-- 压力表 -->
      <circle cx="65" cy="35" r="8" fill="#1e293b" stroke="#475569" stroke-width="1"/>
      <text x="65" y="38" font-size="5" fill="#22c55e" text-anchor="middle">{{ pressure }}</text>
      <text x="65" y="42" font-size="3" fill="#94a3b8" text-anchor="middle">kPa</text>
      
      <!-- 温度计 -->
      <rect x="32" y="35" width="4" height="15" rx="2" fill="#1e293b" stroke="#475569" stroke-width="0.5"/>
      <rect x="33" y="37" width="2" :height="temperature / 10" fill="#ef4444"/>
      <circle cx="34" cy="52" r="2" fill="#ef4444"/>
      
      <!-- 数显面板 -->
      <rect x="25" y="120" width="50" height="12" rx="2" fill="#1e293b" opacity="0.9"/>
      <text x="50" y="127" font-size="6" fill="#22c55e" text-anchor="middle" font-family="monospace">
        {{ level }}% | {{ volume }}m³
      </text>
    </svg>
    
    <!-- 状态文字 -->
    <div class="status-text">
      液位: {{ level }}% | 容量: {{ volume }}m³
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

interface Props {
  node?: any
}

const props = defineProps<Props>()
const nodeId = ref(`tank-${Math.random().toString(36).substr(2, 9)}`)

const getData = () => {
  if (!props.node) return {}
  const nodeData = props.node.getData ? props.node.getData() : props.node.data || {}
  return nodeData
}

const level = ref(50)
const capacity = ref(100)
const temperature = ref(25)
const pressure = ref(101)
const liquidColor = ref('#3b82f6')

const volume = computed(() => ((level.value / 100) * capacity.value).toFixed(1))
const liquidHeight = computed(() => (90 * level.value) / 100)
const liquidY = computed(() => 110 - liquidHeight.value)

const updateTank = () => {
  const data = getData()
  level.value = Math.max(0, Math.min(100, data.level || 50))
  capacity.value = data.capacity || 100
  temperature.value = data.temperature || 25
  pressure.value = data.pressure || 101
  liquidColor.value = data.liquidColor || '#3b82f6'
}

watch(() => props.node, () => {
  updateTank()
}, { deep: true })

onMounted(() => {
  updateTank()
  
  if (props.node && typeof props.node.on === 'function') {
    props.node.on('change:data', () => {
      updateTank()
    })
  }
})
</script>

<style scoped>
.tank-3d-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.tank-3d-container svg {
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
}
</style>
