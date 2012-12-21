
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



var Select, SelectProto;

Select = function(tablesAndFields) {
    this._where = [];
    this._fields = {};
    this._tables = {};
    this._order = [];
    this._limit = [];
    
    var table, fields, field, i, j;
    
    for(table in tablesAndFields) {
        if(tablesAndFields.hasOwnProperty(table)) {
            fields = tablesAndFields[table];
            
            this._tables[table] = true;
            
            for(i = 0, l = fields.length; i < l; i += 1) {
                field = fields[i];
                
                this._fields[table + '.' + field] = true;
            }
        }
    }
};

SelectProto = Select.prototype;

SelectProto._where  = null;
SelectProto._fields = null;
SelectProto._tables = null;
SelectProto._order  = null;

SelectProto._addWhere = function(outerJoin, innerJoin, predicates) {
    this._where.push({
        $outerJoin: outerJoin,
        $innerJoin: innerJoin,
        predicates: predicates
    });    
};

SelectProto._evalWhere = function(where, useOuterJoin, params) {
    var i, l, p, out = [];

    for(i = 0, l = where.predicates.length; i < l; i += 1) {
        p = where.predicates[i];
                
        if(typeof p === 'function') {
            out.push(p.call(this, params));
        } else if(typeof p === 'string') {
            out.push(p);
        }
    }
    
    out = out.join(' ' + where.$innerJoin.toUpperCase() + ' ');

    if(where.predicates.length > 1) {
        out = '( ' + out + ' )';
    }
    
    if(useOuterJoin) {
        out = where.$outerJoin.toUpperCase() + ' ' + out;
    }
    
    return out;
};


SelectProto.where = function(j) {
    if(this._where.length > 0) {
        console.log("Doing it wrong.");

    } else {
        var predicates = Array.prototype.slice.call(arguments, 0),
            joinType = (j === 'and' || j === 'or') ? predicates.shift() : 'or';
                
        this._addWhere(null, joinType, predicates);

        return this;        
    }
};


SelectProto.andWhere = function(j) {
    var predicates = Array.prototype.slice.call(arguments, 0),
        joinType = (j === 'and' || j === 'or') ? predicates.shift() : 'or';
        
    this._addWhere('and', joinType, predicates);

    return this;
};

SelectProto.orWhere = function() {
    var predicates = Array.prototype.slice.call(arguments, 0),
        joinType = (j === 'and' || j === 'or') ? predicates.shift() : 'and';
        
    this._addWhere('or', joinType, predicates);

    return this;
};


SelectProto.order = function(field, ordering) {
    this._fields[field] = true;

    this._order.push({ field: field, order: ordering });
    
    return this;
};

SelectProto.eval = function(params) {
    var fields = Object.keys(this._fields),
        tables = Object.keys(this._tables),
        predicates = this._where,
        stack = [],
        p, i, l;
        
    stack.push('SELECT ' + fields.join(', '));
    stack.push('FROM ' + tables.join(', '));
        
    for(i = 0, l = predicates.length; i < l; i += 1) {
        if(i === 0) {
            stack.push('WHERE');
            stack.push(this._evalWhere(predicates[i], false, params));
        } else {
            stack.push(this._evalWhere(predicates[i], true, params));
        }
    }
    
    if(this._order.length) {
        stack.push('ORDER BY');
        p = [];
        for(i = 0, l = this._order.length; i < l; i += 1) {
            if(this._order[i].order) {
                p.push(this._order[i].field + ' ' + this._order[i].order.toUpperCase());
            } else {
                p.push(this._order[i].field);
            }
        }
        stack.push(p.join(', '));
    }
        
    return stack.join(' ');
};

exports.Select = Select;