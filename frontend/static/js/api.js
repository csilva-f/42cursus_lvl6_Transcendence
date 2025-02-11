let previousNotifications = [];

//? GET - /api/get-userinvitations/?userID=
async function fetchUserNotificationGame() {
    const userLang = localStorage.getItem("language") || "en";
    const langData = await getLanguageData(userLang);
    fetch("/templates/Components/Notification.html")
        .then((response) => {
            if (!response.ok)
                throw new Error("Network response was not ok " + response.statusText);
            return response.text();
        })
        .then((data) => {
            const APIurl = `/api/get-userinvitations/?userID=${1}`;
            $.ajax({
                type: "GET",
                url: APIurl,
                Accept: "application/json",
                contentType: "application/json",
                headers: { Accept: "application/json" },
                success: function (res) {
                    const notificationDropdownMenu = document.getElementById("notificationDropdownMenu");
                    notificationDropdownMenu.innerHTML = "";
                    const currentNotifications = [];

                    res.invitGames.forEach((element) => {
                        if (element.user1ID == 1 && element.statusID == 1) {
                            const newCard = document.createElement("div");
                            newCard.innerHTML = data;
                            insertNotificationGameInfo(newCard, element);
                            notificationDropdownMenu.appendChild(newCard);
                            currentNotifications.push(element.gameID);
                        }
                    });
                    const notificationCount = document.getElementById("notificationCount")
                    if (currentNotifications.length > 0){
                        notificationCount.classList.remove("d-none");
                        notificationCount.textContent = currentNotifications.length;
                    } else {
                        notificationCount.classList.add("d-none");
                    }
                    const hasNewNotifications = currentNotifications.length > 0 && !currentNotifications.every(id => previousNotifications.includes(id));
                    if (hasNewNotifications) {
                        const notificationIcon = document.getElementById("notificationIcon");
                        notificationIcon.classList.add("fa-shake");
                        setTimeout(() => {
                            notificationIcon.classList.remove("fa-shake");
                        }, 1800);
                    }
                    previousNotifications = currentNotifications;
                    updateContent(langData);
                },
                error: function (xhr, status, error) {
                    console.error("Error Thrown:", error);
                    showErrorToast(APIurl, error, langData);
                },
            });
        })
        .catch((error) => {
            console.error("There was a problem with the fetch operation:", error);
        });
}

function insertNotificationGameInfo(newCard, element) {
    const notificationMessage = newCard.querySelector("#notificationMessage")
    notificationMessage.textContent = "Game invitation";
    const notificationNickname = newCard.querySelector("#notificationNickname")
    notificationNickname.textContent = element.user2ID;
    const notificationIcon = newCard.querySelector("#notificationIcon")
    notificationIcon.classList.remove("fa-question");
    //fa-user-plus
    notificationIcon.classList.add("fa-table-tennis-paddle-ball");
    const notificationAccept = newCard.querySelector("#notificationAccept")
    const notificationDeny = newCard.querySelector("#notificationDeny")
    notificationAccept.setAttribute("data-id", element.gameID);
    notificationDeny.setAttribute("data-id", element.gameID);
}