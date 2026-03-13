import { ref, reactive, watch } from 'vue'

export const SUPPORTED_LANGUAGES = [
  { id: 'typescript', label: 'TypeScript' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'vue', label: 'Vue' },
  { id: 'html', label: 'HTML' },
  { id: 'css', label: 'CSS' },
  { id: 'java', label: 'Java' },
  { id: 'python', label: 'Python' },
  { id: 'cpp', label: 'C++' },
  { id: 'go', label: 'Go' },
  { id: 'rust', label: 'Rust' },
  { id: 'json', label: 'JSON' },
  { id: 'sql', label: 'SQL' },
  { id: 'markdown', label: 'Markdown' },
]

export const BG_GRADIENTS = [
  { id: 'breeze', name: 'Breeze', colors: 'linear-gradient(140deg, rgb(207, 47, 152), rgb(106, 61, 236))' },
  { id: 'candy', name: 'Candy', colors: 'linear-gradient(140deg, rgb(165, 142, 251), rgb(233, 191, 248))' },
  { id: 'crimson', name: 'Crimson', colors: 'linear-gradient(140deg, rgb(255, 99, 99), rgb(113, 27, 134))' },
  { id: 'falcon', name: 'Falcon', colors: 'linear-gradient(140deg, rgb(189, 227, 236), rgb(54, 54, 84))' },
  { id: 'meadow', name: 'Meadow', colors: 'linear-gradient(140deg, rgb(89, 212, 153), rgb(160, 253, 205))' },
  { id: 'midnight', name: 'Midnight', colors: 'linear-gradient(140deg, rgb(0, 0, 0), rgb(58, 60, 64))' },
  { id: 'sunset', name: 'Sunset', colors: 'linear-gradient(140deg, rgb(255, 207, 115), rgb(255, 122, 47))' },
  { id: 'bamboo', name: 'Bamboo', colors: 'linear-gradient(140deg, rgb(186, 217, 186), rgb(90, 169, 131))' },
]

export const state = reactive({
  code: 'console.log("Hello, World!");',
  filename: 'Untitled.ts',
  language: 'typescript',
  theme: 'github-dark', // this will be managed automatically by darkMode
  darkMode: true,
  showBackground: true,
  backgroundId: 'breeze',
  padding: 64, // 16, 32, 64, 128
})

// Auto update Shiki theme based on dark mode
watch(() => state.darkMode, (isDark) => {
  state.theme = isDark ? 'github-dark' : 'github-light'
}, { immediate: true })
