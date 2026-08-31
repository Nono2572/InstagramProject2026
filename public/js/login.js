const loginForm = document.getElementById(
    "login-form"
);

const usernameInput = document.getElementById(
    "login-username"
);

const passwordInput = document.getElementById(
    "login-password"
);

const usernameError = document.getElementById(
    "username-error"
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

        const username =
            usernameInput.value.trim();

        const password =
            passwordInput.value;

        let formIsValid = true;


        // Clear previous errors
        usernameError.textContent = "";
        passwordError.textContent = "";
        serverError.textContent = "";

        usernameInput.classList.remove(
            "input-error"
        );

        passwordInput.classList.remove(
            "input-error"
        );


        // Validate username
        if (username === "") {
            usernameError.textContent =
                "Please enter your username.";

            usernameInput.classList.add(
                "input-error"
            );

            formIsValid = false;
        }


        // Validate password
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
                        username: username,
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
                "/feed.html";

        } catch (error) {
            console.error(error);

            serverError.textContent =
                "Could not connect to the server.";
        }
    }
);