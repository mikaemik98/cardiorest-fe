# CardioRest — Testausdokumentaatio

## Sisältö

- [Testausstrategia](#testausstrategia)
- [Testattavat käyttötapaukset](#testattavat-käyttötapaukset)
- [Robot Framework -testit](#robot-framework--testit)
- [Testien ajaminen](#testien-ajaminen)
- [Tulokset](#tulokset)
- [Havainnot ja kommentit](#havainnot-ja-kommentit)

---

## Testiraportit

Testiraportit löytyvät GitHub Pages -sivulta sekä kansiosta `robot-tests/outputs/`:

| Iteraatio   | Raportti                                                                           | Testejä | Tulos    |
| ----------- | ---------------------------------------------------------------------------------- | ------- | -------- |
| Iteraatio 1 | [Avaa raportti](https://mikaemik98.github.io/cardiorest-fe/report_iteraatio1.html) | 7       | ✅ 7/7   |
| Iteraatio 2 | [Avaa raportti](https://mikaemik98.github.io/cardiorest-fe/report_iteraatio2.html) | 10      | ✅ 10/10 |

Päivitä tulokset ajamalla:

```bash
# Iteraatio 1
robot --pythonpath . --outputdir robot-tests/outputs --report report_iteraatio1.html --log log_iteraatio1.html robot-tests/tests

# Iteraatio 2
robot --pythonpath . --outputdir robot-tests/outputs --report report_iteraatio2.html --log log_iteraatio2.html robot-tests/tests
```

---

## Testausstrategia

CardioRest-sovelluksen testaus on toteutettu **Robot Framework** -testaustyökalulla käyttäen **RequestsLibrary**-kirjastoa backend API -reittien automaatiotestaukseen.

Testaus on jaettu kahteen iteraatioon:

- **Iteraatio 1** — Kirjautuminen ja Kubios API -reitit (TC-001–TC-007)
- **Iteraatio 2** — Päiväkirjatoiminnallisuus (TC-008–TC-010)

### Iteraatio 1

| Tunniste | Käyttötapaus                                    | Tyyppi       | Tulos   |
| -------- | ----------------------------------------------- | ------------ | ------- |
| TC-001   | Kirjautuminen oikeilla tunnuksilla onnistuu     | Positiivinen | ✅ PASS |
| TC-002   | Kirjautuminen väärällä salasanalla epäonnistuu  | Negatiivinen | ✅ PASS |
| TC-003   | Kirjautuminen tyhjillä kentillä epäonnistuu     | Negatiivinen | ✅ PASS |
| TC-004   | HRV-data haetaan onnistuneesti                  | Positiivinen | ✅ PASS |
| TC-005   | Etusivu näyttää viimeisimmän analyysin tuloksen | Positiivinen | ✅ PASS |
| TC-006   | Käyttäjä näkee omat profiilitietonsa            | Positiivinen | ✅ PASS |
| TC-007   | Pyyntö ilman tokenia palauttaa 401              | Tietoturva   | ✅ PASS |

### Iteraatio 2

| Tunniste | Käyttötapaus                              | Tyyppi       | Tulos   |
| -------- | ----------------------------------------- | ------------ | ------- |
| TC-008   | Päiväkirjamerkinnän luonti onnistuu       | Positiivinen | ✅ PASS |
| TC-009   | Päiväkirjamerkinnät haetaan onnistuneesti | Positiivinen | ✅ PASS |
| TC-010   | Päiväkirja ilman tokenia palauttaa 401    | Tietoturva   | ✅ PASS |

---

## Testattavat käyttötapaukset

### TC-001 — Kirjautuminen oikeilla tunnuksilla onnistuu

**Kuvaus:** Käyttäjä kirjautuu oikeilla Kubios-tunnuksilla.

**Testattava reitti:** `POST /api/auth/login`

**Testitapauksen vaiheet:**

1. Lähetä kirjautumispyyntö `{ username, password }` oikeilla tunnuksilla
2. Tarkista että vastauskoodi on `200 OK`
3. Tarkista että vastaus sisältää `token`-kentän
4. Tarkista että vastaus sisältää `user`-kentän

**Odotettu tulos:** `200 OK`, JWT-token palautetaan

**Tulos:** ✅ PASS

---

### TC-002 — Kirjautuminen väärällä salasanalla epäonnistuu

**Kuvaus:** Käyttäjä yrittää kirjautua väärällä salasanalla.

**Testattava reitti:** `POST /api/auth/login`

**Testitapauksen vaiheet:**

1. Lähetä kirjautumispyyntö oikealla käyttäjänimellä mutta väärällä salasanalla
2. Tarkista että vastauskoodi on `>= 400`

**Odotettu tulos:** Virhekoodi, kirjautuminen estetään

**Tulos:** ✅ PASS

---

### TC-003 — Kirjautuminen tyhjillä kentillä epäonnistuu

**Kuvaus:** Käyttäjä lähettää tyhjän kirjautumispyynnön.

**Testattava reitti:** `POST /api/auth/login`

**Testitapauksen vaiheet:**

1. Lähetä kirjautumispyyntö tyhjillä kentillä `{ username: "", password: "" }`
2. Tarkista että vastauskoodi on `>= 400`

**Odotettu tulos:** Virhekoodi, kirjautuminen estetään

**Tulos:** ✅ PASS

---

### TC-004 — HRV-data haetaan onnistuneesti

**Kuvaus:** Kirjautunut käyttäjä hakee HRV-datansa Kubios-pilvestä.

**Testattava reitti:** `GET /api/kubios/user-data`

**Testitapauksen vaiheet:**

1. Kirjaudu sisään ja tallenna JWT-token
2. Lähetä pyyntö `Authorization: Bearer <token>` -headerilla
3. Tarkista että vastauskoodi on `200 OK`
4. Tarkista että vastaus sisältää `results`-listan
5. Tarkista että lista ei ole tyhjä

**Odotettu tulos:** `200 OK`, lista Kubios-mittauksista palautetaan

**Tulos:** ✅ PASS

---

### TC-005 — Etusivu näyttää viimeisimmän analyysin tuloksen

**Kuvaus:** Varmistaa että API palauttaa oikeat HRV-arvot uusimmasta mittauksesta, jonka frontend näyttää dashboardilla.

**Testattava reitti:** `GET /api/kubios/user-data`

**Testitapauksen vaiheet:**

1. Hae Kubios-data tokenilla
2. Tarkista `results[0].result` sisältää `readiness`-kentän
3. Tarkista että `readiness` on välillä `0–100`
4. Tarkista `rmssd_ms` ja `stress_index` -kentät

**Odotettu tulos:** Uusin mittaus sisältää kaikki tarvittavat HRV-arvot

**Tulos:** ✅ PASS

---

### TC-006 — Käyttäjä näkee omat profiilitietonsa

**Kuvaus:** Kirjautunut käyttäjä hakee omat tietonsa (`given_name`, `family_name`, `email`).

**Testattava reitti:** `GET /api/kubios/user-info`

**Testitapauksen vaiheet:**

1. Lähetä pyyntö tokenilla
2. Tarkista että vastaus sisältää `user`-objektin
3. Tarkista `given_name`, `family_name`, `email` -kentät

**Odotettu tulos:** Kubios-profiilin tiedot palautetaan oikein

**Tulos:** ✅ PASS

---

### TC-007 — Pyyntö ilman tokenia palauttaa 401

**Kuvaus:** Suojattu reitti hylkää pyynnön ilman autentikointia.

**Testattava reitti:** `GET /api/kubios/user-data`

**Testitapauksen vaiheet:**

1. Lähetä pyyntö ilman `Authorization`-headeria
2. Tarkista että vastauskoodi on `401`

**Odotettu tulos:** `401 Unauthorized`

**Tulos:** ✅ PASS

---

### TC-008 — Päiväkirjamerkinnän luonti onnistuu

**Kuvaus:** Kirjautunut käyttäjä luo uuden päiväkirjamerkinnän.

**Testattava reitti:** `POST /api/diary`

**Testitapauksen vaiheet:**

1. Kirjaudu sisään ja tallenna JWT-token
2. Lähetä pyyntö `{ entry_date, content, mood }` tokenilla
3. Tarkista että vastauskoodi on `201 Created`
4. Tarkista että vastaus sisältää `id`-kentän
5. Tarkista että `id` on suurempi kuin 0

**Odotettu tulos:** `201 Created`, uuden merkinnän id palautetaan

**Tulos:** ✅ PASS

---

### TC-009 — Päiväkirjamerkinnät haetaan onnistuneesti

**Kuvaus:** Kirjautunut käyttäjä hakee kaikki omat päiväkirjamerkintänsä.

**Testattava reitti:** `GET /api/diary`

**Testitapauksen vaiheet:**

1. Lähetä pyyntö tokenilla
2. Tarkista että vastauskoodi on `200 OK`
3. Tarkista että vastaus sisältää `entries`-listan

**Odotettu tulos:** `200 OK`, lista päiväkirjamerkinnöistä palautetaan

**Tulos:** ✅ PASS

---

### TC-010 — Päiväkirja ilman tokenia palauttaa 401

**Kuvaus:** Suojattu päiväkirjareitti hylkää pyynnön ilman autentikointia.

**Testattava reitti:** `GET /api/diary`

**Testitapauksen vaiheet:**

1. Lähetä pyyntö ilman `Authorization`-headeria
2. Tarkista että vastauskoodi on `401`

**Odotettu tulos:** `401 Unauthorized`

**Tulos:** ✅ PASS

---

## Robot Framework -testit

### Kansiorakenne

```
robot-tests/
├── tests/
│   ├── auth_tests.robot    — TC-001, TC-002, TC-003
│   └── api_tests.robot     — TC-004–TC-010
├── resources/
│   ├── common.resource     — yhteiset avainsanat, URL-muuttujat
│   ├── auth.resource       — kirjautumisen avainsanat
│   └── api.resource        — API-kutsujen avainsanat
├── outputs/
│   ├── report_iteraatio1.html
│   └── report_iteraatio2.html
└── README.md
```

### Tagit

| Tagi       | Kuvaus                   |
| ---------- | ------------------------ |
| `smoke`    | Perustoiminnallisuus     |
| `auth`     | Kirjautumistestit        |
| `api`      | API-reittien testit      |
| `kubios`   | Kubios-integraatiotestit |
| `diary`    | Päiväkirjatestit         |
| `negative` | Virhetilanteiden testit  |
| `security` | Tietoturvatestit         |

---

## Testien ajaminen

### Esiehdot

```bash
pip install robotframework
pip install robotframework-requests
```

### Ympäristömuuttujat

```powershell
# Windows (PowerShell) — lataa .env tiedostosta
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^#][^=]*)=(.*)$') {
        [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), 'Process')
    }
}
```

### Käynnistä backend ensin

```bash
cd cardiorest-be
npm run dev
```

### Aja testit

```bash
# Kaikki testit
robot --pythonpath . --outputdir robot-tests/outputs robot-tests/tests

# Vain tietyn tagin testit
robot --pythonpath . --include auth robot-tests/tests
robot --pythonpath . --include diary robot-tests/tests
```

---

## Tulokset

### Iteraatio 1 — 13.4.2026

```
7 tests, 7 passed, 0 failed
```

| Testijoukko      | Testejä | Läpäisty | Hylätty |
| ---------------- | ------- | -------- | ------- |
| auth_tests.robot | 3       | 3        | 0       |
| api_tests.robot  | 4       | 4        | 0       |
| **Yhteensä**     | **7**   | **7**    | **0**   |

### Iteraatio 2 — 26.4.2026

```
10 tests, 10 passed, 0 failed
```

| Testijoukko      | Testejä | Läpäisty | Hylätty |
| ---------------- | ------- | -------- | ------- |
| auth_tests.robot | 3       | 3        | 0       |
| api_tests.robot  | 7       | 7        | 0       |
| **Yhteensä**     | **10**  | **10**   | **0**   |

---

## Havainnot ja kommentit

### Ongelmat testien kehityksessä

| Ongelma                                          | Syy                                     | Ratkaisu                                   |
| ------------------------------------------------ | --------------------------------------- | ------------------------------------------ |
| `Get Environment Variable` ei löytynyt           | `OperatingSystem`-kirjasto puuttui      | Lisätty `common.resource`:en               |
| `Alusta Testit` ei löytynyt                      | Avainsana väärässä resource-tiedostossa | Siirretty `common.resource`:en             |
| `response.status_code` epäonnistui               | `GET`-avainsana palautti dict-objektin  | Vaihdettu `GET On Session`                 |
| `CryptoLibrary` salasanan purku epäonnistui      | `private_key.key` puuttui               | Vaihdettu ympäristömuuttujiin              |
| `Should Not Be Empty` epäonnistui diary-testissä | `id` on numero eikä lista               | Vaihdettu `Should Be True ${data}[id] > 0` |
| Kirjautuminen epäonnistui testeissä              | Ympäristömuuttujat ei asetettu          | `.env` ladataan PowerShell-komennolla      |

### Huomiot sovelluksen toiminnasta

- Kirjautuminen toimii oikeilla Kubios-tunnuksilla — JWT-token luodaan onnistuneesti
- Väärä salasana tai tyhjät kentät hylätään oikein
- `GET /api/kubios/user-data` palauttaa oikeaa mittausdataa Kubios-pilvestä
- `GET /api/kubios/user-info` palauttaa käyttäjän tiedot `given_name`/`family_name`-muodossa
- Suojatut reitit vaativat oikean JWT-tokenin — 401 palautetaan ilman tokenia
- Päiväkirjamerkinnän luonti tallentaa datan tietokantaan ja palauttaa uuden merkinnän id:n
- Päiväkirjareitit on suojattu — 401 palautetaan ilman tokenia

### Testikattavuus

Kaikki 10 käyttötapausta kahdessa iteraatiossa on katettu automaatiotesteillä ja ne läpäisevät onnistuneesti.

---

_Päivitetty: 26.4.2026 | Ryhmä 1 — Markus Kauremaa, Mikael Mikkola, Moumen Flih, Daniil Pavliuk_
