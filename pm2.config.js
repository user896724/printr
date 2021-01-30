module.exports = {
	apps: [
		{
			name: "echo",
			script: "src/main.js",
			
			env: {
				ENV: "dev",
			},
		},
	],
};
