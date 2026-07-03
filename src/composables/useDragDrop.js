import { ref } from 'vue'

export function useDragDrop(toast) {
  let sequenceOps = null

  function setSequenceOps(ops) {
    sequenceOps = ops
  }

  function handleDrop(prefix, type, data, index) {
    if (!sequenceOps) {
      console.error('sequenceOps not initialized')
      return false
    }
    
    const { char, type: dragType } = data
    
    // 类型匹配检查
    if ((type === 'dna' || type === 'dna-code') && dragType !== 'dna') {
      toast?.show('DNA链只能放置DNA碱基')
      return false
    }
    if (type === 'mrna' && dragType !== 'mrna') {
      toast?.show('mRNA链只能放置mRNA碱基')
      return false
    }
    if (type === 'protein' && dragType !== 'amino') {
      toast?.show('多肽链只能放置氨基酸')
      return false
    }
    
    // 兼容性检查
    if (!sequenceOps.checkCompatibility(prefix, type, char, index)) {
      toast?.show('碱基不匹配！')
      return false
    }
    
    // 执行操作
    if (prefix === 'add') {
      sequenceOps.addBase(prefix, type, char, index)
    } else {
      sequenceOps.replaceBase(prefix, type, char, index)
    }
    
    return true
  }

  return {
    setSequenceOps,
    handleDrop
  }
}