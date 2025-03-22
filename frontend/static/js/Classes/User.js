class User {
    userID = null;
    userNick = null;
    userLvl = null;
    userBirthdate = null;
    userGender = null;
    userBio = null;
    userAvatar = null;
    isUpdating = false;

    constructor() { }

    async refreshUser() {
        console.log("[refreshUser]")
        if (!this.isUpdating) {
            this.isUpdating = true;
            await this.fetchUserExtension();
        } else {
            while (this.isUpdating)
                await new Promise((resolve) => setTimeout(resolve, 10))
        }
    }

    async getUserID() {
        if (this.userID) return this.userID;
        return null;
    }
    async getUserNick() {
        if (this.userNick) return this.userNick;
        return null;
    }
    async getUserLvl() {
        if (this.userLvl) return this.userLvl;
        return null;
    }
    async getUserBirthdate() {
        if (this.userBirthdate) return this.userBirthdate;
        return null;
    }
    async getUserGender() {
        if (this.userGender) return this.userGender;
        return null;
    }
    async getUserBio() {
        if (this.userBio) return this.userBio;
        return null;
    }
    async getUserAvatar() {
        if (this.userAvatar) return this.userAvatar;
        return null;
    }

    async fetchUserExtension() {
        const accessToken = await JWT.getAccess();  
        return new Promise((resolve, reject) => {
            $.ajax({
                type: "POST",
                url: `/api/create-userextension/`,
                contentType: "application/json",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                success: async (res) => {
                    await this.insertUserInfo(res.user);
                    this.isUpdating = false;
                    console.log("[Finished refreshUser]")
                    resolve();
                },
                error: function (xhr, status, error) {
                    console.log("error: ", error);
                    this.isUpdating = false;
                    reject(error);
                },
            });
        });
    }


    async insertUserInfo(userInfo) {
        this.userID = userInfo.id;
        this.userNick = userInfo.nickname;
        this.userLvl = userInfo.level;
        this.userBirthdate = userInfo.birthdate;
        this.userGender = userInfo.gender;
        this.userBio = userInfo.bio;
        this.userAvatar = userInfo.avatar;
    }
}