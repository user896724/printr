let {isClient} = require("../utils/checkEnvironment");
let Writable = require("./Writable");

let localStorage;

if (isClient) {
	localStorage = window.localStorage;
}

module.exports = class extends Writable {
	constructor(key, value, version, migrate) {
		let existingValue;
		
		if (localStorage) {
			try {
				let existing = JSON.parse(localStorage.getItem(key));
				
				if (existing.version && (!version || existing.version === version)) {
					existingValue = existing.value;
				} else if (migrate && migrate[existing.version]) {
					existingValue = migrate[existing.version](existing.value);
				} else {
					existingValue = null;
				}
			} catch (e) {
				existingValue = null;
				
				localStorage.setItem(key, "null");
			}
		}
		
		value = existingValue || value;
		
		super(value);
		
		this.version = version;
		this.key = key;
		this._store();
	}
	
	_store() {
		if (localStorage) {
			localStorage.setItem(this.key, JSON.stringify({
				version: this.version || "1",
				value: this.value,
			}));
		}
	}
	
	set(value) {
		super.set(value);
		
		this._store();
	}
	
	update(obj) {
		this.set({
			...this.value,
			...obj,
		});
	}
	
	clear() {
		if (localStorage) {
			localStorage.removeItem(this.key);
		}
	}
}
