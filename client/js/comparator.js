/*jslint browser:true*/
/*global YUI, ESC_CONFIG, ESC_MODEL */
YUI(ESC_CONFIG).use('node', 'event', 'esc-templates', 'esc-ship', 'esc-compare-view', 'esc-ship-query-service', function (Y) {
    "use strict";

    var view = new Y.esc.CompareView({
        container: Y.one('.ship-list'),
        ships: ESC_MODEL.model.ships.map(function(s) { return new Y.esc.model.Ship(s); })
    });

    if (!Y.Node.DOM_EVENTS.popstate) {
        Y.Node.DOM_EVENTS.popstate = 1;
    }

    setTimeout(function() {

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

    }, 300);


    Y.one('#ship-picker').on('key', function(evt) {
        evt.preventDefault();

        var shipQuery = this.get('value').replace(' ', '+').toLowerCase(),
            win = Y.config.win;

        this.set('value', '');

        if(view.get('ships').map(function(s) { return s.name.toLowerCase(); }).indexOf(shipQuery) !== -1) {
            return;
        }

        Y.esc.ShipQuery.search(shipQuery).then(function(newShips) {
            var path = win.location.pathname + (win.location.search ? win.location.search + '&' : '?') + shipQuery,
                prevShips = view.get('ships'),
                shipIds = newShips.map(function(s) { return s.id; });

            win.history.pushState(undefined, 'fake', path);

            Y.Array.each(prevShips, function(s, i, a) {
                if(shipIds.indexOf(s.id) === -1) {
                    newShips.unshift(s);
                }
            });

            newShips.sort(function(a, b) { return a.id - b.id; });

            view.set('ships', newShips);

            view.render();
        });

    }, 'enter');

});