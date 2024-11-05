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
    window.history.pushState({}, "", event.target.href); locationHandler();
}

function activateIcon(element) {
    element.classList.remove('iconInactive');
    element.classList.add('iconActive');
}

function disableIcon(element) {
    element.classList.remove('iconActive');
    element.classList.add('iconInactive');
}

function changeActive(location) {
    const iconsElements = [document.getElementById('homepageIcon'), document.getElementById('gamesIcon'), document.getElementById('statsIcon'), document.getElementById('socialIcon')];
    switch (location) {
        case "/games":
            iconsElements.forEach(element => {
                element.id == 'gamesIcon' ? activateIcon(element) : disableIcon(element);
            });
            break;
        case "/statistics":
            iconsElements.forEach(element => {
                element.id == 'statsIcon' ? activateIcon(element) : disableIcon(element);
            });
            break;
        case "/social":
            iconsElements.forEach(element => {
                element.id == 'socialIcon' ? activateIcon(element) : disableIcon(element);
            });
            break;
        default:
            iconsElements.forEach(element => {
                element.id == 'homepageIcon' ? activateIcon(element) : disableIcon(element);
            });
            break;
    }
}

const locationHandler = async () => {
    const location = window.location.pathname;
    if (location.length == 0)
        location = "/";
    console.log("location: ", location);
    const route = routes[location] || routes["404"];
    console.log(route);
    const html = await fetch(route.template).then((response) => response.text());
    document.getElementById("content").innerHTML = html;
    document.title = route.title;
    document.querySelector('meta[name="description"]').setAttribute("content", route.descripton);
    changeActive(location);
}

document.addEventListener("click", (e) => {
    const { target } = e;
    console.log("Target: ", target);
    if (!target.matches("nav a"))
        return;
    e.preventDefault();
    route();
});

window.onpopstate = locationHandler;
window.route = route;
locationHandler();