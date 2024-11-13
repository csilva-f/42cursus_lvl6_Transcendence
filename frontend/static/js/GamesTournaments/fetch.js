async function fetchGames() {
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
        url: "/api/get-games/",
        success: function (res) {
          console.log(res);
          const divElement = document.getElementById("gamesContent");
          gamesContent.innerHTML = "";
          res.games.forEach((element) => {
            const newCard = document.createElement("div");
            newCard.innerHTML = data;
            const enterBtn = newCard.querySelector("#enterLi");
            const user1Level = newCard.querySelector("#user1Level");
            const user1Nick = newCard.querySelector("#user1Nick");
            const user2Img = newCard.querySelector("#user2Img");
            const user2LvlLabel = newCard.querySelector("#user2LvlLabel");
            const user2Level = newCard.querySelector("#user2Level");
            const user2Nick = newCard.querySelector("#user2Nick");
            enterBtn.setAttribute("data-id", element.id);
            user1Level.textContent = element.user1;
            user1Nick.textContent = "{Nickname}";
            if (element.user2 == null) {
              setRandomImage(user2Img);
              user2LvlLabel.style.display = "none";
              user2Nick.setAttribute("data-i18n", "waiting");
            } else {
              user2Level.textContent = element.user2;
              user2Nick.textContent = "{Nickname2}";
            }
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
