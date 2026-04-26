*** Settings ***
Library             RequestsLibrary
Library             Collections


*** Variables ***
${LOGIN_URL}        ${API_URL}/auth/login
${TEST_USERNAME}    %{TEST_USERNAME=}
${TEST_PASSWORD}    %{TEST_PASSWORD=}
${AUTH_TOKEN}       ${EMPTY}


*** Keywords ***
Kirjaudu Ja Tallenna Token
    [Documentation]    Kirjautuu sisään ja tallentaa JWT-tokenin
    ${headers}=    Create Dictionary    Content-Type=application/json
    ${body}=       Create Dictionary
    ...    username=${TEST_USERNAME}
    ...    password=${TEST_PASSWORD}
    Log    Kirjaudutaan käyttäjänä: ${TEST_USERNAME}
    ${session}=    Create Session    login_session    ${BASE_URL}
    ${response}=   POST On Session    login_session    /api/auth/login
    ...            json=${body}
    ...            headers=${headers}
    ...            expected_status=200
    ${token}=      Get From Dictionary    ${response.json()}    token
    Set Global Variable    ${AUTH_TOKEN}    ${token}
    Log    Token tallennettu onnistuneesti

Kirjaudu Sisään
    [Documentation]    Lähettää kirjautumispyynnön
    [Arguments]    ${username}    ${password}
    ${headers}=    Create Dictionary    Content-Type=application/json
    ${body}=       Create Dictionary
    ...    username=${username}
    ...    password=${password}
    ${session}=    Create Session    login_session    ${BASE_URL}
    ${response}=   POST On Session    login_session    /api/auth/login
    ...            json=${body}
    ...            headers=${headers}
    ...            expected_status=any
    RETURN    ${response}

Luo Auth Header
    [Documentation]    Luo Authorization-header tallennetulla tokenilla
    ${headers}=    Create Dictionary
    ...    Authorization=Bearer ${AUTH_TOKEN}
    ...    Content-Type=application/json
    RETURN    ${headers}

