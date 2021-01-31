let {derived} = require("svelte/store");
let location = require("./location");

module.exports = derived(location, function(location) {
	if (location.hash) {
		try {
			return JSON.parse(decodeURIComponent(location.hash.substr(1)));
		} catch (e) {}
	}
	
	return {};
});
