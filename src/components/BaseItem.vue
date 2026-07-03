<template>
  <div
    :class="baseClasses"
    :draggable="draggable"
    @click="$emit('click', $event)"
    @dragstart="onDragStart"
  >
    {{ char }}
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getShapeClass } from '../constants/genetics'

const props = defineProps({
  char: { type: String, required: true },
  isAmino: { type: Boolean, default: false },
  draggable: { type: Boolean, default: false },
  type: { type: String, default: null },
  highlighted: { type: Boolean, default: false },
  correct: { type: Boolean, default: false }
})

defineEmits(['click', 'dragstart'])

const baseClasses = computed(() => {
  const classes = ['base']
  if (props.isAmino) {
    classes.push('amino', 'bg-orange-400')
  } else {
    classes.push(getShapeClass(props.char), props.char)
  }
  if (props.highlighted) classes.push('highlighted')
  if (props.correct) classes.push('correct')
  return classes
})

function onDragStart(e) {
  if (props.draggable) {
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: props.type,
      char: props.char
    }))
  }
  e.stopPropagation()
}
</script>

<style scoped>
.base {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1;
}

.base.amino {
  white-space: nowrap;
  padding: 0 8px;
  justify-content: center;
}
</style>