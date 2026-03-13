<script setup lang="ts">
import { ref } from 'vue'
import { state, BG_GRADIENTS, SUPPORTED_LANGUAGES } from '../store'
import { ChevronUp, Check } from 'lucide-vue-next'
import CsSelect from './CsSelect.vue'
import CsButton from './CsButton.vue'

const emit = defineEmits<{
  (e: 'export', format: 'png' | 'svg'): void
}>()

const showGradientPicker = ref(false)

const currentGradient = () => {
  return BG_GRADIENTS.find(g => g.id === state.backgroundId) || BG_GRADIENTS[0]
}

const selectGradient = (id: string) => {
  state.backgroundId = id
  showGradientPicker.value = false
}

const toggleBackground = () => {
  state.showBackground = !state.showBackground
}

const toggleDarkMode = () => {
  state.darkMode = !state.darkMode
}

const setPadding = (p: number) => {
  state.padding = p
}
</script>

<template>
  <div class="toolbar-wrapper">
    <!-- Main Toolbar Center -->
    <div class="toolbar">
      <!-- Theme Selection -->
      <div class="toolbar-section">
        <span class="toolbar-label">主题</span>
        <div class="relative">
          <CsButton 
            variant="secondary" 
            size="sm" 
            @click="showGradientPicker = !showGradientPicker"
          >
            <span class="gradient-preview" :style="{ background: currentGradient().colors }"></span>
            <ChevronUp :size="14" class="ml-1 text-zinc-500" />
          </CsButton>
          
          <div v-if="showGradientPicker" class="dropdown-menu gradient-menu">
            <button 
              v-for="g in BG_GRADIENTS" 
              :key="g.id"
              class="gradient-option"
              :class="{ active: state.backgroundId === g.id }"
              @click="selectGradient(g.id)"
            >
              <span class="gradient-preview" :style="{ background: g.colors }"></span>
              <span class="gradient-name">{{ g.name }}</span>
              <Check v-if="state.backgroundId === g.id" :size="14" class="check-icon" />
            </button>
          </div>
        </div>
      </div>

      <!-- Background Toggle -->
      <div class="toolbar-section">
        <span class="toolbar-label">背景</span>
        <button class="toggle-btn" :class="{ active: state.showBackground }" @click="toggleBackground">
          <span class="toggle-knob"></span>
        </button>
      </div>

      <!-- Dark Mode Toggle -->
      <div class="toolbar-section">
        <span class="toolbar-label">暗色模式</span>
        <button class="toggle-btn" :class="{ active: state.darkMode }" @click="toggleDarkMode">
          <span class="toggle-knob"></span>
        </button>
      </div>

      <!-- Padding Selection -->
      <div class="toolbar-section padding-section">
        <span class="toolbar-label">边距</span>
        <div class="padding-group">
          <button 
            v-for="p in [16, 32, 64, 128]" 
            :key="p"
            class="padding-btn"
            :class="{ active: state.padding === p }"
            @click="setPadding(p)"
          >
            {{ p }}
          </button>
        </div>
      </div>

      <!-- Language Selection using new CsSelect -->
      <div class="toolbar-section">
        <span class="toolbar-label">语言</span>
        <CsSelect 
          v-model="state.language"
          :options="SUPPORTED_LANGUAGES"
          placeholder="语言"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use '@/styles/variables' as *;

.toolbar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  position: absolute;
  bottom: 40px;
  left: 0;
  width: 100%;
  pointer-events: none;
  z-index: $z-fixed + 10;
}

.toolbar {
  pointer-events: auto;
  display: flex;
  align-items: center;
  background: $color-toolbar-bg;
  backdrop-filter: blur(20px);
  border: 1px solid $color-toolbar-border;
  padding: $spacing-md $spacing-2xl;
  border-radius: $radius-xl;
  gap: 36px;
  color: $color-text;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.toolbar-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toolbar-label {
  font-size: $font-size-xs;
  color: $color-text-muted-darker;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.toolbar-label {
  font-size: $font-size-xs;
  color: $color-text-muted-darker;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.gradient-preview {
  width: 18px;
  height: 18px;
  border-radius: $radius-md;
  display: inline-block;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
}

.dropdown-menu {
  position: absolute;
  bottom: calc(100% + 12px);
  left: 0;
  background: #18181b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 160px;
  z-index: $z-dropdown;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
}

.gradient-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  background: transparent;
  border: none;
  padding: $spacing-sm;
  border-radius: $radius-lg;
  color: $color-text-muted;
  font-size: $font-size-base;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: $color-text;
  }

  &.active {
    background: rgba(255, 255, 255, 0.05);
    color: $color-text;
    font-weight: 500;
  }
}

.check-icon {
  margin-left: auto;
  color: $color-text;
}

.toggle-btn {
  width: 44px;
  height: 24px;
  background: #3f3f46;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: all $transition-bounce;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);

  &.active {
    background: $color-accent-blue;

    .toggle-knob {
      transform: translateX(20px);
    }
  }
}

.toggle-knob {
  position: absolute;
  top: 1px;
  left: 1px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: $radius-full;
  transition: all $transition-bounce;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2), 0 0 1px rgba(0, 0, 0, 0.2);
}

.padding-group {
  display: flex;
  gap: 0;
  background: transparent;
}

.padding-btn {
  background: transparent;
  border: none;
  color: $color-text-muted-darker;
  font-size: $font-size-base;
  font-weight: 500;
  padding: 4px $spacing-sm;
  border-radius: $radius-md;
  cursor: pointer;
  transition: all $transition-base;
  height: 28px;
  min-width: 36px;

  &:hover {
    color: $color-text-light;
  }

  &.active {
    background: rgba(255, 255, 255, 0.1);
    color: $color-text;
    box-shadow: $shadow-sm;
  }
}

.padding-group {
  display: flex;
  gap: 2px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: $radius-lg;
  padding: 2px;
}

.padding-btn {
  background: transparent;
  border: none;
  color: $color-text-muted-darker;
  font-size: $font-size-base;
  font-weight: 500;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-md;
  cursor: pointer;
  transition: all $transition-base;
  height: 24px;
  min-width: 32px;

  &:hover {
    color: $color-text-light;
    background: rgba(255, 255, 255, 0.03);
  }

  &.active {
    background: rgba(255, 255, 255, 0.1);
    color: $color-text;
    box-shadow: $shadow-sm;
  }
}
</style>
