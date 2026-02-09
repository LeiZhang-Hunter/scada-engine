<template>
  <div class="temperature-sensor-3d-container">
    <svg viewBox="0 0 80 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- 外壳渐变 -->
        <linearGradient :id="`shell-gradient-${nodeId}`" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#64748b" />
          <stop offset="50%" stop-color="#cbd5e1" />
          <stop offset="100%" stop-color="#64748b" />
        </linearGradient>
        
        <!-- 液体渐变 -->
        <linearGradient :id="`liquid-gradient-${nodeId}`" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" :stop-color="liquidColor" />
          <stop offset="100%" :stop-color="liquidColor" stop-opacity="0.7"/>
        </linearGradient>
        
        <!-- 球泡渐变 -->
        <radialGradient :id="`bulb-gradient-${nodeId}`">
          <stop offset="0%" :stop-color="liquidColor" stop-opacity="0.9"/>
          <stop offset="70%" :stop-color="liquidColor" />
          <stop offset="100%" stop-color="#991b1b" />
        </radialGradient>
      </defs>
      
      <!-- 探头外壳 -->
      <rect 
        x="30" 
        y="15" 
        width="20" 
        height="60" 
        rx="10"
        :fill="`url(#shell-gradient-${nodeId})`"
        stroke="#475569" 
        stroke-width="1.5"
      />
      
      <!-- 玻璃管 -->
      <rect 
        x="35" 
        y="20" 
        width="10" 
        height="50" 
        rx="5"
        fill="#f8fafc"
        stroke="#cbd5e1" 
        stroke-width="1"
        opacity="0.8"
      />
      
      <!-- 温度刻度 -->
      <g opacity="0.6">
        <line x1="32" y1="25" x2="35" y2="25" stroke="#64748b" stroke-width="0.8"/>
        <text x="29" y="27" font-size="5" fill="#64748b" text-anchor="end">100</text>
        
        <line x1="32" y1="35" x2="35" y2="35" stroke="#64748b" stroke-width="0.8"/>
        <text x="29" y="37" font-size="5" fill="#64748b" text-anchor="end">75</text>
        
        <line x1="32" y1="45" x2="35" y2="45" stroke="#64748b" stroke-width="0.8"/>
        <text x="29" y="47" font-size="5" fill="#64748b" text-anchor="end">50</text>
        
        <line x1="32" y1="55" x2="35" y2="55" stroke="#64748b" stroke-width="0.8"/>
        <text x="29" y="57" font-size="5" fill="#64748b" text-anchor="end">25</text>
        
        <line x1="32" y1="65" x2="35" y2="65" stroke="#64748b" stroke-width="0.8"/>
        <text x="29" y="67" font-size="5" fill="#64748b" text-anchor="end">0</text>
      </g>
      
      <!-- 温度液柱 -->
      <rect 
        x="37" 
        :y="liquidY" 
        width="6" 
        :height="liquidHeight" 
        rx="3"
        :fill="`url(#liquid-gradient-${nodeId})`"
      />
      
      <!-- 球泡 -->
      <circle 
        cx="40" 
        cy="75" 
        r="10" 
        :fill="`url(#bulb-gradient-${nodeId})`"
        stroke="#991b1b" 
        stroke-width="1.5"
      />
      
      <!-- 球泡高光 -->
      <ellipse 
        cx="37" 
        cy="72" 
        rx="3" 
        ry="4" 
        fill="#ffffff" 
        opacity="0.4"
      />
      
      <!-- 电缆 -->
      <path
        d="M 40,85 Q 45,90 45,95 L 45,105"
        stroke="#1e293b"
        stroke-width="3"
        fill="none"
        stroke-linecap="round"
      />
      <path
        d="M 40,85 Q 35,90 35,95 L 35,105"
        stroke="#ef4444"
        stroke-width="3"
        fill="none"
        stroke-linecap="round"
      />
      
      <!-- 接线端子 -->
      <rect x="32" y="103" width="6" height="8" rx="1" fill="#fbbf24" stroke="#b45309" stroke-width="0.5"/>
      <rect x="42" y="103" width="6" height="8" rx="1" fill="#1e293b" stroke="#475569" stroke-width="0.5"/>
      
      <!-- 数显面板 -->
      <rect x="50" y="35" width="25" height="18" rx="2" fill="#0f172a" stroke="#334155" stroke-width="1"/>
      <text x="62.5" y="47" font-size="10" :fill="temperatureColor" text-anchor="middle" font-family="monospace">
        {{ temperature }}
      </text>
      <text x="62.5" y="51" font-size="4" fill="#64748b" text-anchor="middle">°C</text>
      
      <!-- 报警指示 -->
      <circle 
        cx="58" 
        cy="29" 
        r="2.5" 
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
      
      <!-- 传感器型号 -->
      <text x="40" y="115" font-size="5" fill="#64748b" text-anchor="middle" font-family="Arial">
        PT100
      </text>
    </svg>
    
    <!-- 状态文字 -->
    <div class="status-text" :class="{ 'is-alarm': isAlarm }">
      {{ temperature }}°C {{ isAlarm ? '- 超限' : '' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

interface Props {
  node?: any
}

const props = defineProps<Props>()
const nodeId = ref(`temp-sensor-${Math.random().toString(36).substr(2, 9)}`)

const getData = () => {
  if (!props.node) return {}
  const nodeData = props.node.getData ? props.node.getData() : props.node.data || {}
  return nodeData
}

const temperature = ref(25)
const maxTemp = ref(100)
const minTemp = ref(0)
const alarmHighLimit = ref(80)
const alarmLowLimit = ref(10)

const liquidHeight = computed(() => {
  const range = maxTemp.value - minTemp.value
  const ratio = Math.max(0, Math.min(1, (temperature.value - minTemp.value) / range))
  return ratio * 45
})

const liquidY = computed(() => 65 - liquidHeight.value)

const liquidColor = computed(() => {
  if (temperature.value >= alarmHighLimit.value) return '#ef4444'
  if (temperature.value <= alarmLowLimit.value) return '#3b82f6'
  if (temperature.value >= 60) return '#f97316'
  if (temperature.value >= 40) return '#fbbf24'
  return '#22c55e'
})

const temperatureColor = computed(() => {
  if (temperature.value >= alarmHighLimit.value) return '#ef4444'
  if (temperature.value <= alarmLowLimit.value) return '#3b82f6'
  return '#22c55e'
})

const isAlarm = computed(() => {
  return temperature.value >= alarmHighLimit.value || temperature.value <= alarmLowLimit.value
})

const updateSensor = () => {
  const data = getData()
  temperature.value = Math.round(data.temperature ?? 25)
  maxTemp.value = data.maxTemp || 100
  minTemp.value = data.minTemp || 0
  alarmHighLimit.value = data.alarmHighLimit || 80
  alarmLowLimit.value = data.alarmLowLimit || 10
}

watch(() => props.node, () => {
  updateSensor()
}, { deep: true })

onMounted(() => {
  updateSensor()
  
  if (props.node && typeof props.node.on === 'function') {
    props.node.on('change:data', () => {
      updateSensor()
    })
  }
})
</script>

<style scoped>
.temperature-sensor-3d-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.temperature-sensor-3d-container svg {
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
