const routes = {
  404: {
    template: "/templates/Error/404.html",
    title: "404",
    descripton: "Page not found",
  },
  "/": {
    template: "/templates/Home/Home.html",
    title: "Home",
    descripton: "This is the Home Page",
  },
  "/games": {
    template: "/templates/Games&Tournaments/Games&Tournaments.html",
    title: "Games and Tournaments",
    descripton: "This is the Games and Tournaments Page",
  },
  /*"/games/games": {
        template: "/templates/Games&Tournaments/Games/Games.html",
        title: "Games",
        descripton: "This is the Games Page",
    },*/
  "/statistics": {
    template: "/templates/Statistics/Statistics.html",
    title: "Statistics",
    descripton: "This is the Stats Page",
  },
  "/social": {
    template: "/templates/Social/Social.html",
    title: "Social",
    descripton: "This is the Social Hub Page",
  },
};

const route = (event) => {
  event = event || window.event;
  event.preventDefault();
  console.log(event);
  console.log(event.target);
  console.log(event.target.href);
  window.history.pushState({}, "", event.target.href);
  locationHandler("content");
};

function activateIcon(element) {
  element.classList.remove("iconInactive");
  element.classList.add("iconActive");
}

function disableIcon(element) {
  element.classList.remove("iconActive");
  element.classList.add("iconInactive");
}

/*async function loadGamePage() {
    const iconElement = document.getElementById('loadGamesIcon');
    activateIcon(iconElement);
    const iconStatusElement = document.getElementById('searchingIcon');
    activateIcon(iconStatusElement);
    window.history.pushState({}, "", "/games/games"); locationHandler("gamesContent");
}*/

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
          ? activateIcon(element)
          : disableIcon(element);
      });
      headerElement.setAttribute("data-i18n", "games&tournaments");
      updateContent(langData);
      document.getElementById("subMsg").style.display = "none";
      const iconElement = document.getElementById("loadGamesIcon");
      activateIcon(iconElement);
      break;
    case "/statistics":
      iconsElements.forEach((element) => {
        element.id == "statsIcon"
          ? activateIcon(element)
          : disableIcon(element);
      });
      headerElement.setAttribute("data-i18n", "statistics");
      updateContent(langData);
      document.getElementById("subMsg").style.display = "none";
      break;
    case "/social":
      iconsElements.forEach((element) => {
        element.id == "socialIcon"
          ? activateIcon(element)
          : disableIcon(element);
      });
      headerElement.setAttribute("data-i18n", "socialhub");
      updateContent(langData);
      document.getElementById("subMsg").style.display = "none";
      break;
    default:
      iconsElements.forEach((element) => {
        element.id == "homepageIcon"
          ? activateIcon(element)
          : disableIcon(element);
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
  if (elementID == "content" && location == "/games/games") location = "/games";
  const route = routes[location] || routes["404"];
  console.log(route);
  const html = await fetch(route.template).then((response) => response.text());
  document.getElementById(elementID).innerHTML = html;
  document.title = route.title;
  document
    .querySelector('meta[name="description"]')
    .setAttribute("content", route.descripton);
  if (elementID == "content") changeActive(location);
};

document.addEventListener("click", (e) => {
    const { target } = e;
    console.log("Target: ", target);
    if (target.matches("nav a")) {
        e.preventDefault();
        route();
    }/*else if (target.matches("nav p") || target.matches("nav i")) {
        console.log("Entered nav p or nav i");
    }*/
});


window.onpopstate = locationHandler;
window.route = route;
locationHandler("content");
