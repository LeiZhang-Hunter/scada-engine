<template>
  <div class="filter-3d-container">
    <svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- 外壳渐变 -->
        <linearGradient :id="`shell-gradient-${nodeId}`" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#475569" />
          <stop offset="50%" stop-color="#94a3b8" />
          <stop offset="100%" stop-color="#475569" />
        </linearGradient>
        
        <!-- 滤芯渐变 -->
        <linearGradient :id="`filter-element-${nodeId}`" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" :stop-color="filterColor" />
          <stop offset="100%" :stop-color="filterColorDark" />
        </linearGradient>
      </defs>
      
      <!-- 进口管道 -->
      <rect x="0" y="43" width="25" height="14" fill="#64748b" stroke="#334155" stroke-width="1"/>
      
      <!-- 过滤器外壳 -->
      <rect 
        x="25" 
        y="20" 
        width="70" 
        height="60" 
        rx="5"
        :fill="`url(#shell-gradient-${nodeId})`"
        stroke="#334155" 
        stroke-width="2"
      />
      
      <!-- 观察窗 -->
      <ellipse 
        cx="60" 
        cy="50" 
        rx="15" 
        ry="20" 
        fill="#1e293b" 
        stroke="#64748b" 
        stroke-width="2"
        opacity="0.7"
      />
      
      <!-- 滤芯 -->
      <g>
        <!-- 滤芯本体 -->
        <rect 
          x="50" 
          y="30" 
          width="20" 
          height="40" 
          rx="2"
          :fill="`url(#filter-element-${nodeId})`"
          stroke="#475569" 
          stroke-width="1"
        />
        
        <!-- 滤网纹理 -->
        <g opacity="0.5">
          <line v-for="i in 8" :key="`v-${i}`" :x1="50 + i * 2.5" y1="30" :x2="50 + i * 2.5" y2="70" stroke="#1e293b" stroke-width="0.5"/>
          <line v-for="i in 8" :key="`h-${i}`" x1="50" :y1="30 + i * 5" x2="70" :y2="30 + i * 5" stroke="#1e293b" stroke-width="0.5"/>
        </g>
        
        <!-- 堵塞指示 -->
        <rect 
          x="52" 
          :y="70 - clogLevel * 0.4" 
          width="16" 
          :height="clogLevel * 0.4" 
          fill="#ef4444"
          opacity="0.6"
        />
      </g>
      
      <!-- 出口管道 -->
      <rect x="95" y="43" width="25" height="14" fill="#64748b" stroke="#334155" stroke-width="1"/>
      
      <!-- 排污口 -->
      <rect x="55" y="78" width="10" height="8" rx="1" fill="#334155" stroke="#1e293b" stroke-width="1"/>
      <path d="M 57,86 L 60,90 L 63,86" stroke="#64748b" stroke-width="1.5" fill="none"/>
      
      <!-- 压差指示器 -->
      <g transform="translate(80, 30)">
        <circle cx="0" cy="0" r="12" fill="#0f172a" stroke="#475569" stroke-width="1.5"/>
        <text x="0" y="4" font-size="7" :fill="pressureDropColor" text-anchor="middle" font-family="monospace">
          {{ pressureDrop }}
        </text>
        <text x="0" y="10" font-size="3" fill="#64748b" text-anchor="middle">kPa</text>
      </g>
      
      <!-- 报警指示灯 -->
      <circle 
        cx="35" 
        cy="28" 
        r="3" 
        :fill="isAlarm ? '#ef4444' : '#64748b'"
        :opacity="isAlarm ? 1 : 0.3"
      >
        <animate 
          v-if="isAlarm"
          attributeName="opacity" 
          values="1;0.3;1" 
          dur="0.8s" 
          repeatCount="indefinite"
        />
      </circle>
      
      <!-- 型号标识 -->
      <text x="60" y="95" font-size="5" fill="#64748b" text-anchor="middle" font-family="Arial">
        FLT-{{ diameter }}
      </text>
    </svg>
    
    <!-- 状态文字 -->
    <div class="status-text" :class="{ 'is-alarm': isAlarm }">
      堵塞度: {{ clogLevel }}% | 压差: {{ pressureDrop }} kPa
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

interface Props {
  node?: any
}

const props = defineProps<Props>()
const nodeId = ref(`filter-${Math.random().toString(36).substr(2, 9)}`)

const getData = () => {
  if (!props.node) return {}
  const nodeData = props.node.getData ? props.node.getData() : props.node.data || {}
  return nodeData
}

const clogLevel = ref(20)  // 堵塞程度 0-100%
const pressureDrop = ref(5)  // 压差 kPa
const diameter = ref(50)
const alarmThreshold = ref(70)

const filterColor = computed(() => {
  if (clogLevel.value >= alarmThreshold.value) return '#7f1d1d'
  if (clogLevel.value >= 50) return '#b45309'
  return '#15803d'
})

const filterColorDark = computed(() => {
  if (clogLevel.value >= alarmThreshold.value) return '#991b1b'
  if (clogLevel.value >= 50) return '#d97706'
  return '#166534'
})

const pressureDropColor = computed(() => {
  if (pressureDrop.value >= 15) return '#ef4444'
  if (pressureDrop.value >= 10) return '#f97316'
  return '#22c55e'
})

const isAlarm = computed(() => {
  return clogLevel.value >= alarmThreshold.value
})

const updateFilter = () => {
  const data = getData()
  clogLevel.value = Math.max(0, Math.min(100, data.clogLevel || 20))
  pressureDrop.value = data.pressureDrop || 5
  diameter.value = data.diameter || 50
  alarmThreshold.value = data.alarmThreshold || 70
}

watch(() => props.node, () => {
  updateFilter()
}, { deep: true })

onMounted(() => {
  updateFilter()
  
  if (props.node && typeof props.node.on === 'function') {
    props.node.on('change:data', () => {
      updateFilter()
    })
  }
})
</script>

<style scoped>
.filter-3d-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.filter-3d-container svg {
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

.status-text.is-alarm {
  color: #ef4444;
  text-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style>
