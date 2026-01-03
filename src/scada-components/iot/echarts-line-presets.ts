/**
 * ECharts 折线图预设样式配置
 */

export interface LinePreset {
  id: string
  name: string
  config: any
}

export const linePresets: LinePreset[] = [
  {
    id: 'basic',
    name: '基础折线图',
    config: {
      smooth: false,
      lineStyle: {
        width: 2,
        color: '#5470c6'
      },
      areaStyle: null,
      symbol: 'circle',
      symbolSize: 6,
      radius: '100%',
    }
  },
  {
    id: 'smooth',
    name: '平滑曲线',
    config: {
      smooth: true,
      lineStyle: {
        width: 2,
        color: '#91cc75'
      },
      areaStyle: null,
      symbol: 'circle',
      symbolSize: 6
    }
  },
  {
    id: 'area',
    name: '区域折线图',
    config: {
      smooth: false,
      lineStyle: {
        width: 2,
        color: '#5470c6'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(84, 112, 198, 0.3)' },
            { offset: 1, color: 'rgba(84, 112, 198, 0.05)' }
          ]
        }
      },
      symbol: 'circle',
      symbolSize: 6
    }
  },
  {
    id: 'smooth-area',
    name: '平滑区域图',
    config: {
      smooth: true,
      lineStyle: {
        width: 2,
        color: '#91cc75'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(145, 204, 117, 0.3)' },
            { offset: 1, color: 'rgba(145, 204, 117, 0.05)' }
          ]
        }
      },
      symbol: 'circle',
      symbolSize: 6
    }
  },
  {
    id: 'dashed',
    name: '虚线折线图',
    config: {
      smooth: false,
      lineStyle: {
        width: 2,
        color: '#fac858',
        type: 'dashed'
      },
      areaStyle: null,
      symbol: 'circle',
      symbolSize: 6
    }
  },
  {
    id: 'step',
    name: '阶梯折线图',
    config: {
      smooth: false,
      step: 'middle',
      lineStyle: {
        width: 2,
        color: '#ee6666'
      },
      areaStyle: null,
      symbol: 'circle',
      symbolSize: 6
    }
  }
]

/**
 * 根据预设ID获取预设配置
 */
export function getLinePresetById(presetId: string): LinePreset | undefined {
  return linePresets.find(p => p.id === presetId)
}
