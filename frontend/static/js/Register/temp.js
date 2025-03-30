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
//! DUPLICATED VERIFY WHICH ONE IS REAL
// function passwordVisibility(passwordFieldId, toggleIconId) {
// 	const passwordInput = document.getElementById(passwordFieldId);
// 	const passwordIcon = document.getElementById(toggleIconId).querySelector('i');

// 	if (passwordInput.type === "password") {
// 		passwordInput.type = "text";
// 		passwordIcon.classList.remove("fa-eye-slash");
// 		passwordIcon.classList.add("fa-eye");
// 	} else {
// 		passwordInput.type = "password";
// 		passwordIcon.classList.remove("fa-eye");
// 		passwordIcon.classList.add("fa-eye-slash");
// 	}
// }

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

  if (isValidLength && hasUpperCase && hasNumbers && hasSpecialChars) {
    validationMessage.classList.add("d-none");
  } else {
    validationMessage.classList.remove("d-none");
  }
}

function validatePhoneNumber(phoneId, validationId, errorIcon) {
  const phone = document.getElementById(phoneId);
  const validationMessage = document.getElementById(validationId);
  const icon = document.getElementById(errorIcon);

  const isNumeric = /^\d+$/.test(phone.value);
  if (isNumeric && phone.value.length <= 20) {
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
  if (password1.value === password2.value && password1.value.length >= 8) {
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
//! DUPLICATED VERIFY WHICH ONE IS REAL
// function validatePasswordsMatch(passwordId1, passwordId2, validationId, iconId) {
// 	const password1 = document.getElementById(passwordId1);
// 	const password2 = document.getElementById(passwordId2);
// 	const validationMessage = document.getElementById(validationId);
// 	const icon = document.getElementById(iconId);

// 	validationMessage.classList.remove('d-none');

// 	if (password1.value === password2.value && password1.value.length >= 8) {
// 		validationMessage.classList.add('d-none');
// 	} else {
// 		icon.className = 'fa-solid fa-xmark';
// 		icon.style.color = 'red';
// 	}
// }

function validateName(name, validationName, checkId) {
  const nameInput = document.getElementById(name);
  const validationMessage = document.getElementById(validationName);
  const checkIcon = document.getElementById(checkId);

	if (nameInput.value.length <= 50) {
		validationMessage.classList.add('d-none');
		validationMessage.classList.add('valid');
		validationMessage.classList.remove('invalid');
	} else {
		checkIcon.style.color = 'red';
		validationMessage.classList.remove('d-none');
		validationMessage.classList.add('invalid');
		validationMessage.classList.remove('valid');
	}
}