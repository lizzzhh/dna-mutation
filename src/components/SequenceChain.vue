<template>
  <div>
    <label v-if="label" class="label-text">{{ label }}</label>
    <div
      :class="chainClasses"
      @dragover.prevent="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
      ref="chainRef"
    >
      <BaseItem
        v-for="(item, index) in items"
        :key="`${item}-${index}`"
        :char="item"
        :is-amino="isAmino"
        :highlighted="highlightSet.has(index)"
        @click="(e) => $emit('select', e.target, index)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseItem from './BaseItem.vue'

const highlightSet = computed(() => {
  return new Set([...props.highlights])
})
const props = defineProps({
  items: { type: Array, required: true },
  isAmino: { type: Boolean, default: false },
  label: { type: String, default: '' },
  dropzone: { type: Boolean, default: false },
  prefix: { type: String, required: true },
  type: { type: String, required: true },
  highlights: { type: Set, default: () => new Set() },
  summary: { type: Boolean, default: false }
})

const emit = defineEmits(['select', 'drop'])

const chainRef = ref(null)
const isActive = ref(false)

const chainClasses = computed(() => {
  const classes = ['chain']
  if (props.isAmino) classes.push('amino-chain')
  if (props.dropzone) classes.push('dropzone')
  if (isActive.value) classes.push('active')
  if (props.summary) classes.push('summary')
  return classes
})

function onDragOver(e) {
  if (!props.dropzone) return
  e.preventDefault()
  isActive.value = true
}

function onDragLeave() {
  isActive.value = false
}

function onDrop(e) {
  e.preventDefault()
  isActive.value = false
  if (!props.dropzone) return
  
  const rawData = e.dataTransfer.getData('text/plain')
  if (!rawData) return
  
  try {
    const data = JSON.parse(rawData)
    const idx = getDropIndex(e.clientX)
    
    emit('drop', {
      type: props.type,
      data,
      index: idx
    })
  } catch (err) {
    console.error('Failed to parse drop data:', err)
  }
}

function getDropIndex(clientX) {
  const rect = chainRef.value.getBoundingClientRect()
  const relativeX = clientX - rect.left
  const children = Array.from(chainRef.value.children).filter(c => c.classList.contains('base'))
  if (children.length === 0) return 0
  
  const firstChild = children[0]
  const childWidth = firstChild.offsetWidth
  const gap = parseInt(getComputedStyle(chainRef.value).gap) || 6
  const totalWidth = childWidth + gap
  
  const position = Math.floor(relativeX / totalWidth)
  return Math.max(0, Math.min(position, children.length))
}

defineExpose({ chainRef })
</script>