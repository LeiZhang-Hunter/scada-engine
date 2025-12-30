/**
 * SCADA引擎授权加密解密工具
 * 基于 AES-256-CBC + OpenSSL 格式
 * 兼容 Node.js authkey_tool.js
 */
import CryptoJS from 'crypto-js'

// 加密密码（与 authkey_tool.js 保持一致）
const PASSWORD = '515745617364313233'

interface DecryptResult {
	success: boolean
	company?: string
	expiryDate?: string
	machineId?: string
	parts?: string[]
	error?: string
}

/**
 * 解密授权码
 * @param hexString - Hex格式的授权码
 * @param password - 解密密码
 * @returns 解密结果
 */
export function decryptAuthKey(hexString: string, password: string = PASSWORD): DecryptResult {
	try {
		// 1. Hex转Base64
		const hexBuffer = CryptoJS.enc.Hex.parse(hexString)
		const base64String = CryptoJS.enc.Base64.stringify(hexBuffer)
		
		// 2. 检查是否是OpenSSL格式（以"U2FsdGVkX1"开头 = "Salted__"的Base64）
		if (!base64String.startsWith('U2FsdGVkX1')) {
			return {
				success: false,
				error: '无效的授权码格式'
			}
		}
		
		// 3. 使用CryptoJS解密（自动处理OpenSSL格式）
		const decrypted = CryptoJS.AES.decrypt(base64String, password)
		const utf8String = decrypted.toString(CryptoJS.enc.Utf8)
		
		if (!utf8String) {
			return {
				success: false,
				error: '授权码解密失败'
			}
		}
		
		// 4. 按"|sv|"分割解析授权信息
		const parts = utf8String.split('|sv|')
		
		return {
			success: true,
			company: parts[0] || utf8String,
			expiryDate: parts[1],
			machineId: parts[2],
			parts: parts
		}
		
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : '解密异常'
		}
	}
}

/**
 * 验证授权码有效性
 * @param authCode - Hex格式的授权码
 * @param password - 解密密码
 * @returns 是否有效
 */
export function validateAuthKey(authCode: string, password: string = PASSWORD): boolean {
	if (!authCode || authCode.length < 32) {
		return false
	}
	
	const result = decryptAuthKey(authCode, password)
	
	if (!result.success) {
		return false
	}
	
	// 验证有效期（如果有）
	if (result.expiryDate) {
		const expiryTime = new Date(result.expiryDate).getTime()
		const currentTime = new Date().getTime()
		
		if (currentTime > expiryTime) {
			console.warn('授权已过期')
			return false
		}
	}
	
	// TODO: 验证机器码（如果需要）
	// if (result.machineId) {
	//   const currentMachineId = getMachineId()
	//   if (result.machineId !== currentMachineId) {
	//     console.warn('授权码与当前机器不匹配')
	//     return false
	//   }
	// }
	
	return true
}

/**
 * 获取授权信息
 * @param authCode - Hex格式的授权码
 * @param password - 解密密码
 * @returns 授权信息对象
 */
export function getAuthInfo(authCode: string, password: string = PASSWORD) {
	const result = decryptAuthKey(authCode, password)
	
	if (!result.success) {
		return null
	}
	
	return {
		company: result.company || '未知',
		expiryDate: result.expiryDate,
		isValid: validateAuthKey(authCode, password)
	}
}

/**
 * 生成测试授权码的辅助函数
 * 注意：此函数仅用于开发测试，生产环境应使用 Node.js 版本的 authkey_tool.js
 */
export function generateTestAuthCode(company: string, expiryDate?: string): string {
	try {
		const plaintext = expiryDate 
			? `${company}|sv|${expiryDate}`
			: company
		
		// 使用CryptoJS加密（与OpenSSL兼容）
		const encrypted = CryptoJS.AES.encrypt(plaintext, PASSWORD)
		const base64String = encrypted.toString()
		
		// Base64转Hex
		const hexString = CryptoJS.enc.Base64.parse(base64String).toString(CryptoJS.enc.Hex).toUpperCase()
		
		return hexString
	} catch (error) {
		console.error('生成测试授权码失败:', error)
		return ''
	}
}

// 默认导出
export default {
	decryptAuthKey,
	validateAuthKey,
	getAuthInfo,
	generateTestAuthCode
}
