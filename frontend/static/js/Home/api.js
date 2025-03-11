//? GET - /api/get-usergames/?userID=X&statusID=3
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
            const userID = 1;
            const APIurl = `/api/get-usergames/?statusID=3`
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
                        insertHistoryInfo(newCard, element, userID);
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

async function finishProfile() {
	const APIurl = `/api/update-userextension/`;
	const accessToken = await JWT.getAccess();
	let gender = document.getElementById("gender").value
	let genderID = 0;
	if (gender == "male")
		genderID = 1;
	else if (gender == "female")
		genderID = 2;
	else
		genderID = 3;
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
		success: function (res) {
		  showSuccessToast(langData, langData.gameEntered);
		},
		error: function (xhr, status, error) {
		  showErrorToast(APIurl, error, langData);
		},
	  });
}