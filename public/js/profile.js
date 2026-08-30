const profileImage = document.getElementById(
    "profile-image"
);

const profileUsername = document.getElementById(
    "profile-username"
);

const profileFullName = document.getElementById(
    "profile-full-name"
);

const profileBio = document.getElementById(
    "profile-bio"
);

const profileEmail = document.getElementById(
    "profile-email"
);

const profileCreatedAt = document.getElementById(
    "profile-created-at"
);

const profileMessage = document.getElementById(
    "profile-message"
);

const deleteAccountButton =
    document.getElementById(
        "delete-account-button"
    );

const logoutButton = document.getElementById(
    "profile-logout-button"
);

async function loadProfile() {
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
            profileMessage.textContent =
                result.message;

            return;
        }

        const user = result.user;

        profileImage.src =
            user.profileImage ||
            "images/BlankProfile.jpg";

        profileUsername.textContent =
            "@" + user.username;

        profileFullName.textContent =
            user.fullName ||
            "No full name was added.";

        profileBio.textContent =
            user.bio ||
            "No bio was added.";

        profileEmail.textContent =
            user.email;

        profileCreatedAt.textContent =
            "Member since " +
            new Date(
                user.createdAt
            ).toLocaleDateString();

    } catch (error) {
        profileMessage.textContent =
            "Could not load the profile.";
    }
}

deleteAccountButton.addEventListener(
    "click",

    async function () {
        const shouldDelete =
            window.confirm(
                "Are you sure you want to delete your account?"
            );

        if (!shouldDelete) {
            return;
        }

        try {
            const response = await fetch(
                "/api/users/me",

                {
                    method: "DELETE"
                }
            );

            const result =
                await response.json();

            if (!response.ok) {
                profileMessage.textContent =
                    result.message;

                return;
            }

            window.location.href =
                "register.html";

        } catch (error) {
            profileMessage.textContent =
                "Could not delete the account.";
        }
    }
);

logoutButton.addEventListener(
    "click",

    async function () {
        try {
            await fetch(
                "/api/users/logout",

                {
                    method: "POST"
                }
            );

            window.location.href =
                "login.html";

        } catch (error) {
            profileMessage.textContent =
                "Could not log out.";
        }
    }
);

loadProfile();