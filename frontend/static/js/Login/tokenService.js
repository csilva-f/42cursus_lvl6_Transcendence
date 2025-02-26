class tokenService {
    cookieRefreshName = "refresh";
    cookieAccessName = "access";
    cookieExpiricy = 1 * 60 * 1000;
    token = {};
    date = new Date();

    async setToken(t) {
        this.token = t;
        this.setCookie();
    };
    deleteToken() {
        this.token = {};
    };
    async getAccess() {
        let token = this.checkCookie(this.cookieAccessName);
        console.log("tokenService: ", token)
        if (!token)
            await this.updateToken();
        return this.token.access;
    }
    async reloadPage() {
        console.log("relaodPage")
        await this.updateToken();
        return this.token.access
    }
    
    async updateToken() {
        console.log("updateToken");
        const apiUrl = "/authapi";
        let token = this.checkCookie(this.cookieRefreshName);
        $.ajax({
            type: "POST",
            url: `${apiUrl}/refresh/`,
            contentType: "application/json",
            headers: { Accept: "application/json" },
            data: JSON.stringify({ "refresh": token }),
            success: async (data) => {
                let tk = { "refresh": token, "access": data.access };
                await this.setToken(tk);
            },
            error: function (xhr) {
                console.log("Error occurred, redirecting to login");
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
        let decodedCookie = document.cookie.split(';')
        for (let i = 0; i < decodedCookie.length; i++) {
            let cookie = decodedCookie[i];
            while (cookie.charAt(0) == ' ')
                cookie = cookie.substring(1);
            if (cookie.indexOf(cookieName + "=") == 0)
                return cookie.substring(cookieName.length + 1, cookie.length)
        }
        return '';
    }
}