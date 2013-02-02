
YUI.add('esc-sqlite', function(Y) {
    
    var NS = Y.namespace('esc');
    
    var sqlite3 = YUI.require('sqlite3').verbose(),
        SqliteDatabase = sqlite3.Database;

    function slice(a) { return [].slice.call(a); }
    
    //
    // --- Database Connector --------------------------------------------------------------
    //
    
    var Promise = NS.Promise;

    /**
    @class Query
    @constructor
    @extends esc.Promise
    **/
    var Query = function(resolver) {
        Query.superclass.constructor.apply(this, arguments);
    };
    
    var arrayMethod = function(method) {
        return function() {
            var a = slice(arguments);
            
            return this.then(function(r) {
                if(!Array.isArray(r)) {
                    r = [ r ];
                }
                
                return r[method].apply(r, a);
            });
        };
    };
    
    Y.extend(Query, Promise, {
        /**
        @method each
        **/
        each: arrayMethod('forEach'),
        
        /**
        @method every
        **/
        every: arrayMethod('every'),

        /**
        @method some
        **/
        some: arrayMethod('some'),
        
        /**
        @method filter
        **/
        filter: arrayMethod('filter'),
        
        /**
        @method map
        **/
        map: arrayMethod('map'),
        
        /**
        @method reduce
        **/
        reduce: arrayMethod('reduce'),
        
        /**
        @method reduceRight
        **/
        reduceRight: arrayMethod('reduceRight')
    });

    /**
    @class Database
    @constructor
    @extends esc.Promise
    **/
    var Database = function(resolver) {
        if(typeof resolver === 'string') {
            return Database.open(resolver);
        } else {
            Database.superclass.constructor.apply(this, arguments);
        }
    };
    
    /**
    @method open
    @static
    **/
    Database.open = function(fileName) {
        return new Database(function(fulfill, reject) {
            var db = new SqliteDatabase(fileName, sqlite3.OPEN_READONLY, function(e) {
                if(e) {
                    reject(e);
                } else {
                    fulfill(db);
                }
            });
        });
    };

    Y.extend(Database, Promise, {
        /**
        @method one
        @param select {esc.Select | String}
        @return {esc.Query} A query promise hooked to this instance's db.
        **/
        one: function(select) {
            var self = this;
            
            return new Query(function(fulfill, reject) {
                self.then(function(db) {
                    db.get(query, function(e, r) {
                        if(e) {
                            reject(e);
                        } else {
                            fulfill(r);
                        }
                    })
                }, reject);
            });

        },
        
        /**
        @method all
        @param select {esc.Select | String}
        @return {esc.Query} A query promise hooked to this instance's db.
        **/
        all: function(select) {
            var self = this;
            
            return new Query(function(fulfill, reject) {
                self.then(function(db) {
                    db.all(query, function(e, r) {
                        if(e) {
                            reject(e);
                        } else {
                            fulfill(r);
                        }
                    })
                }, reject);
            });
            
        },
        
        /**
        @method close
        @return {esc.Database} promise chain.
        **/
        close: function() {
            return this.then(function(db) {
                db.close();
                
                return db;
            });
        }
    });
    
    NS.Database = Database;

}, '', {
    requires: [ 'esc-promise', 'oop' ]
});