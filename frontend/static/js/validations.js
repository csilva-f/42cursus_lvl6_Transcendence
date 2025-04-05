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
    firstName = form.firstName.value;
    lastName = form.lastName.value;
    phoneNumber = form.phoneNumber.value;
    birthday = new Date(form.birthday.value);
    biography = form.biography.value;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const isNumeric = /^\d+$/.test(phoneNumber);
    let erro = 0;

    if (!(firstName.length <= 50)) erro += 1;
    if (!(lastName.length <= 50)) erro += 1;
    if (!(phoneNumber.length <= 20)) erro += 1;
    if (!(isNumeric)) erro += 1;
    if (!(birthday < currentDate)) erro += 1;
    if (!(biography.length <= 2000)) erro += 1;
    if (erro == 0) return true;
    return false;
}

function ValidateNicknameForm(form){
    newNickname = form.newNickname.value;
    newBirthday = new Date(form.newBirthday.value);
    const currentDate = new Date();
    let erro = 0;

    currentDate.setHours(0, 0, 0, 0);

    if (!(newNickname.length <= 20)) erro += 1;
    if (!(newBirthday < currentDate)) erro += 1;
    if (erro == 0) return true;
    return false;
}

function ValidateResetPwdForm(form){
    newPassword = form.newPassword.value;
    confirmPassword = form.confirmPassword.value;

    const hasUpperCase = /[A-Z]/.test(newPassword);
	const hasNumbers = /\d/.test(newPassword);
	const hasSpecialChars = /[!@#_$%^&*(),.?":+{}|<>]/.test(newPassword);
	const isValidLength = newPassword.length >= 8;
    let erro = 0;

    if (!(hasUpperCase)) erro += 1;
    if (!(hasNumbers)) erro += 1;
    if (!(hasSpecialChars)) erro += 1;
    if (!(isValidLength)) erro += 1;
    if (!(newPassword == confirmPassword)) erro += 1;
    if (erro == 0) return true;
    return false;
}

function ValidateSignupForm(form){
    signupFirstname = form.signupFirstname.value;
    signupLastname = form.signupLastname.value;
    signupPhone = form.signupPhone.value;
    signupPassword = form.signupPassword.value;
    retypePassword = form.signupPassword2.value;
    const isNumeric = /^\d+$/.test(signupPhone);
    const hasUpperCase = /[A-Z]/.test(signupPassword);
	const hasNumbers = /\d/.test(signupPassword);
	const hasSpecialChars = /[!@#_$%^&*(),.?":+{}|<>]/.test(signupPassword);
	const isValidLength = signupPassword.length >= 8;
    let erro = 0;
    
    if (!(signupFirstname.length <= 50)) erro += 1;
    if (!(signupLastname.length <= 50)) erro += 1;
    if (!(signupPhone.length <= 20)) erro += 1;
    if (!(isNumeric)) erro += 1;
    if (!(hasUpperCase)) erro += 1;
    if (!(hasNumbers)) erro += 1;
    if (!(hasSpecialChars)) erro += 1;
    if (!(isValidLength)) erro += 1;
    if (!(signupPassword == retypePassword)) erro += 1;
    if (erro == 0) return true;
    return false;
}

function ValidatechangePasswordForm(form) {
    newPasswordChange = form.newPasswordChange.value;
    confirmPasswordChange = form.confirmPasswordChange.value;

    const hasUpperCase = /[A-Z]/.test(newPasswordChange);
	const hasNumbers = /\d/.test(newPasswordChange);
	const hasSpecialChars = /[!@#_$%^&*(),.?":+{}|<>]/.test(newPasswordChange);
	const isValidLength = newPasswordChange.length >= 8;
    let erro = 0;

    if (!(hasUpperCase)) erro += 1;
    if (!(hasNumbers)) erro += 1;
    if (!(hasSpecialChars)) erro += 1;
    if (!(isValidLength)) erro += 1;
    if (!(newPasswordChange == confirmPasswordChange)) erro += 1;
    if (erro == 0) return true;
    return false;
}