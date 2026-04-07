*** Settings ***
Documentation       API-kutsuihin liittyvät avainsanat
Library             RequestsLibrary
Library             Collections


*** Variables ***
${PROFILE_URL}      ${API_URL}/users/profile
${KUBIOS_URL}       ${API_URL}/kubios/user-data


*** Keywords ***
Hae Profiili
    [Documentation]    Hakee käyttäjän profiilin tokenilla
    ${headers}=     Luo Auth Header
    ${response}=    GET    ${PROFILE_URL}
    ...             headers=${headers}
    ...             expected_status=200
    RETURN    ${response.json()}

Hae Kubios Data
    [Documentation]    Hakee Kubios-datan tokenilla
    ${headers}=     Luo Auth Header
    ${response}=    GET    ${KUBIOS_URL}
    ...             headers=${headers}
    ...             expected_status=200
    RETURN    ${response.json()}
