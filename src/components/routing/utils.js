/*
Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils

https://github.com/reach/router/blob/master/LICENSE
*/

let paramRe = /^:(.+)/;

let SEGMENT_POINTS = 4;
let STATIC_POINTS = 3;
let DYNAMIC_POINTS = 2;
let SPLAT_PENALTY = 1;
let ROOT_POINTS = 1;

/*
Check if `string` starts with `search`
*/
export function startsWith(string, search) {
	return string.substr(0, search.length) === search;
}

/*
Check if `segment` is a root segment
*/
function isRootSegment(segment) {
	return segment === "";
}

/*
Check if `segment` is a dynamic segment
*/
function isDynamic(segment) {
	return paramRe.test(segment);
}

/*
Check if `segment` is a splat
*/
function isSplat(segment) {
	return segment[0] === "*";
}

/*
Strip `str` of potential start and end `/`
*/
function stripSlashes(str) {
	return str.replace(/(^\/+|\/+$)/g, "");
}

/*
Split up the URI into segments delimited by `/`
*/
function segmentize(uri) {
	return stripSlashes(uri).split("/");
}

/*
Score a route depending on how its individual segments look
*/
function rankRoute(route, index) {
	let score = route.default
		? 0
		: segmentize(route.path).reduce((score, segment) => {
			score += SEGMENT_POINTS;

			if (isRootSegment(segment)) {
				score += ROOT_POINTS;
			} else if (isDynamic(segment)) {
				score += DYNAMIC_POINTS;
			} else if (isSplat(segment)) {
				score -= SEGMENT_POINTS + SPLAT_PENALTY;
			} else {
				score += STATIC_POINTS;
			}

			return score;
		}, 0);

	return {route, score, index};
}

/*
Give a score to all routes and sort them on that
*/
function rankRoutes(routes) {
	return routes.map(rankRoute).sort((a, b) => {
		return (
			a.score < b.score
			? 1
			: a.score > b.score ? -1 : a.index - b.index
		);
	});
}

/*
Ranks and picks the best route to match. Each segment gets the highest
amount of points, then the type of segment gets an additional amount of
points where

	static > dynamic > splat > root

This way we don't have to worry about the order of our routes, let the
computers do it.

A route looks like this

	{ path, default, value }

And a returned match looks like:

	{ route, params, uri }
*/
function pick(routes, uri) {
	let match;
	let default_;

	let [uriPathname] = uri.split("?");
	let uriSegments = segmentize(uriPathname);
	let isRootUri = uriSegments[0] === "";
	let ranked = rankRoutes(routes);

	for (let i = 0; i < ranked.length; i++) {
		let route = ranked[i].route;
		let missed = false;

		if (route.default) {
			default_ = {
				route,
				params: {},
				uri,
			};
			
			continue;
		}

		let routeSegments = segmentize(route.path);
		let params = {};
		let max = Math.max(uriSegments.length, routeSegments.length);
		let index = 0;

		for (; index < max; index++) {
			let routeSegment = routeSegments[index];
			let uriSegment = uriSegments[index];

			if (routeSegment !== undefined && isSplat(routeSegment)) {
				// Hit a splat, just grab the rest, and return a match
				// uri: /files/documents/work
				// route: /files/* or /files/*splatname
				let splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

				params[splatName] = uriSegments
					.slice(index)
					.map(decodeURIComponent)
					.join("/");
				
				break;
			}

			if (uriSegment === undefined) {
				// URI is shorter than the route, no match
				// uri: /users
				// route: /users/:userId
				missed = true;
				break;
			}

			let dynamicMatch = paramRe.exec(routeSegment);

			if (dynamicMatch && !isRootUri) {
				let value = decodeURIComponent(uriSegment);
				params[dynamicMatch[1]] = value;
			} else if (routeSegment !== uriSegment) {
				// Current segments don't match, not dynamic, not splat, so no match
				// uri: /users/123/settings
				// route: /users/:id/profile
				missed = true;
				break;
			}
		}

		if (!missed) {
			match = {
				route,
				params,
				uri: "/" + uriSegments.slice(0, index).join("/"),
			};
			
			break;
		}
	}

	return match || default_ || null;
}

/*
Check if the `path` matches the `uri`.
*/
function match(route, uri) {
	return pick([route], uri);
}

/*
Add the query to the pathname if a query is given
*/
function addQuery(pathname, query) {
	return pathname + (query ? `?${query}` : "");
}

/*
Resolve URIs as though every path is a directory, no files. Relative URIs
in the browser can feel awkward because not only can you be "in a directory",
you can be "at a file", too. For example:

	browserSpecResolve('foo', '/bar/') => /bar/foo
	browserSpecResolve('foo', '/bar') => /foo

But on the command line of a file system, it's not as complicated. You can't
`cd` from a file, only directories. This way, links have to know less about
their current path. To go deeper you can do this:

	<Link to="deeper"/>
	// instead of
	<Link to=`{${props.uri}/deeper}`/>

Just like `cd`, if you want to go deeper from the command line, you do this:

	cd deeper
	# not
	cd $(pwd)/deeper

By treating every path as a directory, linking to relative paths should
require less contextual information and (fingers crossed) be more intuitive.
*/
function resolve(to, base) {
	// /foo/bar, /baz/qux => /foo/bar
	if (startsWith(to, "/")) {
		return to;
	}

	let [toPathname, toQuery] = to.split("?");
	let [basePathname] = base.split("?");
	let toSegments = segmentize(toPathname);
	let baseSegments = segmentize(basePathname);

	// ?a=b, /users?b=c => /users?a=b
	if (toSegments[0] === "") {
		return addQuery(basePathname, toQuery);
	}

	// profile, /users/789 => /users/789/profile
	if (!startsWith(toSegments[0], ".")) {
		let pathname = baseSegments.concat(toSegments).join("/");

		return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
	}

	// ./, /users/123 => /users/123
	// ../, /users/123 => /users
	// ../.., /users/123 => /
	// ../../one, /a/b/c/d => /a/b/one
	// .././one, /a/b/c/d => /a/b/c/one
	let allSegments = baseSegments.concat(toSegments);
	let segments = [];

	allSegments.forEach(segment => {
		if (segment === "..") {
			segments.pop();
		} else if (segment !== ".") {
			segments.push(segment);
		}
	});

	return addQuery("/" + segments.join("/"), toQuery);
}

/*
Combines the `basepath` and the `path` into one path.
*/
function combinePaths(basepath, path) {
	return `${stripSlashes(
		path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
	)}/`;
}

/*
Decides whether a given `event` should result in a navigation or not.
*/
function shouldNavigate(event) {
	return (
		!event.defaultPrevented
		&& event.button === 0
		&& !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
	);
}

function hostMatches(anchor) {
	let host = location.host;
	
	return (
		anchor.host == host
		// svelte seems to kill anchor.host value in ie11, so fall back to checking href
		|| anchor.href.indexOf(`https://${host}`) === 0
		|| anchor.href.indexOf(`http://${host}`) === 0
	);
}

export {
	stripSlashes,
	pick,
	match,
	resolve,
	combinePaths,
	shouldNavigate,
	hostMatches,
};
