/*global YUI*/

YUI.add('esc-ship-query-service', function(Y) {
    "use strict";

    var NS = Y.namespace('esc');

    NS.ShipQuery = {
        search: function(path) {
            return new Y.esc.Promise(function(fulfill, reject) {
                Y.io('/search?' + path, {
                    on: {
                        success: function(id, response) {
                            var r = JSON.parse(response.responseText).map(function(s) { return new Y.esc.Ship(s); });

                            fulfill(r);
                        },
                        failure: function() {
                            reject();
                        }
                    }
                });

            });
        }
    };


});