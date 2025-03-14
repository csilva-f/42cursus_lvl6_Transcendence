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
			const APIurl = `/api/get-nonfriendslist/`
			$.ajax({
				type: "GET",
				url: APIurl,
				contentType: "application/json",
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
				success: function (res) {
					const divElement = document.getElementById("usersContent");
					divElement.innerHTML = "";
					res.nonFriendsList.forEach((element) => {
						const newCard = document.createElement("div");
						newCard.id = "cardUserContent"
						newCard.innerHTML = data;
						insertUserInfo(newCard, element);
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

//TODO get-userID
async function invitePlayer(invitedUserID) {
	const userLang = localStorage.getItem("language") || "en";
	const langData = await getLanguageData(userLang);
	const APIurl = `/api/create-game/`;
	let body = {
		user1ID: 1,
		user2ID: invitedUserID,
		isInvitation: true
	};
	console.log("body: ", body);
	$.ajax({
		type: "POST",
		url: APIurl,
		contentType: "application/json",
		headers: { Accept: "application/json" },
		data: JSON.stringify(body),
		success: function (res) {
			showSuccessToast(langData, langData.gameInvited);
		},
		error: function (xhr, status, error) {
			showErrorToast(APIurl, error, langData);
		}
	});
}

//quando dou reload num game finished ele fica a aparecer a cena de dar join, tratar disso
async function friendshipPlayer(requestedFriend) {
	const userLang = localStorage.getItem("language") || "en";
	const langData = await getLanguageData(userLang);
	const APIurl = `/api/send-friendrequest/`;
	let body = {
		user1ID: 1,
		user2ID: requestedFriend
	};
	console.log("body: ", body);
	$.ajax({
		type: "POST",
		url: APIurl,
		contentType: "application/json",
		headers: { Accept: "application/json" },
		data: JSON.stringify(body),
		success: function (res) {
			//showSuccessToast(langData, langData.friendshipInvited);
		},
		error: function (xhr, status, error) {
			showErrorToast(APIurl, error, langData);
		}
	});
}