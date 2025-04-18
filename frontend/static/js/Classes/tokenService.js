class tokenService {
  cookieRefreshName = "refresh";
  cookieAccessName = "access";
  cookieExpiricy = 1 * 10 * 1000;
  token = {};
  tempToken = {};
  date = new Date();
  timediff =  this.date.getTimezoneOffset();
  isUpdating = false;
  OTPStatus = false;


  async redirectLogin() {
    let location = window.location.pathname;
    let route = routes[location] || routes["404"];
    if (location === "/login" || route.title === "404") return;
    window.history.pushState({}, "", "/mainPage");
    await locationHandler();
  }

  async setToken(t) {
    this.token = t;
    await this.setCookie();
  }

  async getTempAccess() {
    return this.tempToken.access;
  }

  async getOTPStatus() {
    return this.OTPStatus;
  }

  async getTempToken() {
    return this.tempToken;
  }

  async setTempToken(t) {
    this.tempToken = t;
  }

  async setOTPStatus(t) {
    this.OTPStatus = t;
  }

  deleteToken() {
    this.token = {};
    this.tempToken = {};
    this.deleteCookies();
  }

  getIsUpdating() { return this.isUpdating; }


  async getAccess() {
    let cookie = await this.checkCookie(this.cookieAccessName);
    let cookieRefresh = await this.checkCookie(this.cookieRefreshName);
    if (cookie && this.token.access) return this.token.access;
    if (!this.isUpdating && cookieRefresh) {
      this.isUpdating = true;
      try{
        await this.updateToken();
      }
      catch(error){
        this.isUpdating = false;
        await this.redirectLogin();
      }
    }
    else {
      while (this.isUpdating) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }
    cookie = await this.checkCookie(this.cookieAccessName);
    if (cookie)
    {
      return this.token.access;
    }
    return null;
  }

  async reloadPage() {
    let token = await this.checkCookie(this.cookieRefreshName);
    if (!token) return null;
    if (!this.isUpdating) {
      this.isUpdating = true;
      await this.updateToken();
    }
    else {
      while (this.isUpdating) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }
    return this.token.access;
  }



  async updateToken() {
      const apiUrl = "/authapi";
      let token = await this.checkCookie(this.cookieRefreshName);

      if (!token) {
          await this.redirectLogin();
          return; // Exit if no token is found
      }
      return new Promise((resolve, reject) => {
        $.ajax({
          type: "POST",
          url: `${apiUrl}/refresh/`,
          contentType: "application/json",
          headers: { Accept: "application/json" },
          data: JSON.stringify({ refresh: token }),
          success: async (data) => {
            let tk = { refresh: token, access: data.access };
            this.isUpdating = false;
            await this.setToken(tk);

            resolve(); // Resolve the promise when the token is updated
          },
          error: async (xhr) => {
            this.isUpdating = false;
            await this.redirectLogin();
            reject(); // Reject the promise on error
          },
        });
      });
  }


  /* Cookie */
  async setCookie() {
    this.date = new Date();
    this.date.setTime(this.date.getTime() + this.cookieExpiricy);
    let expires = "expires=" + this.date.toUTCString();
    document.cookie = this.cookieRefreshName + "=" + this.token.refresh + "; path=/";
    document.cookie = this.cookieAccessName + "=CucaBeludo;" + expires + "; path=/";
  }

  async checkCookie(cookieName) {
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
