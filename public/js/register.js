const registerForm = document.getElementById(
    "register-form"
);

const fullNameInput = document.getElementById(
    "register-full-name"
);

const usernameInput = document.getElementById(
    "register-username"
);

const emailInput = document.getElementById(
    "register-email"
);

const passwordInput = document.getElementById(
    "register-password"
);

const confirmPasswordInput =
    document.getElementById(
        "register-confirm-password"
    );

const registerError = document.getElementById(
    "register-error"
);

registerForm.addEventListener(
    "submit",

    async function (event) {
        event.preventDefault();

        const fullName =
            fullNameInput.value.trim();

        const username =
            usernameInput.value.trim();

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;

        const confirmPassword =
            confirmPasswordInput.value;

        registerError.textContent = "";

        if (
            username === "" ||
            email === "" ||
            password === ""
        ) {
            registerError.textContent =
                "Username, email and password are required.";

            return;
        }

        if (!isValidUsername(username)) {
            registerError.textContent =
                "Username must contain 3-20 letters, numbers, dots or underscores.";

            return;
        }

        if (!isValidEmail(email)) {
            registerError.textContent =
                "Please enter a valid email address.";

            return;
        }

        if (password.length < 6) {
            registerError.textContent =
                "Password must contain at least 6 characters.";

            return;
        }

        if (password !== confirmPassword) {
            registerError.textContent =
                "The passwords do not match.";

            return;
        }

        try {
            const response = await fetch(
                "/api/users/register",

                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        fullName: fullName,
                        username: username,
                        email: email,
                        password: password
                    })
                }
            );

            const result =
                await response.json();

            if (!response.ok) {
                registerError.textContent =
                    result.message;

                return;
            }

            window.location.href =
                "feed.html";

        } catch (error) {
            registerError.textContent =
                "Could not connect to the server.";
        }
    }
);

function isValidEmail(value) {
    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(value);
}

function isValidUsername(value) {
    const usernamePattern =
        /^[a-zA-Z0-9._]{3,20}$/;

    return usernamePattern.test(value);
}