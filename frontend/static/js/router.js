const routes = {
  404: {
    template: "/templates/Error/404.html",
    title: "404",
    descripton: "Page not found",
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
  "/about": {
    template: "/templates/AboutUs.html",
    title: "AboutUs",
    descripton: "This is the AboutUs Page",
  }
};

const bigScreenLocation = ["/login", "/pong"];

const route = (event) => {
  event = event || window.event;
  event.preventDefault();
  console.log(event);
  console.log(event.target);
  console.log(event.target.href);
  window.history.pushState({}, "", event.target.href);
  locationHandler("content");
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


async function changeToBig(location) {
  const headerElement = document.getElementById("mainMsg");
  const userLang = localStorage.getItem("language") || "en";
  const langData = await getLanguageData(userLang);
  const mainDiv = document.getElementById("allContent");

  if (location == "/login") {
    headerElement.setAttribute("data-i18n", "login");
    getForms();
  }
  else if (location == "/pong")
    headerElement.setAttribute("data-i18n", "pong");

  updateContent(langData);
  document.getElementById("subMsg").style.display = "none";
  document.getElementById("content").style.display = "none";
  document.getElementById("sidebar").style.display = "none";
  mainDiv.classList.add("loginActive");
}

async function changeActive(location) {
  const iconsElements = [
    document.getElementById("homepageIcon"),
    document.getElementById("gamesIcon"),
    document.getElementById("statsIcon"),
    document.getElementById("socialIcon"),
  ];
  const headerElement = document.getElementById("mainMsg");
  const userLang = localStorage.getItem("language") || "en";
  const langData = await getLanguageData(userLang);
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
      const iconStatusElement = document.getElementById('searchingLi');
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
      break;
    case "/about":
      iconsElements.forEach((element) => {
        element.id == "aboutUsIcon"
          ? activateSBIcon(element)
          : disableSBIcon(element);
      });
      headerElement.setAttribute("data-i18n", "aboutUs");
      updateContent(langData);
      document.getElementById("subMsg").style.display = "none";
      break;
    default:
      iconsElements.forEach((element) => {
        element.id == "homepageIcon"
          ? activateSBIcon(element)
          : disableSBIcon(element);
      });
      headerElement.setAttribute("data-i18n", "welcome");
      updateContent(langData);
      document.getElementById("subMsg").style.display = "block";
      break;
  }
}

const locationHandler = async (elementID) => {
  let location = window.location.pathname;
  if (location.length == 0) location = "/";
  console.log("location: ", location);
  const route = routes[location] || routes["404"];
  console.log(route);
  const html = await fetch(route.template).then((response) => response.text());
  document.title = route.title;
  if (bigScreenLocation.includes(location)) {
    document.getElementById("allContent").innerHTML = html;
    changeToBig(location);
    document
      .querySelector('meta[name="description"]')
      .setAttribute("allContent", route.descripton);
  }
  else {
    document.getElementById(elementID).innerHTML = html;
    document
      .querySelector('meta[name="description"]')
      .setAttribute("content", route.descripton);
    if (elementID == "content") changeActive(location);
  }
};

document.addEventListener("click", (e) => {
  const { target } = e;
  //console.log("Target: ", target);
  if (target.matches("nav a")) {
    e.preventDefault();
    route();
  }
});


window.onpopstate = locationHandler;
window.route = route;
locationHandler("content");
