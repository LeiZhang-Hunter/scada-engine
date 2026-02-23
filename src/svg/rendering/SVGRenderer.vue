<template>
  <div class="svg-renderer-container">
    <div v-html="svgContent" ref="svgRef"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import type { SVGComponentConfig, InternalAnimationConfig } from '../core/types'
import { animationTemplateEngine } from './animationTemplates'

// 动画常量
const DEFAULT_TRANSITION_MS = 300

/**
 * Props
 */
interface Props {
  /** X6 节点对象 */
  node?: any
  /** SVG 组件配置（从解析器来） */
  config?: SVGComponentConfig
}

const props = defineProps<Props>()

// Refs
const svgRef = ref<HTMLElement>()

/**
 * 计算属性：SVG 内容
 */
const svgContent = computed(() => {
  return props.config?.svgContent || ''
})

/**
 * 计算属性：内部动画配置
 */
const internalAnimations = computed<InternalAnimationConfig[]>(() => {
  // 优先使用节点数据中的配置（组态工程师配置的）
  const nodeData = props.node?.getData()
  if (nodeData?.internalAnimations && Array.isArray(nodeData.internalAnimations)) {
    return nodeData.internalAnimations
  }
  
  // 否则使用组件预设
  return props.config?.internalAnimations || []
})

/**
 * 应用内部动画
 */
const applyInternalAnimations = () => {
  if (!svgRef.value || !props.node) return
  
  const svgElement = svgRef.value.querySelector('svg')
  if (!svgElement) return
  
  const nodeData = props.node.getData()
  if (!nodeData) return
  
  // 遍历所有内部动画配置
  internalAnimations.value.forEach((animConfig) => {
    // 跳过禁用的动画
    if (animConfig.enabled === false) return
    
    // 查找目标元素
    const targetElement = svgElement.querySelector(`#${animConfig.partId}`) as SVGGraphicsElement
    if (!targetElement) {
      console.warn(`[SVGRenderer] 找不到部件: ${animConfig.partId}`)
      return
    }
    
    // 获取驱动值
    const driverValue = nodeData[animConfig.driverProperty]
    if (driverValue == null) {
      // 静默跳过，数据可能还未到达
      return
    }
    
    // 应用动画模板
    try {
      animationTemplateEngine.applyTemplate(
        targetElement,
        animConfig.templateType,
        animConfig.templateParams!,
        driverValue,
        {
          transitionDuration: animConfig.transitionDuration ?? DEFAULT_TRANSITION_MS,
          easing: animConfig.easing || 'ease-out',
          stateKey: `${props.node.id}:${animConfig.id}`
        }
      )
    } catch (error) {
      console.error(`[SVGRenderer] 应用动画失败:`, error, animConfig)
    }
  })
}

/**
 * 监听节点数据变化
 */
watch(
  () => props.node?.getData(),
  () => {
    applyInternalAnimations()
  },
  { deep: false }
)

/**
 * 监听内部动画配置变化
 */
watch(
  () => internalAnimations.value,
  () => {
    applyInternalAnimations()
  },
  { deep: true }
)

/**
 * 组件挂载
 */
onMounted(() => {
  // 初始化时应用一次动画
  setTimeout(() => {
    applyInternalAnimations()
  }, 100) // 延迟以确保 SVG 已渲染
  
  // 监听 X6 节点的 data 变化事件
  if (props.node && typeof props.node.on === 'function') {
    props.node.on('change:data', () => {
      applyInternalAnimations()
    })
  }
})

/**
 * 组件卸载
 */
onBeforeUnmount(() => {
  // 清理动画状态
  internalAnimations.value.forEach((animConfig) => {
    const stateKey = `${props.node?.id}:${animConfig.id}`
    animationTemplateEngine.clearState(stateKey)
  })
})
</script>

<style scoped>
.svg-renderer-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.svg-renderer-container :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}

/* 确保 SVG 内部元素可以应用 transform */
.svg-renderer-container :deep(svg *) {
  transform-box: fill-box;
}
</style>
