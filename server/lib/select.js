/*global YUI*/
/**
 A tool to make it easier to build complex SQL queries.

 @module esc-select
 @namespace esc
 **/
YUI.add('esc-select', function (Y) {
    "use strict";

    var NS = Y.namespace('esc');

    /**
     @class Criteria
     @constructor
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

        addChildCriteria : function (join, columnOrCriteria) {
            var childCriteria = new Criteria(columnOrCriteria, this, this.parentSelect);

            this.child = { criteria : childCriteria, join : join };

            return childCriteria;
        },

        and : function (columnOrCriteria) {
            return this.addChildCriteria('AND', columnOrCriteria);
        },
        or  : function (columnOrCriteria) {
            return this.addChildCriteria('OR', columnOrCriteria);
        },

        addPredicate : function (join, value) {
            var criteria = this.criteria;

            if (criteria instanceof Criteria) {
                throw "Can't add predicate to Criteria instance.";
            }

            criteria.value = value;
            criteria.join = join;

            return this;
        },

        like : function (value) {
            value = value.replace(/(\')/g, '\\$1');

            return this.addPredicate('LIKE', "'" + value + "' ESCAPE '\\'");
        },
        is   : function (value) {
            return this.addPredicate('==', value);
        },
        gt   : function (value) {
            return this.addPredicate('>', value);
        },
        lt   : function (value) {
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
     @class Select
     @constructor
     */
    function Select(tablesAndFields) {
        var table, fields, field, i, l;

        this.tables = {};
        this.fields = {};

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

    Select.from = function (tablesAndFields) {
        return new Select(tablesAndFields);
    };

    Y.mix(Select.prototype, {
        tables   : null,
        fields   : null,
        criteria : null,

        where : function (columnOrCriteria) {
            var c = new Criteria(columnOrCriteria, null, this);

            this.criteria = c;
            return c;
        },

        limit : function () {

            return this;
        },

        orderBy : function () {

            return this;
        },

        exec : function (a) {
            var sel = [
                'SELECT', this.fields.join(', '),
                'FROM', this.tables.join(', ')
            ];

            if (this.criteria) {
                sel.push('WHERE');
                sel.push(this.criteria.exec(a, true));
            }

            return sel.join(' ');
        }
    });

    NS.Select = Select;

}, '', {});