//? /authapi/register/
async function sendSignup(form) {
	// Login function
	const userLang = localStorage.getItem("language") || "en";
	const langData = await getLanguageData(userLang);
	console.log("[sendSignup]");
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
			form.reset();
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

