const parameters =
    new URLSearchParams(
        window.location.search
    );

const groupId =
    parameters.get("id");

console.log(
    "Group ID:",
    groupId
);