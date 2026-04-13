*** Settings ***
Documentation       CardioRest — Kirjautumisen automaatiotestit
...                 Testaa POST /api/auth/login -reitin eri skenaarioilla
Resource            ../resources/common.resource
Resource            ../resources/auth.resource

Suite Setup         Set Base URL


*** Test Cases ***

Kirjautuminen oikeilla tunnuksilla onnistuu
    [Documentation]    Käyttäjä kirjautuu oikeilla Kubios-tunnuksilla.
    ...                Odotetaan 200 OK ja JWT-token vastauksessa.
    [Tags]    auth    smoke    TC-001
    ${response}=    Kirjaudu Sisään    ${TEST_USERNAME}    ${TEST_PASSWORD}
    Should Be Equal As Strings    ${response.status_code}    200
    ${body}=    Set Variable    ${response.json()}
    Dictionary Should Contain Key    ${body}    token
    Dictionary Should Contain Key    ${body}    user
    Should Not Be Empty    ${body}[token]
    Log    Kirjautuminen onnistui, token saatu

Kirjautuminen väärällä salasanalla epäonnistuu
    [Documentation]    Käyttäjä yrittää kirjautua väärällä salasanalla.
    ...                Odotetaan 401 Unauthorized tai 500 virhekoodi.
    [Tags]    auth    negative    TC-002
    ${headers}=    Create Dictionary    Content-Type=application/json
    ${body}=       Create Dictionary
    ...    username=${TEST_USERNAME}
    ...    password=vaara_salasana_12345
    ${response}=    POST    ${LOGIN_URL}
    ...             json=${body}
    ...             headers=${headers}
    ...             expected_status=any
    Should Be True    ${response.status_code} >= 400
    Log    Väärä salasana palautti statuksen: ${response.status_code}

Kirjautuminen tyhjillä kentillä epäonnistuu
    [Documentation]    Käyttäjä lähettää tyhjän kirjautumispyynnön.
    ...                Odotetaan virhekoodia (400 tai 500).
    [Tags]    auth    negative    TC-003
    ${headers}=    Create Dictionary    Content-Type=application/json
    ${body}=       Create Dictionary
    ...    username=${EMPTY}
    ...    password=${EMPTY}
    ${response}=    POST    ${LOGIN_URL}
    ...             json=${body}
    ...             headers=${headers}
    ...             expected_status=any
    Should Be True    ${response.status_code} >= 400
    Log    Tyhjät kentät palautti statuksen: ${response.status_code}
