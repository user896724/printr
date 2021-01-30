module.exports = {
	apps: [
		{
			name: "echo-prod",
			script: "src/main.js",
			
			env: {
				ENV: "prod",
				PORT: "3400",
				WS_PORT: "3410",
				WS_PROXY: "1",
			},
		},
	],
};
