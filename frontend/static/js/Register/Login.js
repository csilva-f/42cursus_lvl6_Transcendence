async function loginSuccess(data) {
    jwtToken = data.access;
    await JWT.setTempToken(data);
    const opt_status = await OTP_check_enable(jwtToken);
    console.log(opt_status);

    if (opt_status == true) {
        await OTP_send_email();
        window.history.pushState({}, "", "/mfa");
        await locationHandler("content");
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
            localStorage.setItem("jwt", jwtToken);
            await JWT.setToken(data);
            console.log("Access: ", await JWT.getAccess());
        }
        await UserInfo.refreshUser();
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
    } else {
        checkIcon.style.color = 'red';
        validationMessage.classList.remove('d-none');
        validationMessage.classList.add('invalid');
        validationMessage.classList.remove('valid');
    }
}

async function resendOTP() {
    await OTP_send_email();
}
