let ws = require("ws");
let {removeInPlace} = require("./utils/arrayMethods");
let getIp = require("./utils/getIp");
let config = require("../config");

function updateNoOfClients(clients) {
	for (let ws of clients) {
		ws.send(JSON.stringify({
			type: "clients",
			data: clients.length,
		}));
	}
}

module.exports = function(app) {
	app.clientsByIp = {};
	app.clientsByKey = {};
	
	let socket = new ws.Server({
		port: config.ws.port,
	});
	
	// remove default EventEmitter limit
	socket.setMaxListeners(0);
	
	socket.on("connection", function(ws, req) {
		let {clientsByIp, clientsByKey} = app;
		let ip = getIp(req);
		let key = req.url.substr(config.ws.path.length);
		let isPublic = key.startsWith("/public/");
		
		if (!clientsByIp[ip]) {
			clientsByIp[ip] = [];
		}
		
		clientsByIp[ip].push(ws);
		
		if (key !== "/") {
			if (!clientsByKey[key]) {
				clientsByKey[key] = [];
			}
			
			clientsByKey[key].push(ws);
		}
		
		if (isPublic) {
			updateNoOfClients(clientsByKey[key]);
		}
		
		ws.on("close", function() {
			if (clientsByIp[ip]) {
				removeInPlace(clientsByIp[ip], ws);
				
				if (clientsByIp[ip].length === 0) {
					delete clientsByIp[ip];
				}
			}
			
			if (clientsByKey[key]) {
				removeInPlace(clientsByKey[key], ws);
				
				if (isPublic) {
					updateNoOfClients(clientsByKey[key]);
				}
				
				if (clientsByKey[key].length === 0) {
					delete clientsByKey[key];
				}
			}
		});
	});
}
