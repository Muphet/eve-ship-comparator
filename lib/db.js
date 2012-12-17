
var Q = require('q'),
	sqlite3 = require('sqlite3').verbose(),
    db;

function ItemDB(fileName) {
	this._dbFile = fileName;
}

var ItemDBProto = ItemDB.prototype;

ItemDBProto._dbFile = null;
ItemDBProto._db = null;

ItemDBProto._open = function() {
	var defer = Q.defer(),
		db;

	if(this._db && Q.isPromise(this._db)) {
		return this._db; // NOTE RETURN

	} else if(this._db) {
		defer.resolve();

	} else {
		this._db = defer.promise;

		db = new sqlite3.Database(this._dbFile, sqlite3.OPEN_READONLY, function(e) {
			if(e) {
				defer.reject(e);
			} else {
				console.log("Connected to [" + this._dbFile + "]");

				this._db = db;
				defer.resolve();
			}
		}.bind(this));		

		// db.on('trace', function(t) {
		// 	console.log(t);
		// });
	}

	return defer.promise;
};

ItemDBProto._all = function(query, params) {
	var defer = Q.defer();

	this._db.all(query, params, function(e, r) {
		if(e) {
			defer.reject(e);
		} else {
			defer.resolve(r);
		}
	});

	return defer.promise;
};

ItemDBProto._one = function(query, params) {
	var defer = Q.defer();

	this._db.get(query, params, function(e, r) {
		if(e) {
			defer.reject(e);
		} else {
			defer.resolve(r);
		}
	});

	return defer.promise;
};

ItemDBProto.one = function(query, params) {
	return this._open().then(this._one.bind(this, query, params));
};

ItemDBProto.all = function(query, params) {
	return this._open().then(this._all.bind(this, query, params));
}

exports.ItemDB = ItemDB;
