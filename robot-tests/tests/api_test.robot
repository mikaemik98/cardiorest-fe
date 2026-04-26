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

Päiväkirjamerkinnän luonti onnistuu
    [Documentation]    Kirjautunut käyttäjä luo uuden päiväkirjamerkinnän.
    ...                Odotetaan 201 Created ja merkinnän id vastauksessa.
    [Tags]    api    diary    smoke    TC-008
    ${headers}=    Luo Auth Header
    ${body}=       Create Dictionary
    ...    entry_date=2026-04-26
    ...    content=Testimerkintä automaatiotestauksesta
    ...    mood=hyvä
    ${session}=    Create Session    diary_session    ${BASE_URL}
    ${response}=   POST On Session    diary_session    /api/diary
    ...            json=${body}
    ...            headers=${headers}
    ...            expected_status=201
    ${data}=    Set Variable    ${response.json()}
    Dictionary Should Contain Key    ${data}    id
    Should Be True    ${data}[id] > 0
    Log    Merkintä luotu id:llä: ${data}[id]

Päiväkirjamerkinnät haetaan onnistuneesti
    [Documentation]    Kirjautunut käyttäjä hakee kaikki päiväkirjamerkinnät.
    ...                Odotetaan 200 OK ja entries-lista vastauksessa.
    [Tags]    api    diary    smoke    TC-009
    ${headers}=    Luo Auth Header
    ${session}=    Create Session    diary_get_session    ${BASE_URL}
    ${response}=   GET On Session    diary_get_session    /api/diary
    ...            headers=${headers}
    ...            expected_status=200
    ${data}=    Set Variable    ${response.json()}
    Dictionary Should Contain Key    ${data}    entries
    Log    Merkintöjä löytyi: ${data}[entries].__len__()

Päiväkirja ilman tokenia palauttaa 401
    [Documentation]    Suojattu päiväkirjareitti hylkää pyynnön ilman tokenia.
    [Tags]    api    diary    security    TC-010
    ${session}=    Create Session    diary_noauth_session    ${BASE_URL}
    ${response}=   GET On Session    diary_noauth_session    /api/diary
    ...            expected_status=any
    Should Be Equal As Strings    ${response.status_code}    401
    Log    Ilman tokenia palautui: ${response.status_code}
