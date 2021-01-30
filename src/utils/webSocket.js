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

module.exports = function(config, path, handlers) {
	let url = buildUrl(config, path);
	let socket;
	
	function disconnectHandler() {
		if (handlers.disconnected) {
			handlers.disconnected();
		}
		
		createSocket();
	}
	
	function messageHandler(message) {
		handlers.message(JSON.parse(message.data));
	}
	
	function connectHandler() {
		if (handlers.connected) {
			handlers.connected();
		}
	}
	
	function closeSocket() {
		socket.removeEventListener("open", connectHandler);
		socket.removeEventListener("message", messageHandler);
		socket.removeEventListener("error", disconnectHandler);
		socket.removeEventListener("close", disconnectHandler);
		socket.close();
	}
	
	function createSocket() {
		if (socket) {
			closeSocket();
		}
		
		socket = new WebSocket(url);
		
		socket.addEventListener("open", connectHandler);
		socket.addEventListener("message", messageHandler);
		socket.addEventListener("error", disconnectHandler);
		socket.addEventListener("close", disconnectHandler);
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
