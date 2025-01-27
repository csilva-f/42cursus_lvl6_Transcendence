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

function goToProfile() {
    const profilePicElement = document.getElementById('profilePicElement');
    window.history.pushState({}, "", profilePicElement.getAttribute("href"));
    locationHandler("content");
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
				console.log("form invalid")
            } else {
                console.log("Form is valid: ", form);
                if (form.id == "remoteFormID")
                    postGame();
                else if (form.id == "localFormID")
                    postLocalGame();
                else if (form.id == "tournamentFormID")
                    postTournament();
                else if (form.id == "login-form")
                    sendLogin();
                else if (form.id == "signup-form")
                    sendSignup();
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

async function checkLogin() {
	var token = localStorage.getItem("jwt");
	const loginButton = document.getElementById('loginButton');
	if (token != null) {
        const   confirmLogout = window.confirm("Are you sure?");
        if (confirmLogout) {
            loginButton.classList.remove("fa-right-from-bracket");
            loginButton.classList.add("fa-right-to-bracket");
            localStorage.removeItem("jwt");
        }
	}
	else {
        console.log("entra ola");
		window.history.pushState({}, "", "/login");
		loginButton.classList.remove("fa-right-to-bracket");
		loginButton.classList.add("fa-right-from-bracket");
        locationHandler("allcontent");
	}
  }