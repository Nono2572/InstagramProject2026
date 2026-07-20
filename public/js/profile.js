document.addEventListener("DOMContentLoaded", async () => {

    const message = document.getElementById("message");

    const user = await protectPage();

    if (!user) {
        return;
    }

    document.getElementById("username").textContent = user.username;
    document.getElementById("email").textContent = user.email;
    document.getElementById("user-id").textContent = user._id;

    document.getElementById("logout-btn").addEventListener("click", async () => {

        try {

            await apiRequest("/api/users/logout", {
                method: "POST"
            });

            window.location.href = "login.html";

        }

        catch (error) {

            showMessage(message, error.message);

        }

    });

    document.getElementById("delete-account-btn").addEventListener("click", async () => {

        const confirmDelete = confirm(
            "Are you sure you want to delete your account?"
        );

        if (!confirmDelete) {
            return;
        }

        try {

            await apiRequest("/api/users/delete", {
                method: "DELETE"
            });

            alert("Account deleted successfully.");

            window.location.href = "register.html";

        }

        catch (error) {

            showMessage(message, error.message);

        }

    });

});