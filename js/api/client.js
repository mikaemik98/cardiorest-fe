// js/api/client.js
// Axios-instanssi autentikoituihin API-pyyntöihin.
// Lisää automaattisesti JWT-tokenin Authorization-headeriin jokaiseen pyyntöön.

import axios from "axios";

// Luo Axios-instanssi backendin base URL:lla
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
});

// Interceptor lisää JWT-tokenin headeriin jos käyttäjä on kirjautunut
// Token haetaan localStoragesta jonne se tallennetaan kirjautumisen yhteydessä
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
