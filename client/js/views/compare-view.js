/*global YUI*/

/**
 @module esc-compare-view
 @namespace esc
 **/
YUI.add('esc-compare-view', function (Y, NAME) {
    "use strict";

    var NS = Y.namespace('esc');

    /**
     @class CompareView
     @extends View
    **/

    NS.CompareView = Y.Base.create(NAME, Y.View, [], {
        viewTemplate : Y.esc.util.MicroTemplate.getTemplate('compare'),
        shipTemplate : Y.esc.util.MicroTemplate.getTemplate('partials/ship'),

        render : function () {
            var c = this.get('container'),
                ships = this.get('ships'),
                newContent = '';

            Y.Array.each(ships, function (ship) {
                newContent += this.shipTemplate(ship);
            }, this);

            c.setHTML(newContent);
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