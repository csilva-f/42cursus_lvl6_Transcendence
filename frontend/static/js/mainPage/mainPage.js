function goToLogin() {
    window.history.pushState({}, "", "/login");
    locationHandler("content");
}