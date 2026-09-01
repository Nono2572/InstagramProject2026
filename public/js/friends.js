const friendSearchInput = document.getElementById(
    "friend-search-input"
);

const friendSearchButton = document.getElementById(
    "friend-search-button"
);

const friendSearchResults = document.getElementById(
    "friend-search-results"
);

const friendRequestsList = document.getElementById(
    "friend-requests-list"
);

const sentFriendRequestsList = document.getElementById(
    "sent-friend-requests-list"
);

const friendsList = document.getElementById(
    "friends-list"
);

const friendsMessage = document.getElementById(
    "friends-message"
);

let friendIds = new Set();
let incomingRequestIds = new Set();
let sentRequestIds = new Set();

function setFriendsMessage(message, isError) {
    friendsMessage.textContent = message;
    friendsMessage.className = "user-page-message";

    if (message === "") {
        return;
    }

    friendsMessage.classList.add(
        isError ? "error" : "success"
    );
}

function createUserRow(user, buttons) {
    const row = document.createElement("div");
    row.className = "friend-user-row";

    const info = document.createElement("div");
    info.className = "friend-user-info";

    const image = document.createElement("img");
    image.src = user.profileImage || "images/BlankProfile.jpg";
    image.alt = user.username + " profile picture";

    const text = document.createElement("div");

    const username = document.createElement("strong");
    username.textContent = "@" + user.username;

    const fullName = document.createElement("p");
    fullName.textContent = user.fullName || "";

    text.appendChild(username);
    text.appendChild(fullName);

    info.appendChild(image);
    info.appendChild(text);

    const actions = document.createElement("div");
    actions.className = "friend-user-actions";

    buttons.forEach(function (button) {
        actions.appendChild(button);
    });

    row.appendChild(info);
    row.appendChild(actions);

    return row;
}

function createActionButton(text, className, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    button.className = "friend-action-button " + className;

    button.addEventListener("click", onClick);

    return button;
}

async function loadFriends() {
    const response = await fetch("/api/users/friends");
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message);
    }

    friendIds = new Set(
        result.friends.map(function (user) {
            return user._id;
        })
    );

    friendsList.innerHTML = "";

    if (result.friends.length === 0) {
        friendsList.innerHTML =
            '<p class="friend-empty-message">No friends yet.</p>';
        return;
    }

    result.friends.forEach(function (user) {
        const removeButton = createActionButton(
            "Remove",
            "danger",
            function () {
                removeFriend(user._id);
            }
        );

        friendsList.appendChild(
            createUserRow(user, [removeButton])
        );
    });
}

async function loadFriendRequests() {
    const response = await fetch(
        "/api/users/friend-requests"
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message);
    }

    incomingRequestIds = new Set(
        result.friendRequests.map(function (user) {
            return user._id;
        })
    );

    friendRequestsList.innerHTML = "";

    if (result.friendRequests.length === 0) {
        friendRequestsList.innerHTML =
            '<p class="friend-empty-message">No incoming requests.</p>';
        return;
    }

    result.friendRequests.forEach(function (user) {
        const acceptButton = createActionButton(
            "Accept",
            "primary",
            function () {
                acceptFriendRequest(user._id);
            }
        );

        const rejectButton = createActionButton(
            "Reject",
            "secondary",
            function () {
                rejectFriendRequest(user._id);
            }
        );

        friendRequestsList.appendChild(
            createUserRow(
                user,
                [acceptButton, rejectButton]
            )
        );
    });
}

async function loadSentFriendRequests() {
    const response = await fetch(
        "/api/users/sent-friend-requests"
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message);
    }

    sentRequestIds = new Set(
        result.sentFriendRequests.map(function (user) {
            return user._id;
        })
    );

    sentFriendRequestsList.innerHTML = "";

    if (result.sentFriendRequests.length === 0) {
        sentFriendRequestsList.innerHTML =
            '<p class="friend-empty-message">No sent requests.</p>';
        return;
    }

    result.sentFriendRequests.forEach(function (user) {
        const cancelButton = createActionButton(
            "Cancel",
            "secondary",
            function () {
                cancelFriendRequest(user._id);
            }
        );

        sentFriendRequestsList.appendChild(
            createUserRow(user, [cancelButton])
        );
    });
}

async function refreshFriendData() {
    try {
        await Promise.all([
            loadFriends(),
            loadFriendRequests(),
            loadSentFriendRequests()
        ]);
    } catch (error) {
        setFriendsMessage(
            error.message || "Could not load friend data.",
            true
        );
    }
}

async function searchUsers() {
    const searchText = friendSearchInput.value.trim();

    setFriendsMessage("", false);
    friendSearchResults.innerHTML = "";

    if (searchText === "") {
        setFriendsMessage(
            "Enter a username or name to search.",
            true
        );
        return;
    }

    try {
        const response = await fetch(
            "/api/users/search?q=" +
            encodeURIComponent(searchText)
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        if (result.users.length === 0) {
            friendSearchResults.innerHTML =
                '<p class="friend-empty-message">No users found.</p>';
            return;
        }

        result.users.forEach(function (user) {
            const buttons = [];

            if (friendIds.has(user._id)) {
                const friendButton = createActionButton(
                    "Friends",
                    "disabled",
                    function () {}
                );
                friendButton.disabled = true;
                buttons.push(friendButton);
            } else if (incomingRequestIds.has(user._id)) {
                buttons.push(
                    createActionButton(
                        "Accept",
                        "primary",
                        function () {
                            acceptFriendRequest(user._id);
                        }
                    )
                );
            } else if (sentRequestIds.has(user._id)) {
                buttons.push(
                    createActionButton(
                        "Pending",
                        "disabled",
                        function () {}
                    )
                );
                buttons[0].disabled = true;
            } else {
                buttons.push(
                    createActionButton(
                        "Add friend",
                        "primary",
                        function () {
                            sendFriendRequest(user._id);
                        }
                    )
                );
            }

            friendSearchResults.appendChild(
                createUserRow(user, buttons)
            );
        });
    } catch (error) {
        setFriendsMessage(
            error.message || "Could not search users.",
            true
        );
    }
}

async function sendFriendRequest(userId) {
    await runFriendAction(
        "/api/users/" + userId + "/friend-request",
        "POST"
    );
}

async function cancelFriendRequest(userId) {
    await runFriendAction(
        "/api/users/" + userId + "/friend-request",
        "DELETE"
    );
}

async function acceptFriendRequest(userId) {
    await runFriendAction(
        "/api/users/friend-requests/" +
        userId +
        "/accept",
        "POST"
    );
}

async function rejectFriendRequest(userId) {
    await runFriendAction(
        "/api/users/friend-requests/" + userId,
        "DELETE"
    );
}

async function removeFriend(userId) {
    await runFriendAction(
        "/api/users/friends/" + userId,
        "DELETE"
    );
}

async function runFriendAction(url, method) {
    try {
        const response = await fetch(url, {
            method: method
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        setFriendsMessage(result.message, false);

        await refreshFriendData();

        if (friendSearchInput.value.trim() !== "") {
            await searchUsers();
        }
    } catch (error) {
        setFriendsMessage(
            error.message || "Friend action failed.",
            true
        );
    }
}

friendSearchButton.addEventListener(
    "click",
    searchUsers
);

friendSearchInput.addEventListener(
    "keydown",
    function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            searchUsers();
        }
    }
);

refreshFriendData();