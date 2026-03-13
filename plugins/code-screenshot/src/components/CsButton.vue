<script setup lang="ts">

const props = defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  iconOnly?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const handleClick = (e: MouseEvent) => {
  if (!props.disabled) {
    emit('click', e)
  }
}
</script>

<template>
  <button class="cs-button" :class="[
    `variant-${variant || 'secondary'}`,
    `size-${size || 'md'}`,
    { 'icon-only': iconOnly },
    { 'is-disabled': disabled }
  ]" :disabled="disabled" @click="handleClick" type="button">
    <!-- Slot for icon or icon+text -->
    <slot></slot>
  </button>
</template>

<style lang="scss" scoped>
@use "sass:color";
@use '@/styles/variables' as *;

.cs-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  font-family: $font-sans;
  font-weight: 500;
  border: 1px solid transparent;
  outline: none;
  cursor: pointer;
  white-space: nowrap;
  transition: all $transition-bounce;

  /* Global icon alignment inside button via deep selector */
  :deep(svg) {
    flex-shrink: 0;
  }

  /* Disabled State */
  &.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: rgba(255, 255, 255, 0.05) !important;
    border-color: rgba(255, 255, 255, 0.05) !important;
    color: $color-text-muted-darker !important;
  }
}

/* Base Variants (Glassmorphism & Colors) */

/* Default/Secondary: Glassmorphism / Ghost mix */
.variant-secondary {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.08);
  color: $color-text-lighter;

  &:hover:not(.is-disabled) {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.15);
    color: $color-text;
    box-shadow: $shadow-md;
  }

  &:active:not(.is-disabled) {
    transform: scale(0.96);
    background: rgba(255, 255, 255, 0.04);
  }
}

/* Primary/Accent */
.variant-primary {
  background: $color-accent-blue;
  color: #fff;
  border-color: transparent;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.2), 0 4px 12px rgba(56, 189, 248, 0.3);

  &:hover:not(.is-disabled) {
    background: color.adjust(#38bdf8, $lightness: 5%);
    box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 6px 16px rgba(56, 189, 248, 0.4);
  }

  &:active:not(.is-disabled) {
    transform: scale(0.96);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(56, 189, 248, 0.3);
  }
}

/* Danger (Dark Red Glass for Export) */
.variant-danger {
  background-color: #3b1b1f;
  border-color: rgba(255, 60, 60, 0.2);
  color: $color-primary;

  &:hover:not(.is-disabled) {
    background-color: #4c2227;
    border-color: rgba(255, 60, 60, 0.3);
    color: color.adjust(#fb7185, $lightness: 5%);
  }

  &:active:not(.is-disabled) {
    transform: scale(0.96);
    background-color: color.adjust(#3b1b1f, $lightness: -5%);
  }
}

/* Ghost / Bare icon */
.variant-ghost {
  background: transparent;
  border-color: transparent;
  color: $color-text-muted-darker;

  &:hover:not(.is-disabled) {
    background: rgba(255, 255, 255, 0.05);
    color: $color-text;
  }

  &:active:not(.is-disabled) {
    transform: scale(0.96);
    background: rgba(255, 255, 255, 0.03);
  }
}


/* Sizing Properties */
.size-sm {
  height: 28px;
  border-radius: $radius-lg;
  padding: 0 $spacing-md;
  font-size: $font-size-base;

  &.icon-only {
    width: 28px;
    padding: 0;
    justify-content: center;
  }
}

.size-md {
  height: 36px;
  border-radius: $radius-lg;
  padding: 0 $spacing-lg;
  font-size: $font-size-md;

  &.icon-only {
    width: 36px;
    padding: 0;
    justify-content: center;
  }
}

.size-lg {
  height: 44px;
  border-radius: $radius-xl;
  padding: 0 $spacing-xl;
  font-size: $font-size-lg;

  &.icon-only {
    width: 44px;
    padding: 0;
    justify-content: center;
  }
}
</style>
