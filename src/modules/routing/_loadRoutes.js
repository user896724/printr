let bluebird = require("bluebird");
let getRoutes = require("./getRoutes");

module.exports = function(dir, atTopLevel, ...args) {
	return bluebird.map(getRoutes(dir, atTopLevel), function(route) {
		return require(route.path)(...args);
	});
}
