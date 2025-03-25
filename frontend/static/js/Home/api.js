//? GET - /api/get-usergames/?statusID=3
async function fetchMatchHistory() {
	const userLang = localStorage.getItem("language") || "en";
	const langData = await getLanguageData(userLang);
	const accessToken = await JWT.getAccess();
	fetch("/templates/Components/CardHistory.html")
		.then((response) => {
			if (!response.ok) {
				throw new Error("Network response was not ok " + response.statusText);
			}
			return response.text();
		})
		.then((data) => {
			const APIurl = `/api/get-usergames/?statusID=3`;
			$.ajax({
				type: "GET",
				url: APIurl,
				Accept: "application/json",
				contentType: "application/json",
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
				success: function (res) {
					const divElement = document.getElementById("historyContent");
					divElement.innerHTML = "";
					console.log(res);
					res.games.forEach((element) => {
						const newCard = document.createElement("div");
						newCard.innerHTML = data;
						insertHistoryInfo(newCard, element);
						divElement.appendChild(newCard);
					});
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

//? GET - /api/get-friendships/?statusID=2
async function fetchHomeFriends() {
	const userLang = localStorage.getItem("language") || "en";
	const langData = await getLanguageData(userLang);
	const accessToken = await JWT.getAccess();
	fetch("/templates/Components/CardFriend.html")
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
				Accept: "application/json",
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
								renderHomeFriends(res.friendships, data, onlineUsers);
							});
						});
					} else {
						requestOnlineUsers(function (onlineUsers) {
							console.log("Updated online users list:", onlineUsers);
							renderHomeFriends(res.friendships, data, onlineUsers);
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

//? GET - /api/get-topusers/
async function fetchTopUsers() {
	const userLang = localStorage.getItem("language") || "en";
	const langData = await getLanguageData(userLang);
	const accessToken = await JWT.getAccess();
	fetch("/templates/Components/CardTopPlayer.html")
		.then((response) => {
			if (!response.ok) {
				throw new Error("Network response was not ok " + response.statusText);
			}
			return response.text();
		})
		.then((data) => {
			const APIurl = `/api/get-topusers/`;
			$.ajax({
				type: "GET",
				url: APIurl,
				Accept: "application/json",
				contentType: "application/json",
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
				success: function (res) {
					const divElement = document.getElementById("topUsersContent");
					divElement.innerHTML = "";
					console.log("topusers res: ", res);
				 	res.users.forEach((element) => {
						const newCard = document.createElement("div");
						newCard.classList.add("col-4", "d-flex", "justify-content-center", "align-items-center");
						newCard.innerHTML = data;
						insertTopPlayerInfo(newCard, element);
						divElement.appendChild(newCard);
					});
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

function renderHomeFriends(usersList, cardTemplate, users_on) {
	const divElement = document.getElementById("friendsContent");
	divElement.innerHTML = "";
	usersList.forEach(element => {
		const newCard = document.createElement("div");
		newCard.innerHTML = cardTemplate;
		insertHomeFriendInfo(newCard, element, users_on);
		divElement.appendChild(newCard);
	});
}

async function finishProfile() {
	const APIurl = `/api/update-userextension/`;
	const accessToken = await JWT.getAccess();
	let gender = document.getElementById("gender").value;
	let genderID = 0;
	if (gender == "male") genderID = 1;
	else if (gender == "female") genderID = 2;
	else genderID = 3;
	let userData = {
		nickname: document.getElementById("newNickname").value,
		birthdate: document.getElementById("newBirthday").value,
		genderid: genderID,
	};
	$.ajax({
		type: "POST",
		url: APIurl,
		Accept: "application/json",
		contentType: "application/json",
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
		data: JSON.stringify(userData),
		success: async function (res) {
			$("#nickModal").modal("hide");
			const userData = await checkUserExtension();
			await UserInfo.refreshUser();
			await activateTopBar();
			//showSuccessToast(langData, langData.gameEntered);
		},
		error: function (xhr, status, error) {
			//showErrorToast(APIurl, error, langData);
		},
	});
}

async function uploadAvatar() {
	const APIurl = `/api/update-userextension/`;
	const accessToken = await JWT.getAccess();

	let userData = {
		// avatar: aqui o path
	};
	$.ajax({
		type: "POST",
		url: APIurl,
		Accept: "application/json",
		contentType: "application/json",
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
		data: JSON.stringify(userData),
		success: function (res) {
			//showSuccessToast(langData, langData.gameEntered);
		},
		error: function (xhr, status, error) {
			//showErrorToast(APIurl, error, langData);
		},
	});
}
