<template>
  <div class="auth-page">
    <div class="auth-card card">
      <h1>Welcome back</h1>
      <p class="lede">Sign in to keep working on your sermons.</p>

      <form @submit.prevent="handleSubmit">
        <div class="field">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="email" required autocomplete="email" />
        </div>
        <div class="field">
          <label for="password">Password</label>
          <input id="password" v-model="password" type="password" required autocomplete="current-password" />
        </div>
        <p v-if="error" class="error-text">{{ error }}</p>
        <button class="btn" type="submit" :disabled="loading" style="width: 100%; justify-content: center;">
          {{ loading ? "Signing in…" : "Sign in" }}
        </button>
      </form>

      <p class="switch">
        New to Pulpi? <router-link to="/register">Create an account</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth";

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

async function handleSubmit() {
  error.value = "";
  loading.value = true;
  try {
    await auth.login(email.value, password.value);
    router.push(route.query.next || "/sermons");
  } catch (e) {
    error.value = "Couldn't sign in. Check your email and password and try again.";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-page {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}
.auth-card {
  width: 100%;
  max-width: 380px;
  padding: 2.2rem;
}
.lede {
  color: var(--ink-soft);
  margin: -0.2rem 0 1.4rem;
  font-size: 0.9rem;
}
.switch {
  margin-top: 1.2rem;
  font-size: 0.85rem;
  color: var(--ink-soft);
  text-align: center;
}
</style>
