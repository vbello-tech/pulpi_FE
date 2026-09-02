<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h1>Your sermons</h1>
        <p class="lede">Every message you're preparing, in one shelf.</p>
      </div>
      <button class="btn" @click="showNew = true">New sermon</button>
    </div>

    <div v-if="showNew" class="new-form card">
      <div class="field">
        <label for="new-title">Title</label>
        <input id="new-title" v-model="newTitle" type="text" placeholder="e.g. Grace That Sustains" @keyup.enter="createSermon" />
      </div>
      <div class="new-actions">
        <button class="btn" :disabled="!newTitle.trim() || creating" @click="createSermon">
          {{ creating ? "Creating…" : "Create & open" }}
        </button>
        <button class="btn-quiet" @click="showNew = false; newTitle = ''">Cancel</button>
      </div>
    </div>

    <div v-if="loading" class="empty">Loading your sermons…</div>

    <div v-else-if="sermons.length === 0" class="empty card">
      <h2>Nothing here yet</h2>
      <p>Start your first sermon and Pulpi will help you build the outline, point by point.</p>
      <button class="btn" @click="showNew = true">Write your first sermon</button>
    </div>

    <ul v-else class="sermon-list">
      <li v-for="s in sermons" :key="s.id" class="sermon-row card">
        <router-link :to="`/sermons/${s.id}`" class="sermon-main">
          <span class="status" :class="s.status">{{ statusLabel(s.status) }}</span>
          <div>
            <h3>{{ s.title }}</h3>
            <p class="meta">
              <span v-if="s.series">{{ s.series }} · </span>
              <span v-if="s.scripture_reference">{{ s.scripture_reference }}</span>
              <span v-else class="muted">No passage set</span>
            </p>
          </div>
        </router-link>
        <div class="sermon-actions">
          <router-link :to="`/sermons/${s.id}/preach`" class="btn-quiet">Preach</router-link>
          <button class="btn-quiet" @click="duplicate(s)">Duplicate</button>
          <button class="btn-quiet danger" @click="remove(s)">Delete</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { sermonsApi } from "../api/sermons";
import { confirmAction } from "../composables/confirmDialog";

const sermons = ref([]);
const loading = ref(true);
const showNew = ref(false);
const newTitle = ref("");
const creating = ref(false);
const router = useRouter();

function statusLabel(status) {
  return { draft: "Draft", ready: "Ready", preached: "Preached" }[status] || status;
}

async function load() {
  loading.value = true;
  const data = await sermonsApi.list();
  sermons.value = data.results ?? data;
  loading.value = false;
}

async function createSermon() {
  if (!newTitle.value.trim()) return;
  creating.value = true;
  try {
    const sermon = await sermonsApi.create({ title: newTitle.value.trim() });
    router.push(`/sermons/${sermon.id}`);
  } finally {
    creating.value = false;
  }
}

async function duplicate(s) {
  const copy = await sermonsApi.duplicate(s.id);
  sermons.value.unshift(copy);
}

async function remove(s) {
  const ok = await confirmAction(`Delete "${s.title}"? This can't be undone.`, {
    title: "Delete sermon?",
  });
  if (!ok) return;
  await sermonsApi.remove(s.id);
  sermons.value = sermons.value.filter((x) => x.id !== s.id);
}

onMounted(load);
</script>

<style scoped>
.page {
  max-width: 760px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 4rem;
  width: 100%;
}
.page-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 1.8rem;
}
.lede {
  color: var(--ink-soft);
  margin: 0.2rem 0 0;
  font-size: 0.92rem;
}
.new-form {
  padding: 1.2rem;
  margin-bottom: 1.5rem;
}
.new-actions {
  display: flex;
  gap: 0.6rem;
  align-items: center;
}
.empty {
  padding: 2.5rem;
  text-align: center;
  color: var(--ink-soft);
}
.sermon-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.sermon-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.2rem;
}
.sermon-main {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  color: inherit;
  flex: 1;
  min-width: 0;
}
.sermon-main h3 {
  margin: 0 0 0.15rem;
  font-size: 1.05rem;
}
.meta {
  margin: 0;
  font-size: 0.82rem;
  color: var(--ink-soft);
}
.muted { color: var(--rule); }
.status {
  font-size: 0.7rem;
  padding: 0.25em 0.6em;
  border-radius: 999px;
  border: 1px solid var(--rule);
  color: var(--ink-soft);
  white-space: nowrap;
}
.status.ready { border-color: var(--brass); color: var(--brass); }
.status.preached { border-color: var(--sage); color: var(--sage); }
.sermon-actions {
  display: flex;
  gap: 0.3rem;
}
.danger:hover { color: var(--oxblood); }
</style>
