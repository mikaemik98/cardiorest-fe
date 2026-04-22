// js/services/diaryService.js
import api from "../api/client.js";

/**
 * Luo uusi päiväkirjamerkintä
 * @param {Object} entryData - { entry_date: 'YYYY-MM-DD', content: string, mood?: string }
 * @returns {Promise<Object>} { message, id }
 */
export async function createDiaryEntry(entryData) {
  try {
    const response = await api.post("/api/diary", entryData);
    return response.data;
  } catch (error) {
    console.error("Päiväkirjamerkinnän luonti epäonnistui:", error);
    throw error;
  }
}

/**
 * Hae kaikki käyttäjän päiväkirjamerkinnät
 * @returns {Promise<Array>} Lista merkinnöistä
 */
export async function getAllDiaryEntries() {
  try {
    const response = await api.get("/api/diary");
    return response.data.entries || [];
  } catch (error) {
    console.error("Päiväkirjamerkintöjen haku epäonnistui:", error);
    throw error;
  }
}

/**
 * Hae yksittäinen päiväkirjamerkintä
 * @param {number} id - Merkinnän ID
 * @returns {Promise<Object>} Merkintä
 */
export async function getDiaryEntryById(id) {
  try {
    const response = await api.get(`/api/diary/${id}`);
    return response.data.entry;
  } catch (error) {
    console.error(`Päiväkirjamerkinnän ${id} haku epäonnistui:`, error);
    throw error;
  }
}

/**
 * Päivitä päiväkirjamerkintää
 * @param {number} id - Merkinnän ID
 * @param {Object} updates - Päivitettävät kentät { entry_date?, content?, mood? }
 * @returns {Promise<Object>} { message }
 */
export async function updateDiaryEntry(id, updates) {
  try {
    const response = await api.patch(`/api/diary/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error(`Päiväkirjamerkinnän ${id} päivitys epäonnistui:`, error);
    throw error;
  }
}

/**
 * Poista päiväkirjamerkintä
 * @param {number} id - Merkinnän ID
 * @returns {Promise<Object>} { message }
 */
export async function deleteDiaryEntry(id) {
  try {
    const response = await api.delete(`/api/diary/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Päiväkirjamerkinnän ${id} poisto epäonnistui:`, error);
    throw error;
  }
}
