const JWT = new tokenService();
const UserInfo = new User();

const images = [
	"/static/img/logos/buttLogo.svg",
	"/static/img/logos/buttLogoMirror.svg",
];

let incrementImg = 0;

function showErrorToast(APIurl, error, langData) {
  fetch("/templates/Components/ToastError.html")
      .then((response) => {
          if (!response.ok) {
              throw new Error("Network response was not ok " + response.statusText);
          }
          return response.text();
      })
      .then((data) => {
          const bodyElement = document.getElementById("body");
          const newToast = document.createElement("div");
          newToast.innerHTML = data;
          const errorToast = newToast.querySelector('#errorToast')
          const toastShow = bootstrap.Toast.getOrCreateInstance(errorToast)
          const errorMsg = newToast.querySelector('#errorMsg')
          const urlAPIElement = newToast.querySelector('#urlAPI')
          if (error == null)
              errorMsg.textContent = "Unknown Error";
          else
              errorMsg.textContent = error;
          urlAPIElement.textContent = APIurl;
          bodyElement.appendChild(newToast);
          updateContent(langData);
          toastShow.show()
      })
}

function showErrorUserToast(langData, error) {
  fetch("/templates/Components/ToastErrorUser.html")
      .then((response) => {
          if (!response.ok) {
              throw new Error("Network response was not ok " + response.statusText);
          }
          return response.text();
      })
      .then((data) => {
          const bodyElement = document.getElementById("body");
          const newToast = document.createElement("div");
          newToast.innerHTML = data;
          const errorToast = newToast.querySelector('#errorToast')
          const toastShow = bootstrap.Toast.getOrCreateInstance(errorToast)
          const errorMsg = newToast.querySelector('#errorMsg')
          errorMsg.textContent = error;
          bodyElement.appendChild(newToast);
          updateContent(langData);
          toastShow.show()
      })
}

function showSuccessToast(langData, type) {
  fetch("/templates/Components/ToastSuccess.html")
      .then((response) => {
          if (!response.ok) {
              throw new Error("Network response was not ok " + response.statusText);
          }
          return response.text();
      })
      .then((data) => {
          const bodyElement = document.getElementById("body");
          const newToast = document.createElement("div");
          newToast.innerHTML = data;
          const successToast = newToast.querySelector('#successToast')
          const toastShow = bootstrap.Toast.getOrCreateInstance(successToast)
          const successMsg = newToast.querySelector('#successMsg')
          successMsg.textContent = type;
          bodyElement.appendChild(newToast);
          updateContent(langData);
          toastShow.show()
      })
}

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
      async (event) => {
        event.preventDefault();
        const nick = await UserInfo.getUserNick();
        form.classList.remove("was-validated");
        if (!(myCustomValidity(form)) || !(form.checkValidity())) {
          event.preventDefault();
          event.stopPropagation();
        } else {
          //if (form.id == "localFormID") postLocalGame();
          //if (form.id == "remoteFormID") postRemoteGame();
          if (form.id == "localTournamentFormID") initLocalTournament();
          else if (form.id == "login-form") sendLogin();
          else if (form.id == "signup-form") sendSignup(form);
          else if (form.id == "forgotPwd-form") forgotPwd();
          else if (form.id == "nicknameModal-form"){
          //console.log("before: ", nick);
          if (!nick){
            //console.log("after: ", nick);
            await finishProfile();
          }
            //console.log("getForms - finish profile");
          }
            //else if (form.id == "mfa-form") verifyAccount();
          else if (form.id == "resetPwd-form") resetPassword();
          else if (form.id == "changePasswordForm") changePassword();
          else if (form.id == "editProfileForm") updateProfile();
          // else if (form.id == "resendCode-form")
          // 	sendCode();
          // else if (form.id == "resetPwd-form")
          // 	resetPwd();
          event.preventDefault();
          form.classList.add("was-validated");
        }
      },
      false,
    );
  });
}

async function logOut() {
	localStorage.removeItem("jwt");
	JWT.deleteToken();
  await UserInfo.closeWebSocket();
	await UserInfo.resetUser();
  console.log(UserInfo);
	window.history.pushState({}, "", "/mainPage");
	locationHandler();
}

async function notificationLoad() {
	if (await UserInfo.getUserID())
		await fetchUserNotificationGame();
	//setTimeout(notificationLoad, 5000);
}

//notificationLoad();
//setTimeout(notificationLoad, 2500);
