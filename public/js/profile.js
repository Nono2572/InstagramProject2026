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

/* =========================================================
   STATISTICS ELEMENTS
   ========================================================= */

const postsOverTimeChart =
    document.getElementById(
        "posts-over-time-chart"
    );


const likesPerPostChart =
    document.getElementById(
        "likes-per-post-chart"
    );


const profileStatisticsMessage =
    document.getElementById(
        "profile-statistics-message"
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

        await loadProfileStatistics(
        user.id
        );

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

/* =========================================================
   CREATE POSTS OVER TIME DATA
   ========================================================= */

function createPostsOverTimeData(
    posts
) {

    const months = {};


    posts.forEach(
        function (post) {

            const date =
                new Date(
                    post.createdAt
                );


            const month =
                date.toLocaleDateString(
                    "en-US",
                    {
                        month: "short",
                        year: "numeric"
                    }
                );


            if (!months[month]) {
                months[month] = 0;
            }


            months[month]++;
        }
    );


    return Object.entries(
        months
    ).map(
        function (entry) {

            return {

                label:
                    entry[0],

                value:
                    entry[1]

            };
        }
    );
}

/* =========================================================
   CREATE LIKES PER POST DATA
   ========================================================= */

function createLikesPerPostData(
    posts
) {

    return posts.map(
        function (post, index) {

            return {

                label:
                    "Post " +
                    (index + 1),

                value:
                    post.likes || 0

            };
        }
    );
}

/* =========================================================
   DRAW BAR CHART
   ========================================================= */

function drawBarChart(
    container,
    data
) {

    /*
        Clear old graph
    */

    container.innerHTML = "";


    /*
        No data
    */

    if (data.length === 0) {

        container.innerHTML =
            "<p>No data yet.</p>";

        return;
    }


    const width = 450;
    const height = 280;


    const margin = {
        top: 20,
        right: 20,
        bottom: 50,
        left: 40
    };


    /*
        Create SVG
    */

    const svg =
        d3.select(
            container
        )

        .append("svg")

        .attr(
            "viewBox",
            "0 0 " +
            width +
            " " +
            height
        );


    /*
        X axis
    */

    const x =
        d3.scaleBand()

        .domain(
            data.map(
                function (item) {

                    return item.label;
                }
            )
        )

        .range([
            margin.left,
            width -
            margin.right
        ])

        .padding(0.25);


    /*
        Find highest value
    */

    const maximumValue =
        d3.max(
            data,
            function (item) {

                return item.value;
            }
        ) || 1;


    /*
        Y axis
    */

    const y =
        d3.scaleLinear()

        .domain([
            0,
            maximumValue
        ])

        .nice()

        .range([
            height -
            margin.bottom,

            margin.top
        ]);


    /*
        Draw bars
    */

    svg
        .selectAll(
            ".statistics-bar"
        )

        .data(data)

        .enter()

        .append("rect")

        .attr(
            "class",
            "statistics-bar"
        )

        .attr(
            "x",
            function (item) {

                return x(
                    item.label
                );
            }
        )

        .attr(
            "y",
            function (item) {

                return y(
                    item.value
                );
            }
        )

        .attr(
            "width",
            x.bandwidth()
        )

        .attr(
            "height",
            function (item) {

                return (
                    height -
                    margin.bottom -
                    y(
                        item.value
                    )
                );
            }
        )

        .attr(
            "rx",
            5
        );


    /*
        X axis
    */

    svg.append("g")

        .attr(
            "transform",
            "translate(0," +
            (
                height -
                margin.bottom
            ) +
            ")"
        )

        .call(
            d3.axisBottom(x)
        );


    /*
        Y axis
    */

    svg.append("g")

        .attr(
            "transform",
            "translate(" +
            margin.left +
            ",0)"
        )

        .call(
            d3.axisLeft(y)
                .ticks(5)
                .tickFormat(
                    d3.format("d")
                )
        );
}

/* =========================================================
   LOAD PROFILE STATISTICS
   ========================================================= */

async function loadProfileStatistics(
    userId
) {

    try {

        const response =
            await fetch(
                "/api/posts"
            );


        const result =
            await response.json();


        if (!response.ok) {

            profileStatisticsMessage.textContent =
                "Could not load statistics.";

            return;
        }

        const myPosts =
            result.posts.filter(
                function (post) {

                    return (
                        post.author &&
                        String(
                            post.author._id
                        ) ===
                        String(
                            userId
                        )
                    );
                }
            );


        const postsOverTimeData =
            createPostsOverTimeData(
                myPosts
            );


        const likesPerPostData =
            createLikesPerPostData(
                myPosts
            );


        drawBarChart(
            postsOverTimeChart,
            postsOverTimeData
        );


        drawBarChart(
            likesPerPostChart,
            likesPerPostData
        );


    } catch (error) {

        console.error(
            "Statistics error:",
            error
        );


        profileStatisticsMessage.textContent =
            "Could not load statistics.";
    }
}