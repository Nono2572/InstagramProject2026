/*Feed.js is the javscript page that controls code in feed page*/
const openCreateButton = document.getElementById("open-create-post");
const closeCreateButton = document.getElementById("close-create-post");
const createPostOverlay = document.getElementById("create-post-overlay");
const createPostForm = document.getElementById("create-post-form");

const postTypeInput = document.getElementById("post-type");
const mediaInputSection = document.getElementById("media-input-section");
const mediaInput = document.getElementById("post-media");
const captionInput = document.getElementById("post-caption");
const locationInput = document.getElementById("post-location");

const errorMessage = document.getElementById("create-post-error");
const successMessage = document.getElementById("new-post-message");
const postsContainer = document.getElementById("posts-container");
const noPostsMessage =document.getElementById("no-posts-message");

const instagramLogoLink = document.getElementById("instagram-logo-link");
const homeButton = document.getElementById("home-button");

const currentUserProfile = document.getElementById("current-user-profile");
const sidebarProfileImage = document.getElementById("sidebar-profile-image");
sidebarProfileImage.src = currentUserProfile.src;

const openSearchPanel = document.getElementById("open-search-panel");
const closeSearchPanel = document.getElementById("close-search-panel");
const searchOverlay = document.getElementById("search-overlay");
const postSearchInput = document.getElementById("post-search-input");
const postTypeFilter = document.getElementById("post-type-filter");
const searchResultsMessage = document.getElementById("search-results-message");
const applySearchButton = document.getElementById("apply-search-button");
let appliedSearchText = "";
let appliedPostType = "all";

instagramLogoLink.addEventListener("click", function (event) {
    event.preventDefault();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

homeButton.addEventListener("click", function (event) {
    event.preventDefault();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});


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
            mediaInputSection.querySelector("label").textContent =
                "Choose an image";
        } else {
            mediaInput.accept = "video/*";
            mediaInputSection.querySelector("label").textContent =
                "Choose a video";
        }
    }
});


createPostForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const postType = postTypeInput.value;
    const caption = captionInput.value.trim();
    const location = locationInput.value.trim();
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

    const newPost = createPostElement(
        postType,
        caption,
        selectedFile,
        location
    );

    postsContainer.prepend(newPost);
    filterPosts();
    closeCreateWindow();
    showSuccessMessage();

    newPost.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
});


function createPostElement(postType, caption, selectedFile, location) {
    const post = document.createElement("div");
    post.classList.add("instagram-post");
    post.classList.add("newly-created-post");

    post.dataset.postType = postType;

    const header = document.createElement("div");
    header.classList.add("post-header");

   const currentUserProfile =
    document.getElementById("current-user-profile");

    const profileImage = document.createElement("img");
    profileImage.src = currentUserProfile.src;

    const headerText = document.createElement("div");
    headerText.classList.add("post-user-info");

    const username = document.createElement("strong");
    username.textContent = "college_user";

    const locationText = document.createElement("p");

if (location !== "") {
    locationText.textContent = location;
    headerText.append(username, locationText);
    }
    else {
    headerText.append(username);
    }
    const deleteButton = document.createElement("button");

    deleteButton.type = "button";
    deleteButton.classList.add("delete-post-button");
    deleteButton.innerHTML = '<i class="bi bi-trash"></i>';

    header.append(profileImage, headerText, deleteButton);

    post.appendChild(header);

    if (postType === "image") {
        const postImage = document.createElement("img");

        postImage.classList.add("post-image");
        postImage.src = URL.createObjectURL(selectedFile);
        postImage.alt = "Newly created post";

        post.appendChild(postImage);
    }

    if (postType === "video") {
        const postVideo = document.createElement("video");

        postVideo.classList.add("post-video");
        postVideo.src = URL.createObjectURL(selectedFile);
        postVideo.controls = true;

        post.appendChild(postVideo);
    }

    if (postType === "text") {
        const textPost = document.createElement("div");

        textPost.classList.add("text-post-content");
        textPost.textContent = caption;

        post.appendChild(textPost);
    }

    const actions = document.createElement("div");
    actions.classList.add("post-actions");

    actions.innerHTML = `
        <span>♡</span>
        <span>💬</span>
        <span>↗</span>
        <span class="save-icon">▢</span>
    `;

    const likes = document.createElement("p");
    likes.classList.add("likes");
    likes.innerHTML = "<strong>0 likes</strong>";

    const captionParagraph = document.createElement("p");
    captionParagraph.classList.add("caption");

    const captionUsername = document.createElement("strong");
    captionUsername.textContent = "college_user ";

    captionParagraph.appendChild(captionUsername);

    /*
        A text-only post already displays the full text in its main area.
        Its caption is not repeated beneathit
    */
    if (postType !== "text") {
        captionParagraph.appendChild(
            document.createTextNode(caption)
        );
    }

    const comments = document.createElement("p");
    comments.classList.add("comments");
    comments.textContent = "View all 0 comments";

    post.append(actions, likes);

    if (postType !== "text" && caption !== "") {
    post.appendChild(captionParagraph);
    }
    post.appendChild(comments);

    return post;
}


function closeCreateWindow() {
    createPostOverlay.classList.remove("visible");
    createPostForm.reset();

    postTypeInput.value = "image";
    mediaInputSection.style.display = "block";
    mediaInput.accept = "image/*";
    mediaInput.setAttribute("required", "");

    mediaInputSection.querySelector("label").textContent =
        "Choose an image";

    errorMessage.textContent = "";
}


function showSuccessMessage() {
    successMessage.classList.add("visible");

    window.setTimeout(function () {
        successMessage.classList.remove("visible");
    }, 3000); // message will disappear after 3 seconds. miliseconds are used here
}

postsContainer.addEventListener("click", function (event) {
    const deleteButton = event.target.closest(".delete-post-button");

    if (!deleteButton) {
        return;
    }

    const post = deleteButton.closest(".newly-created-post");

    if (!post) {
        return;
    }

    const shouldDelete = window.confirm(
        "Are you sure you want to delete this post?"
    );

    if (shouldDelete) {
        post.remove();
    }
});
// Search functionality
openSearchPanel.addEventListener("click", function (event) {
    event.preventDefault();

    postSearchInput.value = appliedSearchText;
    postTypeFilter.value = appliedPostType;

    searchOverlay.classList.add("visible");
    postSearchInput.focus();
});

applySearchButton.addEventListener("click", function () {
    appliedSearchText =
        postSearchInput.value.trim();

    appliedPostType =
        postTypeFilter.value;

    filterPosts();

    searchOverlay.classList.remove("visible");
});


closeSearchPanel.addEventListener("click", function () {
    postSearchInput.value = appliedSearchText;
    postTypeFilter.value = appliedPostType;

    searchOverlay.classList.remove("visible");
});


searchOverlay.addEventListener("click", function (event) {
    if (event.target === searchOverlay) {
        postSearchInput.value = appliedSearchText;
        postTypeFilter.value = appliedPostType;

        searchOverlay.classList.remove("visible");
    }
});

//Filter stuff
function filterPosts() {
    const searchText =
        appliedSearchText.toLowerCase();

    const selectedType =
        appliedPostType;

    const allPosts =
        postsContainer.querySelectorAll(".instagram-post");

    let visiblePosts = 0;

    allPosts.forEach(function (post) {
        const postType = post.dataset.postType;

        const postText =
            post.textContent.toLowerCase();

        const matchesText =
            searchText === "" ||
            postText.includes(searchText);

        const matchesType =
            selectedType === "all" ||
            postType === selectedType;

        if (matchesText && matchesType) {
            post.style.display = "";
            visiblePosts++;
        } else {
            post.style.display = "none";
        }
    });

    if (visiblePosts === 0) {
    searchResultsMessage.textContent =
        "No matching posts found.";

    noPostsMessage.classList.add("visible");
    } else {
    searchResultsMessage.textContent =
        visiblePosts + " matching post(s).";

    noPostsMessage.classList.remove("visible");
    }
}