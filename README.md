# CardioRest — Frontend

HRV-pohjainen unenlaadun seurantasovellus.
Metropolia Ammattikorkeakoulu | Projektiryhmä 1

---

## Projektin kuvaus

CardioRest on web-sovellus joka hyödyntää Polar H10 -sykesensorin keräämää HRV-dataa (sykevälivaihtelu) unen laadun ja palautumisen seurantaan. Sovellus integroi Kubios Cloud -analytiikkapalvelun readiness- ja time-varying-analyyseihin.

---

## Teknologiat

| Teknologia      | Versio | Käyttötarkoitus              |
| --------------- | ------ | ---------------------------- |
| Vite            | 5.x    | Kehitysympäristö ja bundlaus |
| HTML + CSS + JS | —      | Frontend                     |
| Chart.js        | 4.x    | Kaaviot                      |
| Axios           | 1.x    | HTTP-pyynnöt                 |

---

## Asennus

### Vaatimukset

- Node.js 18+
- npm

### Kloonaus ja asennus

```bash
git clone https://github.com/mikaemik98/cardiorest-fe.git
cd cardiorest-frontend
npm install
```

### Ympäristömuuttujat

Luo `.env` tiedosto projektin juureen:

```bash
VITE_API_URL=http://localhost:3000
```

### Kehityspalvelin

```bash
npm run dev
```

Avaa selaimessa: `http://localhost:5173`

### Tuotantobuild

```bash
npm run build
```

---

## Sivut

| Sivu          | URL                  | Kuvaus                                |
| ------------- | -------------------- | ------------------------------------- |
| Kirjautuminen | `/`                  | index.html                            |
| Dashboard     | `/dashboard.html`    | Etusivu, readiness + HRV-aikasarja    |
| Trendit       | `/trends.html`       | 7/14/30 päivän HRV-kehitys            |
| HRV-analyysi  | `/hrv.html`          | HRV-parametrit yksityiskohtaisesti    |
| Ammattilainen | `/professional.html` | Terveydenhuollon ammattilaisen näkymä |

---

## Kansiorakenne

```
cardiorest-frontend/
├── index.html
├── dashboard.html
├── trends.html
├── hrv.html
├── professional.html
├── public/
│   └── img/
├── css/
│   ├── base.css          — muuttujat, reset, typografia
│   ├── layout.css         — sidebar, topbar, grid
│   ├── components.css     — uudelleenkäytettävät komponentit
│   └── pages/             — sivukohtaiset tyylit
├── js/
│   ├── api/
│   │   └── client.js      — axios-instanssi
│   ├── components/
│   │   ├── sidebar.js     — sivupalkki
│   │   ├── hrvChart.js    — HRV-kaavio
│   │   └── sleepChart.js  — univaiheiden kaavio
│   ├── data/
│   │   └── mockData.js    — mock-testausdata
│   ├── pages/             — sivukohtainen logiikka
│   ├── services/
│   │   └── analysisService.js — API-kutsut
│   └── utils/
│       └── helpers.js     — apufunktiot
└── vite.config.js
```

---

## Mock-data

Frontend toimii itsenäisesti ilman backendiä mock-datan avulla.

Vaihda `js/services/analysisService.js`:ssä:

```js
export const USE_MOCK = true; // mock-data (oletus)
export const USE_MOCK = false; // oikea backend
```

### Mock-tunnukset

| Rooli         | Sähköposti    | Salasana |
| ------------- | ------------- | -------- |
| Potilas       | matti@test.fi | test1234 |
| Ammattilainen | anna@test.fi  | test1234 |

---

## Backend

Frontend kommunikoi backendin kanssa REST API:n kautta.
Backend-repositorio: [cardiorest-be](https://github.com/mikaemik98/cardiorest-be.git)

Varmista että backend pyörii portissa `3000` ennen kuin vaihdat `USE_MOCK = false`.

---

## Ryhmä

| Nimi            | Vastuu                        |
| --------------- | ----------------------------- |
| Markus Kauremaa | Backend + Tietokanta          |
| Mikael Mikkola  | Frontend + Kubios-integraatio |
| Moumen Flih     | Frontend + Kubios-integraatio |
| Daniil Pavliuk  | Backend + Tietokanta          |

---
