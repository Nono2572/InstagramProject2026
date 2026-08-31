const groupsList =
    document.getElementById("groups-list");

const groupsError =
    document.getElementById("groups-error");

const searchForm =
    document.getElementById(
        "group-search-form"
    );

const createGroupForm =
    document.getElementById(
        "create-group-form"
    );

const createGroupError =
    document.getElementById(
        "create-group-error"
    );

const showAllButton =
    document.getElementById(
        "show-all-groups"
    );


async function loadGroups() {
    try {
        groupsError.textContent = "";

        const response = await fetch(
            "/api/groups"
        );

        const result =
            await response.json();

        if (!response.ok) {
            groupsError.textContent =
                result.message;

            return;
        }

        displayGroups(result.groups);

    } catch (error) {
        console.error(error);

        groupsError.textContent =
            "Could not load groups.";
    }
}


function displayGroups(groups) {

    groupsList.innerHTML = "";

    if (groups.length === 0) {
        groupsList.innerHTML =
            "<p>No groups found.</p>";

        return;
    }

    groups.forEach(function (group) {

        const groupElement =
            document.createElement("div");

        groupElement.classList.add(
            "group-card"
        );

        const ownerName =
            group.owner
                ? group.owner.username
                : "Unknown";

        groupElement.innerHTML = `
            <h3>${group.name}</h3>

            <p>
                ${group.description || ""}
            </p>

            <p>
                <strong>Category:</strong>
                ${group.category}
            </p>

            <p>
                <strong>Location:</strong>
                ${group.location || "Not specified"}
            </p>

            <p>
                <strong>Owner:</strong>
                ${ownerName}
            </p>

            <p>
                <strong>Members:</strong>
                ${group.members?.length || 0}
            </p>

            <button
                class="view-group-button"
                data-id="${group._id}"
            >
                View Group
            </button>
        `;

        groupsList.appendChild(
            groupElement
        );
    });
}


searchForm.addEventListener(
    "submit",

    async function (event) {

        event.preventDefault();

        groupsError.textContent = "";

        const name =
            document
                .getElementById(
                    "search-name"
                )
                .value
                .trim();

        const category =
            document
                .getElementById(
                    "search-category"
                )
                .value
                .trim();

        const location =
            document
                .getElementById(
                    "search-location"
                )
                .value
                .trim();

        const parameters =
            new URLSearchParams();

        if (name !== "") {
            parameters.append(
                "name",
                name
            );
        }

        if (category !== "") {
            parameters.append(
                "category",
                category
            );
        }

        if (location !== "") {
            parameters.append(
                "location",
                location
            );
        }

        try {

            const response =
                await fetch(
                    "/api/groups/search?" +
                    parameters.toString()
                );

            const result =
                await response.json();

            if (!response.ok) {
                groupsError.textContent =
                    result.message;

                return;
            }

            displayGroups(
                result.groups
            );

        } catch (error) {

            console.error(error);

            groupsError.textContent =
                "Could not search groups.";
        }
    }
);


showAllButton.addEventListener(
    "click",

    function () {

        document.getElementById(
            "search-name"
        ).value = "";

        document.getElementById(
            "search-category"
        ).value = "";

        document.getElementById(
            "search-location"
        ).value = "";

        loadGroups();
    }
);


groupsList.addEventListener(
    "click",

    function (event) {

        if (
            event.target.classList.contains(
                "view-group-button"
            )
        ) {
            const groupId =
                event.target.dataset.id;

            window.location.href =
                "/group.html?id=" +
                groupId;
        }
    }
);

createGroupForm.addEventListener(
    "submit",

    async function (event) {

        event.preventDefault();

        createGroupError.textContent = "";


        const name =
            document
                .getElementById(
                    "create-group-name"
                )
                .value
                .trim();


        const description =
            document
                .getElementById(
                    "create-group-description"
                )
                .value
                .trim();


        const category =
            document
                .getElementById(
                    "create-group-category"
                )
                .value
                .trim();


        const location =
            document
                .getElementById(
                    "create-group-location"
                )
                .value
                .trim();


        if (name === "") {
            createGroupError.textContent =
                "Group name is required.";

            return;
        }


        if (category === "") {
            createGroupError.textContent =
                "Category is required.";

            return;
        }


        try {

            const response =
                await fetch(
                    "/api/groups",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            name: name,
                            description: description,
                            category: category,
                            location: location
                        })
                    }
                );


            const result =
                await response.json();


            if (!response.ok) {
                createGroupError.textContent =
                    result.message;

                return;
            }


            // Clear the form
            createGroupForm.reset();


            // Reload the groups list
            loadGroups();

        } catch (error) {

            console.error(error);

            createGroupError.textContent =
                "Could not create the group.";
        }
    }
);

loadGroups();