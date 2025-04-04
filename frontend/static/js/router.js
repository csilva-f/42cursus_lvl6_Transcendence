//needauth status
// 0 - No need to be logged in
// 1 - Need to be logged in
// 2 - Exclusive for logged out users


const routes = {
	404: {
		template: "/templates/Error/404.html",
		title: "404",
		descripton: "Page not found",
		needAuth: 0,
	},
	401: {
		template: "/templates/Error/401.html",
		title: "401",
		descripton: "Forbidden",
		needAuth: 0,
	},
	"/mainPage": {
		template: "/mainPage.html",
		title: "Main Page",
		descripton: "This is the Main Page",
		needAuth: 2,
	},
	"/": {
		template: "/templates/Home.html",
		title: "Home",
		descripton: "This is the Home Page",
		needAuth: 1,
	},
	"/login": {
		template: "/templates/Login.html",
		title: "Login",
		descripton: "This is the Login Page",
		needAuth: 2,
	},
	"/forgotPassword": {
		template: "/templates/ForgotPassword.html",
		title: "Forgot Password",
		descripton: "This is the forgot password Page",
		neddAuth: 2,
	},
	"/mfa": {
		template: "/templates/MFA.html",
		title: "Multi-factor authentication",
		descripton: "This is the MFA Page",
		needAuth: 2,
	},
	"/resendCode": {
		template: "/templates/ResendCode.html",
		title: "Resend code",
		descripton: "This is the resend code page",
		needAuth: 2,
	},
	"/resetPassword": {
		template: "/templates/ResetPassword.html",
		title: "Reset Password",
		descripton: "This is the reset password page",
		neddAuth: 2,
	},
	"/pong": {
		template: "/templates/Game.html",
		title: "Pong",
		descripton: "This is the Pong Page",
		needAuth: 1,
	},
	"/games": {
		template: "/templates/GamesTournaments.html",
		title: "Games and Tournaments",
		descripton: "This is the Games and Tournaments Page",
		needAuth: 1,
	},
	"/statistics": {
		template: "/templates/Statistics.html",
		title: "Statistics",
		descripton: "This is the Stats Page",
		needAuth: 1,
	},
	"/social": {
		template: "/templates/Social.html",
		title: "Social",
		descripton: "This is the Social Hub Page",
		needAuth: 1,
	},
	"/aboutUs": {
		template: "/templates/AboutUs.html",
		title: "AboutUs",
		descripton: "This is the AboutUs Page",
		neddAuth: 1,
	},
	"/profile": {
		template: "/templates/Profile.html",
		title: "Profile",
		description: "This is the Profile Page",
		needAuth: 1,
	},
	"/profile/:userID": {
		template: "/templates/Profile.html",
		title: "Profile",
		description: "This is the Profile Page",
		needAuth: 1,
	},
	"/callback": {
		template: "/templates/Login.html",
		title: "Profile",
		descripton: "OAuth2 callback",
		needAuth: 0,
	},
	"/validate-email": {
		template: "/templates/Callback.html",
		title: "Profile",
		descripton: "Validate Email",
		needAuth: 2,
	},
	"/tournament": {
		template: "/templates/TournamentBracket.html",
		title: "Tournament",
		descripton: "Tournament Bracket",
		needAuth: 1,
	},
};

const bigScreenLocation = [
	"/mainPage",
	"/login",
	"/pong",
	"/callback",
	"/validate-email",
	"/forgotPassword",
	"/mfa",
	"/resendCode",
	"/resetPassword",
	"/tournament",
	"/404",
	"/401",
	"/testWebSocket",
];

const route = (event) => {
	event = event || window.event;
	event.preventDefault();

	const targetUrl = new URL(event.target.href, window.location.origin);

	if (targetUrl.origin === window.location.origin) {
		window.history.pushState({}, "", targetUrl.pathname);
		locationHandler();
	} else
		window.open(targetUrl.href, "_blank");
};


function activateSBIcon(element) {
	element.classList.remove("iconSBInactive");
	element.classList.add("iconSBActive");
}

function activateIcon(element) {
	element.classList.remove("iconInactive");
	element.classList.add("iconActive");
}

function disableSBIcon(element) {
	element.classList.remove("iconSBActive");
	element.classList.add("iconSBInactive");
}

function disableIcon(element) {
	element.classList.remove("iconActive");
	element.classList.add("iconInactive");
}

function disableTopBar() {
	const topbar = document.getElementById("topbar")
	topbar.classList.add('d-none')
	document.getElementById("personNickname").textContent = "";
	document.getElementById("subMsg").textContent = "";
	document.getElementById("personLvlProgress").style.width = "0%"
}

function resetNotifications() {
	document.getElementById("notificationDropdownMenu").innerHTML = "";
	document.getElementById("noNotificationP").classList.remove("d-none")
}

async function insertUserLevel(element, otherUserLvl) {
	var userLvl = null;
	if (otherUserLvl == null)
		userLvl = await UserInfo.getUserLvl();
	else
		userLvl = otherUserLvl;
	lvlDecimal = userLvl.split(".")[1];
	let lvlUnity = userLvl.split(".")[0];
	let lvlProgress = parseFloat((lvlDecimal * 100) / (99))
	document.getElementById(element).style.width = lvlProgress + "%"
	if (element == "profileLvlProgress") {
		document.getElementById('profileLvlNow').textContent = "Lvl " + lvlUnity
		document.getElementById('profileNextLvl').textContent = "Lvl " + (parseInt(lvlUnity) + 1)
	}
}

async function changeTopBarImg(newImg) {
	document.getElementById("userProfilePic").src = newImg;
}

async function activateTopBar() {
	console.log("[activateTopBar]")
	const topbar = document.getElementById("topbar")
	topbar.classList.remove('d-none')
	document.getElementById("personNickname").textContent = await UserInfo.getUserNick();
	document.getElementById("subMsg").textContent = `${await UserInfo.getUserFirstName()} ${await UserInfo.getUserLastName()}`;
	document.getElementById("userProfilePic").src = await UserInfo.getUserAvatarPath();
	await insertUserLevel("personLvlProgress", null)
}

async function changeToBig(location) {
	const allContent = document.getElementById("allContent")
	allContent.classList.remove('d-none');
	allContent.style.cssText += 'height: calc(100vh - 7rem);';
	const headerElement = document.getElementById("mainMsg");
	const userLang = localStorage.getItem("language") || "en";
	const langData = await getLanguageData(userLang);
	const mainDiv = document.getElementById("allContent");

	if (location == "/mainPage") {
		headerElement.setAttribute("data-i18n", "noContent");
		disableTopBar();
		resetNotifications();
	}
	else if (location == "/401" || location == "/404")
		disableTopBar();
	else if (location == "/tournament") {
		allContent.style.cssText += 'height: calc(100vh - 7rem); overflow-x: auto;';
	}
	else if (location == "/login") {
		headerElement.setAttribute("data-i18n", "login");
		const input = document.querySelector("#signupPhone");
			window.intlTelInput(input, {
				loadUtils: () => import("https://cdn.jsdelivr.net/npm/intl-tel-input@25.3.0/build/js/utils.js"),
			});
		disableTopBar();
		getForms();
	} else if (location == "/forgotPassword") {
		headerElement.setAttribute("data-i18n", "forgotPassword");
		disableTopBar();
		getForms();
	} else if (location == "/mfa") {
	  let tempToken = await JWT.getTempToken();
		headerElement.setAttribute("data-i18n", "mfa");
		disableTopBar();
		getForms();
	} else if (location == "/resetPassword") {
		headerElement.setAttribute("data-i18n", "resetPassword");
		disableTopBar();
		getForms();
	} else if (location == "/pong") {
		headerElement.setAttribute("data-i18n", "pong");
		document.getElementById("topbar").classList.remove('d-none');
		activateTopBar();
		gameInfo = localStorage.getItem("gameInfo");
		if (gameInfo) {
			gameInfo = JSON.parse(gameInfo);
			console.info("gameInfo: ", gameInfo);
			console.log(gameInfo);
			if(gameInfo.islocal){
				game = new Game(gameInfo);
				game.initGame();
			}
    	}
	} else if (location == "/callback") {
		headerElement.setAttribute("data-i18n", "callback");
		disableTopBar();
		oauthCallback();
	} else if (location == "/validate-email") {
		headerElement.setAttribute("data-i18n", "validateEmail");
		disableTopBar();
		validateVerifyEmail();
	} else if (location == "/profile") {
		console.log("router");
		getForms();
	}

	updateContent(langData);
	document.getElementById("subMsg").style.display = "none";
	document.getElementById("content").classList.add('d-none');
	document.getElementById("sidebar").classList.add('d-none');
	mainDiv.classList.add("loginActive");
}

async function changeToSmall(location) {
	const allContent = document.getElementById('allContent')
	allContent.classList.add('d-none')
	const topbar = document.getElementById('topbar')
	topbar.classList.remove('d-none')
	const sidebar = document.getElementById('sidebar')
	sidebar.classList.remove('d-none')
	const content = document.getElementById('content')
	content.classList.remove('d-none')
}

function insertPlaceholders(location, langData) {
	switch (location) {
		case "/":
			document.getElementById('inputHomeSearchFriends').placeholder = langData.search;
			document.getElementById('newNickname').placeholder = langData.nickname;
			break;
		case "/social":
			document.getElementById('userSearchInput').placeholder = langData.search;
			break;
	}
}

async function changeActive(location) {
	while (UserInfo.getUserID() == null || UserInfo.getUserID() === undefined) {
		setTimeout(10)
	}
	const iconsElements = [
		document.getElementById("homepageIcon"),
		document.getElementById("gamesIcon"),
		document.getElementById("statsIcon"),
		document.getElementById("socialIcon"),
		document.getElementById("creditsIcon"),
	];
	const headerElement = document.getElementById("mainMsg");
	const userLang = localStorage.getItem("language") || "en";
	const langData = await getLanguageData(userLang);
	const allContent = document.getElementById("allContent")
	allContent.classList.add('d-none');
	if (await UserInfo.getUserNick() == null) {
		let nickModal = new bootstrap.Modal(document.getElementById('nickModal'));
		nickModal.show();
	}
	await activateTopBar();
	switch (location) {
		case "/games":
			iconsElements.forEach((element) => {
				element.id == "gamesIcon"
					? activateSBIcon(element)
					: disableSBIcon(element);
			});
			headerElement.setAttribute("data-i18n", "games&tournaments");
			updateContent(langData);
			document.getElementById("subMsg").style.display = "none";
			const iconElement = document.getElementById("loadGamesIcon");
			activateIcon(iconElement);
			const iconStatusElement = document.getElementById("searchingLi");
			activateIcon(iconStatusElement);
			fetchGames(1);
			getForms();
			break;
		case "/statistics":
			iconsElements.forEach((element) => {
				element.id == "statsIcon"
					? activateSBIcon(element)
					: disableSBIcon(element);
			});
			headerElement.setAttribute("data-i18n", "statistics");
			updateContent(langData);
			document.getElementById("subMsg").style.display = "none";
			const statsEverythingIcon = document.getElementById("statsEverythingIcon");
			activateIcon(statsEverythingIcon);
			fetchStatistics();
			break;
		case "/social":
			iconsElements.forEach((element) => {
				element.id == "socialIcon"
					? activateSBIcon(element)
					: disableSBIcon(element);
			});
			headerElement.setAttribute("data-i18n", "socialhub");
			insertPlaceholders("/social", langData);
			updateContent(langData);
			document.getElementById("subMsg").style.display = "none";
			const UserElement = document.getElementById("loadGlobalUsers");
			document.getElementById('reloadIconLi').setAttribute("data-id", 1);
			activateIcon(UserElement);
			fetchUsers();
			break;
		case "/aboutUs":
			iconsElements.forEach((element) => {
				element.id == "creditsIcon"
					? activateSBIcon(element)
					: disableSBIcon(element);
			});
			headerElement.setAttribute("data-i18n", "aboutUs");
			updateContent(langData);
			document.getElementById("subMsg").style.display = "none";
			break;
		case "/":
			iconsElements.forEach((element) => {
				element.id == "homepageIcon"
					? activateSBIcon(element)
					: disableSBIcon(element);
			});
			headerElement.classList.remove("d-none")
			headerElement.setAttribute("data-i18n", "welcome");
			insertPlaceholders("/", langData);
			updateContent(langData);
			document.getElementById("subMsg").style.display = "block";
			getForms();
			fetchMatchHistory();
			fetchHomeFriends();
			fetchTopUsers();
			break;
		case "/profile":
			iconsElements.forEach((element) => {
				disableSBIcon(element);
			});
			headerElement.setAttribute("data-i18n", "profile");
			updateContent(langData);
			document.getElementById("subMsg").style.display = "none";
			const statsEverythingIconProfile = document.getElementById("statsEverythingIcon");
			activateIcon(statsEverythingIconProfile);
			insertOwnProfileInfo();
			insertUserLevel("profileLvlProgress", null);
			fetchStatistics(null);
			getForms();
			const input = document.querySelector("#phoneNumber");
			window.intlTelInput(input, {
				loadUtils: () => import("https://cdn.jsdelivr.net/npm/intl-tel-input@25.3.0/build/js/utils.js"),
			});
			//createQrCode();
			break;
		case "/profile/:userID":
			iconsElements.forEach((element) => {
				disableSBIcon(element);
			});
			headerElement.classList.add("d-none");
			document.getElementById("subMsg").style.display = "none";
			const statsIcon = document.getElementById("statsEverythingIcon");
			activateIcon(statsIcon);
			loadProfileFromURL();
			break;
		default:
			iconsElements.forEach((element) => {
				disableSBIcon(element);
			});
			updateContent(langData);
			document.getElementById("subMsg").style.display = "none";
			break;
	}
}

function isProfile(location) {
	const profileMatch = location.match(/\/profile\/(\w+)/);
	if (profileMatch)
		return true;
	return false;
}

const locationHandler = async () => {
	let route, html;
	let location = window.location.pathname;
	if (location.length == 0) location = "/";
	route = routes[location] || routes["404"];
	let uid = await UserInfo.getUserID();
	let tempToken = await JWT.getTempToken();
	console.log("[Location] ", location)
	if (!(location === "/mfa" && (tempToken && !uid))) {
    if ((isProfile(location) && !uid) || (route.needAuth == 1 && !uid)){
      location = "/mainPage";
     	route = routes[location];
    }
    if (route.needAuth == 2 && uid) {
      location = "401";
      route = routes[location];
    }
  if (!location === "/pong") localStorage.removeItem("gameInfo");
  }
  else {
    if (location === "/mfa" && !tempToken.access)
    {
      location = "/login";
      route = routes[location];
    }
  }
	if (isProfile(location)) {
		route = routes["/profile/:userID"];
		html = await fetch(route.template).then((response) => response.text());
		document.title = route.title;
		document.getElementById("content").innerHTML = html;
		changeToSmall(location);
		document
			.querySelector('meta[name="description"]')
			.setAttribute("content", route.description);
		changeActive("/profile/:userID");
		return;
	}

	html = await fetch(route.template).then((response) => response.text());
	document.title = route.title;
	if (bigScreenLocation.includes(location)) {
		document.getElementById("allContent").innerHTML = html;
		changeToBig(location);
		document
			.querySelector('meta[name="description"]')
			.setAttribute("content", route.description);
	} else {
		document.getElementById("content").innerHTML = html;
		changeToSmall(location);
		document
			.querySelector('meta[name="description"]')
			.setAttribute("content", route.description);
		changeActive(location);
	}
};

document.addEventListener("click", (e) => {
	const { target } = e;
	if (target.matches("nav a")) {
		e.preventDefault();
		route(e);
	}
});

function loadProfileFromURL() {
	console.log("[loadProfileFromURL]")
	const path = window.location.pathname;
	const match = path.match(/\/profile\/(\w+)/);
	if (match) {
		const userID = match[1];
		console.log("userID >> ", userID)
		//document.getElementById("editButton").classList.add('d-none')
		//document.getElementById("changePasswordButton").classList.add('d-none')
		fetchProfileInfo(userID);
		fetchStatistics(userID);
	}
}

async function reloadPage() {
	let location = window.location.pathname;
	let route = routes[location] || routes["404"];

	await JWT.reloadPage();
	if (await JWT.getAccess())
		await UserInfo.refreshUser();
	if (!UserInfo.getUserID())
		initializeWebSocket();
	locationHandler();
}

window.onpopstate = async () => {
	await reloadPage();
}
window.route = route;
reloadPage();
