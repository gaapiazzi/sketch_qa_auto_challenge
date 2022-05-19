# Sketch - QA Automation Challenge

## Objetive and scope
Validate the user sign-in **flow** at sketch.com

Sign-in **page** is not in the scope of the test cases and features not related with the sign-in flow, such as 'Redirection to termns of Services', will not be under testing.

## Running test locally

### Pre requisites

Node.js already installed

### Installation
```
npm i --prefix ./tests cypress
npm i --prefix ./tests cypress-mochawesome-reporter
```

### Test Execution
Complete env vars ***USER_EMAIL*** and ***USER_PASSWORD*** in tests/cypress.json with valid credentials and then run
```
./runtests.sh
```

You'll find a html report in ***tests/cypress/report***

#### Test strategy
Will test E2E sign-in flow through UI, starting from https://www.sketch.com/signin
Since the front-end handle input errors, will also include some API test to validate the correct error handling of bad requests in the back-end


***[T_01]*** Try to sign-in trough UI with empty email

***[T_02]*** Try to sign-in trough UI with malformed email

***[T_03]*** Try to sign-in trough UI with empty password

***[T_04]*** Show/Hide password with eye-icon

***[T_05]*** Try to sign-in with invalid credentials

***[T_06]*** Sign-in with valid credentials

***[T_07]*** Redirects to forgot password page


***[T_08]*** Request token API with empty email

***[T_09]*** Request token API with malformed email

***[T_10]*** Request token API without email field

***[T_11]*** Request token API without password field

***[T_12]*** Request token API with invalid grant_type

***[T_13]*** Request token API without grant_type field


*********************************************************************************************

## Runing test Using Docker

### Installation
Having docker installed, ([quickstart guide](https://docs.docker.com/get-started/)), build the Images for cypress test:

    `docker build ./tests -t sketch-qa-challenge`


### Test Execution
Complete env vars ***USER_EMAIL*** and ***USER_PASSWORD*** in tests/cypress.json with valid credentials.
Start docker through docker-compose, this will run tests automatically.

    `docker-compose up`

You'll find a html report in tests/cypress/report

Note: After running tests in docker, some files change its owner and you can get an error if you try to run them locally.
Workaround: simply set the correct permissions again with
    `sudo chown -R <user> .`
Sorry, not time to deal with this,