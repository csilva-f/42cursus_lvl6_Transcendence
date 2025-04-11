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
    console.table(UserElement)
    if (UserElement.id != await UserInfo.getUserID()){
        document.getElementById("birthdayText").textContent = UserElement.birthdate;
        document.getElementById("genderText").textContent = UserElement.gender;
        document.getElementById("nicknameText").textContent = UserElement.nick;
        document.getElementById("bioText").textContent = UserElement.bio;
        document.getElementById("avatarPreview").src = `/static/img/profilePic/${UserElement.avatar}`;
        document.getElementById("phoneNumberText").textContent = "PRIVATE";
        
        console.log("gender: ", gender);
        console.log()
        console.log(Number(UserElement.id));
        console.log(users_on);
        if (users_on.includes(Number(UserElement.id))) {
            userOnStatus.style.backgroundColor = "green"; // Online
        } else {
            userOnStatus.style.backgroundColor = "white"; // Offline
            userOnStatus.style.border = "1px solid gray";
        }
    } else {
        document.getElementById("profileEditButton").classList.remove('d-none');
        document.getElementById("changePasswordButton").classList.remove('d-none');
        await insertOwnProfileInfo();
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
    await insertOwnProfileInfo();
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
    console.log("[insertOwnProfileInfo]")
    const fName = await UserInfo.getUserFirstName();
    const lName = await UserInfo.getUserLastName();
    const bDate = await UserInfo.getUserBirthdate();
    const bio = await UserInfo.getUserBio();
    let gender = await UserInfo.getUserGender();
    const pN = await UserInfo.getUserPhoneNumber();
    if (gender == 1)
        gender = 'male'
    else if (gender == 2)
        gender = 'female'
    else if (gender == 3)
        gender = 'other'
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
    document.getElementById("phoneNumber").value = pN;
    document.getElementById("birthday").value = bDate;
    document.getElementById("biography").value = bio;
    document.getElementById("gender").value = gender;
    updateIcon();
}

