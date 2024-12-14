async function sendLogin() {
    // Login function
  const email = $("#loginEmail").val();
  const password = $("#loginPassword").val();
  const apiUrl = "/authapi";
  $.ajax({
      type: "POST",
      url: `${apiUrl}/auth/`, // Adjust the endpoint as needed
      contentType: "application/json",
      headers: { Accept: "application/json" },
      data: JSON.stringify({ email, password }),
      success: function (data) {
          jwtToken = data.access; // Store the JWT token
          if (jwtToken) {
              localStorage.setItem("jwt", jwtToken);
          }
          $("#login-message").text("Login successful!");
      },
      error: function (xhr) {
          const data = xhr.responseJSON;
          $("#login-message").text(
              data.error || "Login failed.",
          );
      },
    });
};


async function sendSignup() {
    // Login function
    console.log("sendSignup");
    const email = $("#signupEmail").val();
    const password = $("#signupPassword").val();
    const retyped = $("#signupPassword2").val();
    const first_name = $("#signupFirstname").val();
    const last_name = $("#signupLastname").val();
    const phone = $("#signupPhone").val();
    const apiUrl = "/authapi";
    $.ajax({
        type: "POST",
        url: `${apiUrl}/register/`, // Adjust the endpoint as needed
        contentType: "application/json",
        headers: { Accept: "application/json" },
        data: JSON.stringify({
            email,
            password,
            first_name,
            last_name,
            phone,
        }),
        success: function (data) {
            $("#signup-message").text(
                "Signup successful! Validate your email",
            );
        },
        error: function (xhr) {
            const data = xhr.responseJSON;
            $("#signup-message").text(
                data.error || "register failed.",
            );
        },
    });
};
