<template>
  <div v-if="sermon" class="editor-page">
    <div class="editor-head">
      <div class="editor-toolbar">
        <router-link to="/sermons" class="back-link">‹ All sermons</router-link>
        <div class="toolbar-right">
          <SaveIndicator :status="status" />
          <router-link :to="`/sermons/${id}/preach`" class="btn btn-outline preach-link">Preach</router-link>
        </div>
      </div>
      <input
        class="title-input"
        :value="sermon.title"
        placeholder="Sermon title"
        @change="patchSermon({ title: $event.target.value })"
      />
      <div class="meta-grid">
        <div class="field">
          <label for="series">Series</label>
          <input id="series" :value="sermon.series" @change="patchSermon({ series: $event.target.value })" />
        </div>
        <div class="field">
          <label for="ref">Passage</label>
          <input id="ref" :value="sermon.scripture_reference" placeholder="e.g. Romans 8:28-39"
                 @change="patchSermon({ scripture_reference: $event.target.value })" />
        </div>
        <div class="field">
          <label for="status">Status</label>
          <select id="status" :value="sermon.status" @change="patchSermon({ status: $event.target.value })">
            <option value="draft">Draft</option>
            <option value="ready">Ready</option>
            <option value="preached">Preached</option>
          </select>
        </div>
        <div class="field">
          <label for="date">Preach date</label>
          <input id="date" type="date" :value="sermon.preach_date" @change="patchSermon({ preach_date: $event.target.value })" />
        </div>
      </div>
      <div class="field">
        <label for="big-idea">The big idea</label>
        <textarea id="big-idea" rows="2" :value="sermon.big_idea" placeholder="The one sentence this whole sermon serves…"
                  @change="patchSermon({ big_idea: $event.target.value })"></textarea>
      </div>
    </div>

    <div class="outline-head">
      <h2>Outline</h2>
      <button v-if="sermon.outline.length" class="btn btn-outline" @click="addTopPoint">+ Main point</button>
    </div>

    <ul v-if="sermon.outline.length" class="outline-root">
      <OutlineNode
        v-for="(point, idx) in sermon.outline"
        :key="point.id"
        :point="point"
        :depth="0"
        :index="idx"
        @add-child="addChild"
        @update-point="updatePoint"
        @delete="deletePoint"
        @add-illustration="openIllustrationModal"
        @remove-illustration="removeIllustration"
        @open-verse-picker="openVersePicker"
        @remove-verse-ref="removeVerseRef"
      />
    </ul>

    <div v-else class="template-picker">
      <p class="empty-outline-lede">
        No points yet. Start from a template, or begin with a blank outline.
      </p>
      <div class="template-grid">
        <button
          v-for="t in OUTLINE_TEMPLATES"
          :key="t.id"
          class="template-card"
          :disabled="applyingTemplate"
          @click="applyTemplate(t)"
        >
          <strong>{{ t.name }}</strong>
          <p>{{ t.description }}</p>
        </button>
      </div>
      <button class="btn-quiet" :disabled="applyingTemplate" @click="addTopPoint">
        {{ applyingTemplate ? "Setting up…" : "Or start blank →" }}
      </button>
    </div>

    <div class="bottom-actions">
      <router-link :to="`/sermons/${id}/preach`" class="btn">Go to preach page</router-link>
    </div>

    <IllustrationModal
      v-if="illustrationTargetId"
      @close="illustrationTargetId = null"
      @submit="submitIllustration"
    />
    <VersePicker
      v-if="verseTargetId"
      @close="verseTargetId = null"
      @select-multiple="submitVerseRefs"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { sermonsApi, pointsApi, illustrationsApi, verseRefsApi } from "../api/sermons";
import { confirmAction } from "../composables/confirmDialog";
import { useSaveStatus } from "../composables/saveStatus";
import { OUTLINE_TEMPLATES } from "../data/outlineTemplates";
import OutlineNode from "../components/OutlineNode.vue";
import VersePicker from "../components/VersePicker.vue";
import IllustrationModal from "../components/IllustrationModal.vue";
import SaveIndicator from "../components/SaveIndicator.vue";

const props = defineProps({ id: { type: [String, Number], required: true } });

const sermon = ref(null);
const illustrationTargetId = ref(null);
const verseTargetId = ref(null);
const applyingTemplate = ref(false);

const { status, track } = useSaveStatus();

async function reload() {
  sermon.value = await sermonsApi.get(props.id);
}

async function patchSermon(patch) {
  await track(sermonsApi.update(props.id, patch));
  Object.assign(sermon.value, patch);
}

function findPoint(points, id) {
  for (const p of points) {
    if (p.id === id) return p;
    const found = findPoint(p.children || [], id);
    if (found) return found;
  }
  return null;
}

async function addTopPoint() {
  await pointsApi.create({
    sermon: props.id, parent: null, order: sermon.value.outline.length, heading: "", body: "",
  });
  await reload();
}

async function addChild(parentId) {
  const parent = findPoint(sermon.value.outline, parentId);
  const order = parent?.children?.length ?? 0;
  await pointsApi.create({ sermon: props.id, parent: parentId, order, heading: "", body: "" });
  await reload();
}

async function updatePoint(id, patch) {
  await track(pointsApi.update(id, patch));
}

async function deletePoint(id) {
  const ok = await confirmAction("Delete this point and everything nested under it?", {
    title: "Delete point?",
  });
  if (!ok) return;
  await pointsApi.remove(id);
  await reload();
}

async function applyTemplate(template) {
  applyingTemplate.value = true;
  try {
    for (let i = 0; i < template.points.length; i++) {
      const p = template.points[i];
      const created = await pointsApi.create({
        sermon: props.id, parent: null, order: i, heading: p.heading, body: "",
      });
      if (p.children) {
        for (let j = 0; j < p.children.length; j++) {
          const c = p.children[j];
          await pointsApi.create({
            sermon: props.id, parent: created.id, order: j, heading: c.heading, body: "",
          });
        }
      }
    }
  } finally {
    applyingTemplate.value = false;
    await reload();
  }
}

function openIllustrationModal(pointId) {
  illustrationTargetId.value = pointId;
}
async function submitIllustration(payload) {
  await illustrationsApi.create({ point: illustrationTargetId.value, ...payload });
  illustrationTargetId.value = null;
  await reload();
}
async function removeIllustration(illId) {
  await illustrationsApi.remove(illId);
  await reload();
}

function openVersePicker(pointId) {
  verseTargetId.value = pointId;
}
async function submitVerseRefs(verses) {
  const pointId = verseTargetId.value;
  await Promise.all(verses.map((v) => verseRefsApi.create({ point: pointId, verse: v.id })));
  verseTargetId.value = null;
  await reload();
}
async function removeVerseRef(refId) {
  await verseRefsApi.remove(refId);
  await reload();
}

onMounted(reload);
</script>

<style scoped>
.editor-page {
  max-width: 760px;
  margin: 0 auto;
  padding: 2rem 1.5rem 5rem;
  width: 100%;
}
.back-link {
  font-size: 0.82rem;
  color: var(--ink-soft);
  text-decoration: none;
}
.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}
.preach-link {
  text-decoration: none;
  font-size: 0.85rem;
  padding: 0.4em 1em;
}
.title-input {
  display: block;
  width: 100%;
  border: none;
  background: transparent;
  font-family: var(--font-serif);
  font-size: 1.9rem;
  font-weight: 700;
  padding: 0.3em 0;
  margin: 0.2rem 0 1rem;
}
.title-input:focus { outline: none; border-bottom: 1px solid var(--brass); }
.meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 140px 160px;
  gap: 0.8rem;
  margin-bottom: 0.4rem;
}
.outline-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 2.2rem 0 1.2rem;
  padding-top: 1.4rem;
  border-top: 1px solid var(--rule);
}
.outline-root {
  list-style: none;
  margin: 0;
  padding: 0;
}
.template-picker {
  padding: 1.8rem;
  border: 1px dashed var(--rule);
  border-radius: var(--radius);
  text-align: center;
}
.empty-outline-lede {
  color: var(--ink-soft);
  font-size: 0.9rem;
  margin: 0 0 1.2rem;
}
.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.8rem;
  margin-bottom: 1.1rem;
  text-align: left;
}
.template-card {
  background: var(--paper-raised);
  border: 1px solid var(--rule);
  border-radius: var(--radius);
  padding: 1rem;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}
.template-card:hover:not(:disabled) {
  border-color: var(--brass);
  background: var(--brass-soft);
}
.template-card:disabled {
  opacity: 0.6;
  cursor: default;
}
.template-card strong {
  display: block;
  font-family: var(--font-serif);
  font-size: 0.98rem;
  margin-bottom: 0.3rem;
  color: var(--ink);
}
.template-card p {
  margin: 0;
  font-size: 0.82rem;
  color: var(--ink-soft);
  line-height: 1.4;
}
.bottom-actions {
  margin-top: 2.5rem;
  padding-top: 1.6rem;
  border-top: 1px solid var(--rule);
  display: flex;
  justify-content: center;
}
.bottom-actions .btn {
  text-decoration: none;
}
</style>
