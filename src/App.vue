<template>
  <div class="shell">
    <header v-if="auth.isAuthenticated" class="topbar">
      <router-link to="/sermons" class="brand">Pulpi</router-link>
      <div class="topbar-right">
        <span v-if="auth.user" class="who">{{ auth.user.first_name || auth.user.email }}</span>
        <button class="btn-quiet" @click="handleLogout">Sign out</button>
      </div>
    </header>
    <main class="content">
      <router-view />
    </main>
    <ConfirmDialog />
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "./stores/auth";
import ConfirmDialog from "./components/ConfirmDialog.vue";

const auth = useAuthStore();
const router = useRouter();

function handleLogout() {
  auth.logout();
  router.push("/login");
}
</script>

<style scoped>
.shell {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1.5rem;
  border-bottom: 1px solid var(--rule);
  background: var(--paper-raised);
}

.brand {
  font-family: var(--font-serif);
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--ink);
  text-decoration: none;
  letter-spacing: 0.01em;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.who {
  font-size: 0.85rem;
  color: var(--ink-soft);
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
