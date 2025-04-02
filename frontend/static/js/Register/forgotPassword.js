//? /authapi/recover-password/
async function forgotPwd() {
	// Forgot Password function
	const userLang = localStorage.getItem("language") || "en";
	const langData = await getLanguageData(userLang);
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
			$("#signup-message").text("E-mail send successfully");
			showSuccessToast(langData, langData.RecoverPasswordSuccess);
			//element.classList.add("valid-feedback");
		},
		error: function (xhr) {
			const data = JSON.parse(xhr.responseJSON);
			$("#forgotPwd-message").text(data.error || "forgotPwd failed.");
		},
	});
}

