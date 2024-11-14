async function fetchGames(statusID) {
  const userLang = localStorage.getItem("language") || "en";
  const langData = await getLanguageData(userLang);
  const reloadIcon = document.getElementById("reloadIcon");
  reloadIcon.classList.add("rotate");
  setTimeout(() => {
    reloadIcon.classList.remove("rotate");
  }, 250);
  fetch("/templates/Components/GameCard.html")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.text();
    })
    .then((data) => {
      $.ajax({
        type: "GET",
        url: `/api/get-games/?statusID=${statusID}`,
        success: function (res) {
          const divElement = document.getElementById("gamesContent");
          gamesContent.innerHTML = "";
          res.games.forEach((element) => {
            const newCard = document.createElement("div");
            newCard.innerHTML = data;
            insertInfo(newCard, element);
            divElement.appendChild(newCard);
          });
          updateContent(langData);
        },
        error: function (xhr, status, error) {
          console.log("Error:", error);
        },
      });
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
}
