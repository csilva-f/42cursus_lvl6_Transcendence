//? /authapi/recover-password/
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

