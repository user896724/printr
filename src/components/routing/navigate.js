import location from "../../stores/location";

export default function(to, replace=false) {
	// try...catch iOS Safari limits to 100 pushState calls
	try {
		if (replace) {
			history.replaceState(null, null, to);
		} else {
			history.pushState(null, null, to);
		}
	} catch (e) {
		window.location[replace ? "replace" : "assign"](to);
	}

	location.set(window.location);
}
