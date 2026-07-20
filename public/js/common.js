async function apiRequest(url, options = {}) {

    const response = await fetch(url, {

        credentials: "same-origin",

        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        },

        ...options

    });

    const data = await response.json();

    if (!response.ok) {

        throw new Error(
            data.message || "Request failed."
        );

    }

    return data;

}

function showMessage(element, message, type = "error") {

    element.textContent = message;

    element.className = "message " + type;

}

async function protectPage() {

    try {

        const data = await apiRequest(
            "/api/users/session"
        );

        if (!data.loggedIn) {

            window.location.href = "login.html";

            return null;

        }

        return data.user;

    }

    catch {

        window.location.href = "login.html";

        return null;

    }

}

async function redirectLoggedUser() {

    try {

        const data = await apiRequest(
            "/api/users/session"
        );

        if (data.loggedIn) {

            window.location.href = "profile.html";

        }

    }

    catch {

        console.log("User is not logged in.");

    }

}