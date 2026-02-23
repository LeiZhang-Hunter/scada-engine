/**
 * SVG 组件系统演示和测试
 * 在浏览器控制台运行以下代码进行测试
 */

import { svgLoader } from '../core/loader'
import { loadExampleSvgComponents } from './utils'
import { componentRegistry } from '../../registry'

/**
 * 演示1：加载示例 SVG 组件
 */
export async function demo1_loadExamples() {
  console.log('=== 演示1：加载示例 SVG 组件 ===')
  
  await loadExampleSvgComponents()
  
  // 查看已注册的组件
  const allComponents = componentRegistry.getAllComponents()
  const svgComponents = Object.values(allComponents).filter((c: any) => 
    c.data?.type === 'svg'
  )
  
  console.log('已加载的 SVG 组件:', svgComponents.map((c: any) => c.metadata.name))
}

/**
 * 演示2：从字符串加载自定义 SVG
 */
export function demo2_loadCustomSvg() {
  console.log('=== 演示2：加载自定义 SVG ===')
  
  const customSvg = `
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <metadata>
    <scada-config><![CDATA[
    {
      "component": {
        "id": "demo-button",
        "name": "演示按钮",
        "category": "custom",
        "icon": "🔘"
      }
    }
    ]]></scada-config>
  </metadata>
  
  <g id="root">
    <circle id="part-button" cx="50" cy="50" r="40" fill="#3b82f6"/>
    <circle id="part-indicator" cx="50" cy="50" r="10" fill="#10b981"/>
  </g>
</svg>
  `
  
  const success = svgLoader.loadFromString(customSvg, 'demo-button.svg')
  console.log('加载结果:', success ? '成功' : '失败')
  
  // 获取加载的组件
  const component = componentRegistry.getComponentSync('demo-button')
  console.log('组件信息:', component?.metadata)
}

/**
 * 演示3：配置内部动画
 */
export function demo3_configureAnimation(nodeId: string) {
  console.log('=== 演示3：配置内部动画 ===')
  console.log('需要传入节点 ID，例如: demo3_configureAnimation("node_xxx")')
  
  // 这个函数需要在有 graph 实例的环境中使用
  // 实际使用时从 ScadaCanvas 的 graph 获取节点
}

/**
 * 演示4：模拟数据驱动动画
 */
export function demo4_simulateDataDrive() {
  console.log('=== 演示4：模拟数据驱动 ===')
  console.log('此功能需要在完整的 SCADA 环境中演示')
  console.log('流程：')
  console.log('1. 添加 SVG 组件到画布')
  console.log('2. 配置数据绑定（点位 → node.data 字段）')
  console.log('3. 配置内部动画（部件 + 驱动字段 + 模板）')
  console.log('4. 连接数据源，推送数据')
  console.log('5. 观察 SVG 内部元素动画效果')
}

// 在浏览器控制台中可用
if (typeof window !== 'undefined') {
  (window as any).svgDemo = {
    demo1_loadExamples,
    demo2_loadCustomSvg,
    demo3_configureAnimation,
    demo4_simulateDataDrive,
    // 添加一个快速检查函数
    checkComponents: () => {
      const allComponents = componentRegistry.getAllComponents()
      console.log('所有已注册组件:', Object.keys(allComponents))
      console.log('IoT 组件:', componentRegistry.getComponentsByCategory('iot').map((c: any) => c.metadata.name))
      console.log('Custom 组件:', componentRegistry.getComponentsByCategory('custom').map((c: any) => c.metadata.name))
      console.log('SVG 组件:', Object.values(allComponents).filter((c: any) => c.data?.type === 'svg').map((c: any) => c.metadata.name))
    }
  }
  
  console.log('SVG 组件系统演示已加载')
  console.log('运行 window.svgDemo.demo1_loadExamples() 开始演示')
  console.log('运行 window.svgDemo.checkComponents() 检查已注册组件')
}
