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