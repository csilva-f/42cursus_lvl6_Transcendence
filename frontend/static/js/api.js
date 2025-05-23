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
          const notificationDropdownMenu = document.getElementById("notificationDropdownMenu");
          notificationDropdownMenu.innerHTML = "";
          const currentNotifications = [];
          res.requests.forEach((element) => {
            if (element.statusID == 1) {
              const newCard = document.createElement("div");
              newCard.innerHTML = data;
              insertNotificationInfo(newCard, element);
              notificationDropdownMenu.appendChild(newCard);
              currentNotifications.push(element.gameID);
            }
          });
          const notificationCount =
            document.getElementById("notificationCount");
          if (currentNotifications.length > 0) {
            notificationCount.classList.remove("d-none");
            notificationCount.textContent = currentNotifications.length;
            document.getElementById("noNotificationP").classList.add("d-none");
          } else {
            notificationCount.classList.add("d-none");
            document.getElementById("noNotificationP").classList.remove("d-none");
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
          showErrorToast(APIurl, error, langData);
        },
      });
    })
    .catch((error) => {
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
    success: async function (res) {
      if (statusID == 2) {
        showSuccessToast(langData, langData.friendAccepted);
        if (window.location.pathname == "/")
          await fetchHomeFriends();
      }
      else if (statusID == 3)
        showSuccessToast(langData, langData.friendDennied);
      fetchUserNotificationGame();
    },
    error: function (xhr, status, error) {
      showErrorToast(APIurl, error, langData);
    },
  });
}

function insertNotificationInfo(newCard, element) {
  const notificationNickname = newCard.querySelector("#notificationNickname");
  const notificationAccept = newCard.querySelector("#notificationAccept");
  const notificationDeny = newCard.querySelector("#notificationDeny");
  notificationNickname.textContent = element.userNick;
  notificationAccept.setAttribute("data-id", element.userID);
  notificationDeny.setAttribute("data-id", element.userID);
}

async function notificationAccept(ID) {
  await respondFriendRequest(ID, 2)
}

async function notificationDeny(ID) {
  await respondFriendRequest(ID, 3)
}

async function validatePathUser(userID) {
  const accessToken = await JWT.getAccess();
  APIurl = `/api/get-userextensions/?userID=${userID}`
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: APIurl,
      contentType: "application/json",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      success: function (res) {
        if (res.users.length == 0)
          resolve(false)
        else
          resolve(true)
      },
      error: function (xhr, status, error) {
        reject()
      },
    });
  });
}