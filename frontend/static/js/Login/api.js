async function sendLogin() {
	// Login function
	const email = $("#loginEmail").val();
	const password = $("#loginPassword").val();
	const apiUrl = "/authapi";
	$.ajax({
		type: "POST",
		url: `${apiUrl}/auth/`, // Adjust the endpoint as needed
		contentType: "application/json",
		headers: { Accept: "application/json" },
		data: JSON.stringify({ email, password }),
		success: async function (data) {
		  await loginSuccess(data);
		},
		error: function (xhr) {
			const data = xhr.responseJSON;
			$("#login-message").text(data.error || "Login failed.");
		},
	});
}

async function loginSuccess(data) {
  jwtToken = data.access; // Store the JWT token
	const otp_status = await OTP_check_enable(jwtToken);
	console.log("BMC: ", otp_status);
	if (otp_status) {
		//OTP_send_email(jwtToken);
		await JWT.setTempToken(data);
		window.history.pushState({}, "", "/mfa");
		locationHandler("content");
	} else {
		if (jwtToken) {
			localStorage.setItem("jwt", jwtToken);
			await JWT.setToken(data);
			console.log("Access: ", await JWT.getAccess());
			await checkUserExtension();
		}
		window.history.pushState({}, "", "/");
		locationHandler("content");
	}
	$("#login-message").text("Login successful!");
}


async function checkUserExtension() {
	const APIurl = `/api/create-userextension/`
	const accessToken = await JWT.getAccess();
	console.log("checkUserExtension, accessToken: ", accessToken)
	return new Promise((resolve, reject) => {
		$.ajax({
		  type: "POST",
		  url: APIurl,
		  contentType: "application/json",
		  headers: {
			Authorization: `Bearer ${accessToken}`,
		  },
		  success: function (res) {
			resolve(res.user);
		  },
		  error: function (xhr, status, error) {
			reject(error);
		  },
		});
	  });
}

async function forgotPwd() {
	// Forgot Password function
	const email = $("#ForgotPwdEmail").val();
	const apiUrl = "/authapi";
	$.ajax({
		type: "POST",
		url: `${apiUrl}/recover-password/`,
		contentType: "application/json",
		headers: { Accept: "application/json" },
		data: JSON.stringify({ email }),
		success: function (data) {
			element = document.getElementById("forgotPwd-message");
			element.classList.remove("invalid-feedback");
			element.textContent = "E-mail send successfully";
			//element.classList.add("valid-feedback");
		},
		error: function (xhr) {
			const data = xhr.responseJSON;
			$("#forgotPwd-message").text(data.error || "forgotPwd failed.");
		},
	});
}

async function sendSignup(form) {
	// Login function
	const userLang = localStorage.getItem("language") || "en";
	const langData = await getLanguageData(userLang);
	console.log("sendSignup");
	const email = $("#signupEmail").val();
	const password = $("#signupPassword").val();
	const retyped = $("#signupPassword2").val();
	const first_name = $("#signupFirstname").val();
	const last_name = $("#signupLastname").val();
	const phone = $("#signupPhone").val();
	const apiUrl = "/authapi/register/";
	$.ajax({
		type: "POST",
		url: apiUrl, // Adjust the endpoint as needed
		contentType: "application/json",
		headers: { Accept: "application/json" },
		data: JSON.stringify({
			email,
			password,
			first_name,
			last_name,
			phone,
		}),
		success: function (data) {
			$("#signup-message").text("Signup successful! Validate your email");
			showSuccessToast(langData, langData.signUpSuccess);
			return true;
		},
		error: function (xhr, error) {
			const data = xhr.responseJSON;
			const errorMsg = data.error.match(/"(.*?)"/);
			$("#signup-message").text(data.error || "register failed.");

			const emailInput = document.getElementById('signupEmail');
			const passwordInput = document.getElementById('signupPassword');
			const emailInvalid = document.getElementById('emailInvalid');
			const passwordInvalid = document.getElementById('passwordInvalid');

			emailInvalid.textContent = '';
			passwordInvalid.textContent = '';
			emailInput.setCustomValidity('');
			passwordInput.setCustomValidity('');

			if (data.error.includes("email")) {
				emailInvalid.textContent = errorMsg[1];
				emailInput.setCustomValidity(errorMsg[1]);
				emailInput.classList.add('is-invalid');
			} else if (data.error.includes("password")) {
				passwordInvalid.textContent = errorMsg[1];
				passwordInput.setCustomValidity(errorMsg[1]);
				passwordInput.classList.add('is-invalid');
			}
			return false;
		},
	});
	form.querySelectorAll('input').forEach(input => {
		input.addEventListener('input', () => {
			input.setCustomValidity(''); // Redefine a validade
			input.classList.remove('is-invalid'); // Remove a classe de erro
			const invalidFeedback = input.nextElementSibling;
			if (invalidFeedback) {
				invalidFeedback.textContent = ''; // Limpa a mensagem de erro
			}
		});
	});
}

async function oauthLogin() {
	const oauthapiUrl = "/oauthapi";
	$.ajax({
		type: "POST",
		url: `${oauthapiUrl}/login/`, // Adjust the endpoint as needed
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
			$("#login-message").text("Login successful!");
		},
		error: function (xhr) {
			const data = xhr.responseJSON;
			$("#login-message").text(data.error || "Login failed.");
		},
	});
}

async function oauthCallback() {
	const oauthapiUrl = "/oauthapi";
	const urlParams = new URLSearchParams(window.location.search);
	const code = urlParams.get("code");
	if (code) {
		console.log("oauthCallback");
		$.ajax({
			type: "GET",
			//url: `${oauthapiUrl}/callback`,
			url: `${oauthapiUrl}/callback?code=${encodeURIComponent(code)}`,
			contentType: "application/json",
			headers: { Accept: "application/json" },
			//data: JSON.stringify({ code: code }),
			success: function (data) {
				console.log(data);
				sendOAuthLogin(data);
				$("#login-message").text("Login successful!");
				//window.location.href = '/';
			},
			error: function (xhr) {
				const data = xhr.responseJSON;
				$("#login-message").text(data.error || "Login failed.");
			},
		});
	}
}

async function sendOAuthLogin(userdata) {
	const apiUrl = "/oauthapi";
	const email = userdata.email;
	const first_name = userdata.first_name;
	const last_name = userdata.last_name;
	const phone = userdata.phone;
	$.ajax({
		type: "POST",
		url: `${apiUrl}/oauthlogin/`, // Adjust the endpoint as needed
		contentType: "application/json",
		headers: { Accept: "application/json" },
		data: JSON.stringify({ email, first_name, last_name, phone }),
		success: function (data) {
			jwtToken = data.token; // Store the JWT token
			redirect = data.redirect;
			if (redirect) {
				window.location.href = redirect;
			}
			if (jwtToken) {
				localStorage.setItem("jwt", jwtToken);
			}
			$("#login-message").text("Login successful!");
		},
		error: function (xhr) {
			const data = xhr.responseJSON;
			$("#login-message").text(data.error || "Login failed.");
		},
	});
}

// MFA
async function OTP_check_enable(jwtToken) {
	const apiUrl = "/authapi";
	return new Promise((resolve, reject) => {
		$.ajax({
			type: "POST",
			url: `${apiUrl}/otp-status/`, // Adjust the endpoint as needed
			contentType: "application/json",
			headers: { Accept: "application/json" },
			data: JSON.stringify({ jwtToken }),
			success: function (data) {
				console.log(data);
				var status = data.is_2fa_enabled;
				if (status == 1) {
					resolve(true);
				} else {
					resolve(false);
				}
			},
			error: function (xhr) {
				const data = xhr.responseJSON;
				$("#login-message").text(data.error || "Login failed.");
				reject(data.error || "Login failed.");
			},
		});
	});
}

async function OTP_send_email(jwtToken) {
	const apiUrl = "/authapi";
	$.ajax({
		type: "POST",
		url: `${apiUrl}/otp-send/`, // Adjust the endpoint as needed
		contentType: "application/json",
		headers: { Accept: "application/json" },
		data: JSON.stringify({ jwtToken }),
		success: function (data) {
			console.log("sucess");
		},
		error: function (xhr) {
			const data = xhr.responseJSON;
			$("#login-message").text(data.error || "Login failed.");
		},
	});
}

function handleOTPInput(field) {
	const currentId = parseInt(field.id.replace('otp', ''));
	const nextField = document.getElementById(`otp${currentId + 1}`);
	const prevField = document.getElementById(`otp${currentId - 1}`);

  if (field.value && nextField) nextField.focus();

  field.addEventListener("keydown", function (e) {

    if (e.key === "Backspace" && !field.value && prevField) prevField.focus();
  });

  field.addEventListener("paste", function (e) {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").split("");
    let currentId = parseInt(field.id.replace("otp", ""));

    pasteData.forEach((char) => {
      const targetField = document.getElementById(`otp${currentId}`);
      if (targetField) {
        targetField.value = char;
        currentId++;
      }
    });

    const lastField = document.getElementById(`otp${currentId - 1}`);
    if (lastField) lastField.focus();
  });
}




async function verifyAccount() {
	let code = '';
	for (let i = 1; i <= 6; i++) {
		const field = document.getElementById(`otp${i}`);
		if (field)
			code += field.value;
	}
	console.log('Code:', code);
	const apiUrl = "/authapi";
	let token = await JWT.getTempToken();
	let access = await JWT.getTempAccess();

	$.ajax({
    type: "POST",
    url: `${apiUrl}/otp-verify/`,
    contentType: "application/json",
    headers: { Accept: "application/json",
              Authorization: `Bearer ${access}` },
    data: JSON.stringify({ code }),
    success: function (data) {
      console.log(data);
      JWT.setToken(token);
      window.history.pushState({}, "", "/");
      locationHandler("content");
    },
    error: function (xhr) {
      const data = xhr.responseJSON;
      $("#mfa-message").text(data.error || "Login failed.");
      for (let i = 1; i <= 6; i++) {
  		const field = document.getElementById(`otp${i}`);
  		document.getElementById(`otp${i}`).value = '';
  	}
    },
  });

}

// Password validate
function passwordVisibility(passwordFieldId, toggleIconId) {
	const passwordInput = document.getElementById(passwordFieldId);
	const passwordIcon = document.getElementById(toggleIconId).querySelector('i');

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

function validateNewPassword(passwordId, validationId, iconId, confirmPassId) {
	const password = document.getElementById(passwordId);
	const validationMessage = document.getElementById(validationId);
	const icon = document.getElementById(iconId);
	const confirmPass = document.getElementById(confirmPassId);

	confirmPass.value = '';
	validationMessage.classList.remove('d-none');
	if (password.value.length >= 8) {
		validationMessage.classList.add('d-none');
	} else {
		icon.className = 'fa-solid fa-xmark';
		icon.style.color = '#ff2600';
	}
}

function validatePasswordsMatch(passwordId1, passwordId2, validationId, iconId) {
	const password1 = document.getElementById(passwordId1);
	const password2 = document.getElementById(passwordId2);
	const validationMessage = document.getElementById(validationId);
	const icon = document.getElementById(iconId);

	validationMessage.classList.remove('d-none');

	if (password1.value === password2.value && password1.value.length >= 8) {
		validationMessage.classList.add('d-none');
	} else {
		icon.className = 'fa-solid fa-xmark';
		icon.style.color = '#ff2600';
	}
}

// change icon gender
function updateIcon() {
	const genderSelect = document.getElementById('gender');
	const icon = document.getElementById('icon');

	switch (genderSelect.value) {
		case 'male':
			icon.className = 'fa-solid fa-mars';
			break;
		case 'female':
			icon.className = 'fa-solid fa-venus';
			break;
		case 'other':
			icon.className = 'fa-solid fa-neuter';
			break;
		default:
			icon.className = '';
	}
}

function toggleSwitch(checkbox) {
	const switchLabel = checkbox;
	console.log(switchLabel);
	if (checkbox.checked) {
		switchLabel.style.backgroundColor = 'green';
		switchLabel.style.borderColor = 'green';
	} else {
		switchLabel.style.backgroundColor = '';
		switchLabel.style.borderColor = '';
	}
}

async function fetchProfileInfo(userID) {
	const userLang = localStorage.getItem("language") || "en";
	const langData = await getLanguageData(userLang);
	const accessToken = await JWT.getAccess();
	console.log("fetchProfileInfo, accessToken: ", accessToken)
	let APIurl = `/api/get-userextensions/`
	if (userID != null)
		APIurl = `/api/get-userextensions/?userID=${userID}`
	$.ajax({
		type: "GET",
		url: APIurl,
		contentType: "application/json",
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
		success: function (res) {
			console.log(res);
			insertProfileInfo(res.users[0]);
			updateContent(langData);
		},
		error: function (xhr, status, error) {
			console.error("Error Thrown:", error);
			showErrorToast(APIurl, error, langData);
		},
	});
}

async function insertProfileInfo(UserElement) {
	document.getElementById("birthdayText").textContent= UserElement.birthdate;
	document.getElementById("genderText").textContent= UserElement.gender;
	document.getElementById("phoneNumberText").textContent= UserElement.gender;
	document.getElementById("nicknameText").textContent= UserElement.nick;
	document.getElementById("bioText").textContent= UserElement.bio;
}

async function validateEmail() {
  const urlParams = new URLSearchParams(window.location.search);
  const uid = urlParams.get("uid");
  const token = urlParams.get("token");
  const apiUrl = "/authapi";
  $.ajax({
    type: "POST",
    url: `${apiUrl}/validate-email/`, // Adjust the endpoint as needed
    contentType: "application/json",
    headers: { Accept: "application/json" },
    data: JSON.stringify({ uid, token }),
    success: function (data) {
      console.log("email validated successfully");
    },
    error: function (xhr) {
      const data = xhr.responseJSON;
      console.log("email failed validation");
    },
  });
}

async function resetPassword() {
  const urlParams = new URLSearchParams(window.location.search);
  const uid = urlParams.get("uid");
  const token = urlParams.get("token");
  const password = $("#newPassword").val();
  const confirm_password = $("#confirmPassword").val();
  const apiUrl = "/authapi";
  $.ajax({
    type: "POST",
    url: `${apiUrl}/reset-password/`, // Adjust the endpoint as needed
    contentType: "application/json",
    headers: { Accept: "application/json" },
    data: JSON.stringify({ uid, token, password, confirm_password }),
    success: function (data) {
      //renderizar aqui o form de reset password
      console.log("Token validated successfully");
    },
    error: function (xhr) {
      const data = xhr.responseJSON;
      console.log("token failed validation");
    },
  });
}
