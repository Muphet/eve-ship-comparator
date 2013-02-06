/*global YUI*/
/**
@module esc-sqlite
@namespace esc.util
 */
YUI.add('esc-sqlite', function(Y, NAME) {
    "use strict";

    var NS = Y.namespace('esc.util'),

        sqlite3 = YUI.require('sqlite3').verbose(),
        SqliteDatabase = sqlite3.Database,
        Promise = NS.Promise;

    function slice(a) { return [].slice.call(a); }
    
    //
    // --- Database Connector --------------------------------------------------------------
    //

    /**
    @class Query
    @constructor
    @extends esc.util.Promise
    **/
    function Query(resolver) {
        Query.superclass.constructor.apply(this, arguments);
    }
    
    function arrayMethod(method) {
        return function() {
            var a = slice(arguments);
            
            return this.then(function(r) {
                if(!Array.isArray(r)) {
                    r = [ r ];
                }
                
                return r[method].apply(r, a);
            });
        };
    }
    
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
    @extends esc.util.Promise

    @example

        Database.open('someDatabase.sqlite').all('SELECT * FROM invTypes WHERE typeID == 12345').each(function(result) {
            console.log(res.typeName);
        });
    **/
    function Database(resolver) {
        Database.superclass.constructor.apply(this, arguments);
    }
    
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
        @param select {esc.util.Select | String}
        @return {esc.util.Query} A query promise hooked to this instance's db.
        **/
        one: function(select) {
            var self = this;
            
            Y.log(select, 'info', NAME);
            
            return new Query(function(fulfill, reject) {
                self.then(function(db) {
                    db.get(select, function(e, r) {
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
        @param select {esc.util.Select | String}
        @return {esc.util.Query} A query promise hooked to this instance's db.
        **/
        all: function(select) {
            var self = this;
            
            Y.log(select, 'info', NAME);
            
            return new Query(function(fulfill, reject) {
                self.then(function(db) {
                    db.all(select, function(e, r) {
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
        @return {esc.util.Database} promise chain.
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