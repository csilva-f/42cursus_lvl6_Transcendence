window.ws_os = null;

function initializeWebSocket(callback = null) {
    if (window.ws_os && window.ws_os.readyState === WebSocket.OPEN) {
        if (callback) callback();
        return;
    }

    const wsUrl = `wss://${window.location.host}/onlineStatus/`;
    window.ws_os = new WebSocket(wsUrl);

    window.ws_os.onopen = function () {
        if (callback) callback();
    };

	window.ws_os.onmessage = async function (e) {
        const data = JSON.parse(e.data);
        if (data.online_users) {
            if (window.onlineUsersCallback) {
                window.onlineUsersCallback(data.online_users);
            }
        } else if (data.add_user) {
          let uid = data.add_user;
          //let user = await UserInfo.getUserID();
          if (uid == await UserInfo.getUserID()) {
            await fetchUserNotificationGame();
            if (window.location.pathname == "/social")
                await fetchUsers();
          }
        }
    };

    window.ws_os.onerror = function (error) {
    };

    window.ws_os.onclose = function (event) {
    };
}

function requestOnlineUsers(callback) {
    if (!window.ws_os || window.ws_os.readyState !== WebSocket.OPEN) {
        return;
    }
    window.ws_os.send(JSON.stringify({ action: "queryOnline" }));

	window.onlineUsersCallback = callback;
}
