<template>
  <div ref="root" class="custom-select">
    <button
      type="button"
      class="cs-trigger"
      :class="{ open }"
      :aria-expanded="open"
      @click="toggle"
    >
      <span class="cs-value">{{ selectedLabel || placeholder }}</span>
      <span class="cs-arrow" aria-hidden="true"></span>
    </button>

    <div v-if="open" class="cs-panel">
      <input
        v-if="showSearch"
        v-model="query"
        type="text"
        class="cs-search"
        placeholder="Search…"
        autofocus
      />
      <ul class="cs-list" role="listbox">
        <li
          v-for="opt in filteredOptions"
          :key="opt.value"
          class="cs-option"
          :class="{ active: opt.value === modelValue }"
          role="option"
          @click="select(opt)"
        >
          {{ opt.label }}
        </li>
        <li v-if="!filteredOptions.length" class="cs-empty">No matches</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  modelValue: { type: [String, Number], default: "" },
  options: { type: Array, required: true }, // [{ value, label }]
  placeholder: { type: String, default: "Select…" },
  // Only show the search box once the list is long enough to need it.
  searchThreshold: { type: Number, default: 8 },
});
const emit = defineEmits(["update:modelValue", "change"]);

const root = ref(null);
const open = ref(false);
const query = ref("");

const showSearch = computed(() => props.options.length > props.searchThreshold);
const selectedLabel = computed(
  () => props.options.find((o) => o.value === props.modelValue)?.label
);
const filteredOptions = computed(() => {
  if (!query.value.trim()) return props.options;
  const q = query.value.toLowerCase();
  return props.options.filter((o) => o.label.toLowerCase().includes(q));
});

function toggle() {
  open.value = !open.value;
  if (open.value) query.value = "";
}

function select(opt) {
  emit("update:modelValue", opt.value);
  emit("change", opt.value);
  open.value = false;
}

function handleClickOutside(e) {
  if (root.value && !root.value.contains(e.target)) open.value = false;
}
function handleKey(e) {
  if (e.key === "Escape") open.value = false;
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  document.addEventListener("keydown", handleKey);
});
onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("keydown", handleKey);
});
</script>

<style scoped>
.custom-select {
  position: relative;
  width: 100%;
}
.cs-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6em;
  padding: 0.55em 0.8em;
  border: 1px solid var(--rule);
  border-radius: var(--radius);
  background: var(--paper-raised);
  color: var(--ink);
  font-family: var(--font-sans);
  font-size: 0.95rem;
  text-align: left;
  cursor: pointer;
}
.cs-trigger.open {
  border-color: var(--brass);
  outline: 2px solid var(--brass);
  outline-offset: 1px;
}
.cs-value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cs-arrow {
  flex-shrink: 0;
  width: 0.5em;
  height: 0.5em;
  border-right: 2px solid var(--ink-soft);
  border-bottom: 2px solid var(--ink-soft);
  transform: rotate(45deg);
  margin-top: -0.2em;
}
.cs-panel {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 30;
  background: var(--paper-raised);
  border: 1px solid var(--rule);
  border-radius: var(--radius);
  box-shadow: 0 6px 20px rgba(27, 36, 48, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 280px;
}
.cs-search {
  border: none;
  border-bottom: 1px solid var(--rule);
  border-radius: 0;
  padding: 0.6em 0.8em;
  font-size: 0.88rem;
  flex-shrink: 0;
}
.cs-search:focus {
  outline: none;
  border-bottom-color: var(--brass);
}
.cs-list {
  list-style: none;
  margin: 0;
  padding: 0.3rem;
  overflow-y: auto;
}
.cs-option {
  padding: 0.5em 0.7em;
  border-radius: var(--radius);
  font-size: 0.9rem;
  cursor: pointer;
}
.cs-option:hover {
  background: var(--brass-soft);
}
.cs-option.active {
  background: var(--oxblood-soft);
  color: var(--oxblood);
  font-weight: 600;
}
.cs-empty {
  padding: 0.8em;
  text-align: center;
  font-size: 0.85rem;
  color: var(--ink-soft);
}
</style>


