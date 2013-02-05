YUI.add('esc-select', function(Y) {
    
    var NS = Y.namespace('esc');
    
    
    function Criteria(criteria, parentCriteria, selectStatement) {
        if(!this instanceof Criteria) {
            return new Criteria(criteria, parentCriteria, selectStatement);
        }
        
        this.parent = parentCriteria;
        this._select = selectStatement;
        
        if(criteria instanceof Criteria) {
            criteria.parent = this;
            criteria.select = this._select;
            
            this.criteria = criteria;
        } else if(typeof criteria === 'string') {
            this.criteria = { column: criteria };
        } else if(typeof criteria === 'function') {
            this.criteria = criteria;
        }
    }
    
    Y.mix(Criteria.prototype, {
        parent: null,
        child: null,

        _select: null,        
        select: function() {
            if(this._select) {
                return this._select;
            } else {
                var p = this.parent;
                
                while(p.parent) {
                    p = p.parent;
                }
                
                if(p.select) {
                    return p.select;
                } else {
                    return null;
                }
            }
        },
        
        _addChildCriteria: function(join, columnOrCriteria) {
            var childCriteria = new Criteria(columnOrCriteria, this, this._select);
            
            this.child = { criteria: childCriteria, join: join };
            
            return childCriteria;
        },
        
        and: function(columnOrCriteria) {
            return this._addChildCriteria('AND', columnOrCriteria);
        },
        or: function(columnOrCriteria) {
            return this._addChildCriteria('OR', columnOrCriteria);
        },
        
        _addPredicate: function(join, value) {
            var criteria = this.criteria;
            
            if(criteria instanceof Criteria) {
                throw "Can't add predicate to Criteria instance.";
            }
            
            criteria.value = value;
            criteria.join = join;
            
            return this;
        },
        
        like: function(value) {
            var value = value.replace(/(\')/g, '\\$1');
            
            return this._addPredicate('LIKE', "'" + value + "' ESCAPE '\\'");
        },
        is: function(value) {
            return this._addPredicate('==', value);
        },
        gt: function(value) {
            return this._addPredicate('>', value);
        },
        lt: function() {
            return this._addPredicate('<', value);
        },
        
        orderBy: function() {
            var sel = this.select();
            return sel.orderBy.apply(sel, arguments);
        },
        limit: function() {
            var sel = this.select();
            return sel.limit.apply(sel, arguments);
        },
        
        eval: function(a, force) {
            if(force) {
                var criteria = this.criteria,
                    out;

                if(criteria instanceof Criteria) {
                    out = [ '(', criteria.eval(a, true), ')' ].join(' ');
                } else if(typeof criteria === 'function') {
                    out = criteria.call(this, a);
                } else {
                    out = [ criteria.column, criteria.join, Y.Lang.sub(criteria.value, a) ].join(' ');
                }

                if(this.child) {
                    out = [ out, this.child.join, this.child.criteria.eval(a, true) ].join(' ');
                }
                
                return out;
            } else {
                var sel = this.select();
                return sel.eval.apply(sel, arguments);
            }
            
        }
    });
    
    NS.Criteria = Criteria;
    
    
    function Select(tablesAndFields) {
        var table, fields, field, i, l;
        
        this.tables = {};
        this.fields = {};
        
        for(table in tablesAndFields) {
             if(tablesAndFields.hasOwnProperty(table)) {
                 fields = tablesAndFields[table];

                 this.tables[table] = true;
                 
                 if((/\s+AS\s+/).test(table)) {
                     table = (/\s+AS\s+(.+)/).exec(table)[1];
                 }

                 for(i = 0, l = fields.length; i < l; i += 1) {
                     field = fields[i];
                
                     this.fields[table + '.' + field] = true;
                 }
             }
         }
         
         this.tables = Object.keys(this.tables);
         this.fields = Object.keys(this.fields);
    }
    
    Select.from = function(tablesAndFields) {
        return new Select(tablesAndFields);
    };
    
    Y.mix(Select.prototype, {
        tables: null,
        fields: null,
        criteria: null,
        
        where: function(columnOrCriteria) {
            var c = new Criteria(columnOrCriteria, null, this);
            
            this.criteria = c;
            return c;
        },
        
        limit: function() {
            
            return this;
        },
        
        orderBy: function() {

            return this;
        },
        
        eval: function(a) {
            var sel = [
                'SELECT', this.fields.join(', '),
                'FROM', this.tables.join(', ')
            ];
            
            if(this.criteria) {
                sel.push('WHERE');
                sel.push(this.criteria.eval(a, true));
            }

            return sel.join(' ');
        }
    })
    
    NS.Select = Select;
    
}, '', {});