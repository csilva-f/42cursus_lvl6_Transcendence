
async function fetchGames() {
    fetch('/templates/Components/GameCard.html').then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.text();
    }).then(data => {
        $.ajax({
            type: "GET",
            url: "/api/get-games/",
            success: function (res) {
                console.log(res);
                const divElement = document.getElementById("gamesContent");
                gamesContent.innerHTML = "";
                res.games.forEach(element => {
                    const newDiv = document.createElement('div');
                    newDiv.innerHTML = data;
                    //const enterBtn = newDiv.querySelector('#enterLi');
                    //enterBtn.setAttribute('data-id', element.id);
                    //const title = newDiv.querySelector('#game-title');
                    //title.textContent = element.id;
                    divElement.appendChild(newDiv);
                });
            },
            error: function (xhr, status, error) {
                console.log("Error:", error);
            },
        });
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}