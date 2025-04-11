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

async function insertProfileInfo(UserElement, users_on) {
    console.log("[insertProfileInfo]")
    const userLang = localStorage.getItem("language") || "en";
    const langData = await getLanguageData(userLang);
    const errorMsg = "Error, empty field"; 
    if ((!UserElement.birthdate) || (!UserElement.gender) || (!UserElement.nick)) {
        showErrorUserToast(langData, errorMsg);
        return ;
    }
    document.getElementById("birthdayText").textContent = UserElement.birthdate;
    document.getElementById("genderText").textContent = UserElement.gender;
    document.getElementById("nicknameText").textContent = UserElement.nick;
    document.getElementById("bioText").textContent = UserElement.bio;
    document.getElementById("avatarPreview").src = `/static/img/profilePic/${UserElement.avatar}`;
    document.getElementById("phoneNumberText").textContent = "PRIVATE";

    console.log("gender: ", gender);
    console.log(Number(UserElement.id));
    console.log(users_on);
    if (users_on.includes(Number(UserElement.id))) {
        userOnStatus.style.backgroundColor = "green"; // Online
    } else {
        userOnStatus.style.backgroundColor = "white"; // Offline
        userOnStatus.style.border = "1px solid gray";
    }
    if (UserElement.id == await UserInfo.getUserID()) {
        document.getElementById("profileEditButton").classList.remove('d-none');
        document.getElementById("changePasswordButton").classList.remove('d-none');
    }
}

async function updateProfile() {
    UserInfo.updateFirstName(document.getElementById("firstName").value);
    UserInfo.updateLastName(document.getElementById("lastName").value);
    UserInfo.updatePhoneNumber(document.getElementById("phoneNumber").value);
    UserInfo.updateBirthdate(document.getElementById("birthday").value);
    let gender = document.getElementById("gender").value;
    if (gender == "male")
        UserInfo.updateGender(1);
    else if (gender == "female")
        UserInfo.updateGender(2);
    else
        UserInfo.updateGender(3);
    UserInfo.updateBio(document.getElementById("biography").value);
    await UserInfo.updateProfile();
    await UserInfo.updateUserExtension();
    insertOwnProfileInfo();
}

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

function validateNick(nick, validationNick, checkId) {
    const nickInput = document.getElementById(nick);
    const validationMessage = document.getElementById(validationNick);
    const checkIcon = document.getElementById(checkId);

    if (nickInput.value.length <= 20 && nickInput.value.length > 0) {
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
        validationMessage.classList.add('d-none');
        validationMessage.classList.add('valid');
        validationMessage.classList.remove('invalid');
    } else {
        checkIcon.style.color = 'red';
        validationMessage.classList.remove('d-none');
        validationMessage.classList.add('invalid');
        validationMessage.classList.remove('valid');
    }
}

async function insertOwnProfileInfo() {
    const fName = await UserInfo.getUserFirstName();
    const lName = await UserInfo.getUserLastName();
    const bDate = await UserInfo.getUserBirthdate();
    const bio = await UserInfo.getUserBio();
    const gender = await UserInfo.getUserGender();
    const pN = await UserInfo.getUserPhoneNumber();
    //? Exterior Info
    document.getElementById("birthdayText").textContent = bDate;
    document.getElementById("genderText").textContent = gender;
    document.getElementById("nicknameText").textContent = await UserInfo.getUserNick();
    document.getElementById("bioText").textContent = bio;
    document.getElementById("fullNameText").textContent = fName + " " + lName;
    document.getElementById("phoneNumberText").textContent = pN;
    document.getElementById("avatarPreview").src = await UserInfo.getUserAvatarPath();
    //? Pop-up Info
    document.getElementById("firstName").value = fName;
    document.getElementById("lastName").value = lName;
    //document.getElementById("phoneNumber").value = pN;
    document.getElementById("birthday").value = bDate;
    document.getElementById("biography").value = bio;
    const input = document.querySelector("#phoneNumber");
    const iti = window.intlTelInput(input, {
        separateDialCode: true,
        initialCountry: "auto",
        loadUtils: () => import("/static/js/Libraries/intl.js"),
    });
    iti.setNumber(pN);
    const countryData = iti.getSelectedCountryData();

    let genderSelect = document.getElementById("gender");
    let userGender = await UserInfo.getUserGender();
    if (userGender) {
        genderSelect.value = userGender;
        updateIcon();
    }
}

