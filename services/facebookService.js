async function publishPostToFacebookPage(post) {
    const pageId =
        process.env.FACEBOOK_PAGE_ID;

    const pageAccessToken =
        process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

    const apiVersion =
        process.env.FACEBOOK_API_VERSION || "v26.0";

    const publicBaseUrl =
        process.env.PUBLIC_BASE_URL || "";

    if (!pageId || !pageAccessToken) {
        console.log(
            "Facebook publish skipped: missing FACEBOOK_PAGE_ID or FACEBOOK_PAGE_ACCESS_TOKEN."
        );

        return {
            success: false,
            skipped: true,
            message: "Facebook Page details are missing."
        };
    }

    let message =
        "New post was published on InstagramProject2026.";

    if (post.caption && post.caption.trim() !== "") {
        message += "\n\n" + post.caption.trim();
    }

    if (post.author && post.author.username) {
        message += "\n\nPosted by: " + post.author.username;
    }

    if (
        publicBaseUrl !== "" &&
        !publicBaseUrl.includes("localhost")
    ) {
        message +=
            "\n\nView post: " +
            publicBaseUrl +
            "/share/post/" +
            post._id;
    }

    const url =
        "https://graph.facebook.com/" +
        apiVersion +
        "/" +
        pageId +
        "/feed";

    const body =
        new URLSearchParams();

    body.append(
        "message",
        message
    );

    body.append(
        "access_token",
        pageAccessToken
    );

    try {
        const response =
            await fetch(
                url,
                {
                    method: "POST",
                    body: body
                }
            );

        const result =
            await response.json();

        if (!response.ok) {
            console.log(
                "Facebook publish failed:",
                result
            );

            return {
                success: false,
                skipped: false,
                error: result
            };
        }

        console.log(
            "Facebook publish succeeded:",
            result
        );

        return {
            success: true,
            facebookPost: result
        };

    } catch (error) {
        console.log(
            "Facebook publish request crashed:",
            error.message
        );

        return {
            success: false,
            skipped: false,
            message: error.message
        };
    }
}

module.exports = {
    publishPostToFacebookPage
};