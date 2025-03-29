window.ws_os = null;

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
			const data = JSON.parse(xhr.responseJSON);
			$("#customLogin-message").text(data.detail || "Login failed.");
		},
	});
}

async function loginSuccess(data) {
	jwtToken = data.access; // Store the JWT token
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
		window.history.pushState({}, "", "/");
		locationHandler();
		let uid = await UserInfo.getUserID();
		// initializeWebSocket(() => {
		// 	if (uid && window.ws_os && window.ws_os.readyState === WebSocket.OPEN) {
		// 	  //console.log("User ID:", UserInfo.getUserID());
		// 		window.ws_os.send(JSON.stringify({ user_id: uid }));
		// 	}
		// 	// requestOnlineUsers(function (onlineUsers) {
		// 	//     console.log("Test: Online users list (login):", onlineUsers);
		// 	// });
		// });
	}
	$("#customlogin-message").text("Login successful!");
}



function initializeWebSocket(callback = null) {
    if (window.ws_os && window.ws_os.readyState === WebSocket.OPEN) {
        console.log("WebSocket already open (no need for recreation).");
        if (callback) callback();
        return;
    }

    console.log("Initializing WebSocket...");
    const wsUrl = `wss://${window.location.host}/onlineStatus/`;
    window.ws_os = new WebSocket(wsUrl);

    window.ws_os.onopen = function () {
        console.log("WebSocket: user connection established successfully.");
        if (callback) callback();
    };

	window.ws_os.onmessage = function (e) {
        const data = JSON.parse(e.data);
        if (data.online_users) {
            console.log("Online users list:", data.online_users);
            if (window.onlineUsersCallback) {
                window.onlineUsersCallback(data.online_users);
            }
        } else {
            console.log("Message received:", e.data);
        }
    };

    window.ws_os.onerror = function (error) {
        console.error("WebSocket error:", error);
    };

    window.ws_os.onclose = function (event) {
        console.log("WebSocket connection closed:", event);
    };
}

//document.addEventListener("DOMContentLoaded", function () {

  //initializeWebSocket();
  //});

function requestOnlineUsers(callback) {
	console.log(window.ws_os);
    if (!window.ws_os || window.ws_os.readyState !== WebSocket.OPEN) {
        console.error("WebSocket is not open. Cannot fetch online users.");
        return;
    }
    window.ws_os.send(JSON.stringify({ action: "queryOnline" }));

	window.onlineUsersCallback = callback;
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
			const data = JSON.parse(xhr.responseJSON);
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
	const phone_number = $("#signupPhone").val();
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
			phone_number,
		}),
		success: function (data) {
			$("#signup-message").text("Signup successful! Validate your email");
			showSuccessToast(langData, langData.signUpSuccess);
			return true;
		},
		error: function (xhr, error) {
			const data = JSON.parse(xhr.responseJSON);
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
			$("#customlogin-message").text("Login successful!");
		},
		error: function (xhr) {
			const data = JSON.parse(xhr.responseJSON);
			$("#customLogin-message").text(data["error_description"]  || "Login failed.");
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
			success: async function (data) {
				console.log(data);
				await sendOAuthLogin(data);
				$("#customlogin-message").text("Login successful!");
				//window.location.href = '/';
			},
			error: function (xhr) {
				const data = JSON.parse(xhr.responseJSON);
				console.log(data["error_description"]);
				$("#customlogin-message").text(data["error_description"] || "Login failed.");
			},
		});
	}
}

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
    		localStorage.setItem("jwt", jwtToken);
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
				const data = JSON.parse(xhr.responseJSON);
				$("#customlogin-message").text(data.error || "Login failed.");
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
			const data = JSON.parse(xhr.responseJSON);
			$("#customlogin-message").text(data.error || "Login failed.");
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
	console.log('Token:', token);
	console.log('Access:', access);
	$.ajax({
    type: "POST",
    url: `${apiUrl}/otp-verify/`,
    contentType: "application/json",
    headers: { Accept: "application/json",
              Authorization: `Bearer ${access}` },
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
      		// requestOnlineUsers(function (onlineUsers) {
      		//     console.log("Test: Online users list (login):", onlineUsers);
      		// });
     	});
      window.history.pushState({}, "", "/");
      locationHandler("content");
    },
    error: function (xhr) {
      const data = JSON.parse(xhr.responseJSON);
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
async function EnableOTPViewSet(status) {
	jwtToken = await JWT.getAccess();
	console.log("JWT: ", jwtToken);
	const apiUrl = "/authapi";
	$.ajax({
	  type: "POST",
	  url: `${apiUrl}/otp-enable/`,
	  contentType: "application/json",
	  headers: {
		Accept: "application/json",
		Authorization: `Bearer ${jwtToken}`,
	  },
	  data: JSON.stringify({ status }),
	  success: function (data) {
		console.log("Sucess");
		if (status == 1) {
		  createQrCode(data.otpauth_uri);
		  let modal = new bootstrap.Modal(document.getElementById("codeModal"));
		  modal.show();
		}
	  },
	  error: function (xhr) {
		$("#login-message").text(data.error || "Error");
	  },
	});
  }

async function fetchProfileInfo(userID) {
	const userLang = localStorage.getItem("language") || "en";
	const langData = await getLanguageData(userLang);
	const accessToken = await JWT.getAccess();
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

			if (!window.ws_os || window.ws_os.readyState !== WebSocket.OPEN) {
				console.warn("WebSocket not found or closed. Reinitializing...");
				initializeWebSocket(() => {
					requestOnlineUsers(function (onlineUsers) {
						console.log("Updated online users list:", onlineUsers);
						insertProfileInfo(res.users[0], onlineUsers);
					});
				});
			} else {
				requestOnlineUsers(function (onlineUsers) {
					console.log("Updated online users list:", onlineUsers);
					insertProfileInfo(res.users[0], onlineUsers);
				});
			}
			updateContent(langData);
		},
		error: function (xhr, status, error) {
			console.error("Error thrown:", error);
			showErrorToast(APIurl, error, langData);
		},
	});
}

// async function getUserExtensions(userID, accessToken) {
//     const APIurl = userID ? `/api/get-userextensions/?userID=${userID}` : `/api/get-userextensions/`;
//     try {
//         const response = await $.ajax({
//             type: "GET",
//             url: APIurl,
//             contentType: "application/json",
//             headers: { Authorization: `Bearer ${accessToken}` },
//         });
//         console.log("Data get-userextension:", response);
//         return response.users[0];
//     } catch (error) {
//         console.error("Error GET user extension:", error);
//         return null;
//     }
// }

// async function getUserProfile(accessToken) {
//     const APIurl = `/api/get-profile/`;
//     try {
//         const response = await $.ajax({
//             type: "GET",
//             url: APIurl,
//             contentType: "application/json",
//             headers: { Authorization: `Bearer ${accessToken}` },
//         });
//         console.log("Data get-profile:", response);
//         return response.data || response;
//     } catch (error) {
//         console.error("Error GET user profile:", error);
//         return null;
//     }
// }

// async function fetchProfileInfo(userID) {
//     const userLang = localStorage.getItem("language") || "en";
//     const langData = await getLanguageData(userLang);
//     const accessToken = await JWT.getAccess();
//     console.log("🔹 fetchProfileInfo() iniciado, accessToken:", accessToken);

//     try {
//         const [userExtensions, userProfile] = await Promise.all([
//             getUserExtensions(userID, accessToken),
//             getUserProfile(accessToken)
//         ]);

//         if (!userExtensions || !userProfile) {
//             console.error("Error: incomplete data!");
//             return;
//         }

//         const userData = { ...userExtensions, ...userProfile };
//         console.log("Combined profile data:", userData);

//         if (!window.ws_os || window.ws_os.readyState !== WebSocket.OPEN) {
// 			console.warn("WebSocket not found or closed. Reinitializing...");
// 			initializeWebSocket(() => {
// 				requestOnlineUsers(function (onlineUsers) {
// 					console.log("Updated online users list:", onlineUsers);
// 					insertProfileInfo(userData, onlineUsers);
// 				});
// 			});
// 		} else {
// 			requestOnlineUsers(function (onlineUsers) {
// 				console.log("Updated online users list:", onlineUsers);
// 				insertProfileInfo(userData, onlineUsers);
// 			});
// 		}

//         updateContent(langData);

//     } catch (error) {
//         console.error("Error profile data:", error);
//         showErrorToast("Error loading profile", error, langData);
//     }
// }

async function insertProfileInfo(UserElement, users_on) {
	console.log(UserElement);
	document.getElementById("birthdayText").textContent= UserElement.birthdate;
	document.getElementById("genderText").textContent= UserElement.gender;
	document.getElementById("phoneNumberText").textContent= UserElement.gender;
	document.getElementById("nicknameText").textContent= UserElement.nick;
	document.getElementById("bioText").textContent= UserElement.bio;

	console.log(Number(UserElement.id));
	console.log(users_on);
	if (users_on.includes(Number(UserElement.id))) {
        userOnStatus.style.backgroundColor = "green"; // Online
    } else {
        userOnStatus.style.backgroundColor = "white"; // Offline
        userOnStatus.style.border = "1px solid gray";
    }
}

async function validateVerifyEmail() {
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
      const data = JSON.parse(xhr.responseJSON);
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
	  console.log("Token validated successfully");
	},
	error: function (xhr) {
		const data = JSON.parse(xhr.responseJSON);
		document.getElementById("resetPwd-message").textContent = data.error || "Reset password failed.";
		console.log("Reset password failed:", data.error || "Reset password failed.");
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


async function submitResetPwd() {

}
