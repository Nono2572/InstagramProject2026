const loginForm = document.getElementById("login-form");
const identifierInput = document.getElementById("login-identifier");
const passwordInput = document.getElementById("login-password");

const identifierError = document.getElementById("identifier-error");
const passwordError = document.getElementById("password-error");

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const identifier = identifierInput.value.trim();
    const password = passwordInput.value.trim();

    let formIsValid = true;

    identifierError.textContent = "";
    passwordError.textContent = "";

    identifierInput.classList.remove("input-error");
    passwordInput.classList.remove("input-error");

    if (identifier === "") {
        identifierError.textContent = "Please enter a username, email or mobile number.";
        identifierInput.classList.add("input-error");
        formIsValid = false;
    } else if (!isValidIdentifier(identifier)) {
        identifierError.textContent = "Please enter a valid username, email or mobile number.";
        identifierInput.classList.add("input-error");
        formIsValid = false;
    }

    if (password === "") {
        passwordError.textContent = "Please enter your password.";
        passwordInput.classList.add("input-error");
        formIsValid = false;
    } else if (password.length < 6) {
        passwordError.textContent = "Password must contain at least 6 characters.";
        passwordInput.classList.add("input-error");
        formIsValid = false;
    }

    if (formIsValid) {
        window.location.href = "feed.html";
    }
});

function isValidIdentifier(identifier) {
    return isValidEmail(identifier) ||
        isValidPhoneNumber(identifier) ||
        isValidUsername(identifier);
}

function isValidEmail(value) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(value);
}

function isValidPhoneNumber(value) {
    const phonePattern = /^05\d{8}$/;
    return phonePattern.test(value);
}

function isValidUsername(value) {
    const usernamePattern = /^[a-zA-Z0-9._]{3,20}$/;
    return usernamePattern.test(value);
}