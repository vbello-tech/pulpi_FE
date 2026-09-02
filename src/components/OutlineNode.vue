<template>
  <li class="node" :class="`depth-${depth}`">
    <div class="node-row">
      <span class="marker">{{ marker }}</span>
      <div class="node-body">
        <input
          class="heading-input"
          :value="point.heading"
          placeholder="Point heading…"
          @change="onHeadingChange($event.target.value)"
        />
        <textarea
          class="body-input"
          :value="point.body"
          placeholder="Notes, explanation, exegesis…"
          rows="2"
          @change="onBodyChange($event.target.value)"
        ></textarea>

        <ul v-if="point.verse_refs?.length" class="chip-list">
          <li v-for="vr in point.verse_refs" :key="vr.id" class="chip verse-chip">
            <span>{{ vr.verse_detail?.reference }}</span>
            <button class="chip-remove" title="Remove verse" @click="$emit('remove-verse-ref', vr.id, point.id)">×</button>
          </li>
        </ul>

        <ul v-if="point.illustrations?.length" class="chip-list">
          <li v-for="ill in point.illustrations" :key="ill.id" class="chip illustration-chip">
            <span>{{ kindLabel(ill.kind) }}: {{ truncate(ill.content) }}</span>
            <button class="chip-remove" title="Remove" @click="$emit('remove-illustration', ill.id, point.id)">×</button>
          </li>
        </ul>

        <div class="node-actions">
          <button class="link-btn" @click="$emit('add-child', point.id)">+ Sub-point</button>
          <button class="link-btn" @click="$emit('add-illustration', point.id)">+ Illustration</button>
          <button class="link-btn" @click="$emit('open-verse-picker', point.id)">+ Verse</button>
          <button class="link-btn danger" @click="$emit('delete', point.id, point.parent)">Delete</button>
        </div>
      </div>
    </div>

    <ul v-if="point.children?.length" class="children">
      <OutlineNode
        v-for="(child, idx) in point.children"
        :key="child.id"
        :point="child"
        :depth="depth + 1"
        :index="idx"
        @add-child="(...a) => $emit('add-child', ...a)"
        @update-point="(...a) => $emit('update-point', ...a)"
        @delete="(...a) => $emit('delete', ...a)"
        @add-illustration="(...a) => $emit('add-illustration', ...a)"
        @remove-illustration="(...a) => $emit('remove-illustration', ...a)"
        @open-verse-picker="(...a) => $emit('open-verse-picker', ...a)"
        @remove-verse-ref="(...a) => $emit('remove-verse-ref', ...a)"
      />
    </ul>
  </li>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  point: { type: Object, required: true },
  depth: { type: Number, default: 0 },
  index: { type: Number, default: 0 },
});
const emit = defineEmits([
  "add-child", "update-point", "delete",
  "add-illustration", "remove-illustration",
  "open-verse-picker", "remove-verse-ref",
]);

// Classic homiletical outline numbering: I. / A. / 1. / a. / then dashes.
const SCHEMES = [
  (i) => toRoman(i + 1) + ".",
  (i) => String.fromCharCode(65 + (i % 26)) + ".",
  (i) => (i + 1) + ".",
  (i) => String.fromCharCode(97 + (i % 26)) + ".",
];
const marker = computed(() => {
  const scheme = SCHEMES[Math.min(props.depth, SCHEMES.length - 1)];
  return scheme(props.index);
});

function toRoman(num) {
  const map = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let result = "";
  for (const [value, symbol] of map) {
    while (num >= value) {
      result += symbol;
      num -= value;
    }
  }
  return result;
}

function kindLabel(kind) {
  return { story: "Story", quote: "Quote", statistic: "Stat", analogy: "Analogy", other: "Note" }[kind] || kind;
}
function truncate(text, len = 50) {
  return text?.length > len ? text.slice(0, len) + "…" : text;
}
function onHeadingChange(value) {
  emit("update-point", props.point.id, { heading: value });
}
function onBodyChange(value) {
  emit("update-point", props.point.id, { body: value });
}
</script>

<style scoped>
.node {
  list-style: none;
  margin: 0 0 0.9rem;
}
.node-row {
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
}
.marker {
  font-family: var(--font-serif);
  font-weight: 700;
  color: var(--oxblood);
  min-width: 1.6rem;
  padding-top: 0.55em;
  text-align: right;
  flex-shrink: 0;
}
.depth-1 .marker, .depth-2 .marker, .depth-3 .marker { color: var(--brass); }
.node-body {
  flex: 1;
  min-width: 0;
}
.heading-input {
  font-family: var(--font-serif);
  font-size: 1.02rem;
  font-weight: 600;
  border: none;
  border-bottom: 1px solid var(--rule);
  border-radius: 0;
  padding: 0.35em 0.1em;
  background: transparent;
}
.heading-input:focus {
  outline: none;
  border-bottom-color: var(--brass);
}
.body-input {
  margin-top: 0.35rem;
  border: none;
  background: transparent;
  resize: vertical;
  color: var(--ink-soft);
  padding: 0.2em 0.1em;
}
.body-input:focus { outline: none; }

.chip-list {
  list-style: none;
  margin: 0.4rem 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35em;
  font-size: 0.76rem;
  padding: 0.2em 0.5em 0.2em 0.6em;
  border-radius: 999px;
}
.verse-chip { background: var(--oxblood-soft); color: var(--oxblood); }
.illustration-chip { background: var(--brass-soft); color: #6b5420; }
.chip-remove {
  background: none;
  border: none;
  font-size: 1rem;
  line-height: 1;
  color: inherit;
  opacity: 0.6;
  padding: 0;
}
.chip-remove:hover { opacity: 1; }

.node-actions {
  margin-top: 0.4rem;
  display: flex;
  gap: 0.9rem;
}
.link-btn {
  background: none;
  border: none;
  padding: 0;
  font-size: 0.78rem;
  color: var(--ink-soft);
}
.link-btn:hover { color: var(--ink); text-decoration: underline; }
.link-btn.danger:hover { color: var(--oxblood); }

.children {
  list-style: none;
  margin: 0.7rem 0 0;
  padding: 0 0 0 1.1rem;
  border-left: 1px solid var(--rule);
}
</style>
