const JWT = new tokenService();
const UserInfo = new User();

const images = [
	"/static/img/logos/buttLogo.svg",
	"/static/img/logos/buttLogoMirror.svg",
];

let incrementImg = 0;

async function spankShinChan() {
	const imgElement = document.getElementById("logoImg");
	incrementImg++;
	imgElement.src = images[incrementImg % 2];
	if (window.location.pathname != "/" ) {
		window.history.pushState({}, "", "/");
		await locationHandler();
	}
}

//* Initialization of the tooltips
const tooltipTriggerList = document.querySelectorAll(
	'[data-bs-toggle="tooltip"]',
);
const tooltipList = [...tooltipTriggerList].map(
	(tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl),
);

function getForms() {
  "use strict";
  //Only the forms with the needs-validation enter in this function
  const forms = document.querySelectorAll(".needs-validation");
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        form.classList.remove("was-validated");
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        } else {
          //if (form.id == "localFormID") postLocalGame();
          //if (form.id == "remoteFormID") postRemoteGame();
          if (form.id == "localTournamentFormID") initLocalTournament();
          else if (form.id == "tournamentFormID") postTournament();
          else if (form.id == "login-form") sendLogin();
          else if (form.id == "signup-form") sendSignup(form);
          else if (form.id == "forgotPwd-form") forgotPwd();
          else if (form.id == "nicknameModal-form") finishProfile();
          else if (form.id == "resetPwd-form") resetPassword();
          // else if (form.id == "resendCode-form")
          // 	sendCode();
          // else if (form.id == "resetPwd-form")
          // 	resetPwd();
          event.preventDefault();
        }
        form.classList.add("was-validated");
      },
      false,
    );
  });
}

async function logOut() {
	localStorage.removeItem("jwt");
	JWT.deleteToken();
	UserInfo.resetUser();
	window.history.pushState({}, "", "/mainPage");
	locationHandler();
}

async function notificationLoad() {
	if (await UserInfo.getUserID())
		await fetchUserNotificationGame();
	setTimeout(notificationLoad, 5000);
}

setTimeout(notificationLoad, 2500);
