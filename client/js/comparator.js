/*global YUI, ESC_CONFIG, ESC_MODEL */
YUI(ESC_CONFIG).use('node', 'event', 'esc-templates', 'esc-ship', 'esc-compare-view', 'esc-ship-query-service', function (Y) {
    "use strict";

    var view = new Y.esc.CompareView({
        container: Y.one('.ship-list'),
        ships: ESC_MODEL.model.ships.map(function(s) { return new Y.esc.Ship(s); })
    });

    if (!Y.Node.DOM_EVENTS.popstate) {
        Y.Node.DOM_EVENTS.popstate = 1;
    }

    Y.on('popstate', function(evt) {
        var query = Y.config.win.location.search;

        if(query) {
            Y.esc.ShipQuery.search(query.slice(1)).then(function(ships) {
                view.set('ships', ships);
                view.render();
            });
        } else {
            view.set('ships', []);
            view.render();
        }

    }, Y.config.win);


    Y.one('#ship-picker').on('key', function(evt) {
        evt.preventDefault();

        var shipQuery = this.get('value').replace(' ', '+'),
            win = Y.config.win;

        this.set('value', '');

        Y.esc.ShipQuery.search(shipQuery).then(function(newShips) {
            var path = win.location.pathname + (win.location.search ? win.location.search + '&' : '?') + shipQuery,
                prevShips = view.get('ships'),
                shipIds = prevShips.map(function(s) { return s.id; });


            win.history.pushState(undefined, 'fake', path);

            Y.Array.each(newShips, function(s, i, a) {
                if(shipIds.indexOf(s.id) === -1) {
                    prevShips.push(s);
                }
            });

            view.render();
        });

    }, 'enter');

});