<template>
  <div class="alarm-light-3d-container">
    <svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- 灯罩渐变 -->
        <linearGradient :id="`dome-gradient-${nodeId}`" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" :stop-color="lightColor" stop-opacity="0.9"/>
          <stop offset="50%" :stop-color="lightColor" stop-opacity="0.7"/>
          <stop offset="100%" :stop-color="lightColor" stop-opacity="0.5"/>
        </linearGradient>
        
        <!-- 光晕效果 -->
        <radialGradient :id="`glow-${nodeId}`">
          <stop offset="0%" :stop-color="lightColor" stop-opacity="0.8"/>
          <stop offset="50%" :stop-color="lightColor" stop-opacity="0.3"/>
          <stop offset="100%" :stop-color="lightColor" stop-opacity="0"/>
        </radialGradient>
        
        <!-- 底座渐变 -->
        <linearGradient :id="`base-gradient-${nodeId}`" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#1e293b" />
          <stop offset="50%" stop-color="#334155" />
          <stop offset="100%" stop-color="#1e293b" />
        </linearGradient>
      </defs>
      
      <!-- 光晕（激活时） -->
      <circle 
        v-if="isActive"
        cx="40" 
        cy="35" 
        r="35" 
        :fill="`url(#glow-${nodeId})`"
        :opacity="glowOpacity"
      />
      
      <!-- 灯罩外壳 -->
      <ellipse 
        cx="40" 
        cy="35" 
        rx="25" 
        ry="22" 
        fill="#1e293b" 
        stroke="#475569" 
        stroke-width="1.5"
        opacity="0.3"
      />
      
      <!-- 灯罩（旋转效果） -->
      <g :transform="`rotate(${rotation}, 40, 35)`">
        <ellipse 
          cx="40" 
          cy="35" 
          rx="23" 
          ry="20" 
          :fill="`url(#dome-gradient-${nodeId})`"
          :opacity="isActive ? 1 : 0.3"
        />
        
        <!-- 灯罩分隔线 -->
        <path
          d="M 17,35 Q 40,25 63,35"
          stroke="#ffffff"
          stroke-width="1"
          fill="none"
          opacity="0.3"
        />
        <path
          d="M 17,35 Q 40,45 63,35"
          stroke="#000000"
          stroke-width="1"
          fill="none"
          opacity="0.2"
        />
      </g>
      
      <!-- 中间连接部分 -->
      <rect 
        x="35" 
        y="55" 
        width="10" 
        height="8" 
        rx="2"
        fill="#334155" 
        stroke="#475569" 
        stroke-width="1"
      />
      
      <!-- 底座 -->
      <ellipse 
        cx="40" 
        cy="63" 
        rx="18" 
        ry="5" 
        :fill="`url(#base-gradient-${nodeId})`"
        stroke="#475569" 
        stroke-width="1"
      />
      <rect 
        x="22" 
        y="63" 
        width="36" 
        height="12" 
        :fill="`url(#base-gradient-${nodeId})`"
        stroke="#475569" 
        stroke-width="1"
      />
      <ellipse 
        cx="40" 
        cy="75" 
        rx="18" 
        ry="5" 
        :fill="`url(#base-gradient-${nodeId})`"
        stroke="#475569" 
        stroke-width="1"
      />
      
      <!-- 固定螺丝 -->
      <circle cx="28" cy="69" r="2" fill="#64748b" stroke="#1e293b" stroke-width="0.5"/>
      <circle cx="52" cy="69" r="2" fill="#64748b" stroke="#1e293b" stroke-width="0.5"/>
      <line x1="27" y1="68" x2="29" y2="70" stroke="#1e293b" stroke-width="0.5"/>
      <line x1="51" y1="68" x2="53" y2="70" stroke="#1e293b" stroke-width="0.5"/>
      
      <!-- 电源指示灯 -->
      <circle 
        cx="40" 
        cy="69" 
        r="1.5" 
        :fill="isActive ? '#22c55e' : '#64748b'"
      />
      
      <!-- 型号标识 -->
      <text x="40" y="85" font-size="4" fill="#64748b" text-anchor="middle" font-family="Arial">
        AL-{{ mode.toUpperCase() }}
      </text>
    </svg>
    
    <!-- 状态文字 -->
    <div class="status-text" :class="{ 'is-active': isActive }">
      {{ statusText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

interface Props {
  node?: any
}

const props = defineProps<Props>()
const nodeId = ref(`alarm-${Math.random().toString(36).substr(2, 9)}`)

const getData = () => {
  if (!props.node) return {}
  const nodeData = props.node.getData ? props.node.getData() : props.node.data || {}
  return nodeData
}

const isActive = ref(false)
const mode = ref<'rotating' | 'flashing' | 'steady'>('rotating')
const color = ref('#ef4444')

const rotation = ref(0)
const glowOpacity = ref(0.8)

let animationId: number | null = null

const lightColor = computed(() => {
  if (!isActive.value) return '#475569'
  return color.value
})

const statusText = computed(() => {
  if (!isActive.value) return '正常'
  return mode.value === 'rotating' ? '旋转报警' : mode.value === 'flashing' ? '闪烁报警' : '持续报警'
})

const animate = () => {
  if (isActive.value) {
    if (mode.value === 'rotating') {
      // 旋转模式
      rotation.value = (rotation.value + 5) % 360
      glowOpacity.value = 0.8
    } else if (mode.value === 'flashing') {
      // 闪烁模式
      glowOpacity.value = Math.abs(Math.sin(Date.now() / 300))
    } else {
      // 持续模式
      glowOpacity.value = 0.8
    }
  } else {
    glowOpacity.value = 0
  }
  
  animationId = requestAnimationFrame(animate)
}

const updateAlarmLight = () => {
  const data = getData()
  isActive.value = data.state === 'active' || data.state === true
  mode.value = data.mode || 'rotating'
  color.value = data.color || '#ef4444'
}

watch(() => props.node, () => {
  updateAlarmLight()
}, { deep: true })

onMounted(() => {
  updateAlarmLight()
  animate()
  
  if (props.node && typeof props.node.on === 'function') {
    props.node.on('change:data', () => {
      updateAlarmLight()
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
.alarm-light-3d-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.alarm-light-3d-container svg {
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

.status-text.is-active {
  color: #ef4444;
  text-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
</style>
