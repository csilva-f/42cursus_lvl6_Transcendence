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
            } else {
                console.log("Form is valid: ", form);
                if (form.id == "remoteFormID")
                    postGame();
                else if (form.id == "tournamentFormID")
                    postTournament();
                else if (form.id == "login-form")
                    sendLogin();
                else if (form.id == "signup-form")
                    sendSignup();
                event.preventDefault();
            }
            form.classList.add('was-validated');
        }, false);
    });
}
