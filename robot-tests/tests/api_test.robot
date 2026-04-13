*** Settings ***
Documentation       CardioRest — API-reittien automaatiotestit
...                 Testaa Kubios-datan haku ja profiilitiedot autentikoiduilla pyynnöillä
Resource            ../resources/common.resource
Resource            ../resources/auth.resource
Resource            ../resources/api.resource

Suite Setup         Alusta Testit


*** Test Cases ***

HRV-data haetaan onnistuneesti
    [Documentation]    Kirjautunut käyttäjä hakee HRV-datan.
    ...                Odotetaan 200 OK ja results-lista vastauksessa.
    [Tags]    api    kubios    smoke    TC-004
    ${response}=    Hae Kubios Data
    Should Be Equal As Strings    ${response.status_code}    200
    ${body}=    Set Variable    ${response.json()}
    Dictionary Should Contain Key    ${body}    results
    ${results}=    Get From Dictionary    ${body}    results
    Should Not Be Empty    ${results}
    Log    HRV-data haettu, mittauksia: ${results.__len__()}

Etusivu näyttää viimeisimmän analyysin tuloksen
    [Documentation]    Varmistaa että API palauttaa readiness-arvon uusimmasta mittauksesta.
    ...                Frontend käyttää tätä dashboardin score-kortissa.
    [Tags]    api    kubios    smoke    TC-005
    ${response}=    Hae Kubios Data
    Should Be Equal As Strings    ${response.status_code}    200
    ${body}=    Set Variable    ${response.json()}
    ${results}=    Get From Dictionary    ${body}    results
    Should Not Be Empty    ${results}
    ${latest}=    Get From List    ${results}    0
    Dictionary Should Contain Key    ${latest}    result
    ${result}=    Get From Dictionary    ${latest}    result
    Dictionary Should Contain Key    ${result}    readiness
    Dictionary Should Contain Key    ${result}    rmssd_ms
    Dictionary Should Contain Key    ${result}    stress_index
    ${readiness}=    Get From Dictionary    ${result}    readiness
    Should Be True    ${readiness} >= 0
    Should Be True    ${readiness} <= 100
    Log    Uusin readiness-arvo: ${readiness}

Käyttäjä näkee omat profiilitietonsa
    [Documentation]    Kirjautunut käyttäjä hakee omat tietonsa.
    ...                Odotetaan käyttäjän sähköposti, etunimi ja sukunimi.
    [Tags]    api    profile    smoke    TC-006
    ${response}=    Hae Käyttäjätiedot
    Should Be Equal As Strings    ${response.status_code}    200
    ${body}=    Set Variable    ${response.json()}
    ${user}=    Get From Dictionary    ${body}    user
    Dictionary Should Contain Key    ${user}    email
    Dictionary Should Contain Key    ${user}    given_name
    Dictionary Should Contain Key    ${user}    family_name
    Should Not Be Empty    ${user}[email]
    Log    Käyttäjätiedot haettu: ${user}[given_name] ${user}[family_name]

Pyyntö ilman tokenia palauttaa 401
    [Documentation]    Suojattu reitti hylkää pyynnön ilman Authorization-headeria.
    [Tags]    api    security    TC-007
    ${response}=    GET    ${KUBIOS_URL}
    ...             expected_status=any
    Should Be Equal As Strings    ${response.status_code}    401
    Log    Ilman tokenia palautui: ${response.status_code}
