class User {
    userID = null;
    userNick = null;
    userLvl = null;
    userBirthdate = null;
    userGender = null;
    userBio = null;
    userAvatar = null;

    constructor() { }

    getUserID() {
        return this.userID;
    }
    getUserNick() {
        return this.userNick;
    }
    getUserLvl() {
        return this.userLvl;
    }
    getUserBirthdate() {
        return this.userBirthdate;
    }
    getUserGender() {
        return this.userGender;
    }
    getUserBio() {
        return this.userBio;
    }
    getUserAvatar() {
        return this.userAvatar;
    }

    async fetchUserExtension(accessToken) {
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
                    resolve();
                },
                error: function (xhr, status, error) {
                    console.log("error: ", error);
                    reject(error);
                },
            });
        });
    }
    

    async insertUserInfo(userInfo) {
        console.log('userInfo :>> ', userInfo);
        this.userID = userInfo.id;
        console.log('this.userID :>> ', this.userID);
        this.userNick = userInfo.nickname;
        console.log('this.userNick :>> ', this.userNick);
        this.userLvl = userInfo.level;
        this.userBirthdate = userInfo.birthdate;
        this.userGender = userInfo.gender;
        this.userBio = userInfo.bio;
        this.userAvatar = userInfo.avatar;
    }
}