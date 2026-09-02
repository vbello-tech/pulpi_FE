import { api } from "./client";

export const sermonsApi = {
  list: () => api.get("/sermons/").then((r) => r.data),
  get: (id) => api.get(`/sermons/${id}/`).then((r) => r.data),
  create: (payload) => api.post("/sermons/", payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/sermons/${id}/`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/sermons/${id}/`),
  duplicate: (id) => api.post(`/sermons/${id}/duplicate/`).then((r) => r.data),
};

export const pointsApi = {
  create: (payload) => api.post("/points/", payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/points/${id}/`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/points/${id}/`),
};

export const illustrationsApi = {
  create: (payload) => api.post("/illustrations/", payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/illustrations/${id}/`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/illustrations/${id}/`),
};

export const verseRefsApi = {
  create: (payload) => api.post("/verse-refs/", payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/verse-refs/${id}/`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/verse-refs/${id}/`),
};

export const bibleApi = {
  books: () => api.get("/bible/books/").then((r) => r.data),
  translations: () => api.get("/bible/translations/").then((r) => r.data),
  chapter: (bookId, number, translation = "KJV") =>
    api.get(`/bible/books/${bookId}/chapter/`, { params: { number, translation } }).then((r) => r.data),
  search: (params) => api.get("/bible/verses/", { params }).then((r) => r.data),
};
