<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ChevronUp } from 'lucide-vue-next'

const props = defineProps<{
  options: { id: string | number; label: string }[]
  modelValue: string | number
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

const isOpen = ref(false)
const selectRef = ref<HTMLElement | null>(null)

const toggleOpen = () => {
  isOpen.value = !isOpen.value
}

const selectOption = (id: string | number) => {
  emit('update:modelValue', id)
  isOpen.value = false
}

// Close when clicking outside
const handleClickOutside = (e: MouseEvent) => {
  if (selectRef.value && !selectRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const currentLabel = () => {
  const selected = props.options.find(o => o.id === props.modelValue)
  return selected ? selected.label : (props.placeholder || 'Select')
}
</script>

<template>
  <div class="cs-select" ref="selectRef">
    <!-- Trigger Button -->
    <button class="cs-select-trigger" :class="{ 'is-open': isOpen }" @click="toggleOpen" type="button">
      <span class="cs-select-value">{{ currentLabel() }}</span>
      <ChevronUp :size="14" class="cs-select-arrow" :class="{ 'rotate': !isOpen }" />
    </button>

    <!-- Dropdown Menu -->
    <Transition name="dropdown">
      <div v-if="isOpen" class="cs-select-menu">
        <div class="cs-select-scroll">
          <button v-for="option in options" :key="option.id" class="cs-select-option"
            :class="{ 'is-selected': option.id === modelValue }" @click="selectOption(option.id)" type="button">
            {{ option.label }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.cs-select {
  position: relative;
  display: inline-block;
  min-width: 140px;

  &-trigger {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: $radius-lg;
    padding: 0 $spacing-md;
    height: 28px;
    cursor: pointer;
    outline: none;
    font-family: $font-sans;
    font-size: $font-size-base;
    font-weight: 500;
    color: $color-text-lighter;
    transition: all $transition-base;

    &:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.15);
    }

    &.is-open {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.2);
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.05);
    }
  }

  &-trigger {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: $radius-lg;
    padding: 0 $spacing-md;
    height: 28px;
    cursor: pointer;
    outline: none;
    font-family: $font-sans;
    font-size: $font-size-base;
    font-weight: 500;
    color: $color-text-lighter;
    transition: all $transition-base;

    &:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.15);
    }

    &.is-open {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.2);
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.05);
    }
  }

  &-value {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &-arrow {
    color: $color-text-muted-darker;
    transition: transform $transition-bounce;
    flex-shrink: 0;
    margin-left: 8px;

    &.rotate {
      transform: rotate(180deg);
    }
  }

  /* Menu Dropdown - Glassmorphism matched to Toolbar menus */
  &-menu {
    position: absolute;
    bottom: calc(100% + 8px);
    /* Open upwards since toolbar is at bottom */
    left: 0;
    width: 100%;
    background: rgba(24, 24, 27, 0.95);
    /* zinc-900 highly opaque */
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: $radius-lg;
    padding: 6px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05);
    z-index: $z-dropdown;
    transform-origin: bottom center;
  }

  &-scroll {
    max-height: 200px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 2px;

    /* Custom scrollbar matching design */
    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }

  &-option {
    width: 100%;
    text-align: left;
    background: transparent;
    border: none;
    padding: 8px $spacing-sm;
    border-radius: $radius-md;
    color: $color-text-muted;
    font-family: $font-sans;
    font-size: $font-size-base;
    font-weight: 500;
    cursor: pointer;
    transition: all $transition-fast;

    &:hover {
      background: rgba(255, 255, 255, 0.05);
      color: $color-text;
    }

    &.is-selected {
      background: rgba(255, 255, 255, 0.05);
      color: $color-text;
    }
  }
}

/* Animations */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}
</style>
