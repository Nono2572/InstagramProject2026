const editProfileForm = document.getElementById(
    "edit-profile-form"
);

const fullNameInput = document.getElementById(
    "edit-full-name"
);

const usernameInput = document.getElementById(
    "edit-username"
);

const emailInput = document.getElementById(
    "edit-email"
);

const bioInput = document.getElementById(
    "edit-bio"
);

const profileImageInput = document.getElementById(
    "edit-profile-image"
);

const editProfileMessage =
    document.getElementById(
        "edit-profile-message"
    );

async function loadCurrentProfile() {
    try {
        const response = await fetch(
            "/api/users/me"
        );

        if (response.status === 401) {
            window.location.href =
                "login.html";

            return;
        }

        const result =
            await response.json();

        if (!response.ok) {
            editProfileMessage.textContent =
                result.message;

            return;
        }

        const user = result.user;

        fullNameInput.value =
            user.fullName || "";

        usernameInput.value =
            user.username || "";

        emailInput.value =
            user.email || "";

        bioInput.value =
            user.bio || "";


    } catch (error) {
        editProfileMessage.textContent =
            "Could not load the profile.";
    }
}

editProfileForm.addEventListener(
    "submit",

    async function (event) {
        event.preventDefault();

        const fullName =
            fullNameInput.value.trim();

        const username =
            usernameInput.value.trim();

        const email =
            emailInput.value.trim();

        const bio =
            bioInput.value.trim();

        editProfileMessage.textContent = "";

        editProfileMessage.className =
            "user-page-message";

        if (!isValidUsername(username)) {
            editProfileMessage.textContent =
                "Username must contain 3-20 letters, numbers, dots or underscores.";

            editProfileMessage.classList.add(
                "error"
            );

            return;
        }

        if (!isValidEmail(email)) {
            editProfileMessage.textContent =
                "Please enter a valid email address.";

            editProfileMessage.classList.add(
                "error"
            );

            return;
        }

        try {
            const formData = new FormData();

            formData.append(
                "fullName",
                fullNameInput.value.trim()
            );

            formData.append(
                "username",
                usernameInput.value.trim()
            );

            formData.append(
                "email",
                emailInput.value.trim()
            );

            formData.append(
                "bio",
                bioInput.value.trim()
            );

            if (profileImageInput.files[0]) {
                formData.append(
                    "profileImage",
                    profileImageInput.files[0]
                );
            }

            const response = await fetch("/api/users/me", {
                method: "PUT",
                body: formData
            });

            const result =
            await response.json();

            if (!response.ok) {
                editProfileMessage.textContent =
                    result.message;

                editProfileMessage.classList.add(
                    "error"
                );

                return;
            }

            editProfileMessage.textContent =
                "Profile updated successfully.";

            editProfileMessage.classList.add(
                "success"
            );

            window.setTimeout(
                function () {
                    window.location.href =
                        "profile.html";
                },
                1000
            );

        } catch (error) {
            editProfileMessage.textContent =
                "Could not connect to the server.";

            editProfileMessage.classList.add(
                "error"
            );
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

loadCurrentProfile();