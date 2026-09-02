<template>
  <transition name="fade">
    <span v-if="status !== 'idle'" class="save-indicator" :class="status">
      <span v-if="status === 'saving'">Saving…</span>
      <span v-else-if="status === 'saved'">Saved</span>
      <span v-else-if="status === 'error'">Couldn't save</span>
    </span>
  </transition>
</template>

<script setup>
defineProps({ status: { type: String, required: true } });
</script>

<style scoped>
.save-indicator {
  font-size: 0.76rem;
  padding: 0.25em 0.7em;
  border-radius: 999px;
  white-space: nowrap;
}
.save-indicator.saving {
  color: var(--ink-soft);
}
.save-indicator.saved {
  color: var(--sage);
  background: rgba(91, 117, 83, 0.14);
}
.save-indicator.error {
  color: var(--oxblood);
  background: var(--oxblood-soft);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
