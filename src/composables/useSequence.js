import { reactive, ref } from 'vue'
import {
  defaultTemplateDNA,
  defaultCodeDNA,
  defaultmRNA,
  defaultProtein,
  dnaCodeComplement,
  dnaComplement,
  codonMap,
  cleanProteinAfterStop
} from '../constants/genetics'

// 反向密码子表：氨基酸 -> 第一个对应的密码子
const reverseCodonMap = {}
Object.entries(codonMap).forEach(([codon, amino]) => {
  if (!reverseCodonMap[amino]) {
    reverseCodonMap[amino] = codon
  }
})

export function useSequence(toast) {
  // 序列数据 - 直接使用数组
  const sequences = reactive({
    original: {
      dna: [...defaultTemplateDNA],
      dnaCode: [...defaultCodeDNA],
      mrna: [...defaultmRNA],
      protein: [...defaultProtein]
    },
    replace: {
      dna: [...defaultTemplateDNA],
      dnaCode: [...defaultCodeDNA],
      mrna: [...defaultmRNA],
      protein: [...defaultProtein]
    },
    add: {
      dna: [...defaultTemplateDNA],
      dnaCode: [...defaultCodeDNA],
      mrna: [...defaultmRNA],
      protein: [...defaultProtein]
    },
    del: {
      dna: [...defaultTemplateDNA],
      dnaCode: [...defaultCodeDNA],
      mrna: [...defaultmRNA],
      protein: [...defaultProtein]
    }
  })

  // 高亮集合
  const highlights = reactive({
    original: { template: [], code: [], protein: [] },
    replace: { template: [], code: [], protein: [] },
    add: { template: [], code: [], protein: [] },
    del: { template: [], code: [], protein: [] }
  })

  const selected = ref({
    element: null,
    prefix: null,
    type: null,
    index: -1
  })

// ========== 辅助函数：从蛋白质重新构建mRNA，尽可能保留原有密码子 ==========
function rebuildMrnaFromProtein(newProtein, oldMrna) {
  const newMrna = []
  
  // 将旧mRNA按密码子拆分，并标记是否已使用
  const oldCodons = []
  for (let i = 0; i + 3 <= oldMrna.length; i += 3) {
    const codon = oldMrna.slice(i, i + 3).join('')
    const amino = codonMap[codon] || '未知'
    oldCodons.push({ codon, amino, used: false })
  }
  
  // 遍历新蛋白质的每个氨基酸
  for (const amino of newProtein) {
    let foundCodon = null
    
    if (amino !== '终止密码子') {
      // 在旧密码子中查找第一个未使用且编码相同氨基酸的密码子
      for (const item of oldCodons) {
        if (!item.used && item.amino === amino) {
          foundCodon = item.codon
          item.used = true
          break
        }
      }
    }
    
    if (foundCodon) {
      // 找到可复用的密码子
      newMrna.push(...foundCodon.split(''))
    } else {
      // 使用默认密码子
      if (amino === '终止密码子') {
        newMrna.push('U', 'A', 'A')
      } else {
        const defaultCodon = reverseCodonMap[amino] || 'AUG'
        newMrna.push(...defaultCodon.split(''))
      }
    }
  }
  
  // 如果新蛋白质没有终止密码子，不额外添加
  
  return newMrna
}

// ========== 核心函数：以任意序列为源头，重新计算所有其他序列 ==========
function recalculateAllFrom(prefix, sourceType) {
  const seq = sequences[prefix]
  
  if (sourceType === 'dna') {
    seq.dnaCode = seq.dna.map(b => dnaCodeComplement[b])
    seq.mrna = seq.dna.map(b => dnaComplement[b] || '')
    const rawProtein = translateMrnaToProtein(seq.mrna)
    seq.protein = cleanProteinAfterStop(rawProtein, true, (msg) => toast?.show(msg))
    
  } else if (sourceType === 'dna-code') {
    seq.dna = seq.dnaCode.map(b => dnaCodeComplement[b])
    seq.mrna = seq.dna.map(b => dnaComplement[b] || '')
    const rawProtein = translateMrnaToProtein(seq.mrna)
    seq.protein = cleanProteinAfterStop(rawProtein, true, (msg) => toast?.show(msg))
    
  } else if (sourceType === 'mrna') {
    seq.dna = seq.mrna.map(b => {
      const map = { 'A': 'T', 'U': 'A', 'C': 'G', 'G': 'C' }
      return map[b] || ''
    })
    seq.dnaCode = seq.dna.map(b => dnaCodeComplement[b])
    const rawProtein = translateMrnaToProtein(seq.mrna)
    seq.protein = cleanProteinAfterStop(rawProtein, true, (msg) => toast?.show(msg))
    
  } else if (sourceType === 'protein') {
    // 从蛋白质重新构建mRNA，尽可能保留原有密码子
    const oldMrna = seq.mrna
    const cleanProtein = cleanProteinAfterStop([...seq.protein], false)
    
    seq.mrna = rebuildMrnaFromProtein(cleanProtein, oldMrna)
    
    seq.dna = seq.mrna.map(b => {
      const map = { 'A': 'T', 'U': 'A', 'C': 'G', 'G': 'C' }
      return map[b] || ''
    })
    seq.dnaCode = seq.dna.map(b => dnaCodeComplement[b])
  }
  
  clearHighlightsByPrefix(prefix)
  clearSelection()
}
  // ========== 辅助函数 ==========
  function translateMrnaToProtein(mrnaArray) {
    const protein = []
    for (let i = 0; i + 3 <= mrnaArray.length; i += 3) {
      const codon = mrnaArray.slice(i, i + 3).join('')
      protein.push(codonMap[codon] || '未知')
    }
    return protein
  }

  function hasHighlight(prefix, type, index) {
    return highlights[prefix][type].includes(index)
  }

  function addHighlight(prefix, type, index) {
    if (!highlights[prefix][type].includes(index)) {
      highlights[prefix][type].push(index)
    }
  }

  function clearAllHighlights() {
    Object.keys(highlights).forEach(prefix => {
      highlights[prefix].template = []
      highlights[prefix].code = []
      highlights[prefix].protein = []
    })
  }

  function clearHighlightsByPrefix(prefix) {
    highlights[prefix].template = []
    highlights[prefix].code = []
    highlights[prefix].protein = []
  }

  function resetSequence(prefix) {
    sequences[prefix].dna = [...defaultTemplateDNA]
    sequences[prefix].dnaCode = [...defaultCodeDNA]
    sequences[prefix].mrna = [...defaultmRNA]
    sequences[prefix].protein = [...defaultProtein]
    clearHighlightsByPrefix(prefix)
    clearSelection()
  }

  function clearSelection() {
    if (selected.value.element) {
      selected.value.element.style.border = ''
    }
    selected.value = { element: null, prefix: null, type: null, index: -1 }
  }

  function selectBase(el, prefix, type, index) {
    clearAllHighlights()
    
    if (selected.value.element) {
      selected.value.element.style.border = ''
    }
    
    selected.value = { element: el, prefix, type, index }
    el.style.border = '2px solid #ef4444'

    if (type === 'dna' || type === 'dna-code') {
      addHighlight(prefix, 'template', index)
      addHighlight(prefix, 'code', index)
    } else if (type === 'protein') {
      addHighlight(prefix, 'protein', index)
    }
  }

  // ========== 修改操作 ==========
  function addBase(prefix, type, base, index) {
    const seq = sequences[prefix]
    
    if (type === 'dna') {
      seq.dna.splice(index, 0, base)
    } else if (type === 'dna-code') {
      seq.dnaCode.splice(index, 0, base)
    } else if (type === 'mrna') {
      seq.mrna.splice(index, 0, base)
    } else if (type === 'protein') {
      seq.protein.splice(index, 0, base)
    }
    
    // 以当前修改的序列为源头重新计算所有序列
    recalculateAllFrom(prefix, type)
  }

  function replaceBase(prefix, type, base, index) {
    const seq = sequences[prefix]
    
    if (type === 'dna') {
      if (index >= seq.dna.length) {
        seq.dna.push(base)
      } else {
        seq.dna[index] = base
      }
    } else if (type === 'dna-code') {
      if (index >= seq.dnaCode.length) {
        seq.dnaCode.push(base)
      } else {
        seq.dnaCode[index] = base
      }
    } else if (type === 'mrna') {
      if (index >= seq.mrna.length) {
        seq.mrna.push(base)
      } else {
        seq.mrna[index] = base
      }
    } else if (type === 'protein') {
      if (index >= seq.protein.length) {
        seq.protein.push(base)
      } else {
        seq.protein[index] = base
      }
    }
    
    // 以当前修改的序列为源头重新计算所有序列
    recalculateAllFrom(prefix, type)
  }

  function deleteBase(prefix, type, index) {
    const seq = sequences[prefix]
    
    if (type === 'dna') {
      seq.dna.splice(index, 1)
    } else if (type === 'dna-code') {
      seq.dnaCode.splice(index, 1)
    } else if (type === 'mrna') {
      seq.mrna.splice(index, 1)
    } else if (type === 'protein') {
      seq.protein.splice(index, 1)
    }
    
    // 以当前修改的序列为源头重新计算所有序列
    if (type === 'dna' && seq.dna.length > 0) {
      recalculateAllFrom(prefix, 'dna')
    } else if (type === 'dna-code' && seq.dnaCode.length > 0) {
      recalculateAllFrom(prefix, 'dna-code')
    } else if (type === 'mrna' && seq.mrna.length > 0) {
      recalculateAllFrom(prefix, 'mrna')
    } else if (type === 'protein' && seq.protein.length > 0) {
      recalculateAllFrom(prefix, 'protein')
    } else {
      // 如果全部删空了，重置为空数组
      seq.dna = []
      seq.dnaCode = []
      seq.mrna = []
      seq.protein = []
      clearHighlightsByPrefix(prefix)
      clearSelection()
    }
  }

  function checkCompatibility(prefix, type, base, index) {
    // 由于修改后会重新计算所有序列，这里直接返回true
    // 不再需要兼容性检查
    return true
  }

  // ========== 历史记录 ==========
  function getSnapshot(prefix) {
    return {
      dna: [...sequences[prefix].dna],
      dnaCode: [...sequences[prefix].dnaCode],
      mrna: [...sequences[prefix].mrna],
      protein: [...sequences[prefix].protein],
      highlights: {
        template: [...highlights[prefix].template],
        code: [...highlights[prefix].code],
        protein: [...highlights[prefix].protein]
      }
    }
  }

  function restoreSnapshot(prefix, snapshot) {
    sequences[prefix].dna = [...snapshot.dna]
    sequences[prefix].dnaCode = [...snapshot.dnaCode]
    sequences[prefix].mrna = [...snapshot.mrna]
    sequences[prefix].protein = [...snapshot.protein]
    highlights[prefix].template = [...snapshot.highlights.template]
    highlights[prefix].code = [...snapshot.highlights.code]
    highlights[prefix].protein = [...snapshot.highlights.protein]
    clearSelection()
  }

  return {
    sequences,
    highlights,
    selected,
    resetSequence,
    clearSelection,
    selectBase,
    addBase,
    replaceBase,
    deleteBase,
    checkCompatibility,
    getSnapshot,
    restoreSnapshot,
    hasHighlight,
    clearAllHighlights,
    recalculateAllFrom
  }
}