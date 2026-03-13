<script setup lang="ts">
import { computed, ref } from 'vue'
import { state, BG_GRADIENTS } from '../store'
import { useShiki } from '../composables/useShiki'

const { isLoaded, highlightedHtml } = useShiki()

const currentGradient = computed(() => {
  return BG_GRADIENTS.find(g => g.id === state.backgroundId) || BG_GRADIENTS[0]
})

const textareaRef = ref<HTMLTextAreaElement | null>(null)

// --- Resizing Logic ---
const customWidth = ref<number | 'auto'>('auto')
const isDragging = ref(false)

const startDrag = (e: MouseEvent, direction: 'left' | 'right') => {
  e.preventDefault()
  isDragging.value = true

  const startX = e.clientX
  // Get current exact width of the window
  const windowEl = document.querySelector('.mac-window') as HTMLElement
  if (!windowEl) return

  const startWidth = windowEl.getBoundingClientRect().width

  const onMouseMove = (moveEvent: MouseEvent) => {
    // Because the window is centered, dragging one side means the total width 
    // changes by twice the delta to maintain centering.
    const delta = moveEvent.clientX - startX
    const multiplier = direction === 'right' ? 2 : -2;
    // Limit min width to 400
    const newWidth = Math.max(400, startWidth + delta * multiplier)
    customWidth.value = newWidth
  }

  const onMouseUp = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

const autoWidth = () => {
  customWidth.value = 'auto'
}

// Ensure textarea never scrolls internally to prevent visual desync.
// The parent .code-container handles all the actual scrolling.
const lockInternalScroll = (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  if (target.scrollTop > 0) {
    target.scrollTop = 0;
  }
  if (target.scrollLeft > 0) {
    target.scrollLeft = 0;
  }
}
</script>

<template>
  <div class="window-wrapper">
    <!-- Center the screenshot -->
    <div class="preview-container">

      <!-- The screenshot capture area -->
      <div class="export-target" :style="{
        padding: `${state.padding}px`,
        background: state.showBackground ? currentGradient.colors : 'transparent',
      }">
        <!-- The Window Layer -->
        <div class="mac-window" :style="{ width: customWidth === 'auto' ? '100%' : `${customWidth}px` }"
          :class="{ 'theme-dark': state.darkMode, 'theme-light': !state.darkMode }">
          <!-- Window Frame -->
          <div class="window-header">
            <div class="mac-btns">
              <div class="mac-btn close"></div>
              <div class="mac-btn minimize"></div>
              <div class="mac-btn maximize"></div>
            </div>
            <input type="text" v-model="state.filename" class="filename-input" placeholder="Untitled"
              spellcheck="false" />
          </div>

          <!-- Code Area Container (CSS Grid perfectly overlaps elements) -->
          <div class="code-container">
            <div class="code-highlight" v-html="highlightedHtml" aria-hidden="true"></div>
            <!-- Textarea overlay -->
            <textarea ref="textareaRef" v-model="state.code" class="code-input" spellcheck="false"
              @scroll="lockInternalScroll"></textarea>
          </div>
        </div>
      </div>

      <!-- Handle indicators outside export area -->
      <div class="resize-handle left-handle" data-html2canvas-ignore="true" @mousedown="startDrag($event, 'left')">
      </div>
      <div class="resize-handle right-handle" data-html2canvas-ignore="true" @mousedown="startDrag($event, 'right')">
      </div>

    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.window-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.preview-container {
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
}

.export-target {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all $transition-slow;
  min-width: 400px;
  max-width: 100%;
  border-radius: 8px;
}

.resize-handle {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  background-color: $color-text;
  border-radius: $radius-full;
  cursor: ew-resize;
  z-index: 10;
  box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.2);

  &.left-handle {
    left: -20px;
  }

  &.right-handle {
    right: -20px;
  }
}

.mac-window {
  width: 100%;
  border-radius: $radius-xl;
  overflow: hidden;
  box-shadow: $shadow-2xl, inset 0 1px 0 rgba(255, 255, 255, 0.1);
  background: $color-window-bg-dark;
  backdrop-filter: blur(20px);
  border: 1px solid $color-window-border-dark;
  display: flex;
  flex-direction: column;
  transition: all $transition-slow;

  &.theme-light {
    background: $color-window-bg-light;
    border: 1px solid $color-window-border-light;
    box-shadow: $shadow-xl;
  }
}

.window-header {
  display: flex;
  align-items: center;
  padding: $spacing-lg;
  position: relative;
}

.mac-btns {
  display: flex;
  gap: $spacing-sm;
  position: absolute;
  left: $spacing-lg;

  .mac-btn {
    width: 12px;
    height: 12px;
    border-radius: $radius-full;

    &.close {
      background: #ff5f56;
    }

    &.minimize {
      background: #ffbd2e;
    }

    &.maximize {
      background: #27c93f;
    }
  }
}

.filename-input {
  width: 100%;
  text-align: center;
  background: transparent;
  border: none;
  font-family: $font-sans;
  font-size: $font-size-base;
  color: $color-text-muted;
  outline: none;
  font-weight: 500;
  letter-spacing: 0.3px;

  .theme-light & {
    color: #52525b;
  }
}

.code-container {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  padding: 0 $spacing-xl calc(#{$spacing-xl} + 4px) $spacing-xl;
  flex-grow: 1;
}

.code-highlight,
.code-input {
  grid-area: 1 / 1;
  font-family: #{$font-mono} !important;
  font-size: #{$font-size-md} !important;
  line-height: 24px !important;
  letter-spacing: normal !important;
  word-spacing: normal !important;
  width: 100%;
  height: 100%;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  background: transparent !important;
  color: transparent;
  caret-color: $color-text;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-all;
  overflow-wrap: break-word;
  tab-size: 2;
  box-sizing: border-box;

  .theme-light & {
    caret-color: #000;
  }
}

.code-highlight {
  pointer-events: none;
  z-index: 1;
}

.code-input {
  resize: none;
  outline: none;
  color: transparent !important;
  background: transparent !important;
  z-index: 2;
  overflow: hidden;
}

:deep(pre) {
  margin: 0 !important;
  padding: 0 !important;
  background: transparent !important;
  white-space: pre-wrap !important;
  word-wrap: break-word !important;
  word-break: break-all !important;
  overflow-wrap: break-word !important;
  font-family: inherit !important;
  font-size: inherit !important;
  line-height: inherit !important;
  letter-spacing: inherit !important;
  word-spacing: inherit !important;
  tab-size: 2 !important;
  border: none !important;
}

:deep(code) {
  font-family: inherit !important;
  font-size: inherit !important;
  line-height: inherit !important;
  letter-spacing: inherit !important;
  word-spacing: inherit !important;
}

.toolbar-bottom-tips {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-md;
  margin-top: $spacing-3xl;
  color: $color-text-muted-darker;
  font-size: $font-size-sm;
  cursor: pointer;

  .close-badge {
    background: rgba(255, 255, 255, 0.1);
    border-radius: $radius-full;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-text-muted;
    transition: all $transition-base;
  }

  &:hover {
    .close-badge {
      background: rgba(255, 255, 255, 0.2);
      color: $color-text;
    }

    span {
      color: $color-text-muted;
    }
  }

  &:active {
    transform: scale(0.95);
  }
}

.bottom-tips-container {
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity $transition-slow, transform $transition-bounce;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
