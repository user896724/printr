function buildUrl(config, path="/") {
	let url = config.secure ? "wss" : "ws";
	
	url += "://";
	
	if (config.proxy) {
		url += location.host;
	} else {
		url += location.hostname + ":" + config.port;
	}
	
	url += (config.path || "") + path;
	
	return url;
}

module.exports = function(config, path, onMessage) {
	let url = buildUrl(config, path);
	let socket;
	
	function reconnect() {
		createSocket();
	}
	
	function messageHandler(message) {
		onMessage(JSON.parse(message.data));
	}
	
	function closeSocket() {
		socket.removeEventListener("error", reconnect);
		socket.removeEventListener("close", reconnect);
		socket.removeEventListener("message", messageHandler);
		socket.close();
	}
	
	function createSocket() {
		if (socket) {
			closeSocket();
		}
		
		socket = new WebSocket(url);
		
		socket.addEventListener("message", messageHandler);
		socket.addEventListener("error", reconnect);
		socket.addEventListener("close", reconnect);
	}
	
	function heartbeat() {
		try {
			socket.send("test");
		} catch (e) {
			reconnect();
		}
	}
	
	createSocket();
	
	let heartbeatInterval = setInterval(heartbeat, 3000);
	
	return function() {
		clearInterval(heartbeatInterval);
		closeSocket();
	}
}
