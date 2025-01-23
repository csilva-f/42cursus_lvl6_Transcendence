const avatar = document.getElementById('avatar');
const avatarPreview = document.getElementById('avatarPreview');
const editButton = document.getElementById('editButton');
const saveButton = document.getElementById('saveButton');
const firstName = document.getElementById('firstName');
const lastName = document.getElementById('lastName');
const phoneNumber = document.getElementById('phoneNumber');
const birthday = document.getElementById('birthday');
const gender = document.getElementById('gender');

saveButton.addEventListener('click', () => {
  const newFirstName = firstName.value;
  const newLastName = lastName.value;
  const newFullName = `${newFirstName} ${newLastName}`;

  document.getElementById('fullNameText').innerText = newFullName;
  document.getElementById('levelText').innerText = document.getElementById('levelText').innerText;
  document.getElementById('phoneNumberText').innerText = phoneNumber.value;
  document.getElementById('birthdayText').innerText = birthday.value;
  document.getElementById('genderText').innerText = gender.value;

  const modal = bootstrap.Modal.getInstance(document.getElementById('editProfile'));
  modal.hide();
});

avatar.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      avatarPreview.src = reader.result;
    };
    reader.readAsDataURL(file);
  }
});

avatarPreview.addEventListener('click', () => {
  avatar.click();
});
