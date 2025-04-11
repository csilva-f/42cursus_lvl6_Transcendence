window.ws_os = null;

function initializeWebSocket(callback = null) {
    if (window.ws_os && window.ws_os.readyState === WebSocket.OPEN) {
        console.log("WebSocket already open (no need for recreation).");
        if (callback) callback();
        return;
    }

    console.log("Initializing WebSocket...");
    const wsUrl = `wss://${window.location.host}/onlineStatus/`;
    window.ws_os = new WebSocket(wsUrl);

    window.ws_os.onopen = function () {
        console.log("WebSocket: user connection established successfully.");
        if (callback) callback();
    };

	window.ws_os.onmessage = async function (e) {
        const data = JSON.parse(e.data);
        console.log("Received data:", data);
        if (data.online_users) {
            console.log("Online users list:", data.online_users);
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
        } else {
            console.log("Message received:", e.data);
        }
    };

    window.ws_os.onerror = function (error) {
        console.error("WebSocket error:", error);
    };

    window.ws_os.onclose = function (event) {
        console.log("WebSocket connection closed:", event);
    };
}

function requestOnlineUsers(callback) {
	console.log(window.ws_os);
    if (!window.ws_os || window.ws_os.readyState !== WebSocket.OPEN) {
        console.error("WebSocket is not open. Cannot fetch online users.");
        return;
    }
    window.ws_os.send(JSON.stringify({ action: "queryOnline" }));

	window.onlineUsersCallback = callback;
}
