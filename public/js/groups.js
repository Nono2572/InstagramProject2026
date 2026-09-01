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

            console.log(
                "Opening group:",
                groupId
            );

            window.location.href =
                "/group.html?id=" +
                groupId;
        }
    }
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

        groupsList.innerHTML = `
            <div class="groups-empty-state">

                <i class="bi bi-people"></i>

                <h3>
                    No groups found
                </h3>

                <p>
                    Try changing your search filters
                    or create a new group.
                </p>

            </div>
        `;

        return;
    }


    groups.forEach(function (group) {

        const groupElement =
            document.createElement("article");


        groupElement.classList.add(
            "group-card"
        );


        const ownerName =
            group.owner
                ? group.owner.username
                : "Unknown";


        const memberCount =
            group.members
                ? group.members.length
                : 0;


        groupElement.innerHTML = `

            <div class="group-card-top">

                <div class="group-card-icon">
                    <i class="bi bi-people-fill"></i>
                </div>


                <span class="group-card-category">
                    ${group.category}
                </span>

            </div>


            <h3>
                ${group.name}
            </h3>


            <p class="group-card-description">
                ${
                    group.description ||
                    "No description was provided."
                }
            </p>


            <div class="group-card-meta">

                <span>
                    <i class="bi bi-people"></i>

                    ${memberCount}
                    ${
                        memberCount === 1
                            ? "member"
                            : "members"
                    }
                </span>


                <span>
                    <i class="bi bi-geo-alt"></i>

                    ${
                        group.location ||
                        "No location"
                    }
                </span>

            </div>


            <div
                class="group-weather"
                id="weather-${group._id}"
            >
                <i class="bi bi-cloud-sun"></i>

                Loading weather...
            </div>


            <div class="group-card-footer">

                <span class="group-owner-text">

                    Created by
                    <strong>
                        @${ownerName}
                    </strong>

                </span>


                <button
                    type="button"
                    class="view-group-button"
                    data-id="${group._id}"
                >
                    View Group
                </button>

            </div>
        `;


        groupsList.appendChild(
            groupElement
        );


        loadGroupWeather(group);
    });
}

async function loadGroupWeather(group) {

    const weatherElement =
        document.getElementById(
            "weather-" + group._id
        );


    if (!group.location) {
        weatherElement.textContent =
            "Weather unavailable - no location.";

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


        if (!response.ok) {
            weatherElement.textContent =
                result.message;

            return;
        }


        const temperature =
            result.weather.temperature_2m;

        const description =
            weatherCodeToText(
                result.weather.weather_code
            );


        weatherElement.innerHTML = `
            <strong>Weather:</strong>
            ${temperature} °C,
            ${description}
        `;

    } catch (error) {

        console.error(
            "Weather error:",
            error
        );

        weatherElement.textContent =
            "Could not load weather.";
    }
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


            createGroupForm.reset();


            loadGroups();

        } catch (error) {

            console.error(error);

            createGroupError.textContent =
                "Could not create the group.";
        }
    }
);

async function loadWeather(city) {

    const weatherSection =
        document.getElementById(
            "weather-section"
        );

    const weatherError =
        document.getElementById(
            "weather-error"
        );

    weatherError.textContent = "";

    if (!city) {
        weatherError.textContent =
            "No location was specified for this group.";

        return;
    }

    try {

        const response =
            await fetch(
                "/api/weather?city=" +
                encodeURIComponent(city)
            );

        const result =
            await response.json();


        if (!response.ok) {
            weatherError.textContent =
                result.message;

            return;
        }


        document.getElementById(
            "weather-location"
        ).textContent =
            result.location.name +
            ", " +
            result.location.country;


        document.getElementById(
            "weather-temperature"
        ).textContent =
            result.weather.temperature_2m +
            " °C";


        document.getElementById(
            "weather-feels-like"
        ).textContent =
            result.weather.apparent_temperature +
            " °C";


        document.getElementById(
            "weather-humidity"
        ).textContent =
            result.weather.relative_humidity_2m +
            "%";


        document.getElementById(
            "weather-wind"
        ).textContent =
            result.weather.wind_speed_10m +
            " km/h";


        document.getElementById(
            "weather-description"
        ).textContent =
            weatherCodeToText(
                result.weather.weather_code
            );


        weatherSection.hidden = false;

    } catch (error) {

        console.error(error);

        weatherError.textContent =
            "Could not load weather.";
    }
}

function weatherCodeToText(code) {

    if (code === 0) {
        return "Clear sky";
    }

    if (
        code === 1 ||
        code === 2
    ) {
        return "Partly cloudy";
    }

    if (code === 3) {
        return "Overcast";
    }

    if (
        code === 45 ||
        code === 48
    ) {
        return "Fog";
    }

    if (
        code >= 51 &&
        code <= 57
    ) {
        return "Drizzle";
    }

    if (
        code >= 61 &&
        code <= 67
    ) {
        return "Rain";
    }

    if (
        code >= 71 &&
        code <= 77
    ) {
        return "Snow";
    }

    if (
        code >= 80 &&
        code <= 82
    ) {
        return "Rain showers";
    }

    if (
        code === 85 ||
        code === 86
    ) {
        return "Snow showers";
    }

    if (
        code >= 95
    ) {
        return "Thunderstorm";
    }

    return "Unknown";
}


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

            console.log(
                "Opening group:",
                groupId
            );

            window.location.href =
                "/group.html?id=" +
                groupId;
        }
    }
);

loadGroups();