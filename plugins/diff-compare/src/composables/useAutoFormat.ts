/**
 * 自动格式化设置管理Composable
 * 提供自动格式化功能的开关和持久化存储
 */

import { ref } from 'vue'

const STORAGE_KEY = 'auto-format'

/**
 * 自动格式化设置管理Composable
 */
export function useAutoFormatSettings() {
    /** 是否启用自动格式化 */
    const autoFormat = ref(false)

    /**
     * 加载设置
     */
    const loadSettings = () => {
        try {
            let stored = null
            if (window.ztools?.dbStorage?.getItem) {
                stored = window.ztools.dbStorage.getItem(STORAGE_KEY)
            } else {
                stored = localStorage.getItem(STORAGE_KEY)
            }
            if (stored !== null) {
                autoFormat.value = stored === 'true'
            }
        } catch (e) {
            console.warn('加载自动格式化设置失败:', e)
        }
    }

    /**
     * 保存设置
     */
    const saveSettings = () => {
        try {
            if (window.ztools?.dbStorage?.setItem) {
                window.ztools.dbStorage.setItem(STORAGE_KEY, String(autoFormat.value))
            } else {
                localStorage.setItem(STORAGE_KEY, String(autoFormat.value))
            }
        } catch (e) {
            console.warn('保存自动格式化设置失败:', e)
        }
    }

    /**
     * 设置自动格式化
     * @param value - 是否启用自动格式化
     */
    const setAutoFormat = (value: boolean) => {
        autoFormat.value = value
        saveSettings()
    }

    /**
     * 切换自动格式化
     */
    const toggleAutoFormat = () => {
        setAutoFormat(!autoFormat.value)
    }

    // 初始化加载设置
    loadSettings()

    return {
        autoFormat,
        setAutoFormat,
        toggleAutoFormat
    }
}