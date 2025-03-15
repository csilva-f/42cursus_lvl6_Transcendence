let previousNotifications = [];

//? GET - /api/get-userinvitations/?userID=
async function fetchUserNotificationGame() {
  const userLang = localStorage.getItem("language") || "en";
  const langData = await getLanguageData(userLang);
  const accessToken = await JWT.getAccess();
  fetch("/templates/Components/Notification.html")
    .then((response) => {
      if (!response.ok)
        throw new Error("Network response was not ok " + response.statusText);
      return response.text();
    })
    .then((data) => {
      const APIurl = `/api/get-userinvitations`;
      $.ajax({
        type: "GET",
        url: APIurl,
        Accept: "application/json",
        contentType: "application/json",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        success: function (res) {
          const notificationDropdownMenu = document.getElementById(
            "notificationDropdownMenu"
          );
          notificationDropdownMenu.innerHTML = "";
          const currentNotifications = [];
          res.invitGames.forEach((element) => {
            if (element.statusID == 1) {
              const newCard = document.createElement("div");
              newCard.innerHTML = data;
              insertNotificationInfo(newCard, element, 0);
              notificationDropdownMenu.appendChild(newCard);
              currentNotifications.push(element.gameID);
            }
          });
          const APIurl = `/api/get-friendrequests/?sentToMe=true`;
          $.ajax({
            type: "GET",
            url: APIurl,
            Accept: "application/json",
            contentType: "application/json",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            success: function (res) {
              res.requests.forEach((element) => {
                if (element.statusID == 1) {
                  const newCard = document.createElement("div");
                  newCard.innerHTML = data;
                  insertNotificationInfo(newCard, element, 1);
                  notificationDropdownMenu.appendChild(newCard);
                  currentNotifications.push(element.gameID);
                }
              });
              const notificationCount =
                document.getElementById("notificationCount");
              if (currentNotifications.length > 0) {
                notificationCount.classList.remove("d-none");
                notificationCount.textContent = currentNotifications.length;
              } else {
                notificationCount.classList.add("d-none");
              }
              const hasNewNotifications =
                currentNotifications.length > 0 &&
                !currentNotifications.every((id) =>
                  previousNotifications.includes(id)
                );
              if (hasNewNotifications) {
                const notificationIcon =
                  document.getElementById("notificationIcon");
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

async function respondFriendRequest(friendID, statusID) {
  const userLang = localStorage.getItem("language") || "en";
  const langData = await getLanguageData(userLang);
  const APIurl = `/api/respond-friendrequest/`;
  const accessToken = await JWT.getAccess();
  let body = {
    user2ID: friendID,
    statusID: statusID,
  };
  $.ajax({
    type: "POST",
    url: APIurl,
    contentType: "application/json",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    data: JSON.stringify(body),
    success: function (res) {
      showSuccessToast(langData, langData.friendAccepted);
      fetchUserNotificationGame();
    },
    error: function (xhr, status, error) {
      showErrorToast(APIurl, error, langData);
    },
  });
}

function insertNotificationInfo(newCard, element, type) {
  const notificationMessage = newCard.querySelector("#notificationMessage");
  const notificationNickname = newCard.querySelector("#notificationNickname");
  const notificationIcon = newCard.querySelector("#notificationIcon");
  const notificationAccept = newCard.querySelector("#notificationAccept");
  const notificationDeny = newCard.querySelector("#notificationDeny");
  if (!type) {
    notificationMessage.textContent = "Game invitation";
    notificationNickname.textContent = element.user1Nick;
    notificationIcon.classList.remove("fa-question");
    notificationIcon.classList.add("fa-table-tennis-paddle-ball");
    notificationAccept.setAttribute("data-id", element.gameID);
    notificationAccept.setAttribute("data-type", 0);
    notificationDeny.setAttribute("data-id", element.gameID);
    notificationDeny.setAttribute("data-type", 0);
  } else {
    notificationMessage.textContent = "Friend Request"
    notificationNickname.textContent = element.userNick;
    notificationIcon.classList.remove("fa-question");
    notificationIcon.classList.add("fa-user-plus");
    notificationAccept.setAttribute("data-id", element.userID);
    notificationAccept.setAttribute("data-type", 1);
    notificationDeny.setAttribute("data-id", element.userID);
    notificationDeny.setAttribute("data-type", 1);
  }
}

async function notificationAccept(ID, type) {
  if  (type == '0')
    await acceptGameRequest(ID)
  else
    await respondFriendRequest(ID, 2)
}

async function notificationDeny(ID, type) {
    console.log("Deny")
    console.log("ID: ", ID, " Type: ", type)
}