/**
 * Copyright (c) 2025 leoncheng
 * 
 * This source code is licensed under the proprietary license found in the
 * LICENSE file in the root directory of this source tree.
 * 
 * @author leoncheng
 * @email nywqs@outlook.com
 */

import { defineAsyncComponent } from 'vue'
import type { ComponentConfig } from '../../types'

/**
 * 3D储罐组件（Three.js）
 * 使用 Three.js 渲染的 3D 储罐，支持实时液位显示和动画
 */
export const Tank3DThreeComponent: ComponentConfig = {
	metadata: {
		id: 'tank-3d-three',
		name: '3D储罐(Three.js)',
		category: 'iot',
		icon: '🛢️',
		description: '使用 Three.js 渲染的 3D 储罐，支持实时液位显示、旋转动画和多角度观察',
		version: '1.0.0'
	},
	shape: 'tank-3d-three-vue',
	component: defineAsyncComponent(() => import('./Tank3DThree.vue')),
	width: 200,
	height: 200,
	label: '',
	attrs: {
		body: {
			fill: 'transparent',
			stroke: 'transparent'
		}
	},
	data: {
		type: 'tank-3d-three',
		level: 50,
		capacity: 1000,
		liquidColor: '#3b82f6',
		tankColor: '#64748b'
	},
	ports: {
		groups: {
			top: {
				position: 'top',
				attrs: {
					circle: {
						r: 4,
						magnet: true,
						stroke: '#3b82f6',
						strokeWidth: 2,
						fill: '#1e293b'
					}
				}
			},
			bottom: {
				position: 'bottom',
				attrs: {
					circle: {
						r: 4,
						magnet: true,
						stroke: '#3b82f6',
						strokeWidth: 2,
						fill: '#1e293b'
					}
				}
			}
		},
		items: [
			{ group: 'top', id: 'port-top' },
			{ group: 'bottom', id: 'port-bottom' }
		]
	},
	props: [
		{
			key: 'level',
			label: '液位(%)',
			type: 'number',
			path: 'data.level',
			defaultValue: 50,
			min: 0,
			max: 100,
			step: 1,
			bindable: true,
			description: '储罐液位百分比'
		},
		{
			key: 'capacity',
			label: '容量(L)',
			type: 'number',
			path: 'data.capacity',
			defaultValue: 1000,
			min: 0,
			max: 100000,
			step: 100,
			bindable: true,
			description: '储罐总容量'
		},
		{
			key: 'liquidColor',
			label: '液体颜色',
			type: 'color',
			path: 'data.liquidColor',
			defaultValue: '#3b82f6',
			bindable: false,
			description: '液体的颜色'
		},
		{
			key: 'tankColor',
			label: '罐体颜色',
			type: 'color',
			path: 'data.tankColor',
			defaultValue: '#64748b',
			bindable: false,
			description: '罐体的颜色'
		}
	]
}
