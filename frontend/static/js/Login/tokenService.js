class tokenService {
  cookieRefreshName = "refresh";
  cookieAccessName = "access";
  cookieExpiricy = 1 * 60 * 1000;
  token = {};
  date = new Date();


  async redirectLogin() {
    window.history.pushState({}, "", "/mainPage");
    await locationHandler("allcontent");
  }

  async setToken(t) {
    this.token = t;
    this.setCookie();
  }
  deleteToken() {
    this.token = {};
    deleteCookies();
  }

  async getAccess() {
    let token = this.checkCookie(this.cookieAccessName);
    console.log("tokenService: ", token);
    if (!token) await this.updateToken();
    if (this.token.access) return this.token.access;
    return null;
  }

  async reloadPage() {
    console.log("relaodPage");
    let token = this.checkCookie(this.cookieRefreshName);
    if (!token) return null;
    await this.updateToken();
    return this.token.access;
  }

  async updateToken() {
    console.log("updateToken");
    const apiUrl = "/authapi";
    let token = this.checkCookie(this.cookieRefreshName);
    if (!token) {
      console.log("No token found");
      await this.redirectLogin();
    }
    console.log("token: ", token);
    $.ajax({
      type: "POST",
      url: `${apiUrl}/refresh/`,
      contentType: "application/json",
      headers: { Accept: "application/json" },
      data: JSON.stringify({ refresh: token }),
      success: async (data) => {
        console.log("Token updated");
        let tk = { refresh: token, access: data.access };
        await this.setToken(tk);
      },
      error: async (xhr) => {
        console.log("Error occurred, redirecting to login");
        await this.redirectLogin();
      },
    });
  }

  /* Cookie */
  setCookie() {
    this.date.setTime(this.date.getTime() + this.cookieExpiricy);
    let expires = "expires=" + this.date.toUTCString();
    document.cookie = this.cookieRefreshName + "=" + this.token.refresh;
    document.cookie = this.cookieAccessName + "=CucaBeludo;" + expires;
  }

  checkCookie(cookieName) {
    let decodedCookie = document.cookie.split(";");
    for (let i = 0; i < decodedCookie.length; i++) {
      let cookie = decodedCookie[i];
      while (cookie.charAt(0) == " ") cookie = cookie.substring(1);
      if (cookie.indexOf(cookieName + "=") == 0)
        return cookie.substring(cookieName.length + 1, cookie.length);
    }
    return "";
  }
  deleteCookies() {
    const pastDate = new Date(0).toUTCString();
    document.cookie =
      this.cookieRefreshName + "=; expires=" + pastDate + "; path=/";
    document.cookie =
      this.cookieAccessName + "=; expires=" + pastDate + "; path=/";
  }
}
