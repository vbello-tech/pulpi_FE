import { defineStore } from "pinia";
import { api } from "../api/client";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("pulpi_user") || "null"),
    accessToken: localStorage.getItem("pulpi_access") || null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
  },

  actions: {
    async login(email, password) {
      const { data } = await api.post("/auth/login/", { email, password });
      this.accessToken = data.access;
      localStorage.setItem("pulpi_access", data.access);
      localStorage.setItem("pulpi_refresh", data.refresh);
      await this.fetchMe();
    },

    async register(payload) {
      await api.post("/auth/register/", payload);
      await this.login(payload.email, payload.password);
    },

    async fetchMe() {
      const { data } = await api.get("/auth/me/");
      this.user = data;
      localStorage.setItem("pulpi_user", JSON.stringify(data));
    },

    logout() {
      this.user = null;
      this.accessToken = null;
      localStorage.removeItem("pulpi_access");
      localStorage.removeItem("pulpi_refresh");
      localStorage.removeItem("pulpi_user");
    },
  },
});
