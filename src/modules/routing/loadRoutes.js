let _loadRoutes = require("./_loadRoutes");

module.exports = function(dir, ...args) {
	return _loadRoutes(dir, false, ...args);
}
