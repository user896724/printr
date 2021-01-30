let os = require("os");

module.exports = {
	...require("./config").svelte,
	buildConcurrency: os.cpus().length,
};
