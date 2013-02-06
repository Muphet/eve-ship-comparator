/*global YUI*/
YUI.add('esc-compare-view', function(Y, NAME) {
    "use strict";

    var NS = Y.namespace('esc');

    NS.CompareView = Y.Base.create(NAME, Y.View, [], {
        render: function() {
            var c = this.get('container'),
                ships = this.get('ships'),
                newContent = '';

            Y.Array.each(ships, function(ship) {
                newContent += Y.esc.MicroTemplate.include('partials/ship', ship);
            });

            c.setHTML(newContent);
        }
    }, {
        ATTRS: {
            ships: {
                value: []
            }
        }
    });

}, '', {
    requires: [ 'view' ]
});