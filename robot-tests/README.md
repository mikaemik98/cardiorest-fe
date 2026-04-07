# CardioRest — Robot Framework testit

## Kansiorakenne

```
robot-tests/
├── tests/
│   ├── auth_tests.robot    — kirjautumisen testit
│   └── api_tests.robot     — API-reittien testit
├── resources/
│   ├── common.resource     — yhteiset avainsanat ja muuttujat
│   ├── auth.resource       — kirjautumisen avainsanat
│   └── api.resource        — API-kutsujen avainsanat
├── requirements.txt        — Python-riippuvuudet
└── README.md
```

## Asennus

```bash
pip install -r requirements.txt
```

## Testien ajaminen

```bash
# Kaikki testit
robot --pythonpath . tests

# Vain smoke-testit
robot --pythonpath . --include smoke tests

# Vain auth-testit
robot --pythonpath . --include auth tests
```

## Ympäristömuuttujat

Luo `.env`-tiedosto tai aseta muuttujat ennen testien ajamista:

```bash
TEST_USERNAME=kubios@tunnuksesi.fi
TEST_PASSWORD=salasanasi
API_URL=http://localhost:3000
```

## Tagit

| Tagi | Kuvaus |
|---|---|
| smoke | Perustoiminnallisuus |
| auth | Kirjautumistestit |
| api | API-reittien testit |
| kubios | Kubios-integraatiotestit |
| negative | Virhetilanteiden testit |
| security | Tietoturvatestit |
