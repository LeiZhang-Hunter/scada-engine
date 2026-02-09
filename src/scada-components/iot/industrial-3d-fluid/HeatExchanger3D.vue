<template>
  <div class="heat-exchanger-3d-container">
    <svg viewBox="0 0 140 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- 外壳渐变 -->
        <linearGradient :id="`shell-gradient-${nodeId}`" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#475569" />
          <stop offset="50%" stop-color="#94a3b8" />
          <stop offset="100%" stop-color="#475569" />
        </linearGradient>
        
        <!-- 热侧流体渐变 -->
        <linearGradient :id="`hot-fluid-${nodeId}`" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ef4444" stop-opacity="0.3"/>
          <stop offset="50%" stop-color="#ef4444" stop-opacity="0.7"/>
          <stop offset="100%" stop-color="#ef4444" stop-opacity="0.3"/>
        </linearGradient>
        
        <!-- 冷侧流体渐变 -->
        <linearGradient :id="`cold-fluid-${nodeId}`" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.3"/>
          <stop offset="50%" stop-color="#3b82f6" stop-opacity="0.7"/>
          <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.3"/>
        </linearGradient>
      </defs>
      
      <!-- 换热器主体外壳 -->
      <rect 
        x="20" 
        y="30" 
        width="100" 
        height="60" 
        rx="8"
        :fill="`url(#shell-gradient-${nodeId})`"
        stroke="#334155" 
        stroke-width="2"
      />
      
      <!-- 隔板 -->
      <line x1="70" y1="30" x2="70" y2="90" stroke="#64748b" stroke-width="2"/>
      
      <!-- 换热管束 -->
      <g opacity="0.6">
        <line v-for="i in 8" :key="`tube-${i}`" x1="25" :y1="35 + i * 7" x2="115" :y2="35 + i * 7" stroke="#475569" stroke-width="1.5"/>
      </g>
      
      <!-- 热侧进口（上） -->
      <g>
        <rect x="60" y="10" width="20" height="20" rx="2" fill="#64748b" stroke="#334155" stroke-width="1"/>
        <text x="70" y="23" font-size="6" fill="#ef4444" text-anchor="middle" font-weight="bold">H-IN</text>
        <!-- 热流体动画 -->
        <rect 
          v-if="isWorking"
          x="65" 
          :y="10 + hotInOffset" 
          width="10" 
          height="8" 
          :fill="`url(#hot-fluid-${nodeId})`"
        />
      </g>
      
      <!-- 热侧出口（下） -->
      <g>
        <rect x="60" y="90" width="20" height="20" rx="2" fill="#64748b" stroke="#334155" stroke-width="1"/>
        <text x="70" y="103" font-size="6" fill="#f97316" text-anchor="middle" font-weight="bold">H-OUT</text>
        <!-- 热流体动画 -->
        <rect 
          v-if="isWorking"
          x="65" 
          :y="90 + hotOutOffset" 
          width="10" 
          height="8" 
          :fill="`url(#hot-fluid-${nodeId})`"
          opacity="0.7"
        />
      </g>
      
      <!-- 冷侧进口（左） -->
      <g>
        <rect x="0" y="53" width="20" height="14" rx="2" fill="#64748b" stroke="#334155" stroke-width="1"/>
        <text x="10" y="62" font-size="5" fill="#3b82f6" text-anchor="middle" font-weight="bold">C-IN</text>
        <!-- 冷流体动画 -->
        <rect 
          v-if="isWorking"
          :x="coldInOffset" 
          y="56" 
          width="8" 
          height="8" 
          :fill="`url(#cold-fluid-${nodeId})`"
        />
      </g>
      
      <!-- 冷侧出口（右） -->
      <g>
        <rect x="120" y="53" width="20" height="14" rx="2" fill="#64748b" stroke="#334155" stroke-width="1"/>
        <text x="130" y="62" font-size="5" fill="#60a5fa" text-anchor="middle" font-weight="bold">C-OUT</text>
        <!-- 冷流体动画 -->
        <rect 
          v-if="isWorking"
          :x="120 + coldOutOffset" 
          y="56" 
          width="8" 
          height="8" 
          :fill="`url(#cold-fluid-${nodeId})`"
          opacity="0.7"
        />
      </g>
      
      <!-- 换热效率指示 -->
      <g transform="translate(70, 60)">
        <circle cx="0" cy="0" r="15" fill="#0f172a" stroke="#475569" stroke-width="2"/>
        <text x="0" y="2" font-size="10" :fill="efficiencyColor" text-anchor="middle" font-family="monospace" font-weight="bold">
          {{ efficiency }}
        </text>
        <text x="0" y="8" font-size="4" fill="#64748b" text-anchor="middle">%</text>
      </g>
      
      <!-- 温度显示（热侧） -->
      <g transform="translate(95, 50)">
        <rect x="-15" y="-8" width="30" height="16" rx="2" fill="#1e293b" stroke="#ef4444" stroke-width="1"/>
        <text x="0" y="-1" font-size="6" fill="#ef4444" text-anchor="middle">{{ hotTempIn }}°C</text>
        <text x="0" y="6" font-size="5" fill="#f97316" text-anchor="middle">→{{ hotTempOut }}°C</text>
      </g>
      
      <!-- 温度显示（冷侧） -->
      <g transform="translate(45, 70)">
        <rect x="-15" y="-8" width="30" height="16" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1"/>
        <text x="0" y="-1" font-size="6" fill="#3b82f6" text-anchor="middle">{{ coldTempIn }}°C</text>
        <text x="0" y="6" font-size="5" fill="#60a5fa" text-anchor="middle">→{{ coldTempOut }}°C</text>
      </g>
      
      <!-- 运行指示灯 -->
      <circle 
        cx="30" 
        cy="38" 
        r="3" 
        :fill="isWorking ? '#22c55e' : '#64748b'"
        :opacity="isWorking ? 1 : 0.3"
      >
        <animate 
          v-if="isWorking"
          attributeName="opacity" 
          values="1;0.5;1" 
          dur="1.5s" 
          repeatCount="indefinite"
        />
      </circle>
      
      <!-- 型号标识 -->
      <text x="70" y="115" font-size="5" fill="#64748b" text-anchor="middle" font-family="Arial">
        HEX-{{ heatTransferArea }}m²
      </text>
    </svg>
    
    <!-- 状态文字 -->
    <div class="status-text" :class="{ 'is-working': isWorking }">
      {{ isWorking ? '运行中' : '停止' }} | 效率: {{ efficiency }}%
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { animationScheduler } from '../../../utils/animationScheduler'

interface Props {
  node?: any
}

const props = defineProps<Props>()
const nodeId = computed(() => props.node?.id || `hex-${Math.random().toString(36).substr(2, 9)}`)

const getData = () => {
  if (!props.node) return {}
  const nodeData = props.node.getData ? props.node.getData() : props.node.data || {}
  return nodeData
}

const isWorking = ref(false)
const hotTempIn = ref(80)
const hotTempOut = ref(50)
const coldTempIn = ref(20)
const coldTempOut = ref(40)
const heatTransferArea = ref(10)

const efficiency = computed(() => {
  if (hotTempIn.value <= hotTempOut.value) return 0
  const maxTempDrop = hotTempIn.value - coldTempIn.value
  const actualTempDrop = hotTempIn.value - hotTempOut.value
  const eff = Math.round((actualTempDrop / maxTempDrop) * 100)
  return Math.max(0, Math.min(100, eff))
})

const efficiencyColor = computed(() => {
  if (efficiency.value >= 80) return '#22c55e'
  if (efficiency.value >= 60) return '#fbbf24'
  if (efficiency.value >= 40) return '#f97316'
  return '#ef4444'
})

const hotInOffset = ref(0)
const hotOutOffset = ref(0)
const coldInOffset = ref(0)
const coldOutOffset = ref(0)

const animate = (deltaTime: number) => {
  if (isWorking.value) {
    const factor = deltaTime / 16.67
    const speed = 0.5 * factor
    hotInOffset.value = (hotInOffset.value + speed) % 20
    hotOutOffset.value = (hotOutOffset.value + speed) % 20
    coldInOffset.value = (coldInOffset.value + speed) % 20
    coldOutOffset.value = (coldOutOffset.value + speed) % 20
  }
}

const updateHeatExchanger = () => {
  const data = getData()
  const newWorking = data.state === 'working' || data.state === true
  
  if (newWorking !== isWorking.value) {
    animationScheduler.setEnabled(nodeId.value, newWorking)
  }
  
  isWorking.value = newWorking
  hotTempIn.value = data.hotTempIn || 80
  hotTempOut.value = data.hotTempOut || 50
  coldTempIn.value = data.coldTempIn || 20
  coldTempOut.value = data.coldTempOut || 40
  heatTransferArea.value = data.heatTransferArea || 10
}

watch(() => props.node, () => {
  updateHeatExchanger()
}, { deep: true })

onMounted(() => {
  updateHeatExchanger()
  
  animationScheduler.register(nodeId.value, animate)
  animationScheduler.setEnabled(nodeId.value, isWorking.value)
  
  if (props.node && typeof props.node.on === 'function') {
    props.node.on('change:data', () => {
      updateHeatExchanger()
    })
  }
})

onUnmounted(() => {
  animationScheduler.unregister(nodeId.value)
})
</script>

<style scoped>
.heat-exchanger-3d-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.heat-exchanger-3d-container svg {
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

.status-text.is-working {
  color: #22c55e;
}
</style>
