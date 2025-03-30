function createQrCode(string) {
  document.getElementById("qrcode").innerHTML = "";
  var qrcode = new QRCode("qrcode");

  function makeCode(string) {
    qrcode.makeCode(string);
  }
  makeCode(string);
}

function verifyButtonOTP(checkbox) {
  if (checkbox.checked == false) {
    EnableOTPViewSet(0);
  } else {
    let modal = new bootstrap.Modal(document.getElementById("twoFactorModal"));
    modal.show();
  }
}

async function previewImage(event) {
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
        await activateTopBar();
        imgElement.src = e.target.result;
      });
    };
  }
}

function appendDialCode() {
  console.log("entra sim senhora");
}

function handleOTPInput(field) {
  const currentId = parseInt(field.id.replace("otp", ""));
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

// Password validate
function passwordVisibility(passwordFieldId, toggleIconId) {
  const passwordInput = document.getElementById(passwordFieldId);
  const passwordIcon = document.getElementById(toggleIconId).querySelector("i");

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
  const lengthCheck = document.getElementById("lengthCheck");
  const upperCaseCheck = document.getElementById("upperCaseCheck");
  const numberCheck = document.getElementById("numberCheck");
  const specialCharCheck = document.getElementById("specialCharCheck");
  const validationMessage = document.getElementById(validationId);
  const confirmPass = document.getElementById(confirmPassId);

  confirmPass.value = "";

	const hasUpperCase = /[A-Z]/.test(password.value);
	const hasNumbers = /\d/.test(password.value);
	const hasSpecialChars = /[!@#_$%^&*(),.?":+{}|<>]/.test(password.value);
	const isValidLength = password.value.length >= 8;

  lengthCheck.className = isValidLength
    ? "requirement valid"
    : "requirement invalid";
  document.getElementById("lengthIcon").className = isValidLength
    ? "fa-solid fa-check"
    : "fa-solid fa-xmark";
  document.getElementById("lengthIcon").style.color = isValidLength
    ? "green"
    : "red";

  upperCaseCheck.className = hasUpperCase
    ? "requirement valid"
    : "requirement invalid";
  document.getElementById("upperCaseIcon").className = hasUpperCase
    ? "fa-solid fa-check"
    : "fa-solid fa-xmark";
  document.getElementById("upperCaseIcon").style.color = hasUpperCase
    ? "green"
    : "red";

  numberCheck.className = hasNumbers
    ? "requirement valid"
    : "requirement invalid";
  document.getElementById("numberIcon").className = hasNumbers
    ? "fa-solid fa-check"
    : "fa-solid fa-xmark";
  document.getElementById("numberIcon").style.color = hasNumbers
    ? "green"
    : "red";

  specialCharCheck.className = hasSpecialChars
    ? "requirement valid"
    : "requirement invalid";
  document.getElementById("specialCharIcon").className = hasSpecialChars
    ? "fa-solid fa-check"
    : "fa-solid fa-xmark";
  document.getElementById("specialCharIcon").style.color = hasSpecialChars
    ? "green"
    : "red";

  if (isValidLength && hasUpperCase && hasNumbers && hasSpecialChars) {
    validationMessage.classList.add("d-none");
  } else {
    validationMessage.classList.remove("d-none");
  }
}

function validatePhoneNumber(phoneId, validationId, errorIcon) {
  const phone = document.getElementById(phoneId);
  const validationMessage = document.getElementById(validationId);
  const icon = document.getElementById(errorIcon);

  const isNumeric = /^\d+$/.test(phone.value);
  if (isNumeric && phone.value.length <= 20) {
    validationMessage.classList.add("d-none");
    validationMessage.classList.add("valid");
    validationMessage.classList.remove("invalid");
  } else {
    icon.style.color = "red";
    validationMessage.classList.remove("d-none");
    validationMessage.classList.add("invalid");
    validationMessage.classList.remove("valid");
  }
}

function validatePasswordsMatch(
  passwordId1,
  passwordId2,
  validationId,
  iconId,
) {
  const password1 = document.getElementById(passwordId1);
  const password2 = document.getElementById(passwordId2);
  const validationMessage = document.getElementById(validationId);
  const icon = document.getElementById(iconId);

  validationMessage.classList.remove("d-none");
  if (password1.value === password2.value && password1.value.length >= 8) {
    validationMessage.classList.add("d-none");
    validationMessage.classList.add("valid");
    validationMessage.classList.remove("invalid");
  } else {
    icon.style.color = "red";
    validationMessage.classList.remove("d-none");
    validationMessage.classList.add("invalid");
    validationMessage.classList.remove("valid");
  }
}

function validateEmail(emailId, validationId, checkId) {
  const email = document.getElementById(emailId);
  const validationMessage = document.getElementById(validationId);
  const checkIcon = document.getElementById(checkId);

  const hasSingleAtSymbol = (email.value.match(/@/g) || []).length === 1;
  const hasAtSymbol = email.value.includes("@");
  const hasValidDomain =
    email.value.includes(".") &&
    email.value.indexOf(".") < email.value.length - 1;
  const hasCharactersBeforeAt = email.value.indexOf("@") > 0;

  if (
    hasSingleAtSymbol &&
    hasAtSymbol &&
    hasValidDomain &&
    hasCharactersBeforeAt &&
    email.value.length <= 50
  ) {
    checkIcon.style.color = "green";
    validationMessage.classList.add("d-none");
    validationMessage.classList.add("valid");
    validationMessage.classList.remove("invalid");
  } else {
    checkIcon.style.color = "red";
    validationMessage.classList.remove("d-none");
    validationMessage.classList.add("invalid");
    validationMessage.classList.remove("valid");
  }
}

function validateName(name, validationName, checkId) {
  const nameInput = document.getElementById(name);
  const validationMessage = document.getElementById(validationName);
  const checkIcon = document.getElementById(checkId);

  if (nameInput.value.length <= 50) {
    checkIcon.style.color = "green";
    validationMessage.classList.add("d-none");
    validationMessage.classList.add("valid");
    validationMessage.classList.remove("invalid");
  } else {
    checkIcon.style.color = "red";
    validationMessage.classList.remove("d-none");
    validationMessage.classList.add("invalid");
    validationMessage.classList.remove("valid");
  }
}

function validateNick(nick, validationNick, checkId) {
  const nickInput = document.getElementById(nick);
  const validationMessage = document.getElementById(validationNick);
  const checkIcon = document.getElementById(checkId);

  if (nickInput.value.length <= 20) {
    validationMessage.classList.add("d-none");
    validationMessage.classList.add("valid");
    validationMessage.classList.remove("invalid");
  } else {
    checkIcon.style.color = "red";
    validationMessage.classList.remove("d-none");
    validationMessage.classList.add("invalid");
    validationMessage.classList.remove("valid");
  }
}

function validateBirth(birthDate, validationBirth, checkId) {
  const birthInput = document.getElementById(birthDate);
  const validationMessage = document.getElementById(validationBirth);
  const checkIcon = document.getElementById(checkId);

  const birthValue = new Date(birthInput.value);
  const currentDate = new Date();

  currentDate.setHours(0, 0, 0, 0);

  if (birthValue < currentDate) {
    validationMessage.classList.add("d-none");
    validationMessage.classList.add("valid");
    validationMessage.classList.remove("invalid");
  } else {
    checkIcon.style.color = "red";
    validationMessage.classList.remove("d-none");
    validationMessage.classList.add("invalid");
    validationMessage.classList.remove("valid");
  }
}

function validateBio(bioText, validationBio, checkId) {
  const bioInput = document.getElementById(bioText);
  const validationMessage = document.getElementById(validationBio);
  const checkIcon = document.getElementById(checkId);

  if (bioInput.value.length <= 2000) {
    checkIcon.style.color = "green";
    validationMessage.classList.add("d-none");
    validationMessage.classList.add("valid");
    validationMessage.classList.remove("invalid");
  } else {
    checkIcon.style.color = "red";
    validationMessage.classList.remove("d-none");
    validationMessage.classList.add("invalid");
    validationMessage.classList.remove("valid");
  }
}

// change icon gender
function updateIcon() {
  const genderSelect = document.getElementById("gender");
  const icon = document.getElementById("icon");

  switch (genderSelect.value) {
    case "male":
      icon.className = "fa-solid fa-mars";
      break;
    case "female":
      icon.className = "fa-solid fa-venus";
      break;
    case "other":
      icon.className = "fa-solid fa-neuter";
      break;
    default:
      icon.className = "";
  }
}

function toggleSwitch(checkbox) {
  const switchLabel = checkbox;
  console.log(switchLabel);
  if (checkbox.checked) {
    switchLabel.style.backgroundColor = "green";
    switchLabel.style.borderColor = "green";
  } else {
    switchLabel.style.backgroundColor = "";
    switchLabel.style.borderColor = "";
  }
}

async function insertOwnProfileInfo() {
  document.getElementById("birthdayText").textContent = await UserInfo.getUserBirthdate();
  document.getElementById("genderText").textContent = await UserInfo.getUserGender();
  document.getElementById("nicknameText").textContent = await UserInfo.getUserNick();
  document.getElementById("bioText").textContent = await UserInfo.getUserBio();
  document.getElementById("fullNameText").textContent = await UserInfo.getUserFirstName() + " " + await UserInfo.getUserLastName();
  document.getElementById("phoneNumberText").textContent = await UserInfo.getUserPhoneNumber();

  // edit pop up
  document.getElementById("birthday").value = await UserInfo.getUserBirthdate();
	document.getElementById("avatarPreview").src = await UserInfo.getUserAvatarPath();

  let genderSelect = document.getElementById("gender");
  let userGender = await UserInfo.getUserGender();
  if (userGender) {
    genderSelect.value = userGender;
    updateIcon();
  }
  if (await UserInfo.getUserID()  != null)
    document.getElementById("fullNameText").classList.add = "d-none";
}