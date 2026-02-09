<template>
  <div class="light-3d-container">
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- 灯泡玻璃渐变 -->
        <radialGradient :id="`bulb-gradient-${nodeId}`" cx="40%" cy="30%">
          <stop offset="0%" :stop-color="isOn ? '#fff9e6' : '#e5e7eb'" />
          <stop offset="50%" :stop-color="isOn ? lightColor : '#d1d5db'" />
          <stop offset="100%" :stop-color="isOn ? darkenColor(lightColor, 0.3) : '#9ca3af'" />
        </radialGradient>
        
        <!-- 灯泡底座渐变 -->
        <linearGradient :id="`base-gradient-${nodeId}`" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#94a3b8" />
          <stop offset="50%" stop-color="#64748b" />
          <stop offset="100%" stop-color="#475569" />
        </linearGradient>
        
        <!-- 光晕滤镜 -->
        <filter :id="`glow-${nodeId}`">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        <!-- 外发光效果 -->
        <filter :id="`outer-glow-${nodeId}`">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feFlood :flood-color="lightColor" flood-opacity="0.6" result="color"/>
          <feComposite in="color" in2="blur" operator="in" result="glow"/>
          <feMerge>
            <feMergeNode in="glow"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- 外发光（仅开灯时） -->
      <circle 
        v-if="isOn"
        cx="50" 
        cy="35" 
        r="32"
        :fill="lightColor"
        opacity="0.3"
        :filter="`url(#outer-glow-${nodeId})`"
      />
      
      <!-- 灯泡玻璃球体 -->
      <ellipse
        cx="50"
        cy="35"
        rx="25"
        ry="28"
        :fill="`url(#bulb-gradient-${nodeId})`"
        stroke="#cbd5e1"
        stroke-width="0.5"
        :filter="isOn ? `url(#glow-${nodeId})` : 'none'"
      />
      
      <!-- 灯泡高光 -->
      <ellipse
        cx="42"
        cy="25"
        rx="8"
        ry="10"
        fill="#ffffff"
        :opacity="isOn ? 0.7 : 0.3"
      />
      
      <!-- 灯丝（仅开灯时显示） -->
      <g v-if="isOn" opacity="0.8">
        <path
          d="M 45 30 Q 47 35 45 40"
          stroke="#ff9500"
          stroke-width="1.5"
          fill="none"
        />
        <path
          d="M 55 30 Q 53 35 55 40"
          stroke="#ff9500"
          stroke-width="1.5"
          fill="none"
        />
      </g>
      
      <!-- 灯泡底部连接部分 -->
      <ellipse
        cx="50"
        cy="60"
        rx="15"
        ry="4"
        fill="#94a3b8"
      />
      
      <!-- 灯泡螺纹底座 -->
      <g>
        <!-- 螺纹线条 -->
        <rect x="40" y="63" width="20" height="3" :fill="`url(#base-gradient-${nodeId})`" rx="1"/>
        <rect x="40" y="67" width="20" height="3" :fill="`url(#base-gradient-${nodeId})`" rx="1"/>
        <rect x="40" y="71" width="20" height="3" :fill="`url(#base-gradient-${nodeId})`" rx="1"/>
        <rect x="40" y="75" width="20" height="3" :fill="`url(#base-gradient-${nodeId})`" rx="1"/>
        
        <!-- 螺纹阴影 -->
        <rect x="40" y="66" width="20" height="1" fill="#1e293b" opacity="0.3"/>
        <rect x="40" y="70" width="20" height="1" fill="#1e293b" opacity="0.3"/>
        <rect x="40" y="74" width="20" height="1" fill="#1e293b" opacity="0.3"/>
        <rect x="40" y="78" width="20" height="1" fill="#1e293b" opacity="0.3"/>
      </g>
      
      <!-- 底座 -->
      <ellipse
        cx="50"
        cy="80"
        rx="12"
        ry="5"
        :fill="`url(#base-gradient-${nodeId})`"
      />
      
      <!-- 底座底部 -->
      <ellipse
        cx="50"
        cy="83"
        rx="8"
        ry="3"
        fill="#334155"
      />
      
      <!-- 底部接触点 -->
      <circle
        cx="50"
        cy="85"
        r="2"
        fill="#475569"
      />
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

// 生成唯一ID用于SVG渐变
const nodeId = ref(`light-${Math.random().toString(36).substr(2, 9)}`)

const getData = () => {
  if (!props.node) return {}
  const nodeData = props.node.getData ? props.node.getData() : props.node.data || {}
  return nodeData
}

// 灯泡状态
const isOn = ref(false)
const lightColor = ref('#fbbf24')

// 颜色加深函数
const darkenColor = (color: string, amount: number) => {
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  
  const newR = Math.max(0, Math.floor(r * (1 - amount)))
  const newG = Math.max(0, Math.floor(g * (1 - amount)))
  const newB = Math.max(0, Math.floor(b * (1 - amount)))
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
}

const updateLight = () => {
  const data = getData()
  isOn.value = data.state === true || data.state === 'on'
  lightColor.value = data.color || '#fbbf24'
}

// 监听节点数据变化
watch(() => props.node, () => {
  updateLight()
}, { deep: true })

onMounted(() => {
  updateLight()
  
  // 监听 X6 节点的 data 变化事件
  if (props.node && typeof props.node.on === 'function') {
    props.node.on('change:data', () => {
      updateLight()
    })
  }
})
</script>

<style scoped>
.light-3d-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.light-3d-container svg {
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
  color: #fbbf24;
  text-shadow: 0 0 8px rgba(251, 191, 36, 0.5);
}
</style>
