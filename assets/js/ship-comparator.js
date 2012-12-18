
YUI({
    skin: 'night',
    insertBefore: 'main-styles'
}).use('io', 'template', 'autocomplete', 'ship-model', 'datatable', 'datatable-sort', function(Y) {

    var micro = new Y.Template();

    var shipResult = micro.compile([
            '<img class="ship-result-image" src="/img/ships/<%= this.id %>.png" width="32" height="32" />',
            '<span class="ship-result-name"><%= this.name %></span>',
            '<span class="ship-result-type"><%= this.type %></span>',
            '<span class="ship-faction-name"><%= this.race %></span>'
        ].join(''));

        item = Y.one('#ship-picker').plug(Y.Plugin.AutoComplete, {
            source: '/ship/byNameOrType/{query}',
            resultHighlighter: 'phraseMatch',
            resultTextLocator: 'name',
            minQueryLength: 2,

            resultFormatter: function(query, results) {
                return Y.Array.map(results, function(r) {
                    return shipResult(r.raw);
                });
            }
        });


    Y.io('/ship/byNameOrType/frigate', {
        on: {
            success: function(id, res) {
                var res = JSON.parse(res.responseText),
                    rows = [];
                
                res.forEach(function(s) {
                    rows.push(new Y.esc.Ship(s));
                })

                console.log(rows);
            }
        }
    });

    item.ac.on('select', function(evt) {

    });
});