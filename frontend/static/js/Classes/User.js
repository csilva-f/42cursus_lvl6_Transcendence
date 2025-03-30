class User {
  userID = null;
  userNick = null;
  userLvl = null;
  userBirthdate = null;
  userGender = null;
  userBio = null;
  userAvatar = null;
  userAvatarPath = null;
  userFirstName = null;
  userLastName = null;
  userPhoneNumber = null;
  userEmail = null;
  isUpdating = false;

  constructor() {}
  async openWebSocket() {
    let uid = this.userID;
    initializeWebSocket(() => {
      if (uid && window.ws_os && window.ws_os.readyState === WebSocket.OPEN) {
        //console.log("User ID:", UserInfo.getUserID());
        window.ws_os.send(JSON.stringify({ user_id: uid }));
      }
    });
  }

  async refreshUser() {
    console.log("[refreshUser]");
    if (!this.isUpdating) {
      this.isUpdating = true;
      try {
        await Promise.all([this.fetchUserExtension(), this.fetchGetProfile()]);
      } catch (error) {
        console.error("Error refreshing user:", error);
      } finally {
        this.isUpdating = false;
        console.log("[Finished refreshUser]");
      }
    } else {
      while (this.isUpdating)
        await new Promise((resolve) => setTimeout(resolve, 10));
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
  async getUserAvatarPath() {
    if (this.userAvatarPath) return this.userAvatarPath;
    return null;
  }
  async getUserFirstName() {
    if (this.userFirstName) return this.userFirstName;
    return null;
  }
  async getUserLastName() {
    if (this.userLastName) return this.userLastName;
    return null;
  }
  async getUserPhoneNumber() {
    if (this.userPhoneNumber) return this.userPhoneNumber;
    return null;
  }
  async getUserEmail() {
    if (this.userEmail) return this.userEmail;
    return null;
  }

  async updateAvatar(filename) {
    this.userAvatar = filename;
    this.userAvatarPath = `/static/img/profilePic/${filename}`;
  }

  async updateNickname(nick) {
    this.userNick = nick;
  }

  async updateBirthdate(birthdate) {
    this.userBirthdate = birthdate;
  }

  async updateGender(gender){
    this.userGender = gender;
  }

  async updateBio(bio) {
    this.userBio = bio;
  }

  async updateFirstName(firstName) {
    this.userFirstName = firstName;
  }

  async updateLastName(lastName) {
    this.userLastName = lastName;
  }

  async updatePhoneNumber(phoneNumber) {
    this.userPhoneNumber = phoneNumber;
  }

  async updateUserExtension() {
    const accessToken = await JWT.getAccess();
    let userData = {
      nickname: this.userNick,
      birthdate: this.userBirthdate,
      genderid: this.userGender,
      bio: this.userBio,
      avatar: this.userAvatar,
    };
    console.table(userData);
    $.ajax({
      type: "POST",
      url: `/api/update-userextension/`,
      contentType: "application/json",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      data: JSON.stringify(userData),
      success: async (res) => {
        this.isUpdating = false;
      },
      error: function (xhr, status, error) {
        console.log("error: ", error);
        this.isUpdating = false;
      },
    });
  }

  async updateProfile(){
    const accessToken = await JWT.getAccess();
    let userData = {
      first_name: this.userFirstName,
      last_name: this.userLastName,
      phone_number: this.userPhoneNumber,
    };
    $.ajax({
      type: "POST",
      url: `/authapi/update-profile/`,
      contentType: "application/json",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      data: JSON.stringify(userData),
      success: async (res) => {
        this.isUpdating = false;
      },
      error: function (xhr, status, error) {
        this.isUpdating = false;
      },
    });
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
          await this.insertUserExtension(res.user);
          await this.openWebSocket();
          this.isUpdating = false;
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

  async fetchGetProfile() {
    const accessToken = await JWT.getAccess();
    return new Promise((resolve, reject) => {
      $.ajax({
        type: "POST",
        url: `/authapi/get-profile/`,
        contentType: "application/json",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        success: async (res) => {
          await this.insertGetProfile(res.data);
          this.isUpdating = false;
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

  async insertUserExtension(userInfo) {
    this.userID = userInfo.id;
    this.userNick = userInfo.nickname;
    this.userLvl = userInfo.level;
    this.userBirthdate = userInfo.birthdate;
    this.userGender = userInfo.gender;
    this.userBio = userInfo.bio;
    this.userAvatar = userInfo.avatar;
    this.userAvatarPath = `/static/img/profilePic/${userInfo.avatar}`
  }

  async insertGetProfile(userInfo) {
    this.userFirstName = userInfo.first_name;
    this.userLastName = userInfo.last_name;
    this.userPhoneNumber = userInfo.phone_number;
    this.userEmail = userInfo.email;
  }

  async resetUser() {
    this.userID = null;
    this.userNick = null;
    this.userLvl = null;
    this.userBirthdate = null;
    this.userGender = null;
    this.userBio = null;
    this.userAvatar = null;
    this.userFirstName = null;
    this.userLastName = null;
    this.userPhoneNumber = null;
    this.userEmail = null;
  }
}
