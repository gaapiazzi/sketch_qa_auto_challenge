import signinConstants from '../helpers/signin/signin.constants.js';
import endpointConstants from '../helpers/utils/endpoint.constants.js';

describe('Sign-in flow through UI', () => {
    beforeEach(() => {
        cy.visit(endpointConstants.endpoint.signin);
    });
    it('[T_01] Shows an error when trying to sign-in with empty email', () => {
        cy.get(signinConstants.selectors.userPassword.input).type(Cypress.env("USER_PASSWORD"));
        cy.get(signinConstants.selectors.signInButton).click();
        cy.get(signinConstants.selectors.userEmail.errorMessageSpan).contains(signinConstants.errorMessages.emptyEmailMessage).should("be.visible");
        cy.get(signinConstants.selectors.userEmail.input).should('have.css', "border", signinConstants.styles.inputErrorBorder)
    })

    it('[T_02] Shows an error when trying to sign-in with invalid email', () => {
        const email = "invalid@gmail";
        cy.get(signinConstants.selectors.userEmail.input).type(email);
        cy.get(signinConstants.selectors.signInButton).click();
        cy.get(signinConstants.selectors.userEmail.errorMessageSpan).contains(signinConstants.errorMessages.invalidEmailMessage).should("be.visible");
        cy.get(signinConstants.selectors.userEmail.input).should('have.css', "border", signinConstants.styles.inputErrorBorder)
    })

    it('[T_03] Shows an error when trying to sign-in with empty password', () => {
        cy.get(signinConstants.selectors.userEmail.input).type(Cypress.env("USER_EMAIL"));
        cy.get(signinConstants.selectors.signInButton).click();
        cy.get(signinConstants.selectors.userPassword.errorMessageSpan).contains(signinConstants.errorMessages.emptyPasswordMessage).should("be.visible");
        cy.get(signinConstants.selectors.userPassword.input).should('have.css', "border", signinConstants.styles.inputErrorBorder)
    })

    it('[T_04] Can show and hide password when I click on the eye icon', () => {
        cy.get(signinConstants.selectors.userEmail.input).type(Cypress.env("USER_EMAIL"));
        cy.get(signinConstants.selectors.userPassword.input).type(Cypress.env("USER_PASSWORD"));
        cy.get(signinConstants.selectors.eyeIcon).click();
        cy.get(signinConstants.selectors.userPassword.input).should('have.attr', 'type', 'text');
        // Will also validate that icon changes
        cy.get(signinConstants.selectors.eyeIcon).should('have.css', 'color', signinConstants.styles.eyeIconEnabledColor);
        cy.get(signinConstants.selectors.eyeIcon).click();
        cy.get(signinConstants.selectors.userPassword.input).should('have.attr', 'type', 'password');
        // Again - Can also validate that icon changes
        cy.get(signinConstants.selectors.eyeIcon).should('have.css', 'color', signinConstants.styles.eyeIconDisabledColor);
    })

    it('[T_05] Shows an error when trying to sign-in with invalid password', () => {
        const email = "invalid_email@invalidhost.invalid.com";
        const password = "invalidPassword";
        cy.get(signinConstants.selectors.userEmail.input).type(email);
        cy.get(signinConstants.selectors.userPassword.input).type(password);
        // Intercept request to 'token' API to make some back-end checks
        cy.intercept(endpointConstants.endpoint.oauth_token).as('signinRequest');
        cy.get(signinConstants.selectors.signInButton).click();
        cy.get(signinConstants.selectors.spinnerButton);
        cy.get(signinConstants.selectors.spinnerButton).should('not.exist');
        cy.get(signinConstants.selectors.errorMessageSpan).contains(signinConstants.errorMessages.invalidSignInMessage).should("be.visible");
        // Validate 'token' API response
        cy.wait('@signinRequest').then(interception => {
            expect(interception.response.statusCode).to.eq(401);
            expect(interception.response.body['status']).to.eq('Unauthorized');
            expect(interception.response.body['type']).to.eq('invalid_credentials');
        });
    })

    it('[T_06] Successfully sign-in with a registered user', () => {
        const email = Cypress.env("USER_EMAIL");
        const password = Cypress.env("USER_PASSWORD");
        cy.get(signinConstants.selectors.userEmail.input)
        .should("have.attr", "placeholder", "Enter your email")
        .type(email)
        .should("have.value", email);
        // Intercept request to 'token' API to make some back-end checks
        cy.intercept(endpointConstants.endpoint.oauth_token).as('tokenRequest');
        cy.get(signinConstants.selectors.userPassword.input).type(password);
        cy.get(signinConstants.selectors.signInButton).click();
        // Validate 'token' API request and response
        cy.wait('@tokenRequest').then(interception =>{
            expect(interception.request.body).to.have.property('email', email);
            expect(interception.request.body).to.have.property('password', password);
            expect(interception.request.body).to.have.property('grant_type', 'password');
            expect(interception.response.statusCode).to.eq(200);
            expect(interception.response.headers['content-type']).to.eq('application/json; charset=utf-8');
            expect(interception.response.body).to.not.be.null;
            expect(interception.response.body).to.have.all.keys('access_token', 'expires_in', 'refresh_token', 'token_type');
        })
        cy.url().should("include", "/workspace/");
    })

    it('[T_07] Redirects to forgot password page', () => {
        cy.get(signinConstants.selectors.forgotPasswordLink).contains("Forgot Password?");
        cy.get(signinConstants.selectors.forgotPasswordLink).click();
        cy.url().should("include", "/forgot");
    })
});

// SOME API TESTS TO VALIDATE BACK-END ERRORS HANDLING
describe('Sign-in flow through API - Error handling', () => {
    it('[T_08] Fails request to token API with empty email', () => {
        cy.request({
            method: 'POST',
            url: endpointConstants.endpoint.oauth_token,
            body:{
                email: "",
                password: "my_password",
                grant_type: "password"
            },
            failOnStatusCode: false
            }).as('tokenRequest');
        cy.get('@tokenRequest').then(todos => {
           expect(todos.status).to.eq(400);
           expect(todos.body['status']).to.eq('Bad Request');
           expect(todos.body.['message']).to.eq('Invalid input arguments')
        });
    })

    it('[T_09] Fails request to token API with invalid email', () => {
        cy.request({
            method: 'POST',
            url: endpointConstants.endpoint.oauth_token,
            body:{
                email: "invalidemail",
                password: "my_password",
                grant_type: "password"
            },
            failOnStatusCode: false
            }).as('tokenRequest');
        cy.get('@tokenRequest').then(todos => {
           expect(todos.status).to.eq(400);
           expect(todos.body['status']).to.eq('Bad Request');
           expect(todos.body.['message']).to.eq('Invalid input arguments')
        });
    })

    it('[T_10] Fails request to token API without email', () => {
        cy.request({
            method: 'POST',
            url: endpointConstants.endpoint.oauth_token,
            body:{
                password: "my_passwoed",
                grant_type: "password"
            },
            failOnStatusCode: false
            }).as('tokenRequest');
        cy.get('@tokenRequest').then(todos => {
           expect(todos.status).to.eq(400);
           expect(todos.body['status']).to.eq('Bad Request');
           // Actual message is 'Required field grant_type not provided'
           // expect(todos.body.['message']).to.eq('Required field email not provided')
        });
    })

    it('[T_11] Fails request to token API without password', () => {
        cy.request({
            method: 'POST',
            url: endpointConstants.endpoint.oauth_token,
            body:{
                email: Cypress.env("USER_EMAIL"),
                grant_type: "password"
            },
            failOnStatusCode: false
            }).as('tokenRequest');
        cy.get('@tokenRequest').then(todos => {
           expect(todos.status).to.eq(400);
           expect(todos.body['status']).to.eq('Bad Request');
           // Actual message is 'Required field grant_type not provided'
           // expect(todos.body.['message']).to.eq('Required field password not provided')
        });
    })

    it('[T_12] Fails request to token API with invalid grant_type', () => {
        cy.request({
            method: 'POST',
            url: endpointConstants.endpoint.oauth_token,
            body:{
                email: Cypress.env("USER_EMAIL"),
                password: Cypress.env("USER_PASSWORD"),
                grant_type: "invalid"
            },
            failOnStatusCode: false
            }).as('tokenRequest');
        cy.get('@tokenRequest').then(todos => {
           expect(todos.status).to.eq(400);
           expect(todos.body['status']).to.eq('Bad Request');
           expect(todos.body.['message']).to.eq('Required field grant_type not provided')
        });
    })

    it('[T_13] Fails request to token API without grant_type', () => {
        cy.request({
            method: 'POST',
            url: endpointConstants.endpoint.oauth_token,
            body:{
                email: Cypress.env("USER_EMAIL"),
                password: Cypress.env("USER_PASSWORD"),
            },
            failOnStatusCode: false
            }).as('tokenRequest');
        cy.get('@tokenRequest').then(todos => {
           expect(todos.status).to.eq(400);
           expect(todos.body['status']).to.eq('Bad Request');
           expect(todos.body.['message']).to.eq('Required field grant_type not provided')
        });
    })
});
