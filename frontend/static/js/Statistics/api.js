var userStats = [];

//? GET - /api/get-userstatistics/?userID=
async function fetchStatistics(userID) {
  const userLang = localStorage.getItem("language") || "en";
  const langData = await getLanguageData(userLang);
  const accessToken = await JWT.getAccess();
  let APIurl = `/api/get-userstatistics/`
  if (userID != null)
		APIurl = `/api/get-userstatistics/?userID=${userID}`
  $.ajax({
    type: "GET",
    url: APIurl,
    contentType: "application/json",
    headers: {
		Authorization: `Bearer ${accessToken}`,
	  },
    success: function (res) {
      userStats = res.users[0];
      // if (!window.ws_os || window.ws_os.readyState !== WebSocket.OPEN) {
			// 	console.warn("WebSocket not found or closed. Reinitializing...");
			// 	initializeWebSocket(() => {
			// 		requestOnlineUsers(function (onlineUsers) {
			// 			console.log("Updated online users list:", onlineUsers);
			// 		});
			// 	});
			// } else {
			// 	requestOnlineUsers(function (onlineUsers) {
			// 		console.log("Updated online users list:", onlineUsers);
			// 	});
			// }
      updateContent(langData);
      createChart(userStats, 1);
      insertPageInfo(userStats);
    },
    error: function (xhr, status, error) {
      console.error("Error Thrown:", error);
      showErrorToast(APIurl, error, langData);
    },
  });
}