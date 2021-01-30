let express = require("express");
let _typeof = require("@wildwood/utils/typeof");
let expressAsyncWrap = require("./expressAsyncWrap");

module.exports = function(app, options={}) {
	let router = express.Router({
		mergeParams: true,
		...options,
	});
	
	expressAsyncWrap(router);
	
	router.app = app;
	
	router.spa = function(path, ...args) {
		let middlewares = args.slice(0, args.length - 1);
		let render = args[args.length - 1];
		
		if (_typeof(render) === "String") {
			let page = render;
			
			render = function(req, res) {
				res.render(page);
			}
		}
		
		router.get([path, path + "/*"], ...middlewares, render);
	}
	
	router.page = function(path, ...args) {
		let middlewares = args.slice(0, args.length - 1);
		let page = args[args.length - 1];
		
		router.get(path, ...middlewares, async function(req, res) {
			res.render(page);
		});
	}
	
	return router;
}
