const feedProfileLink = document.getElementById(
    "feed-profile-link"
);

const feedLogoutButton = document.getElementById(
    "feed-logout-button"
);

const currentUserProfile = document.getElementById(
    "current-user-profile"
);

const sidebarProfileImage = document.getElementById(
    "sidebar-profile-image"
);

const currentUsername = document.getElementById(
    "current-username"
);

const currentFullName = document.getElementById(
    "current-full-name"
);

async function loadCurrentUserIntoFeed() {
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
            return;
        }

        const user = result.user;

        if (currentUserProfile) {
            currentUserProfile.src =
                user.profileImage ||
                "images/BlankProfile.jpg";
        }

        if (sidebarProfileImage) {
            sidebarProfileImage.src =
                user.profileImage ||
                "images/BlankProfile.jpg";
        }

        if (currentUsername) {
            currentUsername.textContent =
                user.username;
        }

        if (currentFullName) {
            currentFullName.textContent =
                user.fullName ||
                "Student Account";
        }

    } catch (error) {
        console.error(
            "Could not load the current user."
        );
    }
}

if (feedProfileLink) {
    feedProfileLink.addEventListener(
        "click",

        function (event) {
            event.preventDefault();

            window.location.href =
                "profile.html";
        }
    );
}

if (feedLogoutButton) {
    feedLogoutButton.addEventListener(
        "click",

        async function (event) {
            event.preventDefault();

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
                console.error(
                    "Could not log out."
                );
            }
        }
    );
}

loadCurrentUserIntoFeed();