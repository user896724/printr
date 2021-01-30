let _loadRoutes = require("./_loadRoutes");

module.exports = function(dir, ...args) {
	return _loadRoutes(dir, true, ...args);
}
