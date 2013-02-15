/*jslint browser:true*/
/*global YUI, ESC_CONFIG, ESC_MODEL */
YUI(ESC_CONFIG).use(
    'io',
    'app',
    'app-content',
    'esc-templates',
    'esc-ship',
    'esc-compare-view',
    'esc-ship-query-service',

function (Y) {
    "use strict";
    
    var model, view, app;
    
    model = Y.config.win.ESC_MODEL.model;
    view  = Y.config.win.ESC_MODEL.view;

    app = new Y.App({
        container: '#eve-ship-comparator',
        viewContainer: '#application-body',
        serverRouting: true,

        ships: model.ships.map(function(s) { return new Y.esc.model.Ship(s); }),
        
        routes: [{
            path: '/', callbacks: function(req, res, next) {
                var query = Y.Object.keys(req.query),
                    self = this;
                
                app.search(Y.Object.keys(req.query), function() {
                    self.showView('index', { ships: app.get('ships') }, { update: true });
                });
            }
        }],
        
        views: {
            'index': { type: 'esc.CompareView', preserve: true }
        }
    });
    
    app.search = function(search, callback) {
        var self = this;
        
        search = search.join('&').replace(' ', '+').toLowerCase();
        Y.io('/search?' + search, {
            on: {
                success: function(id, response) {
                    var newShips, newShipIds;
                        
                    newShips = Y.JSON.parse(response.responseText).map(function(s) {
                        return new Y.esc.model.Ship(s);
                    });
                    
                    self.set('ships', newShips);
                    
                    callback();
                },
                failure: function() {
                    Y.error("Couldn't request ships with query [" + search + "]");
                    callback();
                }
            }
        });
    };

    app.on('*:search', function(e) {
        var q = Y.config.win.location.search ? Y.config.win.location.search + '&' : '?';
        app.navigate('/' + q + e.query);
    });

    
    if(view) {
        app.showContent('#application-body .' + view + '-view', {
            view: {
                name: view,
                config: {
                    ships: app.get('ships')
                }
            }
        });
    }
    
    app.render();

    Y.application = app;
});