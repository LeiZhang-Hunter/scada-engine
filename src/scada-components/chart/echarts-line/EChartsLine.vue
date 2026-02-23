<template>
  <div ref="chartContainer" style="width: 100%; height: 100%"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { getLinePresetById } from './presets'

interface Props {
  node?: any
}

const props = defineProps<Props>()
const chartContainer = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

const getData = () => {
  if (!props.node) return {}
  const nodeData = props.node.getData ? props.node.getData() : props.node.data || {}
  return nodeData
}

const initChart = () => {
  if (!chartContainer.value) return
  
  chartInstance = echarts.init(chartContainer.value)
  updateChart()
}

const updateChart = () => {
  if (!chartInstance) return
  
  const data = getData()
  const presetId = data.presetId || 'basic'
  const preset = getLinePresetById(presetId)
  
  const option: any = {
    title: {
      text: data.title || '数据趋势',
      left: 'center',
      top: 10,
      textStyle: {
        color: '#fff',
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderColor: '#333',
      textStyle: {
        color: '#fff'
      }
    },
    grid: {
      left: '10%',
      right: '10%',
      top: '20%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.xAxisData || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      axisLine: {
        lineStyle: {
          color: '#999'
        }
      },
      axisLabel: {
        color: '#999'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#999'
        }
      },
      axisLabel: {
        color: '#999'
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    series: [
      {
        name: data.seriesName || 'Data',
        type: 'line',
        data: data.seriesData || [120, 200, 150, 80, 70, 110, 130]
      }
    ]
  }
  
  // 应用预设配置
  if (preset && preset.config) {
    Object.assign(option.series[0], preset.config)
  }
  
  chartInstance.setOption(option, true)
}

onMounted(() => {
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
