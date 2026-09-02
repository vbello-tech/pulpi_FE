<template>
  <li class="node" :class="`depth-${depth}`">
    <div class="node-row">
      <span class="marker">{{ marker }}</span>
      <div class="node-body">
        <h3 v-if="point.heading" class="heading">{{ point.heading }}</h3>
        <p v-if="point.body" class="body-text">{{ point.body }}</p>

        <p v-if="point.verse_refs?.length" class="verse-line">
          <button
            v-for="vr in point.verse_refs"
            :key="vr.id"
            class="verse-chip"
            :title="vr.verse_detail?.text"
            @click="$emit('click-verse', vr)"
          >
            {{ vr.verse_detail?.reference }}
          </button>
        </p>

        <div v-if="point.illustrations?.length" class="illustrations">
          <div v-for="ill in point.illustrations" :key="ill.id" class="illustration">
            <span class="ill-kind">{{ kindLabel(ill.kind) }}</span>
            <p>{{ ill.content }}</p>
            <p v-if="ill.source" class="ill-source">— {{ ill.source }}</p>
          </div>
        </div>
      </div>
    </div>

    <ul v-if="point.children?.length" class="children">
      <PreachOutlineNode
        v-for="(child, idx) in point.children"
        :key="child.id"
        :point="child"
        :depth="depth + 1"
        :index="idx"
        @click-verse="(...a) => $emit('click-verse', ...a)"
      />
    </ul>
  </li>
</template>

<script setup>
import { computed } from "vue";
import { outlineMarker } from "../utils/outlineMarkers";

const props = defineProps({
  point: { type: Object, required: true },
  depth: { type: Number, default: 0 },
  index: { type: Number, default: 0 },
});
defineEmits(["click-verse"]);

const marker = computed(() => outlineMarker(props.depth, props.index));

function kindLabel(kind) {
  return { story: "Story", quote: "Quote", statistic: "Statistic", analogy: "Analogy", other: "Note" }[kind] || kind;
}
</script>

<style scoped>
.node {
  list-style: none;
  margin: 0 0 1.3rem;
}
.node-row {
  display: flex;
  gap: 0.7rem;
  align-items: flex-start;
}
.marker {
  font-family: var(--font-serif);
  font-weight: 700;
  color: var(--oxblood);
  min-width: 1.7rem;
  text-align: right;
  flex-shrink: 0;
  padding-top: 0.1em;
}
.depth-1 .marker, .depth-2 .marker, .depth-3 .marker { color: var(--brass); }
.node-body { flex: 1; min-width: 0; }
.heading {
  font-size: 1.1rem;
  margin: 0 0 0.25rem;
}
.body-text {
  margin: 0 0 0.5rem;
  color: var(--ink-soft);
  line-height: 1.6;
}
.verse-line {
  margin: 0.2rem 0 0.6rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.verse-chip {
  font-family: var(--font-serif);
  font-size: 0.82rem;
  background: var(--oxblood-soft);
  color: var(--oxblood);
  border: none;
  padding: 0.25em 0.65em;
  border-radius: 999px;
}
.verse-chip:hover {
  background: var(--oxblood);
  color: var(--paper-raised);
}
.illustrations {
  margin: 0.3rem 0 0.6rem;
}
.illustration {
  border-left: 2px solid var(--brass);
  padding-left: 0.8rem;
  margin-bottom: 0.5rem;
}
.ill-kind {
  font-size: 0.72rem;
  color: var(--brass);
  font-weight: 600;
}
.illustration p {
  margin: 0.15rem 0 0;
  color: var(--ink-soft);
  font-size: 0.9rem;
}
.ill-source {
  font-style: italic;
  font-size: 0.8rem !important;
}
.children {
  list-style: none;
  margin: 0.8rem 0 0;
  padding: 0 0 0 1.3rem;
  border-left: 1px solid var(--rule);
}
</style>
