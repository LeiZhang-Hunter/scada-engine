<template>
  <div class="pipe-3d-container">
    <svg :viewBox="viewBox" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- 管道渐变 -->
        <linearGradient :id="`pipe-gradient-${nodeId}`" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#475569" />
          <stop offset="30%" stop-color="#94a3b8" />
          <stop offset="70%" stop-color="#cbd5e1" />
          <stop offset="100%" stop-color="#475569" />
        </linearGradient>
        
        <!-- 流体渐变 -->
        <linearGradient :id="`flow-gradient-${nodeId}`" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" :stop-color="fluidColor" stop-opacity="0.3"/>
          <stop offset="50%" :stop-color="fluidColor" stop-opacity="0.8"/>
          <stop offset="100%" :stop-color="fluidColor" stop-opacity="0.3"/>
        </linearGradient>
      </defs>
      
      <!-- 根据方向渲染管道 -->
      <g v-if="direction === 'horizontal'">
        <!-- 管道外壳 -->
        <rect 
          x="0" 
          :y="centerY - pipeRadius" 
          :width="pipeLength" 
          :height="pipeRadius * 2" 
          :fill="`url(#pipe-gradient-${nodeId})`"
          stroke="#334155" 
          stroke-width="1"
        />
        
        <!-- 管道内部 -->
        <rect 
          x="0" 
          :y="centerY - pipeRadius + 3" 
          :width="pipeLength" 
          :height="pipeRadius * 2 - 6" 
          fill="#0f172a"
        />
        
        <!-- 流体（运行时） -->
        <rect 
          v-if="isFlowing"
          :x="flowOffset" 
          :y="centerY - pipeRadius + 5" 
          :width="pipeLength / 2" 
          :height="pipeRadius * 2 - 10" 
          :fill="`url(#flow-gradient-${nodeId})`"
        />
        
        <!-- 法兰接口 -->
        <g>
          <ellipse :cx="0" :cy="centerY" :rx="pipeRadius + 2" :ry="pipeRadius + 2" fill="#64748b" stroke="#334155" stroke-width="1"/>
          <ellipse :cx="pipeLength" :cy="centerY" :rx="pipeRadius + 2" :ry="pipeRadius + 2" fill="#64748b" stroke="#334155" stroke-width="1"/>
          <!-- 螺栓 -->
          <circle :cx="0" :cy="centerY - pipeRadius - 2" r="1.5" fill="#1e293b"/>
          <circle :cx="0" :cy="centerY + pipeRadius + 2" r="1.5" fill="#1e293b"/>
          <circle :cx="pipeLength" :cy="centerY - pipeRadius - 2" r="1.5" fill="#1e293b"/>
          <circle :cx="pipeLength" :cy="centerY + pipeRadius + 2" r="1.5" fill="#1e293b"/>
        </g>
      </g>
      
      <g v-else>
        <!-- 垂直管道外壳 -->
        <rect 
          :x="centerX - pipeRadius" 
          y="0" 
          :width="pipeRadius * 2" 
          :height="pipeLength" 
          :fill="`url(#pipe-gradient-${nodeId})`"
          stroke="#334155" 
          stroke-width="1"
        />
        
        <!-- 管道内部 -->
        <rect 
          :x="centerX - pipeRadius + 3" 
          y="0" 
          :width="pipeRadius * 2 - 6" 
          :height="pipeLength" 
          fill="#0f172a"
        />
        
        <!-- 流体（运行时） -->
        <rect 
          v-if="isFlowing"
          :x="centerX - pipeRadius + 5" 
          :y="flowOffset" 
          :width="pipeRadius * 2 - 10" 
          :height="pipeLength / 2" 
          :fill="`url(#flow-gradient-${nodeId})`"
        />
        
        <!-- 法兰接口 -->
        <g>
          <ellipse :cx="centerX" :cy="0" :rx="pipeRadius + 2" :ry="pipeRadius + 2" fill="#64748b" stroke="#334155" stroke-width="1"/>
          <ellipse :cx="centerX" :cy="pipeLength" :rx="pipeRadius + 2" :ry="pipeRadius + 2" fill="#64748b" stroke="#334155" stroke-width="1"/>
          <!-- 螺栓 -->
          <circle :cx="centerX - pipeRadius - 2" :cy="0" r="1.5" fill="#1e293b"/>
          <circle :cx="centerX + pipeRadius + 2" :cy="0" r="1.5" fill="#1e293b"/>
          <circle :cx="centerX - pipeRadius - 2" :cy="pipeLength" r="1.5" fill="#1e293b"/>
          <circle :cx="centerX + pipeRadius + 2" :cy="pipeLength" r="1.5" fill="#1e293b"/>
        </g>
      </g>
      
      <!-- 流向箭头 -->
      <g v-if="isFlowing">
        <defs>
          <marker 
            :id="`arrow-${nodeId}`" 
            markerWidth="10" 
            markerHeight="10" 
            refX="8" 
            refY="3" 
            orient="auto" 
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" :fill="fluidColor"/>
          </marker>
        </defs>
        
        <line 
          v-if="direction === 'horizontal'"
          :x1="pipeLength / 2 - 20" 
          :y1="centerY" 
          :x2="pipeLength / 2 + 20" 
          :y2="centerY" 
          :stroke="fluidColor" 
          stroke-width="2"
          :marker-end="`url(#arrow-${nodeId})`"
        />
        <line 
          v-else
          :x1="centerX" 
          :y1="pipeLength / 2 - 20" 
          :x2="centerX" 
          :y2="pipeLength / 2 + 20" 
          :stroke="fluidColor" 
          stroke-width="2"
          :marker-end="`url(#arrow-${nodeId})`"
        />
      </g>
    </svg>
    
    <!-- 状态文字 -->
    <div class="status-text" :class="{ 'is-flowing': isFlowing }">
      {{ isFlowing ? '流动中' : '停止' }} | {{ flowRate }} m³/h
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
const nodeId = computed(() => props.node?.id || `pipe-${Math.random().toString(36).substr(2, 9)}`)

const getData = () => {
  if (!props.node) return {}
  const nodeData = props.node.getData ? props.node.getData() : props.node.data || {}
  return nodeData
}

const isFlowing = ref(false)
const flowRate = ref(10)
const direction = ref<'horizontal' | 'vertical'>('horizontal')
const fluidColor = ref('#3b82f6')
const diameter = ref(40)
const length = ref(200)

const pipeRadius = computed(() => diameter.value / 2)
const pipeLength = computed(() => length.value)

const viewBox = computed(() => {
  if (direction.value === 'horizontal') {
    return `0 0 ${pipeLength.value} ${diameter.value + 10}`
  } else {
    return `0 0 ${diameter.value + 10} ${pipeLength.value}`
  }
})

const centerY = computed(() => (diameter.value + 10) / 2)
const centerX = computed(() => (diameter.value + 10) / 2)

const flowOffset = ref(0)

const animate = (deltaTime: number) => {
  if (isFlowing.value) {
    const factor = deltaTime / 16.67
    const speed = (flowRate.value / 5) * factor
    flowOffset.value = (flowOffset.value + speed) % pipeLength.value
  }
}

const updatePipe = () => {
  const data = getData()
  const newFlowing = data.state === 'flowing' || data.state === true
  
  if (newFlowing !== isFlowing.value) {
    animationScheduler.setEnabled(nodeId.value, newFlowing)
  }
  
  isFlowing.value = newFlowing
  flowRate.value = data.flowRate || 10
  direction.value = data.direction || 'horizontal'
  fluidColor.value = data.fluidColor || '#3b82f6'
  diameter.value = data.diameter || 40
  length.value = data.length || 200
}

watch(() => props.node, () => {
  updatePipe()
}, { deep: true })

onMounted(() => {
  updatePipe()
  
  animationScheduler.register(nodeId.value, animate)
  animationScheduler.setEnabled(nodeId.value, isFlowing.value)
  
  if (props.node && typeof props.node.on === 'function') {
    props.node.on('change:data', () => {
      updatePipe()
    })
  }
})

onUnmounted(() => {
  animationScheduler.unregister(nodeId.value)
})
</script>

<style scoped>
.pipe-3d-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.pipe-3d-container svg {
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

.status-text.is-flowing {
  color: #3b82f6;
}
</style>
