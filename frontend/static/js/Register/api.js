//**********************************************************/
//*                         Login                          */
//**********************************************************/
//? /authapi/auth/
async function sendLogin() {
    const email = $("#loginEmail").val();
    const password = $("#loginPassword").val();
    const apiUrl = "/authapi";
    const userLang = localStorage.getItem("language") || "en";
	const langData = await getLanguageData(userLang);
    $.ajax({
        type: "POST",
        url: `${apiUrl}/auth/`,
        contentType: "application/json",
        headers: { Accept: "application/json" },
        data: JSON.stringify({ email, password }),
        success: async function (data) {
            await loginSuccess(data);
        },
        error: function (xhr) {
            const data = JSON.parse(xhr.responseJSON);
            $("#customLogin-message").text(data.detail || "Login failed.");
            showErrorUserToast(langData, data.detail);
        },
    });
}
//? /oauthapi/login/
async function oauthLogin() {
  const userLang = localStorage.getItem("language") || "en";
	const langData = await getLanguageData(userLang);
    const oauthapiUrl = "/oauthapi";
    $.ajax({
        type: "POST",
        url: `${oauthapiUrl}/login/`,
        contentType: "application/json",
        headers: { Accept: "application/json" },
        data: JSON.stringify({}),
        success: function (data) {
            console.log(data);
            url = data.url;
            if (url) {
                console.log(url);
                window.location.href = url;
            }
            showSuccessToast(langData, "Login successful!");
        },
        error: function (xhr) {
            const data = JSON.parse(xhr.responseJSON);
            showErrorUserToast(langData, data["error_description"] || "Login failed.");
        },
    });
}
//? /oauthapi/callback?code=x
async function oauthCallback() {
    const oauthapiUrl = "/oauthapi";
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const userLang = localStorage.getItem("language") || "en";
	const langData = await getLanguageData(userLang);
    if (code) {
        console.log("oauthCallback");
        $.ajax({
            type: "GET",
            url: `${oauthapiUrl}/callback?code=${encodeURIComponent(code)}`,
            contentType: "application/json",
            headers: { Accept: "application/json" },
            success: async function (data) {
                console.log(data);
                await sendOAuthLogin(data);
                showSuccessToast(langData, "Login successful!");
            },
            error: function (xhr) {
                const data = JSON.parse(xhr.responseJSON);
                console.log(data["error_description"]);
                showErrorUserToast(langData, data["error_description"] || "Login failed.");
            },
        });
    }
}
//? /oauthapi/oauthlogin/
async function sendOAuthLogin(userdata) {
    const apiUrl = "/oauthapi";
    const email = userdata.email;
    const first_name = userdata.first_name;
    const last_name = userdata.last_name;
    let phone = userdata.phone;
    if (phone == "hidden") phone = "+351000000000";
    $.ajax({
        type: "POST",
        url: `${apiUrl}/oauthlogin/`, // Adjust the endpoint as needed
        contentType: "application/json",
        headers: { Accept: "application/json" },
        data: JSON.stringify({ email, first_name, last_name, phone }),
        success: async function (data) {
            jwtToken = data.access; // Store the JWT token
            if (jwtToken) {
                await JWT.setToken(data);
            }
            $("#customlogin-message").text("Login successful!");
            await UserInfo.refreshUser();
            window.history.pushState({}, "", "/");
            locationHandler();
        },
        error: function (xhr) {
            const data = JSON.parse(xhr.responseJSON);
            $("#customlogin-message").text(data.error || "Login failed.");
        },
    });
}

//**********************************************************/
//*                       Sign Up                          */
//**********************************************************/
//? /authapi/validate-email/
async function validateVerifyEmail() {
    const urlParams = new URLSearchParams(window.location.search);
    const uid = urlParams.get("uid");
    const token = urlParams.get("token");
    const apiUrl = "/authapi";
    return new Promise((resolve, reject) => {
    $.ajax({
        type: "POST",
        url: `${apiUrl}/validate-email/`, // Adjust the endpoint as needed
        contentType: "application/json",
        headers: { Accept: "application/json" },
        data: JSON.stringify({ uid, token }),
        success: function (data) {
            resolve(true);
        },
        error: async function (xhr) {
            const data = JSON.parse(xhr.responseJSON);
            reject(data.error || "Email verification failed.");
        },
    });
    });
}

//**********************************************************/
//*                    Reset Password                      */
//**********************************************************/
//? /authapi/reset-password/
async function resetPassword() {
    const urlParams = new URLSearchParams(window.location.search);
    const userLang = localStorage.getItem("language") || "en";
	const langData = await getLanguageData(userLang);
    const uid = urlParams.get("uid");
    const token = urlParams.get("token");
    const password = $("#newPassword").val();
    const confirm_password = $("#confirmPassword").val();
    const	form = document.getElementById("resetPwd-form");
    if (password !== confirm_password) {
        document.getElementById("resetPwd-message").textContent = "Passwords do not match.";
        return;
    }
    const apiUrl = "/authapi";
    $.ajax({
        type: "POST",
        url: `${apiUrl}/reset-password/`, // Adjust the endpoint as needed
        contentType: "application/json",
        headers: { Accept: "application/json" },
        data: JSON.stringify({ uid, token, password, confirm_password }),
        success: function (data) {
            //renderizar aqui o form de reset password
            // console.log("Token validated successfully");
            $("#signup-message").text("Reset password successfully");
			showSuccessToast(langData, langData.ResetPasswordSuccess);
            form.reset();
            window.history.pushState({}, "", "/login");
            locationHandler();

        },
        error: function (xhr) {
            const data = JSON.parse(xhr.responseJSON);
            document.getElementById("resetPwd-message").textContent = data.error || "Reset password failed.";
            showErrorUserToast(langData, data.error[0]);
        },
    });
}
//**********************************************************/
//*                         MFA                            */
//**********************************************************/
//? /authapi/otp-status/
async function OTP_check_enable(jwtToken) {
    const apiUrl = "/authapi";
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: `${apiUrl}/otp-status/`, // Adjust the endpoint as needed
            contentType: "application/json",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${jwtToken}`
            },
            success: async function (data) {
                console.log(data);
                var status = data.is_2fa_enabled;
                await JWT.setOTPStatus(status);
                if (status > 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            },
            error: function (xhr) {
                const data = JSON.parse(xhr.responseJSON);
                $("#customlogin-message").text(data.error || "Login failed.");
                reject(data.error || "Login failed.");
            },
        });
    });
}
//! NOT IN USE (commented on Login.js:7)
//? /authapi/otp-send/
async function OTP_send_email() {
    const apiUrl = "/authapi";
    let jwtToken= await JWT.getTempToken();
    if (await JWT.getOTPStatus() != 2) return;
    if (!jwtToken) return;
    let access = jwtToken.access;
    console.log(access);
    $.ajax({
        type: "POST",
        url: `${apiUrl}/otp-send/`, // Adjust the endpoint as needed
        contentType: "application/json",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${access}`
         },
        //data: JSON.stringify({ access }),
        success: function (data) {
            console.log("sucess");
        },
        error: function (xhr) {
            const data = JSON.parse(xhr.responseJSON);
            $("#customlogin-message").text(data.error || "Login failed.");
        },
    });
}
//? /authapi/otp-verify/
async function verifyAccount() {
    let code = '';
    for (let i = 1; i <= 6; i++) {
        const field = document.getElementById(`otp${i}`);
        if (field)
            if (!Number.isInteger(parseInt(field.value))) {
                $("#mfa-message").text("Invalid code.");
                clearOTPFields();
                return;
            }
        code += field.value;
    }
    if (code.length < 6) {
        $("#mfa-message").text("Invalid code.");
        clearOTPFields();
        return;
    }
    const apiUrl = "/authapi";
    let token = await JWT.getTempToken();
    let access = await JWT.getTempAccess();
    console.log('Token:', token);
    console.log('Access:', access);
    $.ajax({
        type: "POST",
        url: `${apiUrl}/otp-verify/`,
        contentType: "application/json",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${access}`
        },
        data: JSON.stringify({ code }),
        success: async function (data) {
            console.log(data);
            JWT.setToken(token);
            await UserInfo.refreshUser();
            let uid = await UserInfo.getUserID();
            initializeWebSocket(() => {
                if (uid && window.ws_os && window.ws_os.readyState === WebSocket.OPEN) {
                    window.ws_os.send(JSON.stringify({ user_id: uid }));
                }
            });
            window.history.pushState({}, "", "/");
            locationHandler("content");
        },
        error: function (xhr) {
            const data = JSON.parse(xhr.responseJSON);
            $("#mfa-message").text(data.error || "Login failed.");
            clearOTPFields();
        },
    });
}
