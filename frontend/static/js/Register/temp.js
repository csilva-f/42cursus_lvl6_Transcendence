// Password validate
function passwordVisibility(passwordFieldId, toggleIconId) {
  const passwordInput = document.getElementById(passwordFieldId);
  const passwordIcon = document.getElementById(toggleIconId).querySelector("i");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    passwordIcon.classList.remove("fa-eye-slash");
    passwordIcon.classList.add("fa-eye");
  } else {
    passwordInput.type = "password";
    passwordIcon.classList.remove("fa-eye");
    passwordIcon.classList.add("fa-eye-slash");
  }
}

function validateNewPassword(passwordId, validationId, confirmPassId) {
  const password = document.getElementById(passwordId);
  const lengthCheck = document.getElementById("lengthCheck");
  const upperCaseCheck = document.getElementById("upperCaseCheck");
  const numberCheck = document.getElementById("numberCheck");
  const specialCharCheck = document.getElementById("specialCharCheck");
  const validationMessage = document.getElementById(validationId);
  const confirmPass = document.getElementById(confirmPassId);

  confirmPass.value = "";

	const hasUpperCase = /[A-Z]/.test(password.value);
	const hasNumbers = /\d/.test(password.value);
	const hasSpecialChars = /[!@#_$%^&*(),.?":+{}|<>]/.test(password.value);
	const isValidLength = password.value.length >= 8;

  lengthCheck.className = isValidLength
    ? "requirement valid"
    : "requirement invalid";
  document.getElementById("lengthIcon").className = isValidLength
    ? "fa-solid fa-check"
    : "fa-solid fa-xmark";
  document.getElementById("lengthIcon").style.color = isValidLength
    ? "green"
    : "red";

  upperCaseCheck.className = hasUpperCase
    ? "requirement valid"
    : "requirement invalid";
  document.getElementById("upperCaseIcon").className = hasUpperCase
    ? "fa-solid fa-check"
    : "fa-solid fa-xmark";
  document.getElementById("upperCaseIcon").style.color = hasUpperCase
    ? "green"
    : "red";

  numberCheck.className = hasNumbers
    ? "requirement valid"
    : "requirement invalid";
  document.getElementById("numberIcon").className = hasNumbers
    ? "fa-solid fa-check"
    : "fa-solid fa-xmark";
  document.getElementById("numberIcon").style.color = hasNumbers
    ? "green"
    : "red";

  specialCharCheck.className = hasSpecialChars
    ? "requirement valid"
    : "requirement invalid";
  document.getElementById("specialCharIcon").className = hasSpecialChars
    ? "fa-solid fa-check"
    : "fa-solid fa-xmark";
  document.getElementById("specialCharIcon").style.color = hasSpecialChars
    ? "green"
    : "red";

  if (isValidLength && hasUpperCase && hasNumbers && hasSpecialChars && password.length > 0) {
    validationMessage.classList.add("d-none");
  } else {
    validationMessage.classList.remove("d-none");
  }
}

function validatePhoneNumber(phoneId, validationId, errorIcon) {
  const phone = document.getElementById(phoneId);
  const validationMessage = document.getElementById(validationId);
  const icon = document.getElementById(errorIcon);
  const isNumeric = /^[\d\s-]*$/.test(phone.value);

  var elements = document.getElementsByClassName('iti__selected-dial-code');
  if (elements.length > 0) {
    var firstElement = elements[0];
    const dddNumber = firstElement.textContent;
    console.log("firstElement: ", dddNumber);
  }

  if (isNumeric && phone.value.length <= 20 && phone.value.length > 0) {
    validationMessage.classList.add("d-none");
    validationMessage.classList.add("valid");
    validationMessage.classList.remove("invalid");
  } else {
    icon.style.color = "red";
    validationMessage.classList.remove("d-none");
    validationMessage.classList.add("invalid");
    validationMessage.classList.remove("valid");
  }
}

function validatePasswordsMatch(
  passwordId1,
  passwordId2,
  validationId,
  iconId,
) {
  const password1 = document.getElementById(passwordId1);
  const password2 = document.getElementById(passwordId2);
  const validationMessage = document.getElementById(validationId);
  const icon = document.getElementById(iconId);

  validationMessage.classList.remove("d-none");
  if (password1.value === password2.value) {
    validationMessage.classList.add("d-none");
    validationMessage.classList.add("valid");
    validationMessage.classList.remove("invalid");
  } else {
    icon.style.color = "red";
    validationMessage.classList.remove("d-none");
    validationMessage.classList.add("invalid");
    validationMessage.classList.remove("valid");
  }
}

function validateName(name, validationName, checkId, formID) {
  const nameInput = document.getElementById(name);
  const validationMessage = document.getElementById(validationName);
  const checkIcon = document.getElementById(checkId);
	if (nameInput.value.length <= 50  && nameInput.value.length > 0) {
    validationMessage.classList.add('d-none');
		validationMessage.classList.add('valid');
    nameInput.classList.add('is-valid');
		validationMessage.classList.remove('invalid');
    nameInput.classList.remove('is-invalid');
	} else {
    checkIcon.style.color = 'red';
		validationMessage.classList.remove('d-none');
		validationMessage.classList.remove('valid');
		validationMessage.classList.add('invalid');
    nameInput.classList.remove('is-valid');
    nameInput.classList.add('is-invalid');
	}
}

// function clearForm(formElement) {
//   formElement.classList.remove("was-validated");

//   formElement.querySelectorAll(".is-invalid, .is-valid").forEach((el) => {
//       el.classList.remove("is-invalid", "is-valid");
//       el.setCustomValidity("");
//   });

//   formElement.querySelectorAll(".invalid-feedback, .text-muted").forEach((el) => {
//       el.classList.add("d-none");
//   });
// }

function goToForgotPwd() {
  window.history.pushState({}, "", "/forgotPassword");
  locationHandler();
}

function goToResendCode() {
  window.history.pushState({}, "", "/resendCode");
  locationHandler();
}
