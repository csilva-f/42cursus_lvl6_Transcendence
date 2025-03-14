function createQrCode(string) {
	document.getElementById("qrcode").innerHTML = "";
  var qrcode = new QRCode("qrcode");

  function makeCode(string) {
    qrcode.makeCode(string);
  }
  makeCode(string);
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

function verifyButtonOTP(checkbox) {
  if (checkbox.checked == false) {
    EnableOTPViewSet(0);
  } else {
    let modal = new bootstrap.Modal(document.getElementById("twoFactorModal"));
    modal.show();
  }
}

function previewImage(event) {
	const file = event.target.files[0];
	if (file) {
		const reader = new FileReader();
		reader.onload = function(e) {
			const avatarPreview = document.getElementById('avatarPreview');
			avatarPreview.src = e.target.result;
		}
		reader.readAsDataURL(file);
		console.log("avatar:");
		console.log(avatarPreview);
	}
}