/* =========================================================
   GROUP PAGE
   ========================================================= */

const parameters =
    new URLSearchParams(
        window.location.search
    );


const groupId =
    parameters.get("id");


let currentUserId = "";
let currentGroup = null;



/* =========================================================
   ELEMENTS
   ========================================================= */

const groupPageMessage =
    document.getElementById(
        "group-page-message"
    );


const groupHeaderCard =
    document.getElementById(
        "group-header-card"
    );


const groupBody =
    document.getElementById(
        "group-body"
    );


const groupName =
    document.getElementById(
        "group-name"
    );


const groupDescription =
    document.getElementById(
        "group-description"
    );


const groupCategory =
    document.getElementById(
        "group-category"
    );


const groupLocation =
    document.getElementById(
        "group-location"
    );

    const groupLocationSection =
    document.getElementById(
        "group-location-section"
    );


const groupMap =
    document.getElementById(
        "group-map"
    );


const groupMapWrapper =
    document.getElementById(
        "group-map-wrapper"
    );


const groupMapEmpty =
    document.getElementById(
        "group-map-empty"
    );


const groupMapAddress =
    document.getElementById(
        "group-map-address"
    );


const changeGroupLocationButton =
    document.getElementById(
        "change-group-location-button"
    );

const groupMemberCount =
    document.getElementById(
        "group-member-count"
    );


const groupOwnerName =
    document.getElementById(
        "group-owner-name"
    );


const groupOwnerImage =
    document.getElementById(
        "group-owner-image"
    );


const groupWeather =
    document.getElementById(
        "group-weather"
    );


const membersHeadingCount =
    document.getElementById(
        "members-heading-count"
    );


const groupMembersList =
    document.getElementById(
        "group-members-list"
    );


const groupPostsList =
    document.getElementById(
        "group-posts-list"
    );


const groupPostCount =
    document.getElementById(
        "group-post-count"
    );



/* BUTTONS */

const joinGroupButton =
    document.getElementById(
        "join-group-button"
    );


const leaveGroupButton =
    document.getElementById(
        "leave-group-button"
    );


const editGroupButton =
    document.getElementById(
        "edit-group-button"
    );


const deleteGroupButton =
    document.getElementById(
        "delete-group-button"
    );



/* EDIT WINDOW */

const editGroupOverlay =
    document.getElementById(
        "edit-group-overlay"
    );


const editGroupForm =
    document.getElementById(
        "edit-group-form"
    );


const closeEditGroupButton =
    document.getElementById(
        "close-edit-group"
    );


const editGroupError =
    document.getElementById(
        "edit-group-error"
    );



/* =========================================================
   CURRENT USER
   ========================================================= */

async function loadCurrentUser() {

    try {

        const response =
            await fetch(
                "/api/users/me"
            );


        if (response.status === 401) {

            window.location.href =
                "login.html";

            return;
        }


        const result =
            await response.json();


        if (
            result.success &&
            result.user
        ) {

            currentUserId =
                String(
                    result.user._id ||
                    result.user.id ||
                    ""
                );
        }


    } catch (error) {

        console.error(
            "Could not load current user:",
            error
        );
    }
}



/* =========================================================
   LOAD GROUP
   ========================================================= */

async function loadGroup() {

    if (!groupId) {

        groupPageMessage.textContent =
            "No group was selected.";

        return;
    }


    try {

        const response =
            await fetch(
                "/api/groups/" +
                groupId
            );


        const result =
            await response.json();


        if (!response.ok) {

            groupPageMessage.textContent =
                result.message ||
                "Could not load group.";

            return;
        }


        currentGroup =
            result.group;


        displayGroup(
            currentGroup
        );


        loadGroupWeather(
            currentGroup
        );


        loadGroupPosts();


    } catch (error) {

        console.error(error);


        groupPageMessage.textContent =
            "Could not connect to the server.";
    }
}



/* =========================================================
   DISPLAY GROUP
   ========================================================= */

function displayGroup(group) {

    groupPageMessage.hidden = true;

    groupHeaderCard.hidden = false;
    groupBody.hidden = false;


    groupName.textContent =
        group.name;


    groupDescription.textContent =
        group.description ||
        "No description has been added yet.";


    groupCategory.textContent =
        group.category;


    groupLocation.textContent =
        group.location ||
        "No location";

    displayGroupMap(group);

    const members =
        group.members || [];


    groupMemberCount.textContent =
        members.length +
        (
            members.length === 1
                ? " member"
                : " members"
        );


    membersHeadingCount.textContent =
        groupMemberCount.textContent;



    /* OWNER */

    if (group.owner) {

        groupOwnerName.textContent =
            "@" +
            group.owner.username;


        groupOwnerImage.src =
            group.owner.profileImage ||
            "images/BlankProfile.jpg";
    }



    displayMembers(
        members
    );


    updateGroupButtons();
}

/* =========================================================
   GROUP LOCATION MAP
   ========================================================= */

function displayGroupMap(group) {

    groupLocationSection.hidden =
        false;


    const location =
        String(
            group.location || ""
        ).trim();


    /*
        No location was saved
        in MongoDB.
    */

    if (location === "") {

        groupMapAddress.textContent =
            "No address has been added.";


        groupMapWrapper.hidden =
            true;


        groupMapEmpty.hidden =
            false;


        groupMap.removeAttribute(
            "src"
        );


        return;
    }


    /*
        Show the address that came
        from MongoDB.
    */

    groupMapAddress.textContent =
        location;


    groupMapEmpty.hidden =
        true;


    groupMapWrapper.hidden =
        false;


    /*
        Send the address to Google Maps.

        encodeURIComponent is important
        because addresses contain spaces,
        commas, etc.
    */

    const encodedLocation =
        encodeURIComponent(
            location
        );


    groupMap.src =
        "https://maps.google.com/maps?q=" +
        encodedLocation +
        "&z=14&output=embed";
}

/* =========================================================
   MEMBERS
   ========================================================= */

function displayMembers(members) {

    groupMembersList.innerHTML = "";


    if (members.length === 0) {

        groupMembersList.innerHTML =
            "<p>No members yet.</p>";

        return;
    }


    members.forEach(
        function (member) {

            const memberRow =
                document.createElement(
                    "div"
                );


            memberRow.classList.add(
                "group-member-row"
            );


            const image =
                member.profileImage ||
                "images/BlankProfile.jpg";


            memberRow.innerHTML = `

                <img
                    src="${image}"
                    alt="${member.username}"
                >

                <div>
                    <strong>
                        @${member.username}
                    </strong>

                    <p>
                        ${member.fullName || ""}
                    </p>
                </div>
            `;


            groupMembersList.appendChild(
                memberRow
            );
        }
    );
}



/* =========================================================
   MEMBERSHIP / OWNER BUTTONS
   ========================================================= */

function updateGroupButtons() {

    if (!currentGroup) {
        return;
    }


    const ownerId =
        currentGroup.owner &&
        currentGroup.owner._id
            ? String(
                currentGroup.owner._id
            )
            : "";


    const isOwner =
        ownerId === currentUserId;


    const isMember =
        currentGroup.members.some(
            function (member) {

                const memberId =
                    member._id ||
                    member.id ||
                    member;

                return (
                    String(memberId) ===
                    currentUserId
                );
            }
        );


    joinGroupButton.hidden = true;
    leaveGroupButton.hidden = true;
    editGroupButton.hidden = true;
    deleteGroupButton.hidden = true;
    changeGroupLocationButton.hidden = true;

    if (isOwner) {

        editGroupButton.hidden = false;
        deleteGroupButton.hidden = false;
        changeGroupLocationButton.hidden = false;

        return;
    }


    if (isMember) {

        leaveGroupButton.hidden = false;

    } else {

        joinGroupButton.hidden = false;
    }
}



/* =========================================================
   JOIN GROUP
   ========================================================= */

joinGroupButton.addEventListener(
    "click",

    async function () {

        try {

            const response =
                await fetch(
                    "/api/groups/" +
                    groupId +
                    "/join",
                    {
                        method: "POST"
                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                alert(
                    result.message ||
                    "Could not join group."
                );

                return;
            }


            await loadGroup();


        } catch (error) {

            alert(
                "Could not connect to the server."
            );
        }
    }
);



/* =========================================================
   LEAVE GROUP
   ========================================================= */

leaveGroupButton.addEventListener(
    "click",

    async function () {

        const shouldLeave =
            confirm(
                "Are you sure you want to leave this group?"
            );


        if (!shouldLeave) {
            return;
        }


        try {

            const response =
                await fetch(
                    "/api/groups/" +
                    groupId +
                    "/leave",
                    {
                        method: "POST"
                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                alert(
                    result.message ||
                    "Could not leave group."
                );

                return;
            }


            await loadGroup();


        } catch (error) {

            alert(
                "Could not connect to the server."
            );
        }
    }
);



/* =========================================================
   WEATHER
   ========================================================= */

async function loadGroupWeather(group) {

    if (!group.location) {

        groupWeather.textContent =
            "Weather unavailable";

        return;
    }


    try {

        const response =
            await fetch(
                "/api/weather?city=" +
                encodeURIComponent(
                    group.location
                )
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.weather
        ) {

            groupWeather.textContent =
                "Weather unavailable";

            return;
        }


        groupWeather.textContent =
            result.weather.temperature_2m +
            " °C";


    } catch (error) {

        groupWeather.textContent =
            "Weather unavailable";
    }
}



/* =========================================================
   GROUP POSTS
   ========================================================= */

async function loadGroupPosts() {

    try {

        const response =
            await fetch(
                "/api/posts"
            );


        const result =
            await response.json();


        if (!response.ok) {

            groupPostsList.innerHTML =
                "<p>Could not load posts.</p>";

            return;
        }


        const posts =
            result.posts.filter(
                function (post) {

                    if (!post.group) {
                        return false;
                    }


                    const postGroupId =
                        post.group._id ||
                        post.group.id ||
                        post.group;


                    return (
                        String(postGroupId) ===
                        String(groupId)
                    );
                }
            );


        displayGroupPosts(
            posts
        );


    } catch (error) {

        console.error(error);

        groupPostsList.innerHTML =
            "<p>Could not load posts.</p>";
    }
}



/* =========================================================
   DISPLAY POSTS
   ========================================================= */

function displayGroupPosts(posts) {

    groupPostsList.innerHTML = "";


    groupPostCount.textContent =
        posts.length +
        (
            posts.length === 1
                ? " post"
                : " posts"
        );


    if (posts.length === 0) {

        groupPostsList.innerHTML = `

            <div class="group-no-posts">

                <i class="bi bi-images"></i>

                <h3>
                    No posts yet
                </h3>

                <p>
                    This group does not have
                    any posts yet.
                </p>

            </div>
        `;

        return;
    }


    posts.forEach(
        function (post) {

            const postElement =
                document.createElement(
                    "article"
                );


            postElement.classList.add(
                "group-post-card"
            );


            const username =
                post.author &&
                post.author.username
                    ? post.author.username
                    : "Unknown";


            const profileImage =
                post.author &&
                post.author.profileImage
                    ? post.author.profileImage
                    : "images/BlankProfile.jpg";


            /* HEADER */

            const header =
                document.createElement(
                    "div"
                );


            header.classList.add(
                "group-post-header"
            );


            header.innerHTML = `

                <img
                    src="${profileImage}"
                    alt="${username}"
                >

                <div>
                    <strong>
                        @${username}
                    </strong>

                    <p>
                        ${post.location || ""}
                    </p>
                </div>
            `;


            postElement.appendChild(
                header
            );


            /* IMAGE */

            if (
                post.postType === "image" &&
                post.mediaUrl
            ) {

                const image =
                    document.createElement(
                        "img"
                    );


                image.classList.add(
                    "group-post-image"
                );


                image.src =
                    post.mediaUrl;


                postElement.appendChild(
                    image
                );
            }


            /* VIDEO */

            if (
                post.postType === "video" &&
                post.mediaUrl
            ) {

                const video =
                    document.createElement(
                        "video"
                    );


                video.classList.add(
                    "group-post-video"
                );


                video.src =
                    post.mediaUrl;


                video.controls = true;


                postElement.appendChild(
                    video
                );
            }


            /* TEXT */

            if (
                post.postType === "text"
            ) {

                const text =
                    document.createElement(
                        "div"
                    );


                text.classList.add(
                    "group-text-post"
                );


                text.textContent =
                    post.caption || "";


                postElement.appendChild(
                    text
                );
            }


            /* CAPTION */

            if (
                post.postType !== "text" &&
                post.caption
            ) {

                const caption =
                    document.createElement(
                        "p"
                    );


                caption.classList.add(
                    "group-post-caption"
                );


                caption.innerHTML =
                    "<strong>@" +
                    username +
                    "</strong> " +
                    post.caption;


                postElement.appendChild(
                    caption
                );
            }


            groupPostsList.appendChild(
                postElement
            );
        }
    );
}



/* =========================================================
   EDIT GROUP
   ========================================================= */

editGroupButton.addEventListener(
    "click",

    function () {

        document.getElementById(
            "edit-group-name"
        ).value =
            currentGroup.name;


        document.getElementById(
            "edit-group-description"
        ).value =
            currentGroup.description || "";


        document.getElementById(
            "edit-group-category"
        ).value =
            currentGroup.category;


        document.getElementById(
            "edit-group-location"
        ).value =
            currentGroup.location || "";


        editGroupError.textContent = "";


        editGroupOverlay.classList.add(
            "visible"
        );
    }
);

changeGroupLocationButton.addEventListener(
    "click",

    function () {
        editGroupButton.click();

        setTimeout(
            function () {

                document
                    .getElementById(
                        "edit-group-location"
                    )
                    .focus();

            },
            0
        );
    }
);

closeEditGroupButton.addEventListener(
    "click",

    function () {

        editGroupOverlay.classList.remove(
            "visible"
        );
    }
);



editGroupOverlay.addEventListener(
    "click",

    function (event) {

        if (
            event.target ===
            editGroupOverlay
        ) {

            editGroupOverlay.classList.remove(
                "visible"
            );
        }
    }
);



editGroupForm.addEventListener(
    "submit",

    async function (event) {

        event.preventDefault();


        const body = {

            name:
                document.getElementById(
                    "edit-group-name"
                ).value.trim(),

            description:
                document.getElementById(
                    "edit-group-description"
                ).value.trim(),

            category:
                document.getElementById(
                    "edit-group-category"
                ).value.trim(),

            location:
                document.getElementById(
                    "edit-group-location"
                ).value.trim()
        };


        try {

            const response =
                await fetch(
                    "/api/groups/" +
                    groupId,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                body
                            )
                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                editGroupError.textContent =
                    result.message ||
                    "Could not update group.";

                return;
            }


            editGroupOverlay.classList.remove(
                "visible"
            );


            await loadGroup();


        } catch (error) {

            editGroupError.textContent =
                "Could not connect to server.";
        }
    }
);



/* =========================================================
   DELETE GROUP
   ========================================================= */

deleteGroupButton.addEventListener(
    "click",

    async function () {

        const shouldDelete =
            confirm(
                "Delete this group permanently?"
            );


        if (!shouldDelete) {
            return;
        }


        try {

            const response =
                await fetch(
                    "/api/groups/" +
                    groupId,
                    {
                        method: "DELETE"
                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                alert(
                    result.message ||
                    "Could not delete group."
                );

                return;
            }


            window.location.href =
                "groups.html";


        } catch (error) {

            alert(
                "Could not connect to server."
            );
        }
    }
);



/* =========================================================
   START PAGE
   ========================================================= */

async function initializeGroupPage() {

    await loadCurrentUser();

    await loadGroup();
}


initializeGroupPage();