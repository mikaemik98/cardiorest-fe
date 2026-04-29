*** Settings ***
Documentation       Yhteiset avainsanat ja muuttujat
Library             RequestsLibrary
Library             Collections
Library             OperatingSystem
Library             OperatingSystem


*** Variables ***
${BASE_URL}         http://localhost:3000
${API_URL}          ${BASE_URL}/api


*** Keywords ***
Set Base URL
    [Documentation]    Asettaa base URL:n
    ${env_url}=    Get Environment Variable    API_URL    default=${BASE_URL}
    Set Global Variable    ${BASE_URL}    ${env_url}
    Set Global Variable    ${API_URL}     ${env_url}/api
    Log    Base URL: ${BASE_URL}

Alusta Testit
    Set Base URL
    Kirjaudu Ja Tallenna Token

Protect Sensitive Keywords
    Register Protected Keywords
    ...    Kirjaudu Ja Tallenna Token
    ...    Kirjaudu Sisään