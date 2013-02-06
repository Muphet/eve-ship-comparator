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
        viewTemplate : Y.esc.MicroTemplate.getTemplate('compare'),
        shipTemplate : Y.esc.MicroTemplate.getTemplate('partials/ship'),

        search : function (path) {
            path = path.replace(' ', '+');

            Y.io('/search?' + path, {
                on : {
                    success : function (id, response) {
                        var r = JSON.parse(response.responseText).map(function (s) {
                            return new Y.esc.Ship(s);
                        });

                    },
                    failure : function () {

                    }
                }
            });
        },

        render : function () {
            var c = this.get('container'),
                ships = this.get('ships'),
                newContent = '';

            Y.Array.each(ships, function (ship) {
                newContent += Y.esc.MicroTemplate.include('partials/ship', ship);
            });

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