const JWT = new tokenService();

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

function goToProfile(userID) {
    if (userID == null) {
        const profilePicElement = document.getElementById('profilePicElement');
        window.history.pushState({}, "", profilePicElement.getAttribute("href"));
        locationHandler("content");
    } else {
        
    }
}

function getForms() {
    'use strict';
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation');

    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            form.classList.remove('was-validated');
            if (!form.checkValidity()) {
                // If the form is invalid, prevent submission
                event.preventDefault();
                event.stopPropagation();
                console.log("form invalid")
            } else {
                console.log("Form is valid: ", form);
                if (form.id == "localFormID")
                    postLocalGame();
                else if (form.id == "localTournamentFormID")
                    initLocalTournament();
                else if (form.id == "tournamentFormID")
                    postTournament();
                else if (form.id == "login-form")
                    sendLogin();
                else if (form.id == "signup-form")
                    sendSignup(form);
                else if (form.id == "forgotPwd-form")
                    forgotPwd();
                // else if (form.id == "resendCode-form")
                // 	sendCode();
                // else if (form.id == "resetPwd-form")
                // 	resetPwd();
                event.preventDefault();
            }
            form.classList.add('was-validated');
        }, false);
    });
}

async function logOut() {
    localStorage.removeItem("jwt");
    window.history.pushState({}, "", "/mainPage");
    locationHandler("allcontent");
}

async function notificationLoad() {
    var token = JWT.getAccess();
    if (token != null) {
        setTimeout(async function () {
            await fetchUserNotificationGame();
            notificationLoad();
        }, 5000);
    }
}

notificationLoad();

