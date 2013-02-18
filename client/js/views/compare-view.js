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
        templates : {
            view     : MT.getTemplate('index'),
            ships    : MT.getTemplate('partials/ship'),
            keywords : MT.getTemplate('partials/search')
        },

        events : {
            '.ship-search-input' : {
                keydown : 'handleShipSearch'
            },
            '.ship-search .ship-search-keyword' : {
                click   : 'handleKeywordClick',
                keydown : 'handleKeywordKeyup'
            }
        },

        initializer : function () {
            this.after('shipsChange', this.updateShips);
            this.after('keywordsChange', this.updateKeywords);
        },

        handleShipSearch : function (evt) {
            if (evt.keyCode === 13) { // ENTER
                evt.preventDefault();

                var keywords = this.get('keywords');

                keywords.push(evt.target.get('value'));

                this.set('keywords', keywords);

                this.fire('search', { query : keywords });
            } else if(evt.keyCode === 8 && evt.target.get('value').length === 0) { // BACKSPACE
                this.get('container').one('.ship-search .ship-search-keyword:last-of-type').focus();
            }
        },

        handleKeywordClick: function(evt) {
            var keyword = evt.target.getData('keyword'),
                kws = this.get('keywords');

            return false;

            if(Y.Array.indexOf(kws, keyword) !== -1) {
                kws.splice(Y.Array.indexOf(kws, keyword), 1);

                this.set('keywords', kws);

                this.fire('search', { query: kws });
            }
        },

        handleKeywordKeyup: function(evt) {
            var keyword = evt.target.getData('keyword'),
                kws = this.get('keywords');

            if(evt.keyCode === 8) {
                evt.preventDefault();
            }

            if(evt.keyCode === 8 && Y.Array.indexOf(kws, keyword) !== -1) {
                kws.splice(Y.Array.indexOf(kws, keyword), 1);

                this.set('keywords', kws);

                Y.log(kws);

                this.fire('search', { query: kws });

                Y.later(0, this, function() {
                    this.get('container').one('.ship-search-input').focus();
                });
            }
        },

        updateKeywords: function() {
            var sc = this.get('container').one('.ship-search'),
                template = this.templates.keywords;

            sc.setHTML(template(this.get('keywords')));
        },

        updateShips : function () {
            var lc = this.get('container').one('.ship-list'),
                template = this.templates.ships,
                result = [];

            Y.Array.each(this.get('ships'), function (s) {
                result.push(template(s));
            });

            lc.setHTML(result.join(''));
        },

        render : function () {
            var c = this.get('container');

            c.setHTML(this.template({ ships : this.get('ships') }));
        }
    }, {
        ATTRS : {
            ships    : {
                value : []
            },
            keywords : {
                value : []
            }
        }
    });

}, '', {
    requires : [ 'view' ]
});