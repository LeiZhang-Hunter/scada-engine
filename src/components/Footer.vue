<template>
	<footer class="scada-footer" v-if="!isAuthorized">
		<div class="footer-content">
			<div class="footer-left">
				<span class="copyright" style="color: #94a3b8 !important;">© 2025 leoncheng</span>
				<span class="divider" style="color: #475569 !important;">|</span>
				<span class="license" style="color: #94a3b8 !important;">仅供学习研究使用，禁止商业用途</span>
			</div>
			
			<div class="footer-right">
				<div class="contact-item">
					<span class="icon">📧</span>
					<span class="text" style="color: #94a3b8 !important;">nywqs@outlook.com</span>
				</div>
				<span class="divider" style="color: #475569 !important;">|</span>
				<div class="contact-item">
					<span class="icon">📱</span>
					<span class="text" style="color: #94a3b8 !important;">18637762001</span>
				</div>
			</div>
		</div>
	</footer>
	
	<!-- 授权后的自定义 Footer（如果有） -->
	<footer class="scada-footer" v-else-if="customFooter">
		<div class="footer-content">
			<div class="footer-left">
				<span class="copyright" style="color: #94a3b8 !important;">{{ customFooter.copyright }}</span>
				<span class="divider" v-if="customFooter.license" style="color: #475569 !important;">|</span>
				<span class="license" v-if="customFooter.license" style="color: #94a3b8 !important;">{{ customFooter.license }}</span>
			</div>
			
			<div class="footer-right" v-if="customFooter.contact">
				<span class="text" style="color: #94a3b8 !important;">{{ customFooter.contact }}</span>
			</div>
		</div>
	</footer>
	
	<!-- 授权成功但无自定义配置，显示授权信息 -->
	<footer class="scada-footer" v-else>
		<div class="footer-content">
			<div class="footer-left">
				<span class="authorized-icon">✅</span>
				<span class="authorized-text" style="color: #10b981 !important;">已授权: {{ authInfo?.company || '未知' }}</span>
			</div>
			
			<div class="footer-right">
				<span class="expiry-text" v-if="authInfo?.expiryDate" style="color: #94a3b8 !important;">
					📅 有效期至: {{ authInfo.expiryDate }}
				</span>
				<span class="expiry-text" v-else style="color: #94a3b8 !important;">
					∞ 永久授权
				</span>
			</div>
		</div>
	</footer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { validateAuthKey, getAuthInfo } from '../utils/authCrypto'

interface CustomFooterConfig {
	copyright?: string
	license?: string
	contact?: string
}

interface Props {
	authCode?: string // 授权码
	customFooter?: CustomFooterConfig // 自定义 Footer 配置
}

const props = withDefaults(defineProps<Props>(), {
	authCode: '',
	customFooter: undefined
})

// 验证授权码（使用真实的加密解密）
const authInfo = ref<{ company: string; expiryDate?: string; isValid: boolean } | null>(null)

const isAuthorized = computed(() => {
	if (!props.authCode) {
		return false
	}
	
	// 使用 authCrypto 工具验证
	const valid = validateAuthKey(props.authCode)
	
	if (valid) {
		// 获取授权信息
		const info = getAuthInfo(props.authCode)
		if (info) {
			authInfo.value = info
			console.log('✅ 授权验证成功')
			console.log('🏛️ 授权公司:', info.company)
			if (info.expiryDate) {
				console.log('📅 有效期至:', info.expiryDate)
			} else {
				console.log('∞ 永久授权')
			}
		}
	} else {
		authInfo.value = null
		console.warn('❌ 授权码验证失败')
	}
	
	return valid
})
</script>

<style scoped>
.scada-footer {
	height: 32px;
	background: #1e293b;
	border-top: 1px solid #0f3460;
	display: flex;
	align-items: center;
	padding: 0 32px;
	flex-shrink: 0;
}

.footer-content {
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.footer-left,
.footer-right {
	display: flex;
	align-items: center;
	gap: 12px;
}

.copyright,
.license {
	font-size: 12px;
	color: #94a3b8 !important;
}

.divider {
	color: #475569 !important;
	font-size: 12px;
}

.contact-item {
	display: flex;
	align-items: center;
	gap: 4px;
}

.contact-item .icon {
	font-size: 12px;
}

.contact-item .text {
	font-size: 12px;
	color: #94a3b8 !important;
}

.contact-item .text:hover {
	color: #3b82f6 !important;
	cursor: pointer;
}

.authorized-icon {
	font-size: 14px;
	margin-right: 6px;
}

.authorized-text {
	font-size: 12px;
	color: #10b981 !important;
	font-weight: 500;
}

.expiry-text {
	font-size: 12px;
	color: #94a3b8 !important;
}
</style>
