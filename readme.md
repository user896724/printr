printr
======

Web-based logging service for inspecting variables when you don't have easy access to system logs or standard out.

Installation
------------

```
git clone https://github.com/user896724/printr
cd printr
npm i
PORT=3000 WS_PORT=3001 node src/main.js
```

Usage
-----

### cURL

```
$ curl -H "Content-Type: application/json" -d '{"test":123}' http://localhost:3000/
```

### Node.JS

```
function printr(data) {
	require("child_process").exec("curl -H 'Content-Type: application/json' -d '" + JSON.stringify(data) + "' http://localhost:3000/");
}
```

### PHP

```
function printr($data) {
	exec("curl -H 'Content-Type: application/json' -d '" . json_encode($data) . "' http://localhost:3000");
}
```
