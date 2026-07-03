<template>
  <div v-if="visible" class="sidebar">
    <h3 class="title text-center text-lg mb-4">原料</h3>
    
    <div class="mb-4">
      <h4 class="text-cyan-300 text-sm mb-2">DNA碱基</h4>
      <div class="flex flex-wrap gap-2">
        <BaseItem
          v-for="base in dnaBases"
          :key="base.char"
          :char="base.char"
          :type="base.type"
          draggable
          @dragstart="(e) => onDragStart(e, base)"
        />
      </div>
    </div>
    
    <div class="mb-4">
      <h4 class="text-cyan-300 text-sm mb-2">mRNA碱基</h4>
      <div class="flex flex-wrap gap-2">
        <BaseItem
          v-for="base in mrnaBases"
          :key="base.char"
          :char="base.char"
          :type="base.type"
          draggable
          @dragstart="(e) => onDragStart(e, base)"
        />
      </div>
    </div>
    
    <div class="mb-4">
      <h4 class="text-cyan-300 text-sm mb-2">20种氨基酸</h4>
      <div class="flex flex-wrap gap-2">
        <BaseItem
          v-for="amino in aminoAcids"
          :key="amino"
          :char="amino"
          :type="'amino'"
          is-amino
          draggable
          @dragstart="(e) => onDragStart(e, { char: amino, type: 'amino' })"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseItem from './BaseItem.vue'
import { dnaBases, mrnaBases, aminoAcids } from '../constants/genetics'

defineProps({
  visible: { type: Boolean, default: true }
})

const emit = defineEmits(['drag-start'])

function onDragStart(e, data) {
  e.dataTransfer.effectAllowed = 'copy'
  e.dataTransfer.setData('text/plain', JSON.stringify(data))
  emit('drag-start', data)
}
</script>