class User {
    constructor() { }

    insertUserInfo(userInfo) {
        console.log('userInfo :>> ', userInfo);
        this.userID = userInfo.id;
    }

    async fetchUserExtension() {
        const accessToken = await JWT.getAccess();
        $.ajax({
            type: "POST",
            url: `/api/create-userextension/`,
            contentType: "application/json",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            success: function (res) {
                insertUserInfo(res.user)
            },
            error: function (xhr, status, error) {
                console.log("error: ", error);
            },
        });
    }
}