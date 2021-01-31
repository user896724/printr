let http = require("http");
let express = require("express");
let bodyParser = require("body-parser");
let svelteViewEngine = require("svelte-view-engine");
let _typeof = require("@wildwood/utils/typeof");
let cmd = require("./utils/cmd");
let getIp = require("./utils/getIp");
let expressAsyncWrap = require("./modules/routing/expressAsyncWrap");
let loadRoutes = require("./modules/routing/loadRoutes");
let wsServer = require("./wsServer");
let config = require("../config");

(async function() {	
	let app = express();
	
	wsServer(app);
	
	expressAsyncWrap(app);
	
	app.enable("trust proxy");
	
	let engine = svelteViewEngine({
		...config.svelte,
	});

	let {
		dir,
		type,
	} = config.svelte;
	
	/*
	custom render function - the default one uses sync IO before caching,
	and the IO it does is unnecessary anyway.
	*/
	
	app.render = function(template, locals, callback) {
		if (_typeof(locals) === "Function") {
			callback = locals;
			locals = {};
		}
	
		locals = Object.assign({}, this.locals, locals._locals, locals);
		
		return engine.render(template, locals, callback);
	};
	
	app.app = app;
	app.engine = engine;
	
	if (config.env === "dev") {
		if (config.watch) {
			require("../watch")(engine);
		}
		
		/*
		rebuild the page on hard reload in Chrome
		
		svelte-view-engine checks the props for _rebuild and chrome sets
		cache-control to no-cache for hard reloads
		*/
		
		app.use(function(req, res, next) {
			if (req.headers["cache-control"] === "no-cache") {
				res.locals._rebuild = true;
			}
			
			next();
		});
		
		/*
		build global (non-svelte) scss & watch
		*/
		
		cmd(__dirname + "/../scripts/buildScss.js -w");
	}
	
	app.use("/assets", express.static(__dirname + "/../artifacts"));
	app.use("/vendor", express.static(__dirname + "/../vendor"));
	app.use("/img", express.static(__dirname + "/public/img"));
	app.use("/downloads", express.static(__dirname + "/../downloads"));
	
	app.get("/favicon.ico", function(req, res) {
		res.send("");
	});
	
	function saveRawBody(req, res, buffer, encoding) {
		if (buffer && buffer.length > 0) {
			req.rawBody	= buffer.toString(encoding || "uft8");
		}
	}
	
	app.use(bodyParser.raw({
		verify: saveRawBody,
	}));
	
	app.use(bodyParser.text({
		verify: saveRawBody,
	}));
	
	app.use(bodyParser.urlencoded({
		limit: "100mb",
		extended: true,
		verify: saveRawBody,
	}));
	
	app.use(bodyParser.json({
		limit: "100mb",
		strict: false,
		verify: saveRawBody,
	}));
	
	await loadRoutes(__dirname + "/api", app);
	await loadRoutes(__dirname + "/routes", app);
	
	app.use(function(req, res) {
		res.status(404);
		res.send("404");
	});
	
	app.use(function(error, req, res, next) {
		console.error(error);
		res.status(500);
		res.send("500");
	});
	
	http.createServer(app).listen(config.port);
})();
