//? /authapi/otp-enable/
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
//? /api/get-userextensions/
//? /api/get-userextensions/?userID=x
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
			if (userID != null)
				insertUserLevel("profileLvlProgress", res.users[0].level);
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
//? /upload/
async function uploadAvatar(event) {
	const file = event.target.files[0];
	const reader = new FileReader();
	const imgElement = document.getElementById("avatarPreview");
	const apiUrl = "/upload";
	if (file) {
	  reader.readAsDataURL(file);
	  reader.onload = async function (e) {
		var form = new FormData();
		form.append("user", await UserInfo.getUserID());
		form.append("image", event.target.files[0], event.target.files[0].name);
  
		var settings = {
		  url: `${apiUrl}/`,
		  method: "POST",
		  timeout: 0,
		  headers: {
			Accept: "application/json",
		  },
		  processData: false,
		  mimeType: "multipart/form-data",
		  contentType: false,
		  data: form,
		  success: function (response) {
			console.log(response);
			imgElement.src = e.target.result;
		  },
		  error: function (response) {
			console.log(response);
		  },
		};
		$.ajax(settings).done(async function (response) {
		  response = JSON.parse(response);
		  await UserInfo.updateAvatar(response.filename);
		  await UserInfo.updateUserExtension();
		  await changeTopBarImg(e.target.result);
		  imgElement.src = e.target.result;
		});
	  };
	}
  }

  async function changePassword() {
	const userLang = localStorage.getItem("language") || "en";
	const langData = await getLanguageData(userLang);
	const	old_password = $("#currentPassword").val();
	const	new_password = $("#newPasswordChange").val();
	const	confirm_new_password = $("#confirmPasswordChange").val();
	const	form = document.getElementById("changePasswordForm");
	const apiUrl = "/authapi";
	const accessToken = await JWT.getAccess();
	$.ajax({
        type: "POST",
        url: `${apiUrl}/change-password/`,
        contentType: "application/json",
        headers: { 
			Accept: "application/json",
			Authorization: `Bearer ${accessToken}`,
		 },
        data: JSON.stringify({ old_password, new_password, confirm_new_password }),
		success: function (data) {
			$("#signup-message").text("Change password successfully");
			showSuccessToast(langData, langData.ChangePasswordSuccess);
			form.reset();
			// clearForm(form);
			$("#changePasswordModal").modal("hide");
		},
		error: function (xhr) {
            const data = JSON.parse(xhr.responseJSON);
            console.log("Change password failed:", data.error, xhr.responseJSON, data.error[0]);
			showErrorUserToast(langData, data.error[0]);
			// retornar os erros!!!
		}
	})
  }