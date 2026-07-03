<template>
  <div :class="['toast', { show: visible }]">{{ message }}</div>
</template>

<script setup>
import { ref } from 'vue'

const visible = ref(false)
const message = ref('')
let timeout = null

function show(msg, duration = 1200) {
  message.value = msg
  visible.value = true
  
  if (timeout) clearTimeout(timeout)
  timeout = setTimeout(() => {
    visible.value = false
  }, duration)
}

defineExpose({ show })
</script>