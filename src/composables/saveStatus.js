import { ref } from "vue";

/**
 * Wrap any save promise to drive a "Saving… / Saved / Couldn't save" indicator.
 * Usage: const { status, track } = useSaveStatus(); await track(api.update(...));
 */
export function useSaveStatus() {
  const status = ref("idle"); // idle | saving | saved | error
  let hideTimer = null;

  async function track(promise) {
    status.value = "saving";
    clearTimeout(hideTimer);
    try {
      const result = await promise;
      status.value = "saved";
      hideTimer = setTimeout(() => {
        status.value = "idle";
      }, 1500);
      return result;
    } catch (err) {
      status.value = "error";
      hideTimer = setTimeout(() => {
        status.value = "idle";
      }, 2500);
      throw err;
    }
  }

  return { status, track };
}
