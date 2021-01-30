#!/usr/bin/env node

let fs = require("flowfs");
let yargs = require("yargs");
let cmd = require("../src/utils/cmd");

yargs.alias("w", "watch");
yargs.boolean("watch");

let nodeSass = __dirname + "/../node_modules/node-sass/bin/node-sass";

let {
	watch,
} = yargs.argv;

let root = fs(__dirname).parent.path;

(async function() {
	let c = w => `
		${nodeSass}
		${w ? "-w" : ""}
		--output ${root}/artifacts/css/global
		${root}/src/css/global
	`;
	
	/*
	node-sass doesn't do the initial compile if -w is set
	*/
	
	await cmd(c());
	
	if (watch) {
		cmd(c(true));
	}
})();
