<template>
  <div v-if="sermon" class="preach-page">
    <div class="preach-toolbar">
      <router-link to="/sermons" class="back-link">‹ All sermons</router-link>
      <router-link :to="`/sermons/${id}`" class="back-link">‹ Back to editor</router-link>
    </div>

    <div class="preach-layout">
      <article class="manuscript">
        <header class="manuscript-head">
          <p v-if="sermon.series" class="series">{{ sermon.series }}</p>
          <h1>{{ sermon.title }}</h1>
          <p v-if="sermon.scripture_reference" class="passage">{{ sermon.scripture_reference }}</p>
          <p v-if="sermon.big_idea" class="big-idea">{{ sermon.big_idea }}</p>
        </header>

        <ul v-if="sermon.outline.length" class="outline-root">
          <PreachOutlineNode
            v-for="(point, idx) in sermon.outline"
            :key="point.id"
            :point="point"
            :depth="0"
            :index="idx"
            @click-verse="onClickVerse"
          />
        </ul>
        <p v-else class="empty">This sermon doesn't have an outline yet.</p>
      </article>

      <div class="sidebar" :class="{ 'sidebar-open': showBible }">
        <button class="sidebar-close" aria-label="Close Bible panel" @click="showBible = false">×</button>
        <MiniBible
          ref="miniBible"
          :replace-target="activeVerseRef"
          @select-verse="onSelectReplacement"
          @cancel-replace="activeVerseRef = null"
        />
      </div>
    </div>

    <button class="bible-fab" @click="showBible = true">
      <span aria-hidden="true">📖</span> Bible
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { sermonsApi, verseRefsApi } from "../api/sermons";
import PreachOutlineNode from "../components/PreachOutlineNode.vue";
import MiniBible from "../components/MiniBible.vue";

const props = defineProps({ id: { type: [String, Number], required: true } });

const sermon = ref(null);
const activeVerseRef = ref(null);
const miniBible = ref(null);
const showBible = ref(false);

async function reload() {
  sermon.value = await sermonsApi.get(props.id);
}

function onClickVerse(vr) {
  activeVerseRef.value = vr;
  showBible.value = true;
  const d = vr.verse_detail;
  if (d) miniBible.value?.showVerse({ book: d.book_name, chapter: d.chapter, verse: d.verse });
}

async function onSelectReplacement(newVerse) {
  await verseRefsApi.update(activeVerseRef.value.id, { verse: newVerse.id });
  activeVerseRef.value = null;
  await reload();
}

onMounted(reload);
</script>

<style scoped>
.preach-page {
  max-width: 1180px;
  margin: 0 auto;
  padding: 1.5rem 1.5rem 3rem;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.preach-toolbar {
  margin-bottom: 1.2rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.7rem;
}
.back-link {
  font-size: 0.82rem;
  color: var(--ink-soft);
  text-decoration: none;
}
.back-link:not(:last-child) {
  padding-right: 0.7rem;
  border-right: 1px solid var(--rule);
}
.preach-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 1.5rem;
  flex: 1;
  min-height: 0;
}
.manuscript {
  background: var(--paper-raised);
  border: 1px solid var(--rule);
  border-radius: var(--radius);
  padding: 2.4rem 2.8rem;
  overflow-y: auto;
}
.manuscript-head {
  margin-bottom: 2.2rem;
  padding-bottom: 1.6rem;
  border-bottom: 1px solid var(--rule);
}
.series {
  margin: 0 0 0.3rem;
  font-size: 0.82rem;
  color: var(--brass);
  font-weight: 600;
}
.manuscript-head h1 {
  font-size: 2rem;
  margin: 0 0 0.3rem;
}
.passage {
  margin: 0 0 0.9rem;
  color: var(--oxblood);
  font-family: var(--font-serif);
  font-size: 1rem;
}
.big-idea {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 1.15rem;
  line-height: 1.55;
  color: var(--ink);
  margin: 0;
  padding-left: 1rem;
  border-left: 3px solid var(--oxblood);
}
.outline-root {
  list-style: none;
  margin: 0;
  padding: 0;
}
.empty {
  color: var(--ink-soft);
  font-size: 0.9rem;
}
.sidebar {
  min-height: 0;
}
.sidebar-close {
  display: none;
}
.bible-fab {
  display: none;
}

@media (max-width: 900px) {
  .preach-layout {
    grid-template-columns: 1fr;
  }
  .manuscript { padding: 1.6rem 1.4rem; }

  .sidebar {
    display: none;
  }
  .sidebar.sidebar-open {
    display: flex;
    flex-direction: column;
    position: fixed;
    inset: 0;
    z-index: 40;
    background: var(--paper);
    padding: 1rem;
    padding-top: 3.4rem;
  }
  .sidebar-close {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 0.9rem;
    right: 1rem;
    width: 2.3rem;
    height: 2.3rem;
    border-radius: 50%;
    border: 1px solid var(--rule);
    background: var(--paper-raised);
    color: var(--ink);
    font-size: 1.4rem;
    line-height: 1;
    z-index: 41;
  }
  .bible-fab {
    display: flex;
    align-items: center;
    gap: 0.4em;
    position: fixed;
    bottom: 1.3rem;
    right: 1.2rem;
    padding: 0.7em 1.2em;
    border-radius: 999px;
    background: var(--oxblood);
    color: var(--paper-raised);
    border: none;
    font-size: 0.85rem;
    font-weight: 600;
    box-shadow: 0 4px 14px rgba(27, 36, 48, 0.25);
    z-index: 35;
  }
}
</style>