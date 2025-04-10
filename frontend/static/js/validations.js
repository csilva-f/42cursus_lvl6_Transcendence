function myCustomValidity(form)
{
    if (form.id == "signup-form") return ValidateSignupForm(form);
    else if (form.id == "nicknameModal-form") return ValidateNicknameForm(form);
    else if (form.id == "editProfileForm") return (validateUpdateProfileForm(form));
    else if (form.id == "changePasswordForm") return (ValidatechangePasswordForm(form));
    else if (form.id == "resetPwd-form") return (ValidateResetPwdForm(form));
    else return true
}

function validateUpdateProfileForm(form)
{
    firstInput = form.firstName.value;
    lastInput = form.lastName.value;
    phoneNumberInput = form.phoneNumber.value;
    birthdayInput = new Date(form.birthday.value);
    biographyInput = form.biography.value;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const isNumeric = /^\d+$/.test(phoneNumberInput);
    let erro = 0;

    if (!(firstInput.length <= 50 && firstInput.length > 0)) {
        form.firstName.classList.remove('is-valid');
        erro += 1;  
    } 
    if (!(lastInput.length <= 50 && lastInput.length > 0)) {
        form.lastName.classList.remove('is-valid');
        erro += 1;
    }
    if (!(phoneNumberInput.length <= 20 && phoneNumberInput.length > 0)){
        form.phoneNumber.classList.remove('is-valid');
        erro += 1;
    }
    if (!(isNumeric)) {
        form.phoneNumber.classList.remove('is-valid');
        erro += 1;
    }
    if (!(birthdayInput < currentDate)) {
        form.birthday.classList.remove('is-valid');
        erro += 1;
    }
    if (!(biographyInput.length <= 2000)) {
        form.biography.classList.remove('is-valid');
        erro += 1;
    }
    if (erro == 0) return true;
    return false;
}

function ValidateNicknameForm(form){
    newNicknameInput = form.newNickname.value;
    newBirthdayInput = new Date(form.newBirthday.value);
    const currentDate = new Date();
    let erro = 0;

    currentDate.setHours(0, 0, 0, 0);

    if (!(newNicknameInput.length <= 20)) {
        form.newNickname.classList.remove('is-valid');
        erro += 1;
    }
    if (!(newNicknameInput.length > 0)) {
        form.newNickname.classList.remove('is-valid');
        erro += 1;
    }
    if (!(newBirthdayInput < currentDate)) {
        form.newBirthday.classList.remove('is-valid');
        erro += 1;
    }
    if (erro == 0) return true;
    return false;
}

function ValidateResetPwdForm(form){
    newPasswordInput = form.newPassword.value;
    confirmPasswordInput = form.confirmPassword.value;

    const hasUpperCase = /[A-Z]/.test(newPasswordInput);
	const hasNumbers = /\d/.test(newPasswordInput);
	const hasSpecialChars = /[!@#_$%^&*(),.?":+{}|<>]/.test(newPasswordInput);
	const isValidLength = newPasswordInput.length >= 8;
    let erro = 0;

    if (!(hasUpperCase)) {
        form.newPassword.classList.remove('is-valid');
        erro += 1;
    }
    if (!(hasNumbers)) {
        form.newPassword.classList.remove('is-valid');
        erro += 1;
    }
    if (!(hasSpecialChars)) {
        form.newPassword.classList.remove('is-valid');
        erro += 1;
    }
    if (!(isValidLength)) {
        form.newPassword.classList.remove('is-valid');
        erro += 1;
    }
    if (!(newPasswordInput == confirmPasswordInput)) {
        form.confirmPassword.classList.remove('is-valid');
        erro += 1;
    }
    if (erro == 0) return true;
    return false;
}

function ValidateSignupForm(form){
    signupFirstnameInput = form.signupFirstname.value;
    signupLastnameInput = form.signupLastname.value;
    signupPhoneInput = form.signupPhone.value;
    signupPasswordInput = form.signupPassword.value;
    retypePasswordInput = form.signupPassword2.value;
    const isNumeric = /^\d+$/.test(signupPhoneInput);
    const hasUpperCase = /[A-Z]/.test(signupPassword);
	const hasNumbers = /\d/.test(signupPassword);
	const hasSpecialChars = /[!@#_$%^&*(),.?":+{}|<>]/.test(signupPasswordInput);
	const isValidLength = signupPasswordInput.length >= 8;
    let erro = 0;
    
    if (!(signupFirstnameInput.length <= 50)) {
        form.signupFirstname.classList.remove('is-valid');
        erro += 1;
    } 
    if (!(signupLastnameInput.length <= 50)) {
        form.signupLastname.classList.remove('is-valid');
        erro += 1;
    }
    if (!(signupPhoneInput.length <= 20)) {
        form.signupPhone.classList.remove('is-valid');
        erro += 1;
    }
    if (!(isNumeric)) {
        form.signupPhone.classList.remove('is-valid');
        erro += 1;
    }
    if (!(hasUpperCase)) {
        form.signupPassword.classList.remove('is-valid');
        erro += 1;
    }
    if (!(hasNumbers)) {
        form.signupPassword.classList.remove('is-valid');
        erro += 1;
    }
    if (!(hasSpecialChars)) {
        form.signupPassword.classList.remove('is-valid');
        erro += 1;
    }
    if (!(isValidLength)) {
        form.signupPassword.classList.remove('is-valid');
        erro += 1;
    }
    if (!(signupPasswordInput == retypePasswordInput)) {
        form.retypePassword.classList.remove('is-valid');
        erro += 1;
    }
    if (erro == 0) return true;
    return false;
}

function ValidatechangePasswordForm(form) {
    newPasswordChangeInput = form.newPasswordChange.value;
    confirmPasswordChangeInput = form.confirmPasswordChange.value;

    const hasUpperCase = /[A-Z]/.test(newPasswordChangeInput);
	const hasNumbers = /\d/.test(newPasswordChangeInput);
	const hasSpecialChars = /[!@#_$%^&*(),.?":+{}|<>]/.test(newPasswordChangeInput);
	const isValidLength = newPasswordChangeInput.length >= 8;
    let erro = 0;

    if (!(hasUpperCase)) {
        form.newPasswordChange.classList.remove('is-valid');
        erro += 1;
    }
    if (!(hasNumbers)) {
        form.newPasswordChange.classList.remove('is-valid');
        erro += 1;
    }
    if (!(hasSpecialChars)) {
        form.newPasswordChange.classList.remove('is-valid');
        erro += 1;
    }
    if (!(isValidLength)) {
        form.newPasswordChange.classList.remove('is-valid');
        erro += 1;
    }
    if (!(newPasswordChange == confirmPasswordChangeInput)) {
        form.confirmPasswordChange.classList.remove('is-valid');
        erro += 1;
    }
    if (erro == 0) return true;
    return false;
}