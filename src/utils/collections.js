let _typeof = require("@wildwood/utils/typeof");

let api = module.exports = {
	findIndex(list, test) {
		let index = -1;
		let type = _typeof(test);
		
		for (let i = 0; i < list.length; i++) {
			let item = list[i];
			let matches;
			
			if (type === "Number") {
				matches = item.id === test;
			} else if (type === "Function") {
				matches = test(item);
			}
			
			if (matches) {
				index = i;
				
				break;
			}
		}
		
		return index;
	},
	
	find(list, test) {
		let index = api.findIndex(list, test);
		
		if (index === -1) {
			return null;
		} else {
			return list[index];
		}
	},
	
	hasId(list, id) {
		return !!api.find(list, function(item) {
			return item.id === id;
		});
	},
	
	indexOfId(list, id) {
		return api.findIndex(list, function(item) {
			return item.id === id;
		});
	},
	
	groupBy(list, ...fields) {
		let field = fields.shift();
		let obj = {};
			
		for (let row of list) {
			let key;
			
			if (_typeof(field) === "Function") {
				key = field(row);
			} else {
				key = row[field];
			}
			
			if (!obj[key]) {
				obj[key] = [];
			}
			
			obj[key].push(row);
		}
		
		if (fields.length > 0) {
			for (let k in obj) {
				obj[k] = api.groupBy(obj[k], ...fields);
			}
		}
		
		return obj;
	},
	
	ungroup(obj) {
		return Object.values(obj).reduce(function(acc, val) {
			return acc.concat(val);
		}, []);
	},
	
	indexBy(list, field) {
		let obj = {};
			
		for (let row of list) {
			obj[row[field]] = row;
		}
		
		return obj;
	},
	
	indexById(list) {
		return api.indexBy(list, "id");
	},
	
	sortBy(list, field, desc=false) {
		let isFunction = _typeof(field) === "Function";
		
		return list.slice().sort(function(a, b) {
			let comp;
			
			if (isFunction) {
				a = field(a);
				b = field(b);
			} else {
				a = a[field];
				b = b[field];
			}
			
			if (_typeof(a) === "String" && _typeof(b) === "String") {
				a = String(a || "");
				b = String(b || "");
				
				comp = a.localeCompare(b);
			} else {
				a = Number(a || 0);
				b = Number(b || 0);
				
				comp = a < b ? -1 : 1;
			}
			
			return desc ? -comp : comp;
		});
	},
	
	map(source, fn) {
		let result = {};
		
		if (_typeof(source) === "Array") {
			for (let i = 0; i < source.length; i++) {
				let [key, value] = fn(source[i], i);
				
				if (key !== null) {
					result[key] = value;
				}
			}
		} else {
			for (let k in source) {
				result[k] = fn(source[k], k);
			}
		}
		
		return result;
	},
	
	mapToArray(obj, fn) {
		let result = [];
		
		for (let k in obj) {
			result.push(fn(obj[k], k));
		}
		
		return result;
	},
	
	filter(obj, fn) {
		let result = {};
		
		for (let k in obj) {
			if (fn(obj[k])) {
				result[k] = obj[k];
			}
		}
		
		return result;
	},
	
	filterToArray(obj, fn) {
		let result = [];
		
		for (let k in obj) {
			if (fn(obj[k])) {
				result.push(obj[k]);
			}
		}
		
		return result;
	},
	
	unique(array, field=null) {
		let valuesEncountered = [];
		
		return array.filter(function(item) {
			let value = field ? item[field] : item;
			let encountered = valuesEncountered.includes(value);
			
			if (!encountered) {
				valuesEncountered.push(value);
			}
			
			return !encountered;
		});
	},
	
	partition(list, fn) {
		let left = [];
		let right = [];
		
		for (let item of list) {
			if (fn(item)) {
				left.push(item);
			} else {
				right.push(item);
			}
		}
		
		return left.concat(right);
	},
	
	splitEvery(list, n) {
		let result = [];
		let group;
		
		for (let i = 0; i < list.length; i++) {
			if (i % n === 0) {
				if (group) {
					result.push(group);
				}
				
				group = [];
			}
			
			group.push(list[i]);
		}
		
		if (group) {
			result.push(group);
		}
		
		return result;
	},
	
	setAdd(list, row) {
		if (api.hasId(list, row.id)) {
			return list;
		} else {
			return [...list, row];
		}
	},
	
	setRemove(list, row) {
		return list.filter(item => item.id !== row.id);
	},
};
