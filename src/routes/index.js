let config = require("../../config");
let getIp = require("../utils/getIp");

module.exports = function(app) {
	app.use(async function(req, res, next) {
		if (req.method !== "GET") {
			return next();
		}
		
		let ip = getIp(req);
		
		res.render("Index", {
			ip,
			key: req.path,
			wsConfig: config.ws,
		});
	});
}
