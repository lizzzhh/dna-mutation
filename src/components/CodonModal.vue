<template>
  <div v-if="visible" class="codon-modal" @click="close">
    <div class="relative" @click.stop>
      <div class="codon-close" @click="close">×</div>
      <img
        src="https://cdn.luogu.com.cn/upload/image_hosting/mmnfhl4g.png"
        class="codon-img"
        alt="密码子表"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const visible = ref(false)

function open() {
  visible.value = true
}

function close() {
  visible.value = false
}

defineExpose({ open, close })
</script>