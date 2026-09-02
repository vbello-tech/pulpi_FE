<template>
  <div v-if="confirmState" class="modal-backdrop" @click.self="cancel">
    <div class="modal card">
      <h2>{{ confirmState.title }}</h2>
      <p class="message">{{ confirmState.message }}</p>
      <div class="modal-actions">
        <button :class="confirmState.danger ? 'btn btn-danger' : 'btn'" @click="confirm">
          {{ confirmState.confirmLabel }}
        </button>
        <button class="btn-quiet" @click="cancel">{{ confirmState.cancelLabel }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { confirmState, resolveConfirm } from "../composables/confirmDialog";

function confirm() {
  resolveConfirm(true);
}
function cancel() {
  resolveConfirm(false);
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(27, 36, 48, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 60;
}
.modal {
  width: min(380px, 92%);
  padding: 1.6rem;
}
.modal h2 {
  font-size: 1.1rem;
}
.message {
  color: var(--ink-soft);
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0.6rem 0 1.3rem;
}
.modal-actions {
  display: flex;
  gap: 0.6rem;
}
</style>
