let {isClient} = require("../utils/checkEnvironment");
let Writable = require("./Writable");

let location = new Writable(isClient ? window.location : {
	pathname: "/",
});

function update() {
	location.set(window.location);
}

if (isClient) {
	window.addEventListener("popstate", update);
	window.addEventListener("hashchange", update);
}

module.exports = location;
