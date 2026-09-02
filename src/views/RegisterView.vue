<template>
  <div class="auth-page">
    <div class="auth-card card">
      <h1>Start preparing</h1>
      <p class="lede">Create your Pulpi account.</p>

      <form @submit.prevent="handleSubmit">
        <div class="row">
          <div class="field">
            <label for="first">First name</label>
            <input id="first" v-model="firstName" type="text" required />
          </div>
          <div class="field">
            <label for="last">Last name</label>
            <input id="last" v-model="lastName" type="text" />
          </div>
        </div>
        <div class="field">
          <label for="church">Church (optional)</label>
          <input id="church" v-model="church" type="text" placeholder="Grace Community Church" />
        </div>
        <div class="field">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="email" required autocomplete="email" />
        </div>
        <div class="field">
          <label for="password">Password</label>
          <input id="password" v-model="password" type="password" required autocomplete="new-password" />
        </div>
        <p v-if="error" class="error-text">{{ error }}</p>
        <button class="btn" type="submit" :disabled="loading" style="width: 100%; justify-content: center;">
          {{ loading ? "Creating account…" : "Create account" }}
        </button>
      </form>

      <p class="switch">
        Already have an account? <router-link to="/login">Sign in</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const firstName = ref("");
const lastName = ref("");
const church = ref("");
const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

const auth = useAuthStore();
const router = useRouter();

async function handleSubmit() {
  error.value = "";
  loading.value = true;
  try {
    await auth.register({
      email: email.value,
      username: email.value,
      password: password.value,
      first_name: firstName.value,
      last_name: lastName.value,
      church_name: church.value,
    });
    router.push("/sermons");
  } catch (e) {
    const detail = e.response?.data;
    error.value = detail
      ? Object.values(detail).flat().join(" ")
      : "Couldn't create your account. Please try again.";
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
  max-width: 420px;
  padding: 2.2rem;
}
.lede {
  color: var(--ink-soft);
  margin: -0.2rem 0 1.4rem;
  font-size: 0.9rem;
}
.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
}
.switch {
  margin-top: 1.2rem;
  font-size: 0.85rem;
  color: var(--ink-soft);
  text-align: center;
}
</style>
