<template>
  <div ref="chartRef" class="echarts-gauge-component" :style="{ width: '100%', height: '100%' }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import { getPresetById } from './presets'

// Vue Shape 会传递整个 node 对象作为 prop
interface Props {
  node?: any  // X6 节点对象
}

const props = defineProps<Props>()

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

// 从 node 中获取数据
const getData = () => {
  if (!props.node) return {}
  const nodeData = props.node.getData ? props.node.getData() : props.node.data || {}
  return nodeData
}

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return
  
  // 销毁旧实例
  if (chartInstance) {
    chartInstance.dispose()
  }
  
  // 创建新实例
  chartInstance = echarts.init(chartRef.value)
  
  // 更新配置
  updateChart()
}

// 更新图表配置
const updateChart = () => {
  if (!chartInstance) return
  
  const data = getData()
  const presetId = data.presetId || 'basic'
  const preset = getPresetById(presetId)
  
  // 基础配置
  const baseOption: any = {
    tooltip: {
      formatter: '{a} <br/>{b} : {c}%'
    },
    series: [
      {
        name: data.name || 'Pressure',
        type: 'gauge',
        data: [
          {
            value: data.value ?? 50,
            name: data.title || 'SCORE'
          }
        ]
      }
    ]
  }
  
  // 应用预设配置
  if (preset && preset.config) {
    Object.assign(baseOption.series[0], preset.config)
  }
  
  chartInstance.setOption(baseOption, true)
}

// 监听数据变化 - 监听整个 node.data
watch(() => props.node?.data, (newData, oldData) => {
  updateChart()
}, { deep: true })

// 单独监听 presetId 变化
watch(() => props.node?.data?.presetId, (newPreset, oldPreset) => {
  if (newPreset !== oldPreset) {
    updateChart()
  }
})

// 监听尺寸变化
watch(() => props.node?.size, () => {
  if (chartInstance && props.node) {
    const size = props.node.getSize ? props.node.getSize() : props.node.size || { width: 200, height: 200 }
    chartInstance.resize({
      width: size.width,
      height: size.height
    })
  }
}, { deep: true })

onMounted(() => {
  // 延迟初始化，确保 DOM 完全就绪
  setTimeout(() => {
    initChart()
    
    // 监听 X6 节点的 data 变化事件
    if (props.node && typeof props.node.on === 'function') {
      props.node.on('change:data', ({ current }: any) => {
        updateChart()
      })
    }
  }, 100)
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<style scoped>
.echarts-gauge-component {
  width: 100%;
  height: 100%;
}
</style>
