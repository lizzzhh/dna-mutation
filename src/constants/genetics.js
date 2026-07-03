// 默认序列
export const defaultTemplateDNA = ['T', 'A', 'C', 'C', 'A', 'A', 'T', 'A', 'A', 'A', 'A', 'T', 'C', 'C', 'A', 'A', 'T', 'T']

export const dnaCodeComplement = { A: 'T', T: 'A', C: 'G', G: 'C' }

export const defaultCodeDNA = defaultTemplateDNA.map(b => dnaCodeComplement[b])

export const defaultmRNA = ['A', 'U', 'G', 'G', 'U', 'U', 'A', 'U', 'U', 'U', 'U', 'A', 'G', 'G', 'U', 'U', 'A', 'A']

export const defaultProtein = ['甲硫氨酸', '缬氨酸', '异亮氨酸', '亮氨酸', '甘氨酸', '终止密码子']

export const dnaComplement = { A: 'U', T: 'A', C: 'G', G: 'C' }

// 密码子表
export const codonMap = {
  'AUG': '甲硫氨酸',"AAA":"赖氨酸", "AAG": "赖氨酸",
  'GUU': '缬氨酸', 'GUC': '缬氨酸', 'GUA': '缬氨酸', 'GUG': '缬氨酸',
  'AUU': '异亮氨酸', 'AUC': '异亮氨酸', 'AUA': '异亮氨酸',
  'UUA': '亮氨酸', 'UUG': '亮氨酸', 'CUU': '亮氨酸', 'CUC': '亮氨酸', 'CUA': '亮氨酸', 'CUG': '亮氨酸',
  'GCU': '丙氨酸', 'GCC': '丙氨酸', 'GCA': '丙氨酸', 'GCG': '丙氨酸',
  'CGU': '精氨酸', 'CGC': '精氨酸', 'CGA': '精氨酸', 'CGG': '精氨酸', 'AGA': '精氨酸', 'AGG': '精氨酸',
  'GAU': '天冬氨酸', 'GAC': '天冬氨酸',
  'UGU': '半胱氨酸', 'UGC': '半胱氨酸',
  'CAA': '谷氨酰胺', 'CAG': '谷氨酰胺',
  'GAA': '谷氨酸', 'GAG': '谷氨酸',
  'GGU': '甘氨酸', 'GGC': '甘氨酸', 'GGA': '甘氨酸', 'GGG': '甘氨酸',
  'CAU': '组氨酸', 'CAC': '组氨酸',
  'UUU': '苯丙氨酸', 'UUC': '苯丙氨酸',
  'CCU': '脯氨酸', 'CCC': '脯氨酸', 'CCA': '脯氨酸', 'CCG': '脯氨酸',
  'UCU': '丝氨酸', 'UCC': '丝氨酸', 'UCA': '丝氨酸', 'UCG': '丝氨酸', 'AGU': '丝氨酸', 'AGC': '丝氨酸',
  'ACU': '苏氨酸', 'ACC': '苏氨酸', 'ACA': '苏氨酸', 'ACG': '苏氨酸',
  'UGG': '色氨酸',
  'UAU': '酪氨酸', 'UAC': '酪氨酸',
  'UAA': '终止密码子', 'UAG': '终止密码子', 'UGA': '终止密码子'
}

// 氨基酸列表
export const aminoAcids = [
  '丙氨酸', '精氨酸', '天冬氨酸', '半胱氨酸', '谷氨酰胺', '谷氨酸', '甘氨酸',
  '组氨酸', '异亮氨酸', '亮氨酸', '赖氨酸', '甲硫氨酸', '苯丙氨酸', '脯氨酸',
  '丝氨酸', '苏氨酸', '色氨酸', '酪氨酸', '缬氨酸', '天冬酰胺', '终止密码子'
]

// DNA碱基
export const dnaBases = [
  { char: 'A', type: 'dna' },
  { char: 'T', type: 'dna' },
  { char: 'C', type: 'dna' },
  { char: 'G', type: 'dna' }
]

// mRNA碱基
export const mrnaBases = [
  { char: 'A', type: 'mrna' },
  { char: 'U', type: 'mrna' },
  { char: 'C', type: 'mrna' },
  { char: 'G', type: 'mrna' }
]

// 工具函数
export function getShapeClass(char) {
  return char === 'U' ? 'shape-U' : `shape-${char}`
}

export function cleanProteinAfterStop(arr, tip = false, showToast) {
  const idx = arr.findIndex(v => v === '终止密码子')
  if (idx === -1) return arr
  if (arr.length > idx + 1 && tip && showToast) {
    showToast('终止密码子后氨基酸已全部删除')
  }
  return arr.slice(0, idx + 1)
}

export function translateMrnaToProtein(mrna) {
  const protein = []
  for (let i = 0; i + 3 <= mrna.length; i += 3) {
    const codon = mrna.slice(i, i + 3).join('')
    protein.push(codonMap[codon] || '未知')
  }
  return cleanProteinAfterStop(protein)
}