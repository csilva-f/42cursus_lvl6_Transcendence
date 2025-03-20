async function fetchUsers() {
  const userLang = localStorage.getItem("language") || "en";
  const langData = await getLanguageData(userLang);
  const reloadIcon = document.getElementById("reloadIcon");
  reloadIcon.classList.add("rotate");
  setTimeout(() => {
    reloadIcon.classList.remove("rotate");
  }, 250);
  const accessToken = await JWT.getAccess();
  fetch("/templates/Components/CardUser.html")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.text();
    })
    .then((data) => {
      const APIurl = `/api/get-nonfriendslist/`;
      $.ajax({
        type: "GET",
        url: APIurl,
        contentType: "application/json",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        success: function (res) {
          if (!window.ws_os || window.ws_os.readyState !== WebSocket.OPEN) {
            console.warn("WebSocket not found or closed. Reinitializing...");
            initializeWebSocket(() => {
                requestOnlineUsers(function (onlineUsers) {
                    console.log("Updated online users list:", onlineUsers);
                    renderUserCards(res.nonFriendsList, data, onlineUsers, 1);
                });
            });
          } else {
            requestOnlineUsers(function (onlineUsers) {
                console.log("Updated online users list:", onlineUsers);
                renderUserCards(res.nonFriendsList, data, onlineUsers, 1);
            });
          }
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

function renderUserCards(usersList, cardTemplate, users_on, isNonFriends) {
  const divElement = document.getElementById("usersContent");
  divElement.innerHTML = "";

  usersList.forEach(element => {
      const newCard = document.createElement("div");
      newCard.id = "cardUserContent";
      newCard.innerHTML = cardTemplate;
      if (isNonFriends) {
        insertGlobalUserInfo(newCard, element, users_on);
      } else {
        insertFriendInfo(newCard, element, users_on);
      }
      divElement.appendChild(newCard);
  });
}

async function fetchFriends() {
  const userLang = localStorage.getItem("language") || "en";
  const langData = await getLanguageData(userLang);
  const reloadIcon = document.getElementById("reloadIcon");
  reloadIcon.classList.add("rotate");
  setTimeout(() => {
    reloadIcon.classList.remove("rotate");
  }, 250);
  const accessToken = await JWT.getAccess();
  fetch("/templates/Components/CardUser.html")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.text();
    })
    .then((data) => {
      const APIurl = `/api/get-friendships/?statusID=2`;
      $.ajax({
        type: "GET",
        url: APIurl,
        contentType: "application/json",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        success: function (res) {
          if (!window.ws_os || window.ws_os.readyState !== WebSocket.OPEN) {
            console.warn("WebSocket not found or closed. Reinitializing...");
            initializeWebSocket(() => {
                requestOnlineUsers(function (onlineUsers) {
                    console.log("Updated online users list:", onlineUsers);
                    renderUserCards(res.friendships, data, onlineUsers, 0);
                });
            });
          } else {
            requestOnlineUsers(function (onlineUsers) {
                console.log("Updated online users list:", onlineUsers);
                renderUserCards(res.friendships, data, onlineUsers, 0);
            });
          }
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

async function invitePlayer(invitedUserID) {
  const userLang = localStorage.getItem("language") || "en";
  const langData = await getLanguageData(userLang);
  const APIurl = `/api/create-game/`;
  const accessToken = await JWT.getAccess();
  let body = {
    user2ID: invitedUserID,
    isInvitation: true,
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
      showSuccessToast(langData, langData.gameInvited);
    },
    error: function (xhr, status, error) {
      showErrorToast(APIurl, error, langData);
    },
  });
}

//quando dou reload num game finished ele fica a aparecer a cena de dar join, tratar disso
async function addPlayer(requestedFriend) {
  const userLang = localStorage.getItem("language") || "en";
  const langData = await getLanguageData(userLang);
  const APIurl = `/api/send-friendrequest/`;
  const accessToken = await JWT.getAccess();
  let body = {
    user2ID: requestedFriend,
  };
  console.log("body: ", body);
  $.ajax({
    type: "POST",
    url: APIurl,
    contentType: "application/json",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    data: JSON.stringify(body),
    success: function (res) {
      showSuccessToast(langData, langData.friendshipInvited);
      fetchUsers();
    },
    error: function (xhr, status, error) {
      showErrorToast(APIurl, error, langData);
    },
  });
}

async function removePlayer(removedFriend) {
  const userLang = localStorage.getItem("language") || "en";
  const langData = await getLanguageData(userLang);
  const APIurl = `/api/respond-friendrequest/`;
  const accessToken = await JWT.getAccess();
  let body = {
    user2ID: removedFriend,
    statusID: 3
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
      showSuccessToast(langData, langData.friendRemoved);
      fetchFriends();
    },
    error: function (xhr, status, error) {
      showErrorToast(APIurl, error, langData);
    },
  });
}
