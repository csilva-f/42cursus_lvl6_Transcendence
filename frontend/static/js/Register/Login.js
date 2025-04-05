async function loginSuccess(data) {
    jwtToken = data.access;
    const opt_status = await OTP_check_enable(jwtToken);
    console.log(opt_status);

    if (opt_status == true) {
        //OTP_send_email(jwtToken);
        await JWT.setTempToken(data);
        window.history.pushState({}, "", "/mfa");
        locationHandler("content");
    } else {
        if (jwtToken) {
            localStorage.setItem("jwt", jwtToken);
            await JWT.setToken(data);
            console.log("Access: ", await JWT.getAccess());
        }
        await UserInfo.refreshUser();
        localStorage.setItem('language', await UserInfo.getUserLang());
        window.history.pushState({}, "", "/");
        locationHandler();
    }
    $("#customlogin-message").text("Login successful!");
}

function validateEmail(emailId, validationId, checkId) {
    const email = document.getElementById(emailId);
    const validationMessage = document.getElementById(validationId);
    const checkIcon = document.getElementById(checkId);

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/;
    const isValid = emailRegex.test(email.value);

    if (isValid) {
        validationMessage.classList.add('d-none', 'valid');
        validationMessage.classList.remove('invalid');
    } else {
        checkIcon.style.color = 'red';
        validationMessage.classList.remove('d-none');
        validationMessage.classList.add('invalid');
        validationMessage.classList.remove('valid');
    }
}


