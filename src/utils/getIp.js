module.exports = function(req) {
	let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	
	if (ip === "::1" || ip.includes("127.0.0.1")) {
		ip = "127.0.0.1";
	}
	
	return ip;
}
