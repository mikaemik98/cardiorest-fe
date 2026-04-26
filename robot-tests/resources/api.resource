*** Settings ***
Documentation       API-kutsuihin liittyvät avainsanat
Library             RequestsLibrary
Library             Collections


*** Variables ***
${KUBIOS_URL}       ${API_URL}/kubios/user-data
${USER_INFO_URL}    ${API_URL}/kubios/user-info
${DIARY_URL}        ${API_URL}/diary
${PROFILE_URL}      ${API_URL}/users/profile


*** Keywords ***
Hae Kubios Data
    [Documentation]    Hakee HRV-datan Kubios-reitistä tokenilla
    ${headers}=     Luo Auth Header
    ${session}=     Create Session    kubios    ${BASE_URL}
    ${response}=    GET On Session    kubios    /api/kubios/user-data
    ...             headers=${headers}
    ...             expected_status=any
    RETURN    ${response}

Hae Käyttäjätiedot
    [Documentation]    Hakee käyttäjän profiilitiedot Kubios-tokenilla
    ${headers}=     Luo Auth Header
    ${session}=     Create Session    userinfo    ${BASE_URL}
    ${response}=    GET On Session    userinfo    /api/kubios/user-info
    ...             headers=${headers}
    ...             expected_status=any
    RETURN    ${response}
