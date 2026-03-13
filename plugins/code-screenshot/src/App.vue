<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { toPng, toSvg } from 'html-to-image'
import CodeWindow from './components/CodeWindow.vue'
import Toolbar from './components/Toolbar.vue'
import { Info, ChevronDown, Download, X, FileCode2, ImageDown, FileType2, Clipboard, Check } from 'lucide-vue-next'
import { state, SUPPORTED_LANGUAGES } from './store'
import CsButton from './components/CsButton.vue'

const showAbout = ref(false)
const isDraggingFile = ref(false)
const showExportMenu = ref(false)
const copyDone = ref(false)
const exportMenuRef = ref<HTMLElement | null>(null)

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  if (e.dataTransfer?.types.includes('Files')) {
    isDraggingFile.value = true
  }
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  // Ensure we are actually leaving the window
  if (!e.relatedTarget || (e.relatedTarget as HTMLElement).nodeName === 'HTML') {
    isDraggingFile.value = false
  }
}

const handleDrop = async (e: DragEvent) => {
  e.preventDefault()
  isDraggingFile.value = false

  const file = e.dataTransfer?.files[0]
  if (!file) return

  try {
    const text = await file.text()
    state.code = text
    state.filename = file.name

    // Attempt language detection from extension
    const extMatch = file.name.match(/\.([^.]+)$/)
    if (extMatch) {
      const ext = extMatch[1].toLowerCase()

      const extMap: Record<string, string> = {
        'ts': 'typescript', 'tsx': 'typescript',
        'js': 'javascript', 'jsx': 'javascript',
        'vue': 'vue',
        'html': 'html', 'htm': 'html',
        'css': 'css', 'scss': 'css', 'sass': 'css', 'less': 'css',
        'java': 'java', 'class': 'java',
        'py': 'python',
        'cpp': 'cpp', 'cxx': 'cpp', 'cc': 'cpp', 'c': 'cpp', 'h': 'cpp', 'hpp': 'cpp',
        'go': 'go',
        'rs': 'rust',
        'json': 'json',
        'sql': 'sql',
        'md': 'markdown'
      }

      const mappedLangId = extMap[ext]
      // Check if it's one we support explicitly
      if (mappedLangId && SUPPORTED_LANGUAGES.some(lang => lang.id === mappedLangId)) {
        state.language = mappedLangId
      }
    }
  } catch (err) {
    console.error('Failed to read dragged file:', err)
  }
}

const handleExport = async (format: 'png' | 'svg') => {
  showExportMenu.value = false
  const node = document.querySelector('.export-target') as HTMLElement
  if (!node) return

  try {
    const scale = 3 // High resolution
    let dataUrl = ''

    // Ensure styles are correctly applied before capture
    if (format === 'png') {
      dataUrl = await toPng(node, {
        pixelRatio: scale,
        skipFonts: true,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      })
    } else {
      dataUrl = await toSvg(node)
    }

    const link = document.createElement('a')
    link.download = `ztools-code-snippet.${format}`
    link.href = dataUrl
    link.click()
  } catch (err) {
    console.error('Export failed', err)
    alert('导出失败，请重试')
  }
}

const copyToClipboard = async () => {
  showExportMenu.value = false
  const node = document.querySelector('.export-target') as HTMLElement
  if (!node) return

  try {
    const dataUrl = await toPng(node, {
      pixelRatio: 3,
      skipFonts: true,
    })
    // Convert dataUrl to Blob
    const res = await fetch(dataUrl)
    const blob = await res.blob()
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ])
    copyDone.value = true
    setTimeout(() => { copyDone.value = false }, 2000)
  } catch (err) {
    console.error('Copy failed', err)
    alert('复制失败，请试​使用导出功能')
  }
}

const closeExportMenu = (e: MouseEvent) => {
  if (exportMenuRef.value && !exportMenuRef.value.contains(e.target as Node)) {
    showExportMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeExportMenu)
  if (window.ztools) {
    window.ztools.onPluginEnter((action: any) => {
      // ready
    })
    window.ztools.onPluginOut(() => {
    })
  }
})

onUnmounted(() => {
  document.removeEventListener('click', closeExportMenu)
})
</script>

<template>
  <div class="app-viewport" @dragover="handleDragOver" @dragleave="handleDragLeave" @drop="handleDrop">

    <!-- Drag Overlay -->
    <Transition name="fade">
      <div v-if="isDraggingFile" class="drag-overlay">
        <div class="drag-content">
          <FileCode2 :size="64" class="drag-icon" />
          <h2>松开以载入代码片段</h2>
        </div>
      </div>
    </Transition>

    <!-- Top Global Header -->
    <header class="global-header">
      <div class="header-right">
        <!-- About Button -->
        <CsButton variant="ghost" size="sm" @click="showAbout = true">
          <Info :size="15" />
          <span>关于</span>
        </CsButton>

        <!-- Export Button Combo -->
        <div class="export-combo-btn" ref="exportMenuRef">
          <CsButton class="btn-export-inner" variant="danger" size="sm" @click="handleExport('png')">
            <Download :size="15" />
            <span>导出图片</span>
          </CsButton>
          <div class="btn-export-divider"></div>
          <CsButton 
            class="btn-export-drop-inner" 
            :class="{ 'menu-open': showExportMenu }"
            variant="danger" 
            size="sm" 
            :icon-only="true" 
            @click.stop="showExportMenu = !showExportMenu"
          >
            <ChevronDown :size="15" class="drop-chevron" :class="{ 'rotated': showExportMenu }" />
          </CsButton>

          <!-- Export Format Dropdown Menu -->
          <Transition name="export-menu">
            <div v-if="showExportMenu" class="export-menu">
              <div class="export-menu-header">选择格式</div>
              <button class="export-menu-item" @click="handleExport('png')">
                <ImageDown :size="15" />
                <div class="export-menu-item-text">
                  <span class="item-label">PNG 图片</span>
                  <span class="item-desc">高清三倍速退，最小体积</span>
                </div>
              </button>
              <button class="export-menu-item" @click="handleExport('svg')">
                <FileType2 :size="15" />
                <div class="export-menu-item-text">
                  <span class="item-label">SVG 矢量图</span>
                  <span class="item-desc">无限缩放，适合打印展示</span>
                </div>
              </button>
              <div class="export-menu-divider"></div>
              <button class="export-menu-item" @click="copyToClipboard">
                <Check v-if="copyDone" :size="15" class="copy-check" />
                <Clipboard v-else :size="15" />
                <div class="export-menu-item-text">
                  <span class="item-label">{{ copyDone ? '已复制到剪贴板' : '复制到剪贴板' }}</span>
                  <span class="item-desc">直接粘贴到其他应用</span>
                </div>
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </header>

    <!-- Main Workspace -->
    <div class="main-workspace">
      <div class="workspace-center">
        <CodeWindow />
      </div>
    </div>

    <!-- Fixed Floating Toolbar -->
    <Toolbar class="fixed-toolbar" />

    <!-- About Modal -->
    <Transition name="fade">
      <div v-if="showAbout" class="about-modal-overlay" @click="showAbout = false">
        <div class="about-modal" @click.stop>
          <button class="close-about-btn" @click="showAbout = false">
            <X :size="16" />
          </button>
          <div class="about-icon-wrapper">
            <div class="about-icon">
              <!-- simple decorative code icon -->
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
            </div>
          </div>
          <h2 class="about-title">Code Screenshot</h2>
          <p class="about-version">v1.0.0</p>
          <p class="about-desc">
            一款优雅而专业的代码截图工具。<br />
            将您的代码片段转化为精美的设计图片，支持语法高亮与多种极客主题。<br />
            基于强大且开放的 ztools 插件生态。
          </p>
          <div class="about-footer">
            <span class="about-brand">Designed perfectly with Vue 3 & Shiki</span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.app-viewport {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: $color-bg;
  overflow: hidden;
  position: relative;
}

.global-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: $spacing-3xl $spacing-4xl;
  display: flex;
  justify-content: flex-end;
  z-index: $z-fixed;
  pointer-events: none;
}

.header-right {
  display: flex;
  align-items: center;
  gap: $spacing-3xl;
  pointer-events: auto;
}

/* Export Combo: wrap CsButtons in one unified dark-red container */
.export-combo-btn {
  display: flex;
  align-items: center;
  position: relative; /* Anchor for the export dropdown menu */
  background-color: #3b1b1f;
  border: 1px solid rgba(255, 60, 60, 0.2);
  border-radius: $radius-lg;
  overflow: visible; /* Allow menu to overflow the rounded container */
  transition: background-color $transition-base, border-color $transition-base;

  &:hover {
    background-color: #4c2227;
    border-color: rgba(255, 60, 60, 0.3);
  }

  /* Override CsButton inner styles to work within the combo */
  .btn-export-inner,
  .btn-export-drop-inner {
    background: transparent !important;
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    color: $color-primary !important;

    &:hover:not(.is-disabled) {
      background: rgba(255, 255, 255, 0.05) !important;
    }

    &:active:not(.is-disabled) {
      transform: none !important;
      background: rgba(0, 0, 0, 0.1) !important;
    }
  }

  .btn-export-inner {
    padding-left: $spacing-md;
    padding-right: $spacing-lg;
    font-size: $font-size-md;
    font-weight: 500;
    border-radius: $radius-lg 0 0 $radius-lg !important; /* Clip left side */
  }

  .btn-export-drop-inner {
    width: 32px;
    border-radius: 0 $radius-lg $radius-lg 0 !important; /* Clip right side */

    .drop-chevron {
      transition: transform $transition-bounce;

      &.rotated {
        transform: rotate(180deg);
      }
    }
  }
}

/* Export Dropdown Menu */
.export-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 220px;
  background: rgba(20, 20, 22, 0.97);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: $radius-xl;
  padding: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  z-index: $z-dropdown;
}

.export-menu-header {
  font-size: $font-size-xs;
  color: $color-text-muted-darker;
  font-weight: 600;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  padding: 4px $spacing-sm 8px;
}

.export-menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: $spacing-md;
  background: transparent;
  border: none;
  border-radius: $radius-lg;
  padding: 9px $spacing-sm;
  cursor: pointer;
  color: $color-text-muted;
  transition: all $transition-fast;
  text-align: left;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: $color-text;

    .item-label {
      color: $color-text;
    }
  }
}

.export-menu-item-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-label {
  font-size: $font-size-base;
  font-weight: 500;
  color: $color-text-light;
  transition: color $transition-fast;
}

.item-desc {
  font-size: $font-size-xs;
  color: $color-text-muted-darker;
  line-height: 1.3;
}

.export-menu-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: 4px 0;
}

.copy-check {
  color: #4ade80; /* green-400 */
}

/* Export Menu Transition */
.export-menu-enter-active,
.export-menu-leave-active {
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.export-menu-enter-from,
.export-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.97);
}

.btn-export-divider {
  width: 1px;
  height: 16px;
  flex-shrink: 0;
  background-color: rgba(251, 113, 133, 0.2);
}

.main-workspace {
  position: relative;
  width: 100%;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.workspace-center {
  margin: auto;
  padding: 100px $spacing-2xl 140px $spacing-2xl;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.about-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: $color-modal-overlay;
  backdrop-filter: blur(10px);
  z-index: $z-modal;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
}

.about-modal {
  position: relative;
  width: 380px;
  background: $color-modal-bg;
  backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: $spacing-4xl $spacing-3xl $spacing-3xl;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.close-about-btn {
  position: absolute;
  top: $spacing-md;
  right: $spacing-md;
  background: transparent;
  border: none;
  color: $color-text-muted-darker;
  cursor: pointer;
  padding: $spacing-sm;
  border-radius: $radius-full;
  border: 1px solid transparent;
  transition: all $transition-base;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: $color-text;
    border-color: rgba(255, 255, 255, 0.1);
  }
}

.about-icon-wrapper {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, $color-accent-blue, $color-accent-purple);
  border-radius: $radius-2xl;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $spacing-xl;
  box-shadow: 0 10px 20px rgba(56, 189, 248, 0.3);
}

.about-icon {
  color: white;
}

.about-title {
  margin: 0;
  font-size: $font-size-xl;
  font-weight: 600;
  color: $color-text;
  letter-spacing: -0.5px;
}

.about-version {
  margin: 4px 0 20px;
  font-size: $font-size-sm;
  color: $color-text-muted;
  font-weight: 500;
}

.about-desc {
  margin: 0 0 $spacing-3xl;
  font-size: $font-size-md;
  color: $color-text-light;
  line-height: 1.6;
}

.about-footer {
  width: 100%;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.about-brand {
  font-size: $font-size-xs;
  color: $color-text-muted-darker;
}

.drag-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.drag-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  color: $color-text;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  padding: $spacing-5xl 128px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.02);
  animation: pulse-border 2s infinite ease-in-out;

  h2 {
    font-size: $font-size-2xl;
    font-weight: 500;
    margin: 0;
    letter-spacing: 1px;
  }
}

.drag-icon {
  color: $color-accent-blue;
  filter: $shadow-glow-blue;
}
</style>
