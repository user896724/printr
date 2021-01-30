let unique = require("../utils/array/unique");
let getIp = require("../utils/getIp");

module.exports = function(router) {
	let {clientsByIp, clientsByKey} = router.app;
	
	router.use(async function(req, res, next) {
		if (req.method !== "POST") {
			return next();
		}
		
		let ip = getIp(req);
		let key = req.path;
		let isPublic = key.startsWith("/public/");
		let clients = [];
		
		if (clientsByIp[ip]) {
			clients = clients.concat(clientsByIp[ip]);
		}
		
		if (isPublic && clientsByKey[key]) {
			clients = clients.concat(clientsByKey[key]);
		}
		
		clients = unique(clients);
		
		let isJson = req.headers["content-type"] === "application/json";
		
		for (let ws of clients) {
			ws.send(JSON.stringify({
				key,
				isJson,
				data: isJson ? req.body : req.rawBody,
			}));
		}
		
		res.json(null);
	});
}
