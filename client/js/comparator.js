/*jslint browser:true*/
/*global YUI, ESC_CONFIG, ESC_MODEL */
YUI(ESC_CONFIG).use('esc-compare-app', function (Y) {
    "use strict";
    
    var model = Y.config.win.ESC_MODEL.model,
        view = Y.config.win.ESC_MODEL.view,
        ships = model.ships.map(function(s) { return new Y.esc.model.Ship(s); }),
        app;



    app = new Y.esc.CompareApp({
        container: '#eve-ship-comparator',
        viewContainer: '#application-body',
        serverRouting: true
    });

    if(view) {
        app.showContent('#application-body .' + view + '-view', {
            view: {
                name: view,
                config: {
                    ships: ships,
                    keywords: model.keywords
                }
            }
        }, function() {
            Y.one("input").focus();
        });
    }
    
    app.render();

    Y.application = app;
});