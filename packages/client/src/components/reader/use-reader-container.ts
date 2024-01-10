import { reactive } from 'vue'

export function useReaderContainer() {
  const state = reactive({
    showHeader: true,
    showSlider: true,

    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: 16,
    lineHeight: 18,
    letterSpacing: 0,
    fontWeight: 400,

    paddingSlider: 24,
    paddingHeader: 24,
  })

  return {
    state,
  }
}
