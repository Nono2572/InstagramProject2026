/* Feed.js is the JavaScript page that controls code in feed page */

const openCreateButton = document.getElementById("open-create-post");
const closeCreateButton = document.getElementById("close-create-post");
const createPostOverlay = document.getElementById("create-post-overlay");
const createPostForm = document.getElementById("create-post-form");

const postTypeInput = document.getElementById("post-type");
const mediaInputSection = document.getElementById("media-input-section");
const mediaInput = document.getElementById("post-media");
const captionInput = document.getElementById("post-caption");
const locationInput = document.getElementById("post-location");
const postGroupInput = document.getElementById("post-group");
const groupId = postGroupInput.value;

const errorMessage = document.getElementById("create-post-error");
const successMessage = document.getElementById("new-post-message");
const postsContainer = document.getElementById("posts-container");
const noPostsMessage = document.getElementById("no-posts-message");

const instagramLogoLink = document.getElementById("instagram-logo-link");
const homeButton = document.getElementById("home-button");
const reelsButton = document.getElementById("reels-button");

const openSearchPanel = document.getElementById("open-search-panel");
const closeSearchPanel = document.getElementById("close-search-panel");
const searchOverlay = document.getElementById("search-overlay");
const postSearchInput = document.getElementById("post-search-input");
const postGroupFilter = document.getElementById("post-group-filter");
const postTypeFilter = document.getElementById("post-type-filter");
const searchResultsMessage = document.getElementById("search-results-message");
const applySearchButton = document.getElementById("apply-search-button");

let appliedSearchText = "";
let appliedPostType = "all";
let appliedGroupId = "all";
let currentUserId = "";

/* =========================================================
   HOME / INSTAGRAM LOGO
   ========================================================= */

instagramLogoLink.addEventListener("click", function (event) {
    event.preventDefault();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});


homeButton.addEventListener("click", function (event) {
    event.preventDefault();

    appliedSearchText = "";
    appliedPostType = "all";
    appliedGroupId = "all";

    postSearchInput.value = "";
    postTypeFilter.value = "all";
    postGroupFilter.value = "all";

    filterPosts();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});


/* =========================================================
   CREATE POST
   ========================================================= */

openCreateButton.addEventListener("click", function (event) {
    event.preventDefault();

    createPostOverlay.classList.add("visible");
});


closeCreateButton.addEventListener("click", function () {
    closeCreateWindow();
});


createPostOverlay.addEventListener("click", function (event) {
    if (event.target === createPostOverlay) {
        closeCreateWindow();
    }
});


postTypeInput.addEventListener("change", function () {
    const selectedType = postTypeInput.value;

    errorMessage.textContent = "";
    mediaInput.value = "";

    if (selectedType === "text") {
        mediaInputSection.style.display = "none";
        mediaInput.removeAttribute("required");
    } else {
        mediaInputSection.style.display = "block";
        mediaInput.setAttribute("required", "");

        if (selectedType === "image") {
            mediaInput.accept = "image/*";

            mediaInputSection
                .querySelector("label")
                .textContent = "Choose an image";
        } else {
            mediaInput.accept = "video/*";

            mediaInputSection
                .querySelector("label")
                .textContent = "Choose a video";
        }
    }
});

createPostForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const postType = postTypeInput.value;
    const caption = captionInput.value.trim();
    const location = locationInput.value.trim();
    const groupId = postGroupInput.value;
    const selectedFile = mediaInput.files[0];

    errorMessage.textContent = "";

    if (postType === "text" && caption === "") {
        errorMessage.textContent = "Please enter text for the post.";
        return;
    }

    if (postType !== "text" && !selectedFile) {
        errorMessage.textContent = "Please choose a media file.";
        return;
    }

    if (
        postType === "image" &&
        !selectedFile.type.startsWith("image/")
    ) {
        errorMessage.textContent = "Please choose a valid image file.";
        return;
    }

    if (
        postType === "video" &&
        !selectedFile.type.startsWith("video/")
    ) {
        errorMessage.textContent = "Please choose a valid video file.";
        return;
    }

    const formData = new FormData();

    formData.append("postType", postType);
    formData.append("caption", caption);
    formData.append("location", location);
    formData.append("group", groupId);

    if (selectedFile) {
        formData.append("media", selectedFile);
    }

    fetch("/api/posts", {
        method: "POST",
        body: formData
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
    if (!data.success) {
        errorMessage.textContent =
            data.message || "Could not save the post.";
        return;
    }

    const newPost =
        createPostElementFromDatabase(data.post);

    postsContainer.prepend(newPost);

    filterPosts();
    closeCreateWindow();
    showSuccessMessage();

    newPost.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
})
    .catch(function (error) {
        console.log("Create post frontend error:", error);

        errorMessage.textContent =
            "The post was saved, but the page could not display it. Check Console.";
            });
});

function createPostElement(postType, caption, selectedFile, location, groupId) {
    const post = document.createElement("div");

    post.classList.add("instagram-post");
    post.classList.add("newly-created-post");

    post.dataset.postType = postType;
    post.dataset.groupId = groupId; 

    /* Post header */

    const header = document.createElement("div");
    header.classList.add("post-header");


    /*
       The user-session.js file loads the logged-in user's
       real profile information into the feed.
       Here we read the values that already exist in the page.
    */

    const currentUserProfile =
        document.getElementById("current-user-profile");

    const currentUsername =
        document.getElementById("current-username");


    const profileImage = document.createElement("img");

    if (
        currentUserProfile &&
        currentUserProfile.src
    ) {
        profileImage.src = currentUserProfile.src;
    } else {
        profileImage.src = "images/BlankProfile.jpg";
    }


    const headerText = document.createElement("div");
    headerText.classList.add("post-user-info");


    const username = document.createElement("strong");

    if (
        currentUsername &&
        currentUsername.textContent.trim() !== ""
    ) {
        username.textContent =
            currentUsername.textContent.trim();
    } else {
        username.textContent = "college_user";
    }


    const locationText = document.createElement("p");

    if (location !== "") {
        locationText.textContent = location;

        headerText.append(
            username,
            locationText
        );
    } else {
        headerText.append(username);
    }


    const deleteButton =
        document.createElement("button");

    deleteButton.type = "button";
    deleteButton.classList.add(
        "delete-post-button"
    );

    deleteButton.innerHTML =
        '<i class="bi bi-trash"></i>';


    header.append(
        profileImage,
        headerText,
        deleteButton
    );

    post.appendChild(header);


    /* Image post */

    if (postType === "image") {
        const postImage =
            document.createElement("img");

        postImage.classList.add("post-image");

        postImage.src =
            URL.createObjectURL(selectedFile);

        postImage.alt =
            "Newly created post";

        post.appendChild(postImage);
    }


    /* Video post */

    if (postType === "video") {
        const postVideo =
            document.createElement("video");

        postVideo.classList.add("post-video");

        postVideo.src =
            URL.createObjectURL(selectedFile);

        postVideo.controls = true;

        post.appendChild(postVideo);
    }


    /* Text post */

    if (postType === "text") {
        const textPost =
            document.createElement("div");

        textPost.classList.add(
            "text-post-content"
        );

        textPost.textContent = caption;

        post.appendChild(textPost);
    }


    /* Actions */

    const actions =
        document.createElement("div");

    actions.classList.add("post-actions");

    actions.innerHTML = `
        <button type="button"
            class="like-button">♡</button>

        <button type="button"
            class="open-comments-window-button">💬</button>

        <button type="button"
            class="share-button">↗️</button>

        <span class="save-icon">▢</span>
    `;


    const likes =
        document.createElement("p");

    likes.classList.add("likes");

    likes.innerHTML =
        "<strong>0 likes</strong>";


    /* Caption */

    const captionParagraph =
        document.createElement("p");

    captionParagraph.classList.add(
        "caption"
    );


    const captionUsername =
        document.createElement("strong");


    if (
        currentUsername &&
        currentUsername.textContent.trim() !== ""
    ) {
        captionUsername.textContent =
            currentUsername.textContent.trim() + " ";
    } else {
        captionUsername.textContent =
            "college_user ";
    }


    captionParagraph.appendChild(
        captionUsername
    );


    /*
       A text-only post already displays
       the full text in its main area,
       so the caption is not repeated.
    */

    if (postType !== "text") {
        captionParagraph.appendChild(
            document.createTextNode(caption)
        );
    }


    /* Comments */

    const comments =
        document.createElement("p");

    comments.classList.add("comments");

    comments.textContent =
        "View all 0 comments";


    post.append(
        actions,
        likes
    );


    if (
        postType !== "text" &&
        caption !== ""
    ) {
        post.appendChild(
            captionParagraph
        );
    }


    post.appendChild(comments);


    addCommentSectionToPost(post);

    return post;
}

function createPostElementFromDatabase(postData) {
    const post = document.createElement("div");

    post.classList.add("instagram-post");
    post.classList.add("newly-created-post");

    post.dataset.postType = postData.postType;
    const databaseGroupId =
    postData.group && postData.group._id
        ? postData.group._id
        : postData.group || "";

    post.dataset.groupId = databaseGroupId.toString();
    post.dataset.postId = postData._id;

    const header = document.createElement("div");
    header.classList.add("post-header");

   const profileImage = document.createElement("img");

if (postData.author && postData.author.profileImage) {
    profileImage.src = postData.author.profileImage;
} else {
    profileImage.src = "images/BlankProfile.jpg";
}

    const headerText = document.createElement("div");
    headerText.classList.add("post-user-info");

    const username = document.createElement("strong");

    if (postData.author && postData.author.username) {
        username.textContent = postData.author.username;
    } else {
        username.textContent = "college_user";
    }

    const locationText = document.createElement("p");
    locationText.textContent = postData.location || "";

    headerText.append(username, locationText);

header.append(profileImage, headerText);

const authorId =
    postData.author && postData.author._id
        ? postData.author._id
        : postData.author && postData.author.id
            ? postData.author.id
            : postData.author || "";

console.log("Post author id:", authorId);
console.log("Current user id:", currentUserId);

if (authorId.toString() === currentUserId.toString()) {
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.classList.add("delete-post-button");
    deleteButton.innerHTML = '<i class="bi bi-trash"></i>';

    header.appendChild(deleteButton);
}

post.appendChild(header);

    if (postData.postType === "image") {
        const postImage = document.createElement("img");
        postImage.classList.add("post-image");
        postImage.src = postData.mediaUrl;
        postImage.alt = "Post image";

        post.appendChild(postImage);
    }

    if (postData.postType === "video") {
        const postVideo = document.createElement("video");
        postVideo.classList.add("post-video");
        postVideo.src = postData.mediaUrl;
        postVideo.controls = true;

        post.appendChild(postVideo);
    }

    if (postData.postType === "text") {
        const textPost = document.createElement("div");
        textPost.classList.add("text-post-content");
        textPost.textContent = postData.caption;

        post.appendChild(textPost);
    }

    const actions = document.createElement("div");
    actions.classList.add("post-actions");

    actions.innerHTML = `
        <button type="button" class="like-button">♡</button>
        <button type="button" class="open-comments-window-button">💬</button>
        <button type="button" class="share-button">↗️</button>
        <span class="save-icon">▢</span>
    `;

    const likes = document.createElement("p");
    likes.classList.add("likes");
    likes.innerHTML = "<strong>0 likes</strong>";

    const captionParagraph = document.createElement("p");
    captionParagraph.classList.add("caption");

    const captionUsername = document.createElement("strong");
    captionUsername.textContent = username.textContent + " ";

    captionParagraph.appendChild(captionUsername);
    captionParagraph.appendChild(
        document.createTextNode(postData.caption || "")
    );

    const comments = document.createElement("p");
    comments.classList.add("comments");
    comments.textContent = "0 comments";

    post.append(actions, likes);

    if (postData.caption !== "") {
        post.appendChild(captionParagraph);
    }

    post.appendChild(comments);

    return post;
}

function loadCurrentUserForFeed() {
    fetch("/api/users/me")
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if (data.success && data.user) {
                currentUserId =
                    data.user._id ||
                    data.user.id ||
                    "";
            }

            console.log("Current user id:", currentUserId);

            loadSavedPosts();
        })
        .catch(function (error) {
            console.log("Could not load current user:", error);
            loadSavedPosts();
        });
}

function loadSavedPosts() {
    fetch("/api/posts")
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if (!data.success) {
                console.log("Could not load posts.");
                return;
            }

            data.posts.forEach(function (postData) {
                const postElement =
                    createPostElementFromDatabase(postData);

                const firstStaticPost =
                    postsContainer.querySelector(".instagram-post");

                postsContainer.insertBefore(
                    postElement,
                    firstStaticPost
                );
            });

            filterPosts();
        })
        .catch(function (error) {
            console.log("Could not connect to posts API:", error);
        });
}

/* Close create-post window */

function closeCreateWindow() {
    createPostOverlay.classList.remove(
        "visible"
    );

    createPostForm.reset();

    postTypeInput.value = "image";
    postGroupInput.value = "";

    mediaInputSection.style.display =
        "block";

    mediaInput.accept = "image/*";

    mediaInput.setAttribute(
        "required",
        ""
    );

    mediaInputSection
        .querySelector("label")
        .textContent = "Choose an image";

    errorMessage.textContent = "";
}


/* Success message */

function showSuccessMessage() {
    successMessage.classList.add(
        "visible"
    );

    window.setTimeout(function () {
        successMessage.classList.remove(
            "visible"
        );
    }, 3000);
}


/* =========================================================
   DELETE POST
   ========================================================= */

postsContainer.addEventListener("click", function (event) {
    const deleteButton = event.target.closest(".delete-post-button");

    if (!deleteButton) {
        return;
    }

    const post = deleteButton.closest(".instagram-post");

    if (!post) {
        return;
    }

    const postId = post.dataset.postId;

    if (!postId) {
        alert("This post was not saved in the database, so it cannot be deleted from MongoDB.");
        return;
    }

    const shouldDelete = window.confirm(
        "Are you sure you want to delete this post?"
    );

    if (!shouldDelete) {
        return;
    }

    fetch("/api/posts/" + postId, {
        method: "DELETE"
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if (!data.success) {
                alert(data.message || "Could not delete the post.");
                return;
            }

            post.remove();
            filterPosts();
        })
        .catch(function () {
            alert("Could not connect to the server.");
        });
});


/* =========================================================
   SEARCH
   ========================================================= */

openSearchPanel.addEventListener(
    "click",
    function (event) {
        event.preventDefault();

        postSearchInput.value = appliedSearchText;
        postTypeFilter.value = appliedPostType;
        postGroupFilter.value = appliedGroupId;

        searchOverlay.classList.add(
            "visible"
        );

        postSearchInput.focus();
    }
);


applySearchButton.addEventListener("click", function () {
    appliedSearchText = postSearchInput.value.trim();

    appliedPostType = postTypeFilter.value;

    appliedGroupId = postGroupFilter.value;

    filterPosts();

    searchOverlay.classList.remove("visible");
});


closeSearchPanel.addEventListener(
    "click",
    function () {
        postSearchInput.value = appliedSearchText;

        postTypeFilter.value = appliedPostType;

        postGroupFilter.value = appliedGroupId;

        searchOverlay.classList.remove(
            "visible"
        );
    }
);


searchOverlay.addEventListener(
    "click",
    function (event) {
        if (event.target === searchOverlay) {
            postSearchInput.value = appliedSearchText;

            postTypeFilter.value = appliedPostType;

            postGroupFilter.value = appliedGroupId;

            searchOverlay.classList.remove(
                "visible"
            );
        }
    }
);


/* Filter posts */

function filterPosts() {
    const searchText =
        appliedSearchText.toLowerCase();

    const selectedType =
        appliedPostType;

    const selectedGroup =
    appliedGroupId;

    const allPosts =
        postsContainer.querySelectorAll(
            ".instagram-post"
        );

    let visiblePosts = 0;


    allPosts.forEach(function (post) {
        const postType =
            post.dataset.postType;

        const postGroupId = post.dataset.groupId || "";

        const postText =
            post.textContent.toLowerCase();

        const matchesText =
            searchText === "" ||
            postText.includes(searchText);

        const matchesType =
            selectedType === "all" ||
            postType === selectedType;

            const matchesGroup =
            selectedGroup === "all" ||
            selectedGroup === postGroupId ||
            (
                selectedGroup === "none" &&
                postGroupId === ""
            );

        if (
            matchesText && matchesType && matchesGroup
        ) {
            post.style.display = "";
            visiblePosts++;
        } else {
            post.style.display = "none";
        }
    });


        if (visiblePosts === 0) {
        searchResultsMessage.textContent =
            "No matching posts found.";

        if (selectedType === "video") {
            noPostsMessage.textContent =
                "No reels were found. Try creating a video post.";
        } else {
            noPostsMessage.textContent =
                "No posts matched your search or filter.";
        }

        noPostsMessage.classList.add("visible");
    } else {
        searchResultsMessage.textContent =
            visiblePosts + " matching post(s).";

        noPostsMessage.classList.remove("visible");
    }
}


reelsButton.addEventListener("click", function (event) {
    event.preventDefault();

    appliedSearchText = "";
    appliedPostType = "video";

    postSearchInput.value = appliedSearchText;
    postTypeFilter.value = appliedPostType;
    postGroupFilter.value = appliedGroupId;

    filterPosts();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});


/* =========================================================
   COMMENTS
   ========================================================= */

let activeCommentsPost = null;


const commentsOverlay =
    document.createElement("div");

commentsOverlay.id =
    "comments-overlay";

commentsOverlay.classList.add(
    "comments-overlay"
);


commentsOverlay.innerHTML = `
    <div class="comments-window">

        <div class="comments-window-header">

            <h2>Comments</h2>

            <button
                type="button"
                id="close-comments-window"
                class="close-comments-window">
                &times;
            </button>

        </div>

        <p
            id="comments-window-counter"
            class="comments-window-counter">
        </p>

        <div
            id="comments-window-list"
            class="comments-window-list">
        </div>

        <p
            id="comments-window-typing-message"
            class="typing-message">
            User is typing a comment...
        </p>

        <form
            id="comments-window-form"
            class="comment-form">

            <input
                type="text"
                id="comments-window-input"
                class="comment-input"
                placeholder="Write a comment...">

            <button
                type="submit"
                class="send-comment-button">
                Send
            </button>

        </form>

    </div>
`;


document.body.appendChild(
    commentsOverlay
);


const closeCommentsWindowButton =
    document.getElementById(
        "close-comments-window"
    );

const commentsWindowCounter =
    document.getElementById(
        "comments-window-counter"
    );

const commentsWindowList =
    document.getElementById(
        "comments-window-list"
    );

const commentsWindowForm =
    document.getElementById(
        "comments-window-form"
    );

const commentsWindowInput =
    document.getElementById(
        "comments-window-input"
    );

const commentsWindowTypingMessage =
    document.getElementById(
        "comments-window-typing-message"
    );


function addCommentSectionToPost(post) {
    if (
        post.querySelector(
            ".comments-feature"
        )
    ) {
        return;
    }

    const existingCommentsText =
        post.querySelector(".comments");

    let initialCommentsCount = 0;


    if (existingCommentsText) {
        const numberMatch =
            existingCommentsText
                .textContent
                .match(/\d+/);

        if (numberMatch) {
            initialCommentsCount =
                Number(numberMatch[0]);
        }

        existingCommentsText.style.display =
            "none";
    }


    post.dataset.commentsCount =
        initialCommentsCount;


    if (!post.commentsListData) {
        post.commentsListData = [];
    }


    const commentsFeature =
        document.createElement("div");

    commentsFeature.classList.add(
        "comments-feature"
    );


    const commentsCounter =
        document.createElement("span");

    commentsCounter.classList.add(
        "comments-counter"
    );

    commentsCounter.textContent =
        initialCommentsCount +
        " comments";


    const showCommentsButton =
        document.createElement("button");

    showCommentsButton.type =
        "button";

    showCommentsButton.classList.add(
        "show-comments-button"
    );

    showCommentsButton.textContent =
        "Show comments";


    commentsFeature.append(
        commentsCounter,
        showCommentsButton
    );


    post.appendChild(
        commentsFeature
    );
}


function updateCommentsCounter(post) {
    const commentsCounter =
        post.querySelector(
            ".comments-counter"
        );

    const commentsCount =
        Number(
            post.dataset.commentsCount
        );


    if (commentsCounter) {
        commentsCounter.textContent =
            commentsCount +
            " comments";
    }


    if (post === activeCommentsPost) {
        commentsWindowCounter.textContent =
            commentsCount +
            " comments";
    }
}


function renderCommentsWindow() {
    commentsWindowList.innerHTML = "";

    if (!activeCommentsPost) {
        return;
    }


    const comments =
        activeCommentsPost
            .commentsListData || [];


    if (comments.length === 0) {
        const emptyMessage =
            document.createElement("p");

        emptyMessage.classList.add(
            "empty-comments-message"
        );

        emptyMessage.textContent =
            "No new comments yet.";

        commentsWindowList.appendChild(
            emptyMessage
        );

        return;
    }


    comments.forEach(
        function (commentText) {
            const comment =
                document.createElement("p");

            comment.classList.add(
                "single-comment"
            );


            const username =
                document.createElement(
                    "strong"
                );

            const currentUsername =
                document.getElementById(
                    "current-username"
                );


            if (
                currentUsername &&
                currentUsername
                    .textContent
                    .trim() !== ""
            ) {
                username.textContent =
                    currentUsername
                        .textContent
                        .trim() +
                    " ";
            } else {
                username.textContent =
                    "college_user ";
            }


            comment.append(
                username,
                document.createTextNode(
                    commentText
                )
            );


            commentsWindowList.appendChild(
                comment
            );
        }
    );
}


function openCommentsWindow(post) {
    activeCommentsPost = post;

    commentsWindowInput.value = "";

    commentsWindowTypingMessage
        .classList.remove("visible");

    updateCommentsCounter(post);

    renderCommentsWindow();

    commentsOverlay.classList.add(
        "visible"
    );

    commentsWindowInput.focus();
}


function closeCommentsWindow() {
    commentsOverlay.classList.remove(
        "visible"
    );

    commentsWindowInput.value = "";

    commentsWindowTypingMessage
        .classList.remove("visible");

    activeCommentsPost = null;
}


function addCommentToActivePost(
    commentText
) {
    if (!activeCommentsPost) {
        return;
    }


    if (
        !activeCommentsPost
            .commentsListData
    ) {
        activeCommentsPost
            .commentsListData = [];
    }


    activeCommentsPost
        .commentsListData
        .push(commentText);


    activeCommentsPost
        .dataset
        .commentsCount =
        Number(
            activeCommentsPost
                .dataset
                .commentsCount
        ) + 1;


    updateCommentsCounter(
        activeCommentsPost
    );

    renderCommentsWindow();
}


/* Add comments functionality to existing posts */

postsContainer
    .querySelectorAll(
        ".instagram-post"
    )
    .forEach(function (post) {
        addCommentSectionToPost(post);
    });


/* Open comments */

postsContainer.addEventListener(
    "click",
    function (event) {
        const commentsIconButton =
            event.target.closest(
                ".open-comments-window-button"
            );

        const showCommentsButton =
            event.target.closest(
                ".show-comments-button"
            );


        if (
            !commentsIconButton &&
            !showCommentsButton
        ) {
            return;
        }


        const post =
            event.target.closest(
                ".instagram-post"
            );


        if (!post) {
            return;
        }


        openCommentsWindow(post);
    }
);


/* Submit comment */

commentsWindowForm.addEventListener(
    "submit",
    function (event) {
        event.preventDefault();

        const commentText =
            commentsWindowInput
                .value
                .trim();


        if (commentText === "") {
            return;
        }


        addCommentToActivePost(
            commentText
        );


        commentsWindowInput.value = "";

        commentsWindowTypingMessage
            .classList.remove(
                "visible"
            );

        commentsWindowInput.focus();
    }
);


/* Typing message */

commentsWindowInput.addEventListener(
    "input",
    function () {
        if (
            commentsWindowInput
                .value
                .trim() !== ""
        ) {
            commentsWindowTypingMessage
                .classList.add(
                    "visible"
                );
        } else {
            commentsWindowTypingMessage
                .classList.remove(
                    "visible"
                );
        }
    }
);


closeCommentsWindowButton
    .addEventListener(
        "click",
        function () {
            closeCommentsWindow();
        }
    );


commentsOverlay.addEventListener(
    "click",
    function (event) {
        if (
            event.target ===
            commentsOverlay
        ) {
            closeCommentsWindow();
        }
    }
);


/* =========================================================
   SECTION 1 - LIKE
   ========================================================= */

postsContainer.addEventListener(
    "click",
    function (event) {
        const likeButton =
            event.target.closest(
                ".like-button"
            );


        if (!likeButton) {
            return;
        }


        const post =
            likeButton.closest(
                ".instagram-post"
            );

        const likesText =
            post.querySelector(
                ".likes strong"
            );


        let currentLikes =
            parseInt(
                likesText.textContent
            );


        if (
            likeButton.classList.contains(
                "liked"
            )
        ) {
            likeButton.classList.remove(
                "liked"
            );

            likeButton.innerHTML = "♡";

            currentLikes--;
        } else {
            likeButton.classList.add(
                "liked"
            );

            likeButton.innerHTML = "♥️";

            currentLikes++;

            likeButton.classList.add(
                "like-effect"
            );


            window.setTimeout(
                function () {
                    likeButton.classList
                        .remove(
                            "like-effect"
                        );
                },
                300
            );
        }


        likesText.textContent =
            currentLikes +
            " likes";
    }
);


/* =========================================================
   SECTION 4 - LIGHT / DARK MODE
   ========================================================= */

const darkModeButton =
    document.getElementById(
        "dark-mode-button"
    );


darkModeButton.addEventListener(
    "click",
    function (event) {
        event.preventDefault();


        document.body.classList.toggle(
            "dark-mode"
        );


        if (
            document.body.classList
                .contains(
                    "dark-mode"
                )
        ) {
            darkModeButton
                .querySelector("span")
                .innerHTML =
                "Light mode";

            darkModeButton
                .querySelector("i")
                .className =
                "bi bi-sun";
        } else {
            darkModeButton
                .querySelector("span")
                .innerHTML =
                "Dark mode";

            darkModeButton
                .querySelector("i")
                .className =
                "bi bi-moon";
        }
    }
);


/* =========================================================
   SECTION 5 - BACK TO TOP
   ========================================================= */

const backToTopButton =
    document.getElementById(
        "back-to-top-button"
    );


window.onscroll = function () {
    if (window.scrollY > 300) {
        backToTopButton.classList.add(
            "visible"
        );
    } else {
        backToTopButton.classList.remove(
            "visible"
        );
    }
};


backToTopButton.addEventListener(
    "click",
    function () {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
);


/* =========================================================
   SECTION 10 - SHARE
   ========================================================= */

const shareOverlay =
    document.getElementById(
        "share-overlay"
    );

const closeShareWindow =
    document.getElementById(
        "close-share-window"
    );

const shareMessage =
    document.getElementById(
        "share-message"
    );


postsContainer.addEventListener(
    "click",
    function (event) {
        const shareButton =
            event.target.closest(
                ".share-button"
            );


        if (!shareButton) {
            return;
        }


        shareMessage.innerHTML = "";

        shareOverlay.classList.add(
            "visible"
        );
    }
);


closeShareWindow.addEventListener(
    "click",
    function () {
        shareOverlay.classList.remove(
            "visible"
        );
    }
);


shareOverlay.addEventListener(
    "click",
    function (event) {
        if (
            event.target ===
            shareOverlay
        ) {
            shareOverlay.classList.remove(
                "visible"
            );
        }
    }
);


const shareOptions =
    document.getElementsByClassName(
        "share-option"
    );


for (
    let i = 0;
    i < shareOptions.length;
    i++
) {
    shareOptions[i].onclick =
        function () {
            shareMessage.innerHTML =
                "Post shared successfully!";
        };
}


function loadSavedPosts() {
    fetch("/api/posts")
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if (!data.success) {
                console.log("Could not load posts.");
                return;
            }

            data.posts.forEach(function (postData) {
                const postElement =
                    createPostElementFromDatabase(postData);

                const firstStaticPost =
                    postsContainer.querySelector(".instagram-post");

                postsContainer.insertBefore(
                    postElement,
                    firstStaticPost
                );
            });

            filterPosts();
        })
        .catch(function (error) {
            console.log("Could not connect to posts API:", error);
        });
}

function loadCurrentUserForFeed() {
    fetch("/api/users/me")
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if (data.success && data.user) {
                currentUserId =
                    data.user._id ||
                    data.user.id ||
                    "";
            }

            loadSavedPosts();
        })
        .catch(function (error) {
            console.log("Could not load current user:", error);
            loadSavedPosts();
        });
}


function loadSavedPosts() {
    fetch("/api/posts")
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if (!data.success) {
                console.log("Could not load posts.");
                return;
            }

            const firstStaticPost =
                postsContainer.querySelector(".instagram-post:not(.newly-created-post)");

            data.posts.forEach(function (postData) {
                const postElement =
                    createPostElementFromDatabase(postData);

                postsContainer.insertBefore(
                    postElement,
                    firstStaticPost
                );
            });

            filterPosts();
        })
        .catch(function (error) {
            console.log("Could not connect to posts API:", error);
        });
}


function loadGroupsForCreatePost() {
    fetch("/api/groups")
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if (!data.success) {
                console.log("Could not load groups.");
                return;
            }

            /*
                Create-post group dropdown
            */

            postGroupInput.innerHTML = "";

            const noGroupCreateOption =
                document.createElement("option");

            noGroupCreateOption.value = "";
            noGroupCreateOption.textContent = "No group";

            postGroupInput.appendChild(noGroupCreateOption);


            /*
                Search/filter group dropdown
            */

            postGroupFilter.innerHTML = "";

            const allGroupsSearchOption =
                document.createElement("option");

            allGroupsSearchOption.value = "all";
            allGroupsSearchOption.textContent = "All groups";

            postGroupFilter.appendChild(allGroupsSearchOption);

            const noGroupSearchOption =
                document.createElement("option");

            noGroupSearchOption.value = "none";
            noGroupSearchOption.textContent = "No group";

            postGroupFilter.appendChild(noGroupSearchOption);


            /*
                Add real MongoDB groups to both dropdowns
            */

            data.groups.forEach(function (group) {
                const createOption =
                    document.createElement("option");

                createOption.value = group._id;
                createOption.textContent = group.name;

                postGroupInput.appendChild(createOption);


                const searchOption =
                    document.createElement("option");

                searchOption.value = group._id;
                searchOption.textContent = group.name;

                postGroupFilter.appendChild(searchOption);
            });
        })
        .catch(function (error) {
            console.log("Could not load groups:", error);
        });
}


loadGroupsForCreatePost();
loadCurrentUserForFeed();