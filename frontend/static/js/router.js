const routes = {
  404: {
    template: "/templates/Error/404.html",
    title: "404",
    descripton: "Page not found",
  },
  "/mainPage": {
    template: "/mainPage.html",
    title: "Main Page",
    descripton: "This is the Main Page",
  },
  "/": {
    template: "/templates/Home.html",
    title: "Home",
    descripton: "This is the Home Page",
  },
  "/login": {
    template: "/templates/Login.html",
    title: "Login",
    descripton: "This is the Login Page",
  },
  "/forgotPassword": {
    template: "/templates/ForgotPassword.html",
    title: "Forgot Password",
    descripton: "This is the forgot password Page",
  },
  "/mfa": {
    template: "/templates/MFA.html",
    title: "Multi-factor authentication",
    descripton: "This is the MFA Page",
  },
  "/resendCode": {
    template: "/templates/ResendCode.html",
    title: "Resend code",
    descripton: "This is the resend code page",
  },
  "/resetPassword": {
    template: "/templates/ResetPassword.html",
    title: "Reset Password",
    descripton: "This is the reset password page",
  },
  "/pong": {
    template: "/templates/Game.html",
    title: "Pong",
    descripton: "This is the Pong Page",
  },
  "/games": {
    template: "/templates/GamesTournaments.html",
    title: "Games and Tournaments",
    descripton: "This is the Games and Tournaments Page",
  },
  "/statistics": {
    template: "/templates/Statistics.html",
    title: "Statistics",
    descripton: "This is the Stats Page",
  },
  "/social": {
    template: "/templates/Social.html",
    title: "Social",
    descripton: "This is the Social Hub Page",
  },
  "/aboutUs": {
    template: "/templates/AboutUs.html",
    title: "AboutUs",
    descripton: "This is the AboutUs Page",
  },
  "/profile": {
    template: "/templates/Profile.html",
    title: "Profile",
    descripton: "This is the Profile Page",
  },
  "/callback": {
    template: "/templates/Login.html",
    title: "Profile",
    descripton: "OAuth2 callback",
  },
  "/validate-email": {
    template: "/templates/Callback.html",
    title: "Profile",
    descripton: "Validate Email",
  },
  "/tournament": {
    template: "/templates/TournamentBracket.html",
    title: "Tournament",
    descripton: "Tournament Bracket",
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
];

const route = (event) => {
  event = event || window.event;
  event.preventDefault();

  const targetUrl = new URL(event.target.href, window.location.origin);

  if (targetUrl.origin === window.location.origin) {
    window.history.pushState({}, "", targetUrl.pathname);
    locationHandler("content");
  } else {
    window.open(targetUrl.href, "_blank");
  }
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
}

function activateTopBar() {
  const topbar = document.getElementById("topbar")
  topbar.classList.remove('d-none')
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
  }
  else if (location == "/tournament") {
    allContent.style.cssText += 'height: calc(100vh - 7rem); overflow-x: auto;';
  }
  else if (location == "/login") {
    headerElement.setAttribute("data-i18n", "login");
    disableTopBar();
    getForms();
  } else if (location == "/forgotPassword") {
    headerElement.setAttribute("data-i18n", "forgotPassword");
    disableTopBar();
    getForms();
  } else if (location == "/mfa") {
    headerElement.setAttribute("data-i18n", "mfa");
    disableTopBar();
    getForms();
  } else if (location == "/resetPassword") {
    headerElement.setAttribute("data-i18n", "resetPassword");
    disableTopBar();
    console.log("resetPassword");
    getForms();
  } else if (location == "/pong") {
    headerElement.setAttribute("data-i18n", "pong");
    //initGame();
  } else if (location == "/callback") {
    headerElement.setAttribute("data-i18n", "callback");
    disableTopBar();
    oauthCallback();
  } else if (location == "/validate-email") {
    headerElement.setAttribute("data-i18n", "validateEmail");
    disableTopBar();
    validateEmail();
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

async function changeActive(location) {
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
  activateTopBar();
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
      updateContent(langData);
      document.getElementById("subMsg").style.display = "none";
      const UserElement = document.getElementById("loadGlobalUsers");
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
      console.log(JWT.getAccess());
      iconsElements.forEach((element) => {
        element.id == "homepageIcon"
          ? activateSBIcon(element)
          : disableSBIcon(element);
      });
      headerElement.setAttribute("data-i18n", "welcome");
      updateContent(langData);
      document.getElementById("subMsg").style.display = "block";
      fetchMatchHistory();
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
      fetchProfileInfo();
      fetchStatistics();
        const input = document.querySelector("#phoneNumber");
        window.intlTelInput(input, {
            loadUtils: () => import("https://cdn.jsdelivr.net/npm/intl-tel-input@25.3.0/build/js/utils.js"),
        });
      createQrCode();
      break;
    default:
      console.log("default");
      iconsElements.forEach((element) => {
        disableSBIcon(element);
      });
      updateContent(langData);
      document.getElementById("subMsg").style.display = "none";
      break;
  }
}

const locationHandler = async (elementID) => {
  let location = window.location.pathname;
  if (location.length == 0) location = "/";
  console.log("location: ", location);
  const route = routes[location] || routes["404"];
  const html = await fetch(route.template).then((response) => response.text());
  document.title = route.title;
  if (bigScreenLocation.includes(location)) {
    document.getElementById("allContent").innerHTML = html;
    changeToBig(location);
    document
      .querySelector('meta[name="description"]')
      .setAttribute("allContent", route.descripton);
  } else {
    document.getElementById(elementID).innerHTML = html;
    changeToSmall(location);
    document
      .querySelector('meta[name="description"]')
      .setAttribute("content", route.descripton);
    if (elementID == "content") changeActive(location);
  }
};

document.addEventListener("click", (e) => {
  const { target } = e;

  if (target.matches("nav a")) {
    e.preventDefault();
    route(e);
}});


window.onpopstate = () => locationHandler("content");
window.route = route;
locationHandler("content");
