<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal card">
      <h2>Add an illustration</h2>
      <div class="field">
        <label for="kind">Type</label>
        <select id="kind" v-model="kind">
          <option value="story">Story / Anecdote</option>
          <option value="quote">Quote</option>
          <option value="statistic">Statistic</option>
          <option value="analogy">Analogy</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div class="field">
        <label for="content">Content</label>
        <textarea id="content" v-model="content" rows="4" placeholder="Tell the story or note the quote…"></textarea>
      </div>
      <div class="field">
        <label for="source">Source (optional)</label>
        <input id="source" v-model="source" type="text" placeholder="Book, speaker, or where it's from" />
      </div>
      <div class="modal-actions">
        <button class="btn" :disabled="!content.trim()" @click="submit">Add</button>
        <button class="btn-quiet" @click="$emit('close')">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const emit = defineEmits(["close", "submit"]);
const kind = ref("story");
const content = ref("");
const source = ref("");

function submit() {
  if (!content.value.trim()) return;
  emit("submit", { kind: kind.value, content: content.value.trim(), source: source.value.trim() });
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
  z-index: 50;
}
.modal {
  width: min(420px, 92%);
  padding: 1.6rem;
}
.modal-actions {
  display: flex;
  gap: 0.6rem;
  margin-top: 0.4rem;
}
</style>
