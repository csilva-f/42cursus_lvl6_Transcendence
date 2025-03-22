class tokenService {
  cookieRefreshName = "refresh";
  cookieAccessName = "access";
  cookieExpiricy = 1 * 60 * 1000;
  token = {};
  tempToken = {};
  date = new Date();
  isUpdating = false;


  async redirectLogin() {
    window.history.pushState({}, "", "/mainPage");
    await locationHandler("allcontent");
  }

  async setToken(t) {
    console.log("Token: ", t);
    this.token = t;
    this.setCookie();
  }

  async getTempAccess() {
    return this.tempToken.access;
  }

  async getTempToken() {
    return this.tempToken;
  }

  async setTempToken(t) {
    console.log("setTempToken: ", t);
    this.tempToken = t;
  }

  deleteToken() {
    this.token = {};
    this.tempToken = {};
    deleteCookies();
  }

  async getAccess() {
    let cookie = this.checkCookie(this.cookieAccessName);
    console.log("tokenService: ", cookie);
    if (cookie && this.token.access) return this.token.access;
    if (!this.isUpdating) {
      this.isUpdating = true;
      try{
        await this.updateToken();
      }
      catch(error){
        console.log("Error updating token");
        this.isUpdating = false;
        await this.redirectLogin();
      }
    }
    else {
      console.log("Waiting for token update");
      while (this.isUpdating) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }
    cookie = this.checkCookie(this.cookieAccessName);
    if (cookie) return this.token.access;
    return null;
  }

  async reloadPage() {
    console.log("relaodPage");
    let token = this.checkCookie(this.cookieRefreshName);
    if (!token) return null;
    try{
      await this.updateToken();
    }
    catch(error){
      console.log("Error updating token");
    }
    return this.token.access;
  }

  async updateToken() {
      console.log("updateToken");
      const apiUrl = "/authapi";
      let token = this.checkCookie(this.cookieRefreshName);

      if (!token) {
          console.log("No token found");
          await this.redirectLogin();
          return; // Exit if no token is found
      }

      console.log("token: ", token);

      try {
          const data = await $.ajax({
              type: "POST",
              url: `${apiUrl}/refresh/`,
              contentType: "application/json",
              headers: { Accept: "application/json" },
              data: JSON.stringify({ refresh: token }),
          });

          console.log("Token updated");
          let tk = { refresh: token, access: data.access };
          await this.setToken(tk);
          this.isUpdating = false;
          return; // Successfully updated, exit the function

      } catch (xhr) {
          console.log("Error occurred, redirecting to login");
          await this.redirectLogin();
          this.isUpdating = false;
          throw new Error("Token update failed"); // Throw an error to indicate failure
      }
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
      while (cookie.charAt(0) == " ") {
        cookie = cookie.substring(1);
      }
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
