<template>
  <div class="switch-3d-container">
    <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- 开关底座渐变 -->
        <linearGradient :id="`base-gradient-${nodeId}`" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#475569" />
          <stop offset="50%" stop-color="#334155" />
          <stop offset="100%" stop-color="#1e293b" />
        </linearGradient>
        
        <!-- 开关轨道渐变 -->
        <linearGradient :id="`track-gradient-${nodeId}`" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#1e293b" />
          <stop offset="50%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#1e293b" />
        </linearGradient>
        
        <!-- 拨杆渐变 -->
        <linearGradient :id="`handle-gradient-${nodeId}`" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#e2e8f0" />
          <stop offset="50%" stop-color="#cbd5e1" />
          <stop offset="100%" stop-color="#94a3b8" />
        </linearGradient>
        
        <!-- 指示灯光晕 -->
        <filter :id="`indicator-glow-${nodeId}`">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- 底座 -->
      <rect x="20" y="25" width="80" height="50" rx="8" :fill="`url(#base-gradient-${nodeId})`" stroke="#0f172a" stroke-width="1"/>
      
      <!-- 固定螺丝 -->
      <g>
        <circle cx="30" cy="35" r="3" fill="#0f172a"/>
        <circle cx="30" cy="35" r="1.5" fill="#475569"/>
        <line x1="28" y1="35" x2="32" y2="35" stroke="#1e293b" stroke-width="0.5"/>
        
        <circle cx="90" cy="35" r="3" fill="#0f172a"/>
        <circle cx="90" cy="35" r="1.5" fill="#475569"/>
        <line x1="88" y1="35" x2="92" y2="35" stroke="#1e293b" stroke-width="0.5"/>
        
        <circle cx="30" cy="65" r="3" fill="#0f172a"/>
        <circle cx="30" cy="65" r="1.5" fill="#475569"/>
        <line x1="28" y1="65" x2="32" y2="65" stroke="#1e293b" stroke-width="0.5"/>
        
        <circle cx="90" cy="65" r="3" fill="#0f172a"/>
        <circle cx="90" cy="65" r="1.5" fill="#475569"/>
        <line x1="88" y1="65" x2="92" y2="65" stroke="#1e293b" stroke-width="0.5"/>
      </g>
      
      <!-- 开关轨道槽 -->
      <rect x="40" y="38" width="40" height="24" rx="12" :fill="`url(#track-gradient-${nodeId})`" stroke="#0f172a" stroke-width="1"/>
      
      <!-- OFF标记 -->
      <text x="48" y="53" font-size="8" fill="#64748b" text-anchor="middle" font-weight="bold">OFF</text>
      
      <!-- ON标记 -->
      <text x="72" y="53" font-size="8" :fill="isOn ? '#22c55e' : '#64748b'" text-anchor="middle" font-weight="bold">ON</text>
      
      <!-- 拨杆（带平滑动画过渡） -->
      <g :transform="`translate(${handleX}, 0)`" style="transition: transform 0.3s ease">
        <!-- 拨杆阴影 -->
        <ellipse cx="0" cy="52" rx="10" ry="3" fill="#000" opacity="0.3"/>
        
        <!-- 拨杆主体 -->
        <rect x="-8" y="40" width="16" height="20" rx="8" :fill="`url(#handle-gradient-${nodeId})`" stroke="#94a3b8" stroke-width="1"/>
        
        <!-- 拨杆纹理 -->
        <g opacity="0.3">
          <line x1="-4" y1="43" x2="-4" y2="57" stroke="#64748b" stroke-width="0.5"/>
          <line x1="0" y1="43" x2="0" y2="57" stroke="#64748b" stroke-width="0.5"/>
          <line x1="4" y1="43" x2="4" y2="57" stroke="#64748b" stroke-width="0.5"/>
        </g>
        
        <!-- 拨杆高光 -->
        <rect x="-6" y="42" width="4" height="8" rx="2" fill="#ffffff" opacity="0.4"/>
      </g>
      
      <!-- 状态指示灯 -->
      <g>
        <!-- OFF指示灯 -->
        <circle 
          cx="35" 
          cy="50" 
          r="3" 
          :fill="!isOn ? '#ef4444' : '#334155'"
          :filter="!isOn ? `url(#indicator-glow-${nodeId})` : 'none'"
        />
        <circle 
          cx="35" 
          cy="50" 
          r="1.5" 
          fill="#ffffff"
          :opacity="!isOn ? 0.6 : 0.1"
        />
        
        <!-- ON指示灯 -->
        <circle 
          cx="85" 
          cy="50" 
          r="3" 
          :fill="isOn ? '#22c55e' : '#334155'"
          :filter="isOn ? `url(#indicator-glow-${nodeId})` : 'none'"
        />
        <circle 
          cx="85" 
          cy="50" 
          r="1.5" 
          fill="#ffffff"
          :opacity="isOn ? 0.6 : 0.1"
        />
      </g>
      
      <!-- 接线端子 -->
      <g>
        <rect x="15" y="47" width="8" height="6" rx="1" fill="#64748b" stroke="#475569" stroke-width="0.5"/>
        <circle cx="19" cy="50" r="1.5" fill="#94a3b8"/>
        
        <rect x="97" y="47" width="8" height="6" rx="1" fill="#64748b" stroke="#475569" stroke-width="0.5"/>
        <circle cx="101" cy="50" r="1.5" fill="#94a3b8"/>
      </g>
      
      <!-- 型号标识 -->
      <rect x="50" y="67" width="20" height="6" rx="1" fill="#0f172a" opacity="0.7"/>
      <text x="60" y="71" font-size="3" fill="#64748b" text-anchor="middle" font-family="monospace">KCD1-101</text>
    </svg>
    
    <!-- 状态文字 -->
    <div class="status-text" :class="{ 'is-on': isOn }">
      {{ isOn ? '开启' : '关闭' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

interface Props {
  node?: any
}

const props = defineProps<Props>()
const nodeId = ref(`switch-${Math.random().toString(36).substr(2, 9)}`)

const getData = () => {
  if (!props.node) return {}
  const nodeData = props.node.getData ? props.node.getData() : props.node.data || {}
  return nodeData
}

const isOn = ref(false)

// 拨杆位置（根据开关状态）
const handleX = computed(() => isOn.value ? 72 : 48)

const updateSwitch = () => {
  const data = getData()
  isOn.value = data.state === true || data.state === 'on'
}

watch(() => props.node, () => {
  updateSwitch()
}, { deep: true })

onMounted(() => {
  updateSwitch()
  
  if (props.node && typeof props.node.on === 'function') {
    props.node.on('change:data', () => {
      updateSwitch()
    })
  }
})
</script>

<style scoped>
.switch-3d-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.switch-3d-container svg {
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

.status-text.is-on {
  color: #22c55e;
}
</style>
