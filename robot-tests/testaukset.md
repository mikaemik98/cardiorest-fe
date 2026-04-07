# CardioRest Robot Framework testit

# Testaukset

## Kirjautuminen

| Testitapaus | Kuvaus | Odotettu tulos |
|---|---|---|
| Kirjautuminen oikeilla tunnuksilla onnistuu | Käyttäjä syöttää oikeat Kubios-tunnukset | Kirjautuminen onnistuu ja käyttäjä ohjataan dashboardille |
| Kirjautuminen väärällä salasanalla epäonnistuu | Käyttäjä syöttää väärän salasanan | Näytetään virheviesti "Väärä sähköposti tai salasana" |
| Kirjautuminen tyhjillä kentillä epäonnistuu | Käyttäjä jättää kentät tyhjiksi | Näytetään virheviesti "Täytä kaikki kentät" |

---

## Datan haku

| Testitapaus | Kuvaus | Odotettu tulos |
|---|---|---|
| HRV-data haetaan onnistuneesti | Kirjautunut käyttäjä avaa dashboardin | HRV-data haetaan Kubios-pilvestä ja näytetään dashboardilla |
| Etusivu näyttää viimeisimmän analyysin tuloksen | Käyttäjä avaa dashboardin | Uusin mittaus näkyy palautumispistemäärässä ja kaavioissa |

---

## Omien tietojen tarkastelu

| Testitapaus | Kuvaus | Odotettu tulos |
|---|---|---|
| Käyttäjä näkee omat profiilitietonsa | Kirjautunut käyttäjä tarkastelee sivupalkkia | Käyttäjän nimi ja sähköposti näkyvät sivupalkin alaosassa |

## Robot Framework -testit

Automaattiset testit on toteutettu Robot Framework -testaustyökalulla.
Testit sijaitsevat kansiossa `robot-tests/`
