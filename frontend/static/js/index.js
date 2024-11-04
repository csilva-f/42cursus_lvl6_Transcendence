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