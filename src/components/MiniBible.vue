<template>
  <aside class="mini-bible card">
    <div class="mb-head">
      <h2>Bible</h2>
      <select v-model="translation" @change="load">
        <option v-for="t in translations" :key="t.code" :value="t.code">{{ t.name }}</option>
      </select>
    </div>

    <div class="mb-controls">
      <select v-model="bookName" @change="onBookChange">
        <option v-for="b in books" :key="b.id" :value="b.name">{{ b.name }}</option>
      </select>
      <div class="mb-row">
        <input v-model.number="chapter" type="number" min="1" placeholder="Ch" @keyup.enter="load" />
        <input v-model.number="verseStart" type="number" min="1" placeholder="Start v" @keyup.enter="load" />
        <input v-model.number="verseEnd" type="number" min="1" placeholder="End v" @keyup.enter="load" />
      </div>
      <button class="btn btn-outline" style="width: 100%; justify-content: center;" :disabled="!bookName || !chapter" @click="load">
        Go
      </button>
    </div>

    <div v-if="replaceTarget" class="replace-banner">
      <span>Pick a verse for <strong>{{ replaceTarget.verse_detail?.reference }}</strong></span>
      <button class="btn-quiet" @click="$emit('cancel-replace')">Cancel</button>
    </div>

    <div class="mb-results">
      <p v-if="loading" class="mb-empty">Loading…</p>
      <p v-else-if="!verses.length" class="mb-empty">Choose a book and chapter to read.</p>
      <div
        v-for="v in verses"
        :key="v.id"
        class="mb-verse"
        :class="{ highlighted: isHighlighted(v) }"
      >
        <span class="mb-vnum">{{ v.verse }}</span>
        <span class="mb-text">{{ v.text }}</span>
        <button v-if="replaceTarget" class="btn-quiet use-btn" @click="$emit('select-verse', v)">
          Use this
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { bibleApi } from "../api/sermons";

defineProps({
  replaceTarget: { type: Object, default: null },
});
defineEmits(["select-verse", "cancel-replace"]);

const books = ref([]);
const translations = ref([]);
const bookName = ref("");
const chapter = ref(1);
const verseStart = ref(null);
const verseEnd = ref(null);
const translation = ref("KJV");
const verses = ref([]);
const loading = ref(false);

function isHighlighted(v) {
  if (!verseStart.value) return false;
  const end = verseEnd.value || verseStart.value;
  return v.verse >= verseStart.value && v.verse <= end;
}

function onBookChange() {
  chapter.value = 1;
  verseStart.value = null;
  verseEnd.value = null;
  load();
}

async function load() {
  if (!bookName.value || !chapter.value) return;
  loading.value = true;
  try {
    const params = { book: bookName.value, chapter: chapter.value, translation: translation.value };
    if (verseStart.value) params.verse_start = verseStart.value;
    if (verseEnd.value) params.verse_end = verseEnd.value;
    const data = await bibleApi.search(params);
    verses.value = data.results ?? data;
  } finally {
    loading.value = false;
  }
}

/** Called by the parent when a verse chip is clicked in the outline. */
function showVerse({ book, chapter: ch, verse }) {
  bookName.value = book;
  chapter.value = ch;
  verseStart.value = verse;
  verseEnd.value = verse;
  load();
}

defineExpose({ showVerse });

onMounted(async () => {
  [books.value, translations.value] = await Promise.all([bibleApi.books(), bibleApi.translations()]);
  if (books.value.length) {
    bookName.value = books.value[0].name;
    await load();
  }
});
</script>

<style scoped>
.mini-bible {
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
.mb-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.9rem;
}
.mb-head h2 {
  font-size: 1.1rem;
  margin: 0;
}
.mb-head select {
  width: auto;
  font-size: 0.78rem;
  padding: 0.3em 0.5em;
}
.mb-controls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-bottom: 0.9rem;
  border-bottom: 1px solid var(--rule);
  margin-bottom: 0.9rem;
}
.mb-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.4rem;
}
.replace-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  background: var(--brass-soft);
  color: #6b5420;
  font-size: 0.78rem;
  padding: 0.5em 0.7em;
  border-radius: var(--radius);
  margin-bottom: 0.7rem;
}
.mb-results {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}
.mb-empty {
  color: var(--ink-soft);
  font-size: 0.85rem;
  text-align: center;
  padding: 1.5rem 0;
}
.mb-verse {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  padding: 0.35rem 0.3rem;
  border-radius: var(--radius);
  font-size: 0.88rem;
  line-height: 1.55;
}
.mb-verse.highlighted {
  background: var(--oxblood-soft);
}
.mb-vnum {
  font-family: var(--font-serif);
  font-weight: 700;
  color: var(--oxblood);
  font-size: 0.72rem;
  min-width: 1.4rem;
  text-align: right;
  flex-shrink: 0;
}
.mb-text {
  flex: 1;
  color: var(--ink);
}
.use-btn {
  font-size: 0.72rem;
  white-space: nowrap;
  flex-shrink: 0;
}
</style>
