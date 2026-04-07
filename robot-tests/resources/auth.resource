*** Settings ***
Documentation       Kirjautumiseen liittyvät avainsanat
Library             RequestsLibrary
Library             Collections


*** Variables ***
${LOGIN_URL}        ${API_URL}/auth/login
${REGISTER_URL}     ${API_URL}/auth/register
${TEST_USERNAME}    %{TEST_USERNAME=test@example.com}
${TEST_PASSWORD}    %{TEST_PASSWORD=testpassword}
${AUTH_TOKEN}       ${EMPTY}


*** Keywords ***
Kirjaudu Sisään
    [Documentation]    Kirjautuu sisään ja tallentaa tokenin
    ${headers}=    Create Dictionary    Content-Type=application/json
    ${body}=       Create Dictionary
    ...    username=${TEST_USERNAME}
    ...    password=${TEST_PASSWORD}
    ${response}=   POST    ${LOGIN_URL}
    ...            json=${body}
    ...            headers=${headers}
    ...            expected_status=200
    ${token}=      Get From Dictionary    ${response.json()}    token
    Set Global Variable    ${AUTH_TOKEN}    ${token}
    Log    Kirjautuminen onnistui, token tallennettu
    RETURN    ${token}

Luo Auth Header
    [Documentation]    Luo Authorization-header tokenilla
    ${headers}=    Create Dictionary
    ...    Authorization=Bearer ${AUTH_TOKEN}
    ...    Content-Type=application/json
    RETURN    ${headers}
