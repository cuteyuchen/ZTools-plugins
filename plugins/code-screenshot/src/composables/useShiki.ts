import { ref, shallowRef, watch } from 'vue'
import { createHighlighter, type HighlighterCore } from 'shiki'
import { state, SUPPORTED_LANGUAGES } from '../store'

export function useShiki() {
  const highlighter = shallowRef<HighlighterCore | null>(null)
  const isLoaded = ref(false)
  const highlightedHtml = ref('')

  const initShiki = async () => {
    isLoaded.value = false
    try {
      highlighter.value = await createHighlighter({
        themes: ['github-dark', 'github-light'],
        langs: SUPPORTED_LANGUAGES.map(l => l.id),
      })
      isLoaded.value = true
      updateHighlight()
    } catch (e) {
      console.error('Failed to init Shiki:', e)
    }
  }

  const updateHighlight = () => {
    if (!highlighter.value || !isLoaded.value) {
      highlightedHtml.value = escapeHtml(state.code)
      return
    }

    try {
      const html = highlighter.value.codeToHtml(state.code || ' ', {
        lang: state.language,
        theme: state.theme
      })
      highlightedHtml.value = html
    } catch (e) {
      console.error('Highlight failed:', e)
      highlightedHtml.value = escapeHtml(state.code)
    }
  }

  // Escape HTML if shiki fails or is not loaded to prevent XSS and correct display
  const escapeHtml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  initShiki()

  watch([() => state.code, () => state.language, () => state.theme], () => {
    updateHighlight()
  })

  return {
    isLoaded,
    highlightedHtml
  }
}
