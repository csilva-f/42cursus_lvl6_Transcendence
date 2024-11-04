const images = [
    '/static/img/logos/1.svg',
    '/static/img/logos/2.svg',
    '/static/img/logos/3.svg',
    '/static/img/logos/4.svg',
    '/static/img/logos/5.svg',
    '/static/img/logos/6.svg',
    '/static/img/logos/7.svg',
    '/static/img/logos/8.svg',
];

// Function to set a random image
function setRandomImage() {
    const imgElement = document.getElementById("logoImg");
    const randomIndex = Math.floor(Math.random() * images.length);
    imgElement.src = images[randomIndex];
}

window.onload = setRandomImage;

$(document).ready(function () {
    $("#learnMoreBtn").on("click", function () {
        $.ajax({
            type: "GET",
            url: "/api/get-datetime/", // adjust the URL according to your Django app's URL configuration
            success: function (data) {
                console.log(data.current_datetime);
                const pElement = document.getElementById("datetime");
                pElement.innerText = data.current_datetime;
            },
            error: function (xhr, status, error) {
                console.log("Error:", error);
                // update your HTML with an error message
            },
        });
    });
});
