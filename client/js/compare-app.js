/*global YUI*/
YUI.add('esc-compare-app', function (Y) {
    "use strict";

    var NS = Y.namespace('esc'),
        Promise = NS.util.Promise;

    /**
     @module esc-compare-app
     @namespace esc
     **/

    /**
     @class CompareApp
     @extends App
     @uses App.Content
     **/
    NS.CompareApp = Y.Base.create('compare-app', Y.App, [], {

        views : {
            'index' : { type : 'esc.CompareView', preserve : true }
        },

        initializer : function () {
            this.on('*:search', this.handleSearchEvent);
        },

        handleIndex : function (req, res, next) {
            var app = this,
                keywords = Y.Object.keys(req.query);

            app.search(keywords).then(function (ships) {
                app.showView('index', { ships : ships, keywords: keywords }, { update : true }, function() {
                    Y.one("input").focus();
                });
            });
        },

        handleSearchEvent : function (evt) {
            if(evt.query.length) {
                this.navigate('/?' + evt.query.join('&'));
            } else {
                this.navigate('/');
            }
        },

        search : function (searchParams) {
            function mapResultsToShips(results) {
                return results.map(function (result) {
                    return new NS.model.Ship(result);
                });
            }

            return new Promise(function (fulfill, reject) {
                Y.io('/search?' + searchParams.join('&'), {
                    on : {
                        success : function (id, response) {
                            try {
                                fulfill(mapResultsToShips(Y.JSON.parse(response.responseText)));
                            } catch (e) {
                                reject(e);
                            }
                        },
                        failure : function (id, response) {
                            reject({ status : response.status, statusText : response.statusText });
                        }
                    }
                });
            });
        }
    }, {
        ATTRS : {
            routes : {
                value : [
                    { path : '/', callbacks : 'handleIndex' }
                ]
            }
        }
    });

}, '', {
    requires : [
        'io',
        'json',
        'app',
        'app-content',
        'esc-ship',
        'esc-compare-view',
        'esc-promise'
    ]
});