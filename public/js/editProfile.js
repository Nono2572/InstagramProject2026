document.addEventListener("DOMContentLoaded", async () => {

    const message = document.getElementById("message");

    const user = await protectPage();

    if (!user) {
        return;
    }

    const usernameInput = document.getElementById("username");
    const emailInput = document.getElementById("email");

    usernameInput.value = user.username;
    emailInput.value = user.email;

    const form = document.getElementById("edit-profile-form");

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        try {

            const data = await apiRequest("/api/users/profile", {

                method: "PUT",

                body: JSON.stringify({

                    username: usernameInput.value.trim(),
                    email: emailInput.value.trim()

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