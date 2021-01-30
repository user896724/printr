let os = require("os");
let fs = require("fs");
let yargs = require("yargs");
let merge = require("lodash.merge");
let name = require("./package.json").name;

require("dotenv").config();

let {
	HOME,
	ENV,
} = process.env;

let root = __dirname;
let args = yargs.argv.config;
let envFile = fs.existsSync(__dirname + "/env.js") && require("./env.js");
let env = args && args.env || ENV || envFile && envFile.env;
let dev = env === "dev";
let secrets = {};
let secretsFile = `${__dirname}/deploy/secrets/secrets.js`;

if (fs.existsSync(secretsFile)) {
	let {
		common,
		envs,
	} = require(secretsFile);
	
	secrets = {
		...common,
		...envs[env],
	};
}

// base config

let config = {
	env,
	port: 3000,
	
	ws: {
		port: 3010,
		proxy: false,
		path: "/ws",
		secure: true,
	},
	
	svelte: {
		env: env === "dev" ? "dev" : "prod",
		template: `${root}/src/template.html`,
		dir: `${root}/src/pages`,
		type: "html",
		buildDir: `${root}/artifacts/pages`,
		buildConcurrency: os.cpus().length - 1,
		assetsPrefix: "/assets/pages/",
		
		svelteDirs: [
			`${root}/src/pages`,
			`${root}/src/components`,
		],
	},
};

// env file

if (envFile) {
	merge(config, envFile);
}

// environment variables

let {
	PORT,
	WS_PORT,
	WS_PROXY,
} = process.env;

if (PORT) {
	config.port = Number(PORT);
}

if (WS_PORT) {
	config.ws.port = Number(WS_PORT);
}

if (WS_PROXY) {
	config.ws.proxy = true;
}

// command line args

if (args) {
	merge(config, args);
}

module.exports = config;
