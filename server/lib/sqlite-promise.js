
var sqlite = require('sqlite3').verbose(),
    extend = require('../../shared/utils').extend,
    Promise = require('../../shared/promise').Promise,
    ListPromise = require('../../shared/list-promise').ListPromise,
    SqliteDatabase = sqlite.Database;

function Database() {
    Database.superclass.constructor.apply(this, arguments);
}

extend(Database, Promise, {
    one: function(q, a) {
        var self = this;
        
        return new Promise(function(fulfill, reject) {
            self.then(function(db) {
                db.get(q, a, function(err, data) {
                    (err) ? reject(err) : fulfill(data);
                });
            });
        });
    },
    
    all: function(q, a) {
        var self = this;
        
        return new ListPromise(function(fulfill, reject) {
            self.then(function(db) {
                db.all(q, a, function(err, data) {
                    (err) ? reject(err) : fulfill(data);
                });
            });
        });
    },
    
    trace: function(fn) {
        this.then(function(db) {
            db.on('trace', fn);
        });
        
        return this;
    }
});

module.exports = function(file) {
    return new Database(function(fulfill, reject) {
        var db = new SqliteDatabase(file, sqlite.OPEN_READONLY, function(e) {
            if(e) {
                reject(e);
            } else {
                fulfill(db);
            }
        });
    });
};
