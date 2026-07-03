import { ref } from 'vue'

export function useHistory(maxSize = 20) {
  const history = ref([])
  const currentIndex = ref(-1)

  function push(state) {
    // 深拷贝状态
    const clonedState = JSON.parse(JSON.stringify({
      dna: state.dna,
      dnaCode: state.dnaCode,
      mrna: state.mrna,
      protein: state.protein,
      highlights: {
        template: Array.from(state.highlights.template),
        code: Array.from(state.highlights.code),
        protein: Array.from(state.highlights.protein)
      }
    }))
    
    if (history.value.length >= maxSize) {
      history.value.shift()
    }
    history.value.push(clonedState)
    currentIndex.value = history.value.length - 1
  }

  function undo() {
    if (currentIndex.value > 0) {
      currentIndex.value--
      const state = history.value[currentIndex.value]
      return {
        dna: state.dna,
        dnaCode: state.dnaCode,
        mrna: state.mrna,
        protein: state.protein,
        highlights: {
          template: new Set(state.highlights.template),
          code: new Set(state.highlights.code),
          protein: new Set(state.highlights.protein)
        }
      }
    }
    return null
  }

  function canUndo() {
    return currentIndex.value > 0
  }

  function reset() {
    history.value = []
    currentIndex.value = -1
  }

  function getCurrent() {
    if (currentIndex.value >= 0) {
      const state = history.value[currentIndex.value]
      return {
        dna: state.dna,
        dnaCode: state.dnaCode,
        mrna: state.mrna,
        protein: state.protein,
        highlights: {
          template: new Set(state.highlights.template),
          code: new Set(state.highlights.code),
          protein: new Set(state.highlights.protein)
        }
      }
    }
    return null
  }

  return {
    history,
    currentIndex,
    push,
    undo,
    canUndo,
    reset,
    getCurrent
  }
}