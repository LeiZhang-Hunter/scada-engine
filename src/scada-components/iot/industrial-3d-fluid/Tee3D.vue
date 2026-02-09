<template>
  <div class="tee-3d-container">
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- 管道渐变 -->
        <linearGradient :id="`pipe-gradient-${nodeId}`" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#475569" />
          <stop offset="50%" stop-color="#94a3b8" />
          <stop offset="100%" stop-color="#475569" />
        </linearGradient>
        
        <!-- 流体渐变 -->
        <radialGradient :id="`flow-gradient-${nodeId}`">
          <stop offset="0%" :stop-color="fluidColor" stop-opacity="0.8"/>
          <stop offset="100%" :stop-color="fluidColor" stop-opacity="0.2"/>
        </radialGradient>
      </defs>
      
      <!-- 主管道（横向） -->
      <rect 
        x="0" 
        y="40" 
        width="100" 
        height="20" 
        :fill="`url(#pipe-gradient-${nodeId})`"
        stroke="#334155" 
        stroke-width="1.5"
      />
      
      <!-- 支管道（纵向） -->
      <rect 
        x="40" 
        y="0" 
        width="20" 
        height="100" 
        :fill="`url(#pipe-gradient-${nodeId})`"
        stroke="#334155" 
        stroke-width="1.5"
      />
      
      <!-- 中心连接部分 -->
      <circle 
        cx="50" 
        cy="50" 
        r="18" 
        :fill="`url(#pipe-gradient-${nodeId})`"
        stroke="#334155" 
        stroke-width="2"
      />
      
      <!-- 内部通道 -->
      <rect x="0" y="43" width="100" height="14" fill="#0f172a"/>
      <rect x="43" y="0" width="14" height="100" fill="#0f172a"/>
      <circle cx="50" cy="50" r="15" fill="#0f172a"/>
      
      <!-- 流体动画（运行时） -->
      <g v-if="isFlowing">
        <!-- 中心流体 -->
        <circle 
          cx="50" 
          cy="50" 
          r="12" 
          :fill="`url(#flow-gradient-${nodeId})`"
        >
          <animate 
            attributeName="r" 
            values="8;14;8" 
            dur="1.5s" 
            repeatCount="indefinite"
          />
        </circle>
        
        <!-- 左侧流入 -->
        <rect 
          :x="leftFlowOffset" 
          y="45" 
          width="20" 
          height="10" 
          :fill="fluidColor"
          opacity="0.6"
        />
        
        <!-- 右侧流出 -->
        <rect 
          :x="60 + rightFlowOffset" 
          y="45" 
          width="20" 
          height="10" 
          :fill="fluidColor"
          opacity="0.4"
        />
        
        <!-- 上侧流出 -->
        <rect 
          x="45" 
          :y="topFlowOffset" 
          width="10" 
          height="20" 
          :fill="fluidColor"
          opacity="0.4"
        />
        
        <!-- 下侧流出 -->
        <rect 
          x="45" 
          :y="60 + bottomFlowOffset" 
          width="10" 
          height="20" 
          :fill="fluidColor"
          opacity="0.4"
        />
      </g>
      
      <!-- 法兰接口 -->
      <g>
        <!-- 左 -->
        <ellipse cx="0" cy="50" rx="3" ry="10" fill="#64748b" stroke="#334155" stroke-width="1"/>
        <circle cx="0" cy="45" r="1" fill="#1e293b"/>
        <circle cx="0" cy="55" r="1" fill="#1e293b"/>
        
        <!-- 右 -->
        <ellipse cx="100" cy="50" rx="3" ry="10" fill="#64748b" stroke="#334155" stroke-width="1"/>
        <circle cx="100" cy="45" r="1" fill="#1e293b"/>
        <circle cx="100" cy="55" r="1" fill="#1e293b"/>
        
        <!-- 上 -->
        <ellipse cx="50" cy="0" rx="10" ry="3" fill="#64748b" stroke="#334155" stroke-width="1"/>
        <circle cx="45" cy="0" r="1" fill="#1e293b"/>
        <circle cx="55" cy="0" r="1" fill="#1e293b"/>
        
        <!-- 下 -->
        <ellipse cx="50" cy="100" rx="10" ry="3" fill="#64748b" stroke="#334155" stroke-width="1"/>
        <circle cx="45" cy="100" r="1" fill="#1e293b"/>
        <circle cx="55" cy="100" r="1" fill="#1e293b"/>
      </g>
      
      <!-- 流向箭头 -->
      <g v-if="isFlowing">
        <defs>
          <marker 
            :id="`arrow-${nodeId}`" 
            markerWidth="8" 
            markerHeight="8" 
            refX="6" 
            refY="3" 
            orient="auto"
          >
            <path d="M0,0 L0,6 L6,3 z" :fill="fluidColor"/>
          </marker>
        </defs>
        
        <!-- 主流向（左到右） -->
        <line 
          x1="20" 
          y1="50" 
          x2="35" 
          y2="50" 
          :stroke="fluidColor" 
          stroke-width="2"
          :marker-end="`url(#arrow-${nodeId})`"
        />
        
        <!-- 分流向上 -->
        <line 
          v-if="topFlowEnabled"
          x1="50" 
          y1="35" 
          x2="50" 
          y2="20" 
          :stroke="fluidColor" 
          stroke-width="2"
          :marker-end="`url(#arrow-${nodeId})`"
        />
        
        <!-- 分流向下 -->
        <line 
          v-if="bottomFlowEnabled"
          x1="50" 
          y1="65" 
          x2="50" 
          y2="80" 
          :stroke="fluidColor" 
          stroke-width="2"
          :marker-end="`url(#arrow-${nodeId})`"
        />
      </g>
      
      <!-- 阀门状态指示 -->
      <g transform="translate(50, 50)">
        <circle cx="0" cy="0" r="6" fill="#0f172a" stroke="#475569" stroke-width="1"/>
        <circle 
          cx="0" 
          cy="0" 
          r="3" 
          :fill="isFlowing ? '#22c55e' : '#64748b'"
        />
      </g>
    </svg>
    
    <!-- 状态文字 -->
    <div class="status-text" :class="{ 'is-flowing': isFlowing }">
      {{ isFlowing ? '流动中' : '关闭' }}
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
const nodeId = computed(() => props.node?.id || `tee-${Math.random().toString(36).substr(2, 9)}`)

const getData = () => {
  if (!props.node) return {}
  const nodeData = props.node.getData ? props.node.getData() : props.node.data || {}
  return nodeData
}

const isFlowing = ref(false)
const fluidColor = ref('#3b82f6')
const topFlowEnabled = ref(true)
const bottomFlowEnabled = ref(true)

const leftFlowOffset = ref(0)
const rightFlowOffset = ref(0)
const topFlowOffset = ref(0)
const bottomFlowOffset = ref(0)

const animate = (deltaTime: number) => {
  if (isFlowing.value) {
    const factor = deltaTime / 16.67
    leftFlowOffset.value = (leftFlowOffset.value + 1 * factor) % 40
    rightFlowOffset.value = (rightFlowOffset.value + 1 * factor) % 20
    topFlowOffset.value = (topFlowOffset.value + 1 * factor) % 20
    bottomFlowOffset.value = (bottomFlowOffset.value + 1 * factor) % 20
  }
}

const updateTee = () => {
  const data = getData()
  const newFlowing = data.state === 'flowing' || data.state === true
  
  if (newFlowing !== isFlowing.value) {
    animationScheduler.setEnabled(nodeId.value, newFlowing)
  }
  
  isFlowing.value = newFlowing
  fluidColor.value = data.fluidColor || '#3b82f6'
  topFlowEnabled.value = data.topFlowEnabled !== false
  bottomFlowEnabled.value = data.bottomFlowEnabled !== false
}

watch(() => props.node, () => {
  updateTee()
}, { deep: true })

onMounted(() => {
  updateTee()
  
  animationScheduler.register(nodeId.value, animate)
  animationScheduler.setEnabled(nodeId.value, isFlowing.value)
  
  if (props.node && typeof props.node.on === 'function') {
    props.node.on('change:data', () => {
      updateTee()
    })
  }
})

onUnmounted(() => {
  animationScheduler.unregister(nodeId.value)
})
</script>

<style scoped>
.tee-3d-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.tee-3d-container svg {
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
