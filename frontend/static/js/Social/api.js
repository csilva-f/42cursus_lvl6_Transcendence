async function fetchUsers() {
    const userLang = localStorage.getItem("language") || "en";
    const langData = await getLanguageData(userLang);
    const reloadIcon = document.getElementById("reloadIcon");
    reloadIcon.classList.add("rotate");
    setTimeout(() => {
      reloadIcon.classList.remove("rotate");
    }, 250);
    fetch("/templates/Components/CardUser.html")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.text();
      })
      .then((data) => {
        const users = ["Kaoruko Waguri", "Hatsune Miku", "Marin Kitagawa", "Shinomiya Shouko", "Ado", "Nagisa Kubo", "Mai Sakurajima", "Yamada Anna"];
        const usersImg = ["/static/img/pfp1.jpeg", "/static/img/pfp2.jpg", "/static/img/marin.jpg", "/static/img/shouko.jpg", "/static/img/ado.jpg", "/static/img/kubo.jpg", "/static/img/mai.jpg", "/static/img/yamada.jpg"];
        const divElement = document.getElementById("usersContent");
        divElement.innerHTML = "";
        for (let i = 0; i < 8; i++) {
            const newCard = document.createElement("div");
            newCard.innerHTML = data;
            insertUserInfo2(newCard, users[i], usersImg[i]);
            divElement.appendChild(newCard);
        }
        const APIurl = `/api/get-userextensions/`
        $.ajax({
          type: "GET",
          url: APIurl,
          contentType: "application/json",
          headers: { Accept: "application/json" },
          success: function (res) {
            //const divElement = document.getElementById("usersContent");
            //divElement.innerHTML = "";
            res.users.forEach((element) => {
              const newCard = document.createElement("div");
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