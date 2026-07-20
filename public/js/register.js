document.addEventListener("DOMContentLoaded", () => {

    redirectLoggedUser();

    const registerForm = document.getElementById("register-form");
    const message = document.getElementById("message");

    registerForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        message.textContent = "";

        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        try {

            const data = await apiRequest("/api/users/register", {
                method: "POST",
                body: JSON.stringify({
                    username,
                    email,
                    password
                })
            });

            showMessage(message, data.message, "success");

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);

        }

        catch (error) {

            showMessage(message, error.message);

        }

    });

});