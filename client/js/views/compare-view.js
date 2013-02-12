/*global YUI*/

/**
 @module esc-compare-view
 @namespace esc
 **/
YUI.add('esc-compare-view', function (Y, NAME) {
    "use strict";

    var NS = Y.namespace('esc'),
        MT = NS.util.MicroTemplate;

    /**
     @class CompareView
     @extends View
    **/
    NS.CompareView = Y.Base.create(NAME, Y.View, [], {
        template: MT.getTemplate('index'),
        shipTemplate: MT.getTemplate('partials/ship'),
        
        events: {
            '.ship-search': {
                keyup: 'handleShipSearch'
            }
        },
        
        initializer: function() {
            this.after('shipsChange', this.updateShips);
        },
        
        handleShipSearch: function(evt) {
            if(evt.keyCode === 13) { // ENTER
                evt.preventDefault();
                this.fire('search', { query: evt.target.get('value') });
                evt.target.set('value', '');
            }
        },
        
        updateShips: function() {
            var lc = this.get('container').one('.ship-list'),
                template = this.shipTemplate,
                result = [];
            
            Y.Array.each(this.get('ships'), function(s) {
                result.push(template(s));
            });
            
            lc.setHTML(result.join(''));
        },
        
        render: function() {
            var c = this.get('container');

            c.setHTML(this.template({ ships: this.get('ships') }));
        }
    }, {
        ATTRS : {
            ships : {
                value : []
            }
        }
    });

}, '', {
    requires : [ 'view' ]
});