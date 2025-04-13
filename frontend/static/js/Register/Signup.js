//? /authapi/register/
async function sendSignup(form) {
	// Login function
	const userLang = localStorage.getItem("language") || "en";
	const langData = await getLanguageData(userLang);
	const email = $("#signupEmail").val();
	const password = $("#signupPassword").val();
	const retyped = $("#signupPassword2").val();
	const first_name = $("#signupFirstname").val();
	const last_name = $("#signupLastname").val();
	const iti = intlTelInput.getInstance(document.getElementById('signupPhone'));
	const phone_number = iti.getNumber();
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
			clearForm(form);
			return true;
		},
		error: function (xhr, error) {
			const data = JSON.parse(xhr.responseJSON);
			showErrorUserToast(langData, data);
			/*if (data) {
				const errorMsg = data.match(/"(.*?)"/);
			}
			$("#signup-message").text(data || "register failed.");

			const emailInput = document.getElementById('signupEmail');
			const passwordInput = document.getElementById('signupPassword');
			const emailInvalid = document.getElementById('emailInvalid');
			const passwordInvalid = document.getElementById('passwordInvalid');

			emailInvalid.textContent = '';
			passwordInvalid.textContent = '';
			emailInput.setCustomValidity('');
			passwordInput.setCustomValidity('');

			if (data.includes("email")) {
				// emailInvalid.textContent = errorMsg[1];
				// emailInput.setCustomValidity(errorMsg[1]);
				// emailInput.classList.add('is-invalid');
			} else if (data.error.includes("password")) {
				showErrorUserToast(langData, data);
				// passwordInvalid.textContent = errorMsg[1];
				// passwordInput.setCustomValidity(errorMsg[1]);
				// passwordInput.classList.add('is-invalid');
			}*/
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

