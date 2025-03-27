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
			jwtToken = data.access; // Store the JWT token
			const opt_status = await OTP_check_enable(jwtToken);
			console.log(opt_status);
			if (opt_status == true) {
				OTP_send_email(jwtToken);
				window.location.href = "/mfa";
			} else {
				if (jwtToken) {
					localStorage.setItem("jwt", jwtToken);
					console.log(data);
					JWT.setToken(data);
					console.log("Access: ", JWT.getAccess());
					await checkUserExtension();
				}
				window.history.pushState({}, "", "/");
				locationHandler("content");
			}
			$("#login-message").text("Login successful!");
		},
		error: function (xhr) {
			const data = xhr.responseJSON;
			$("#login-message").text(data.error || "Login failed.");
		},
	});
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
				var status = data.otp_enabled;
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

function verifyAccount() {
	let code = '';
	for (let i = 1; i <= 6; i++) {
		const field = document.getElementById(`otp${i}`);
		if (field)
			code += field.value;
	}
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

function validateNewPassword(passwordId, validationId, confirmPassId) {
	const password = document.getElementById(passwordId);
	const lengthCheck = document.getElementById('lengthCheck');
	const upperCaseCheck = document.getElementById('upperCaseCheck');
	const numberCheck = document.getElementById('numberCheck');
	const specialCharCheck = document.getElementById('specialCharCheck');
	const validationMessage = document.getElementById(validationId);
	const confirmPass = document.getElementById(confirmPassId);

	confirmPass.value = '';

	const hasUpperCase = /[A-Z]/.test(password.value);
	const hasNumbers = /\d/.test(password.value);
	const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password.value);
	const isValidLength = password.value.length >= 8;

	lengthCheck.className = isValidLength ? 'requirement valid' : 'requirement invalid';
	document.getElementById('lengthIcon').className = isValidLength ? 'fa-solid fa-check' : 'fa-solid fa-xmark';
	document.getElementById('lengthIcon').style.color = isValidLength ? 'green' : 'red';

	upperCaseCheck.className = hasUpperCase ? 'requirement valid' : 'requirement invalid';
	document.getElementById('upperCaseIcon').className = hasUpperCase ? 'fa-solid fa-check' : 'fa-solid fa-xmark';
	document.getElementById('upperCaseIcon').style.color = hasUpperCase ? 'green' : 'red';

	numberCheck.className = hasNumbers ? 'requirement valid' : 'requirement invalid';
	document.getElementById('numberIcon').className = hasNumbers ? 'fa-solid fa-check' : 'fa-solid fa-xmark';
	document.getElementById('numberIcon').style.color = hasNumbers ? 'green' : 'red';

	specialCharCheck.className = hasSpecialChars ? 'requirement valid' : 'requirement invalid';
	document.getElementById('specialCharIcon').className = hasSpecialChars ? 'fa-solid fa-check' : 'fa-solid fa-xmark';
	document.getElementById('specialCharIcon').style.color = hasSpecialChars ? 'green' : 'red';

	if (isValidLength && hasUpperCase && hasNumbers && hasSpecialChars) {
		validationMessage.classList.add('d-none');
	} else {
		validationMessage.classList.remove('d-none');
	}
}

function validatePhoneNumber(phoneId, validationId, errorIcon) {
	const phone = document.getElementById(phoneId);
	const validationMessage = document.getElementById(validationId);
	const icon = document.getElementById(errorIcon);

	const isValidLength = phone.value.length === 9;
	const isNumeric = /^\d+$/.test(phone.value);
	if (isValidLength && isNumeric) {
		validationMessage.classList.add('d-none');
		validationMessage.classList.add('valid');
		validationMessage.classList.remove('invalid');
	} else {
		icon.style.color = '#ff2600';
		validationMessage.classList.remove('d-none');
		validationMessage.classList.add('invalid');
		validationMessage.classList.remove('valid');
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
		validationMessage.classList.add('valid');
		validationMessage.classList.remove('invalid');
	} else {
		icon.style.color = '#ff2600';
		validationMessage.classList.remove('d-none');
		validationMessage.classList.add('invalid');
		validationMessage.classList.remove('valid');
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
			insertProfileInfo(res.users[0]), userID;
			updateContent(langData);
		},
		error: function (xhr, status, error) {
			console.error("Error Thrown:", error);
			showErrorToast(APIurl, error, langData);
		},
	});
}

async function insertProfileInfo(UserElement, userID) {
	document.getElementById("birthdayText").textContent= UserElement.birthdate;
	document.getElementById("genderText").textContent= UserElement.gender;
	document.getElementById("nicknameText").textContent= UserElement.nick;
	document.getElementById("bioText").textContent= UserElement.bio;

	// edit pop up
	document.getElementById("birthday").value = UserElement.birthdate;

	let genderSelect = document.getElementById("gender");
	if (UserElement.gender) {
		genderSelect.value = UserElement.gender.toLowerCase(); 
		updateIcon();
	}
	if (userID != null)
		document.getElementById("fullNameText").classList.add=("d-none");
		
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

async function GetProfileView() {
	const userLang = localStorage.getItem("language") || "en";
	const langData = await getLanguageData(userLang);
	const accessToken = await JWT.getAccess();
	const apiUrl = "/authapi";
 $.ajax({
	 type: "POST",
	 url: `${apiUrl}/get-profile/`, 
	 contentType: "application/json",
	 headers: {
		 "Authorization": `Bearer ${accessToken}`
	 },
	 data: "",
	 success: function (res) {
		 insertProfileData(res.data);
		 //updateContent(langData);
		 console.log("data do get: " ,res);
	 },
	 error: function (xhr, status, error) {
		console.error("Error Thrown:", error);
		showErrorToast(APIurl, error, langData);
	 }
 });
}

async function insertProfileData(UserElement) {
	document.getElementById("firstName").value = UserElement.first_name;
	document.getElementById("lastName").value = UserElement.last_name;
	document.getElementById("phoneNumber").value = UserElement.phone_number;

	document.getElementById("fullNameText").textContent = `${UserElement.first_name} ${UserElement.last_name}`;

	document.getElementById("phoneNumberText").textContent= UserElement.phone_number;
}

async function updateProfile() {
	const userLang = localStorage.getItem("language") || "en";
	const langData = getLanguageData(userLang);
	const accessToken = await JWT.getAccess();
	const apiUrl = "/authapi";
	const firstName = document.getElementById("firstName").value;
	const lastName = document.getElementById("lastName").value;
	const number = document.getElementById("phoneNumber").value;
	
	const data = {
		first_name: firstName,
		last_name: lastName,
		phone_number: number
	};
	$.ajax({
		type: "POST",
		url: `${apiUrl}/update-profile/`,
		contentType: "application/json",
		headers: {
			"Authorization": `Bearer ${accessToken}`
		},
		data: JSON.stringify(data),
		success: function(res) {
			console.log(res.message);
		},
		error: function(xhr, status, error) {
			console.error("Error Thrown:", error);
			showErrorToast(apiUrl, error, langData);
		}
	});
}
