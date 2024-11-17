const images = [
    '/static/img/logos/buttLogo.svg',
    '/static/img/logos/buttLogoMirror.svg',
];

let incrementImg = 0;

function spankShinChan() {
    const imgElement = document.getElementById("logoImg");
    incrementImg++;
    imgElement.src = images[incrementImg % 2];
}

//* Initialization of the tooltips
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

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

function testClick() {
    console.log("miku dayo");
}

function getForms() {
    'use strict';
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation');

    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                // If the form is invalid, prevent submission
                event.preventDefault();
                event.stopPropagation();
                console.log("Form is invalid: ", form);
            } else {
                console.log("Form is valid: ", form);
                if (form.id == "remoteFormID")
                    postGame();
                event.preventDefault();
            }
            form.classList.add('was-validated');
        }, false);
    });
}
