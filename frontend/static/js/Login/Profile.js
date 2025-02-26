function createQrCode() {
	var qrcode = new QRCode("qrcode");

	function makeCode() {
		qrcode.makeCode("www.youtube.com");
	}
	makeCode();
}

async function EnableOTPViewSet(status) {
	jwtToken = await JWT.getAccess();
	$.ajax({
		type: "POST",
		url: `${apiUrl}/otp-enable/`,
		contentType: "application/json",
		headers: { Accept: "application/json" },
		data: JSON.stringify({ jwtToken , status}),
		success: function (data) {
			console.log("Sucess");
			if (status == 1) {
				let modal = new bootstrap.Modal(document.getElementById('codeModal'));
				modal.show();
			}
		},
		error: function (xhr) {
			$("#login-message").text(data.error || "Error");
		},
	  });
}

function verifyButtonOTP(checkbox) {
	if (checkbox.checked == false) {
		EnableOTPViewSet(0);
	} else {
	    let modal = new bootstrap.Modal(document.getElementById('twoFactorModal'));
	    modal.show();
	}
}