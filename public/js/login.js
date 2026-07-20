document.addEventListener("DOMContentLoaded", () => {

    redirectLoggedUser();

    const loginForm = document.getElementById("login-form");
    const message = document.getElementById("message");

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        message.textContent = "";

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;

        try {

            const data = await apiRequest("/api/users/login", {
                method: "POST",
                body: JSON.stringify({
                    username,
                    password
                })
            });

            showMessage(message, data.message, "success");

            setTimeout(() => {
                window.location.href = "profile.html";
            }, 1000);

        }

        catch (error) {

            showMessage(message, error.message);

        }

    });

});