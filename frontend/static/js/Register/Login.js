async function loginSuccess(data) {
    jwtToken = data.access;
    await JWT.setTempToken(data);
    const opt_status = await OTP_check_enable(jwtToken);

    if (opt_status == true) {
        await OTP_send_email();
        window.history.pushState({}, "", "/mfa");
        await locationHandler();
        if (await JWT.getOTPStatus() == 1) {
            let resend = document.getElementById("resendLabel");
            let msgLabel = document.getElementById("msgLabel");
            let titleLabel = document.getElementById("titleLabel");
            msgLabel.innerHTML = "";
            titleLabel.innerHTML = "Check your app to get the code";
            resend.innerHTML = "Please use your aplication";
        }
    } else {
        if (jwtToken) {
            await JWT.setToken(data);
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

    const emailRegex =/^[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*@[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+$/;
    const isValid = emailRegex.test(email.value);
    if (isValid) {
        validationMessage.classList.add('d-none', 'valid');
        validationMessage.classList.remove('invalid');
        validationMessage.classList.add('is-valid');
    } else {
        checkIcon.style.color = 'red';
        validationMessage.classList.remove('d-none');
        validationMessage.classList.add('invalid');
        validationMessage.classList.remove('valid');
    }
}

async function handleValidateEmail() {
    try {
        await validateVerifyEmail();
        document.getElementById("emailVerifiedIcon").classList.remove("d-none");
        document.getElementById("emailVerifiedLabel1").innerHTML = "Email Verified";
        document.getElementById("emailVerifiedLabel2").innerHTML = "Your email address was successfully verified.";
    } catch (error) {
        document.getElementById("emailVerifiedFailedIcon").classList.remove("d-none");
        document.getElementById("emailVerifiedLabel1").innerHTML = "Email Verification Failed";
        document.getElementById("emailVerifiedLabel2").innerHTML = error;
    }
}

async function resendOTP() {
    await OTP_send_email();
}
