<template>
  <div class="slide-page">
    <div :class="['panel', { summary }]">
      <div v-if="!hideControls" class="btn-group">
        <button v-if="showUndo" class="btn btn-undo" @click="$emit('undo')">
          上一步
        </button>
        <button class="btn btn-reset" @click="$emit('reset')">复原</button>
        <button class="btn btn-delete" @click="$emit('delete')">
          删除选中
        </button>
      </div>

      <h3 :class="['title', 'text-center', { summary }]">{{ title }}</h3>

      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  summary: { type: Boolean, default: false },
  showUndo: { type: Boolean, default: false },
  hideControls: { type: Boolean, default: false },
});

defineEmits(["undo", "reset", "delete"]);
</script>
