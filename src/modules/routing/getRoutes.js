let fs = require("flowfs");
let bluebird = require("bluebird");

/*
routes are automatically loaded from the routes dir

dirs can have their own routers, in router.js, in which case only that file
is loaded by the current call to getRoutes, and is responsible for loading
its entire sub-tree.

if the router calling getRoutes is a sibling of its top-level routes, ie.
it is passing its own dir, it must also pass the atTopLevel flag to
tell getRoutes to return the routes, not the router file itself.

we also skip any dirs called "modules" etc so that we can have non-route
code in the routes dirs

NOTE the app and router.js must await if async, as the order of handlers is
important (e.g. 404 is a catch-all at the end of the list)
*/

let skipDirs = [
	"modules",
	"middleware",
];

async function getRoutes(dir, atTopLevel=false) {
	dir = fs(dir);
	
	let routes = [];
	let router = dir.child("router.js");
	
	if (!atTopLevel && await router.exists()) {
		routes.push(router);
	} else {
		let files = (await dir.lsFiles()).filter(node => node.type === "js" && node.name !== "router.js");
		let dirs = (await dir.lsDirs()).filter(node => !skipDirs.includes(node.name));
		
		routes = routes.concat(
			files,
			...(await bluebird.map(dirs, dir => getRoutes(dir))),
		);
	}
	
	return routes;
}

module.exports = getRoutes;
