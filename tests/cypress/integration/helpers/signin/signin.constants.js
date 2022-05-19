const selectors = {
    userEmail: {
        input: '[id="text-input"]',
        errorMessageSpan: 'form div:nth-of-type(1) span',
    },
    userPassword: {
        input: '[id="password-input"]',
        errorMessageSpan: 'form div:nth-of-type(2) span',
    },
    signInButton: 'button[type=submit]',
    spinnerButton: 'div[data-testid=button-spinner]',
    forgotPasswordLink: 'label[for=password-input]',
    eyeIcon: '[data-testid="eye-icon"]',
    errorMessageSpan: 'form span',
    forgotPasswordLink: 'label[for=password-input] div a',
};

const errorMessages = {
    invalidEmailMessage: "This is not a valid email",
    emptyEmailMessage: "Email can’t be blank",
    emptyPasswordMessage: "Password can’t be blank",
    invalidSignInMessage: 'We couldn’t sign you in. Please check your details and try again.',
}

const styles = {
    inputErrorBorder: "2px solid rgb(204, 0, 0)",
    eyeIconEnabledColor: "rgb(242, 103, 38)",
    eyeIconDisabledColor: "rgba(0, 0, 0, 0.4)",
}

export default {
    selectors,
    errorMessages,
    styles
};
