let config = require("../../config");

module.exports = function(app) {
	app.use(async function(req, res, next) {
		if (req.method !== "GET") {
			return next();
		}
		
		res.render("Index", {
			key: req.path,
			wsConfig: config.ws,
		});
	});
}
