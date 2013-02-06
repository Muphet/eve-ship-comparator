/*global YUI*/
/**
 A tool to make it easier to build complex SQL queries.

 @module esc-select
 @namespace esc.util
 **/
YUI.add('esc-select', function (Y) {
    "use strict";

    var NS = Y.namespace('esc.util');

    /**

     A criteria object generates a set of conditionals to be attached to a SQL query. Criteria objects are usually generated from Select instances using the `where` method, but can be generated on its own, if that level of control is needed.

     @class Criteria
     @constructor
     @param criteria {String|Function|esc.Criteria}

     If the `criteria` argument is a string, it sets the column the criteria is looking at, so that it can be followed by a call to `is`, `gt`, `lt`, or `like`. If the criteria argument is a function, it will evaluate the function against provided arguments when the criteria is evaluated. If the criteria is a `Criteria` instance, it attaches that. This last case is useful for attaching tree-based criteria to a query.

     @param [parentCriteria] {Criteria} Criteria objects exist in a linked list. If the parentCriteria is defined, it will be set as the previous link in the list.
     @param [selectStatement] {Select} The containing select statement.
     **/
    function Criteria(criteria, parentCriteria, selectStatement) {
        if (!this instanceof Criteria) {
            return new Criteria(criteria, parentCriteria, selectStatement);
        }

        this.parent = parentCriteria;
        this.parentSelect = selectStatement;

        if (criteria instanceof Criteria) {
            criteria.parent = this;
            criteria.select = this.parentSelect;

            this.criteria = criteria;
        } else if (typeof criteria === 'string') {
            this.criteria = { column : criteria };
        } else if (typeof criteria === 'function') {
            this.criteria = criteria;
        }
    }

    Y.mix(Criteria.prototype, {
        /**
         The parent criteria for this instance.

         @property parent {esc.Criteria}
         */
        parent : null,

        /**
         The child criteria for this instance.

         @property child {esc.Criteria}
         */
        child : null,

        /**
         The parent select statement.

         @property parentSelect {esc.Select}
         */
        parentSelect : null,

        /**
         Returns the select statement that this criteria is a part of, if one exists. If this Critiera doesn't know what select statement it is a part of, it will traverse the criteria tree until it finds it.

         @method select
         @returns {esc.Select} The parent select object, if any.
         */
        select : function () {
            var out, p;
            if (this.parentSelect) {
                out = this.parentSelect;
            } else {
                p = this.parent;

                while (p.parent) {
                    p = p.parent;
                }

                if (p.select) {
                    out = p.select;
                } else {
                    out = null;
                }
            }
            return out;
        },

        /**
         Adds a child criteria to the linked list and returns it. Used for fluent chaining.

         @method addChildCriteria
         @protected
         @param join {String}
         @param columnOrCriteria {String|Function|Criteria}
         @return {esc.Criteria} The child criteria.
         **/
        addChildCriteria : function (join, columnOrCriteria) {
            var childCriteria = new Criteria(columnOrCriteria, this, this.parentSelect);

            this.child = { criteria : childCriteria, join : join };

            return childCriteria;
        },

        /**
         Adds a new `AND` child criteria and returns it.

         @method and
         @param columnOrCriteria {String|Function|Criteria}
         @return {esc.Criteria} The child criteria
         **/
        and : function (columnOrCriteria) {
            return this.addChildCriteria('AND', columnOrCriteria);
        },

        /**
         Adds a new `OR` child criteria and returns it.

         @method or
         @param columnOrCriteria {String|Function|Criteria}
         @return {esc.Criteria} The child criteria
         **/
        or : function (columnOrCriteria) {
            return this.addChildCriteria('OR', columnOrCriteria);
        },

        /**
         Adds a predicate to the current criteria.

         @method addPredicate
         @protected
         @chainable
         @param join {String}
         @param value {String|Number}
         @return {esc.Criteria} This criteria
         **/
        addPredicate : function (join, value) {
            var criteria = this.criteria;

            if (criteria instanceof Criteria) {
                throw "Can't add predicate to Criteria instance.";
            }

            criteria.value = value;
            criteria.join = join;

            return this;
        },

        /**
         @method like
         @chainable
         @param value {String|Number}
         @return {esc.Criteria} This criteria
         **/
        like : function (value) {
            value = value.replace(/(\')/g, '\\$1');

            return this.addPredicate('LIKE', "'" + value + "' ESCAPE '\\'");
        },

        /**
         @method is
         @chainable
         @param value {String|Number}
         @return {esc.Criteria} This criteria
         **/
        is : function (value) {
            return this.addPredicate('==', value);
        },

        /**
         @method gt
         @chainable
         @param value {String|Number}
         @return {esc.Criteria} This criteria
         */
        gt : function (value) {
            return this.addPredicate('>', value);
        },

        /**
         @method lt
         @chainable
         @param value {String|Number}
         @return {esc.Criteria} This criteria
         **/
        lt : function (value) {
            return this.addPredicate('<', value);
        },

        orderBy : function () {
            var sel = this.select();
            return sel.orderBy.apply(sel, arguments);
        },
        limit   : function () {
            var sel = this.select();
            return sel.limit.apply(sel, arguments);
        },

        /**
         Evaluates the current select statement.

         @method exec
         @param a {Object|Number|Array|String}
         @return {String}
         **/
        exec : function (a, force) {
            var criteria = this.criteria,
                sel,
                out;

            if (force) {
                if (criteria instanceof Criteria) {
                    out = [ '(', criteria.exec(a, true), ')' ].join(' ');
                } else if (typeof criteria === 'function') {
                    out = criteria.call(this, a);
                } else {
                    out = [ criteria.column, criteria.join, Y.Lang.sub(criteria.value, a) ].join(' ');
                }

                if (this.child) {
                    out = [ out, this.child.join, this.child.criteria.exec(a, true) ].join(' ');
                }

            } else {
                sel = this.select();
                out = sel.exec.apply(sel, arguments);
            }

            return out;
        }
    });

    NS.Criteria = Criteria;

    /**
     Generates a new select statement that can be evaluated using `exec`. Generally accessed via the `from` factory method.

     @class Select
     @constructor
     @param tablesAndFields {Object}

     @example

         select.from({ 'invTypes': [ 'typeID', 'typeName' ] }).where('typeID').is('{id}').exec({ id: 12345 });
         // SELECT invTypes.typeID, invTypes.typeName FROM invTypes WHERE typeID == 12345

     **/
    function Select(tablesAndFields) {
        var table, fields, field, i, l;

        this.tables = {};
        this.fields = {};
        this.order  = [];

        for (table in tablesAndFields) {
            if (tablesAndFields.hasOwnProperty(table)) {
                fields = tablesAndFields[table];

                this.tables[table] = true;

                if ((/\s+AS\s+/).test(table)) {
                    table = (/\s+AS\s+([\w\W]+)/).exec(table)[1];
                }

                for (i = 0, l = fields.length; i < l; i += 1) {
                    field = fields[i];

                    this.fields[table + '.' + field] = true;
                }
            }
        }

        this.tables = Object.keys(this.tables);
        this.fields = Object.keys(this.fields);
    }

    /**
     A factory method for Select

     @method from
     @static
     @param tablesAndFields {Object}
     @return {esc.Select} A new select instance.
     **/
    Select.from = function (tablesAndFields) {
        return new Select(tablesAndFields);
    };

    Y.mix(Select.prototype, {
        tables   : null,
        fields   : null,
        criteria : null,
        order    : null,

        /**
         Returns a new Criteria clause attached to this select statement.

         @method where
         @param columnOrCriteria {String|Function|esc.Criteria}
         @return {esc.Criteria} The first item on the criteria chain.
         **/
        where : function (columnOrCriteria) {
            var c = new Criteria(columnOrCriteria, null, this);

            this.criteria = c;
            return c;
        },

        limit : function () {
            return this;
        },

        orderBy : function (field, sort) {
            sort = sort || 'ASC';
            this.order.push({ field: field, sort: sort });

            return this;
        },

        /**
         A factory method for Select

         @method exec
         @param a {String|Number|Array|Object}
         @return {String} The evaluated select statement.
         **/
        exec : function (a) {
            var orderStack,
                sel = [
                    'SELECT', this.fields.join(', '),
                    'FROM', this.tables.join(', ')
                ];

            if (this.criteria) {
                sel.push('WHERE');
                sel.push(this.criteria.exec(a, true));
            }

            if (this.order.length) {
                sel.push('ORDER BY');
                orderStack = [];

                this.order.forEach(function(o) {
                    orderStack.push(o.field + ' ' + o.sort);
                });
                sel.push(orderStack.join(', '));
            }

            return sel.join(' ');
        }
    });

    NS.Select = Select;

}, '', {});