// js/services/analysisService.js
import api from '../api/client.js';
import { mockAnalysis, mockTrend } from '../data/mockData.js';

export const USE_MOCK = true;

export async function syncFromKubios() {
    if (USE_MOCK) return;
    await api.post('/api/analysis/sync');
}

export async function syncTimevarying() {
    if (USE_MOCK) return;
    await api.post('/api/analysis/sync-timevarying');
}

export async function getLatestAnalysis() {
    if (USE_MOCK) return mockAnalysis;
    const res = await api.get('/api/analysis/latest');
    return res.data;
}

export async function getAnalysisTrend(days = 7) {
    if (USE_MOCK) return mockTrend;
    const res = await api.get(`/api/analysis/trend?days=${days}`);
    return res.data;
}
