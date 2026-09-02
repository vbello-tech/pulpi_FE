<template>
  <div class="picker-backdrop" @click.self="$emit('close')">
    <aside class="picker">
      <div class="picker-head">
        <h2>Add verses</h2>
        <button class="btn-quiet" @click="$emit('close')">Close</button>
      </div>

      <div class="picker-tabs">
        <button :class="{ active: mode === 'search' }" @click="mode = 'search'">Search</button>
        <button :class="{ active: mode === 'browse' }" @click="mode = 'browse'">Browse</button>
      </div>

      <div v-if="mode === 'search'" class="search-block">
        <input
          v-model="query"
          type="text"
          placeholder="Search KJV text, e.g. 'shepherd'…"
          @keyup.enter="runSearch"
        />
        <button class="btn" style="margin-top: 0.5rem;" :disabled="!query.trim() || searching" @click="runSearch">
          {{ searching ? "Searching…" : "Search" }}
        </button>
      </div>

      <div v-else class="browse-block">
        <select v-model="selectedBookId" @change="onBookChange">
          <option disabled value="">Choose a book…</option>
          <option v-for="b in books" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>
        <div v-if="selectedBookId" class="chapter-row">
          <label for="chapter-input" class="chapter-label">Chapter</label>
          <input
            id="chapter-input"
            v-model.number="chapterInput"
            type="number"
            min="1"
            @keyup.enter="loadChapter(chapterInput)"
          />
          <button class="btn-outline btn-sm" @click="loadChapter(chapterInput)">Go</button>
        </div>
      </div>

      <div v-if="selected.size" class="selection-bar">
        <span>{{ selected.size }} verse{{ selected.size > 1 ? "s" : "" }} selected</span>
        <div class="selection-actions">
          <button class="btn-quiet" @click="clearSelection">Clear</button>
          <button class="btn btn-sm" @click="addSelected">Add {{ selected.size }}</button>
        </div>
      </div>

      <ul class="results">
        <li
          v-for="v in results"
          :key="v.id"
          class="result-row"
          :class="{ checked: selected.has(v.id) }"
          @click="toggle(v)"
        >
          <span class="checkbox" aria-hidden="true">{{ selected.has(v.id) ? "✓" : "" }}</span>
          <div class="result-body">
            <strong>{{ v.reference }}</strong>
            <p>{{ v.text }}</p>
          </div>
        </li>
        <li v-if="!results.length && !loading" class="empty">
          {{ mode === "search" ? "Search the KJV to find a verse." : "Choose a book and chapter to browse." }}
        </li>
      </ul>
    </aside>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { bibleApi } from "../api/sermons";

const emit = defineEmits(["close", "select-multiple"]);

const mode = ref("search");
const query = ref("");
const results = ref([]);
const searching = ref(false);
const loading = ref(false);

const books = ref([]);
const selectedBookId = ref("");
const chapter = ref(1);
const chapterInput = ref(1);

// Map of verse.id -> verse object, so selection survives re-searching/browsing.
const selected = ref(new Map());

function toggle(v) {
  if (selected.value.has(v.id)) {
    selected.value.delete(v.id);
  } else {
    selected.value.set(v.id, v);
  }
  // Trigger reactivity for the Map.
  selected.value = new Map(selected.value);
}

function clearSelection() {
  selected.value = new Map();
}

function addSelected() {
  if (!selected.value.size) return;
  emit("select-multiple", Array.from(selected.value.values()));
  clearSelection();
}

async function runSearch() {
  if (!query.value.trim()) return;
  searching.value = true;
  try {
    const data = await bibleApi.search({ q: query.value.trim() });
    results.value = data.results ?? data;
  } finally {
    searching.value = false;
  }
}

function onBookChange() {
  chapterInput.value = 1;
  loadChapter(1);
}

async function loadChapter(num) {
  if (!num || num < 1) return;
  chapter.value = num;
  chapterInput.value = num;
  loading.value = true;
  try {
    results.value = await bibleApi.chapter(selectedBookId.value, num);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  books.value = await bibleApi.books();
});
</script>

<style scoped>
.picker-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(27, 36, 48, 0.35);
  display: flex;
  justify-content: flex-end;
  z-index: 50;
}
.picker {
  width: min(440px, 100%);
  background: var(--paper-raised);
  height: 100%;
  padding: 1.4rem;
  overflow-y: auto;
  border-left: 1px solid var(--rule);
  display: flex;
  flex-direction: column;
}
.picker-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.8rem;
}
.picker-tabs {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 0.9rem;
}
.picker-tabs button {
  flex: 1;
  padding: 0.45em;
  border: 1px solid var(--rule);
  background: transparent;
  border-radius: var(--radius);
  font-size: 0.85rem;
  color: var(--ink-soft);
}
.picker-tabs button.active {
  border-color: var(--ink);
  color: var(--ink);
  background: var(--paper);
}
.browse-block select { margin-bottom: 0.6rem; }
.chapter-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.chapter-label {
  margin: 0;
  font-size: 0.8rem;
  color: var(--ink-soft);
  white-space: nowrap;
}
.chapter-row input {
  width: 5rem;
}
.btn-sm {
  padding: 0.4em 0.8em;
  font-size: 0.82rem;
  white-space: nowrap;
}
.selection-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--brass-soft);
  color: #6b5420;
  font-size: 0.82rem;
  padding: 0.5em 0.8em;
  border-radius: var(--radius);
  margin-top: 1rem;
}
.selection-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.results {
  list-style: none;
  margin: 1rem 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
}
.result-row {
  display: flex;
  gap: 0.6rem;
  padding: 0.6rem 0.7rem;
  border: 1px solid var(--rule);
  border-radius: var(--radius);
  cursor: pointer;
}
.result-row:hover {
  border-color: var(--brass);
  background: var(--brass-soft);
}
.result-row.checked {
  border-color: var(--oxblood);
  background: var(--oxblood-soft);
}
.checkbox {
  flex-shrink: 0;
  width: 1.2rem;
  height: 1.2rem;
  border: 1px solid var(--rule);
  border-radius: 3px;
  background: var(--paper-raised);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: var(--oxblood);
  margin-top: 0.1rem;
}
.result-row.checked .checkbox {
  border-color: var(--oxblood);
  background: var(--oxblood-soft);
}
.result-body { min-width: 0; }
.result-row strong {
  font-family: var(--font-serif);
  font-size: 0.85rem;
  color: var(--oxblood);
}
.result-row p {
  margin: 0.2rem 0 0;
  font-size: 0.85rem;
  color: var(--ink-soft);
}
.empty {
  text-align: center;
  color: var(--ink-soft);
  font-size: 0.85rem;
  padding: 1.5rem 0;
}
</style>
