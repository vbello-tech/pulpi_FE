import { ref } from "vue";

// Singleton (module-level) state, so any view can call confirmAction()
// and a single <ConfirmDialog /> mounted once in App.vue renders it.
export const confirmState = ref(null);

export function confirmAction(message, options = {}) {
  return new Promise((resolve) => {
    confirmState.value = {
      message,
      title: options.title || "Are you sure?",
      confirmLabel: options.confirmLabel || "Delete",
      cancelLabel: options.cancelLabel || "Cancel",
      danger: options.danger !== false,
      resolve,
    };
  });
}

export function resolveConfirm(result) {
  confirmState.value?.resolve(result);
  confirmState.value = null;
}
