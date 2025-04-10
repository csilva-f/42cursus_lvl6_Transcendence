function handleOTPInput(field) {
	const currentId = parseInt(field.id.replace('otp', ''));
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

function clearOTPFields() {
  for (let i = 1; i <= 6; i++) {
    const field = document.getElementById(`otp${i}`);
    field.value = '';
  }
}
