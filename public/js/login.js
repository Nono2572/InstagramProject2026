const loginForm = document.getElementById(
    "login-form"
);

const identifierInput = document.getElementById(
    "login-identifier"
);

const passwordInput = document.getElementById(
    "login-password"
);

const identifierError = document.getElementById(
    "identifier-error"
);

const passwordError = document.getElementById(
    "password-error"
);

const serverError = document.getElementById(
    "login-server-error"
);

loginForm.addEventListener(
    "submit",

    async function (event) {
        event.preventDefault();

        const identifier =
            identifierInput.value.trim();

        const password =
            passwordInput.value;

        let formIsValid = true;

        identifierError.textContent = "";
        passwordError.textContent = "";
        serverError.textContent = "";

        identifierInput.classList.remove(
            "input-error"
        );

        passwordInput.classList.remove(
            "input-error"
        );

        if (identifier === "") {
            identifierError.textContent =
                "Please enter your username or email.";

            identifierInput.classList.add(
                "input-error"
            );

            formIsValid = false;
        }

        if (password === "") {
            passwordError.textContent =
                "Please enter your password.";

            passwordInput.classList.add(
                "input-error"
            );

            formIsValid = false;
        }

        if (!formIsValid) {
            return;
        }

        try {
            const response = await fetch(
                "/api/users/login",

                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        identifier: identifier,
                        password: password
                    })
                }
            );

            const result =
                await response.json();

            if (!response.ok) {
                serverError.textContent =
                    result.message;

                return;
            }

            window.location.href =
                "feed.html";

        } catch (error) {
            serverError.textContent =
                "Could not connect to the server.";
        }
    }
);