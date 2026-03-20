// js/data/mockData.js

export const mockAnalysis = {
    readiness:        85,
    sleep_duration_h: 7.5,
    rmssd_ms:         68,
    recovery_pct:     88,
    stress_index:     6.4,
    pns_index:        0.75,
    sns_index:        -1.02,
    artefact_level:   'GOOD',
    recorded_at:      new Date().toISOString(),
    timevarying_data: JSON.stringify({
        labels: Array.from({ length: 60 }, (_, i) => i * 5),
        rmssd:  Array.from({ length: 60 }, () => 40 + Math.random() * 40),
        hr:     Array.from({ length: 60 }, () => 55 + Math.random() * 25)
    })
};

export const mockTrend = [
    { readiness: 72, rmssd_ms: 55, stress_index: 8.2, pns_index: 0.5,  sns_index: -0.8, created_at: '2026-03-09' },
    { readiness: 78, rmssd_ms: 58, stress_index: 7.5, pns_index: 0.6,  sns_index: -0.9, created_at: '2026-03-10' },
    { readiness: 65, rmssd_ms: 52, stress_index: 9.0, pns_index: 0.4,  sns_index: -0.6, created_at: '2026-03-11' },
    { readiness: 81, rmssd_ms: 65, stress_index: 6.8, pns_index: 0.7,  sns_index: -1.0, created_at: '2026-03-12' },
    { readiness: 85, rmssd_ms: 70, stress_index: 5.9, pns_index: 0.8,  sns_index: -1.1, created_at: '2026-03-13' },
    { readiness: 74, rmssd_ms: 62, stress_index: 7.2, pns_index: 0.65, sns_index: -0.95, created_at: '2026-03-14' },
    { readiness: 82, rmssd_ms: 68, stress_index: 6.4, pns_index: 0.75, sns_index: -1.02, created_at: '2026-03-15' }
];

export const mockHrvParams = {
    readiness:      85,
    rmssd_ms:       68.3,
    sdnn_ms:        74.1,
    pns_index:      0.75,
    sns_index:      -1.02,
    stress_index:   6.4,
    mean_hr_bpm:    63.2,
    artefact_level: 'GOOD',
    sd1_ms:         48.3,
    sd2_ms:         96.2
};

export const mockProfessionalData = {
    patient: {
        name: 'Matti Meikäläinen',
        id:   'PAT-2024-1234',
        role: 'Potilas'
    },
    summary: {
        avg_sleep_score: 78,
        avg_rmssd:       71,
        avg_recovery:    81
    },
    trend: [
        { readiness: 65, rmssd_ms: 58, stress_index: 8.2, created_at: '2026-02-15' },
        { readiness: 70, rmssd_ms: 61, stress_index: 7.8, created_at: '2026-02-16' },
        { readiness: 68, rmssd_ms: 59, stress_index: 8.0, created_at: '2026-02-17' },
        { readiness: 74, rmssd_ms: 64, stress_index: 7.2, created_at: '2026-02-18' },
        { readiness: 78, rmssd_ms: 67, stress_index: 6.8, created_at: '2026-02-19' },
        { readiness: 75, rmssd_ms: 65, stress_index: 7.0, created_at: '2026-02-20' },
        { readiness: 80, rmssd_ms: 69, stress_index: 6.5, created_at: '2026-02-21' },
        { readiness: 82, rmssd_ms: 71, stress_index: 6.2, created_at: '2026-02-22' },
        { readiness: 79, rmssd_ms: 68, stress_index: 6.7, created_at: '2026-02-23' },
        { readiness: 85, rmssd_ms: 74, stress_index: 5.9, created_at: '2026-02-24' }
    ],
    notes: [
        { date: '3.2.2026',  text: 'Potilas raportoi parantuneesta unesta stressinhallintatekniikoiden käyttöönoton jälkeen.' },
        { date: '27.1.2026', text: 'Suositeltu säännöllisen nukkumaanmenoajan noudattamista.' },
        { date: '10.1.2026', text: 'Stress-indeksi ajoittain korkea ma–ti. Kehotettu rentoutumisharjoituksia.' }
    ]
};