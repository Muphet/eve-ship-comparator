
YUI({
    skin: 'night',
    insertBefore: 'main-styles'
}).use('io', 'template', 'autocomplete', 'ship-model', 'datatable', 'datatable-sort', function(Y) {

    /*
    var micro = new Y.Template();

    var item = Y.one('#ship-picker').plug(Y.Plugin.AutoComplete, {
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
    */
    
    function sortNested(propertyPath) {
        var getVal = Y.Object.getValue,
            path = propertyPath.split('.'),
            attr = path.shift();
        
        return function(a, b, desc) {
            var va = a.get(attr),
                vb = b.get(attr);
        
            return (getVal(va, path) - getVal(vb, path)) * (desc ? -1 : 1);
        }
    }

    var table = new Y.DataTable({
        columns: [
            {
                key: "id",
                label: ' ',
                allowHTML: true,
                formatter: function(o) { return '<img src="/img/ships/' + o.value + '.png" />'; },
                sortFn: function(a, b, desc) {
                    var ra = a.get('race'),
                        rb = b.get('race'),
                        l = desc ? -1 : 1,
                        r = l * -1;
                    
                    return ra === rb ? 0 : (ra > rb ? l : r);
                }
            },
            {
                key: "name",
                label: "Ship Name"
            },
            {
                key: "shield",
                label: "Shield Recharge",
                formatter: function(o) { return Math.round(o.value.peakRecharge * 100) / 100; },
                sortFn: sortNested('shield.peakRecharge')
            },
            {
                key: "capacitor",
                label: "Cap Recharge",
                formatter: function(o) { return Math.round(o.value.peakRecharge * 100) / 100; },
                sortFn: sortNested('capacitor.peakRecharge')
            }
        ],
        sortable: true
    }).render('#ship-display');



    Y.io('/ship/byNameOrType/frigate', {
        on: {
            success: function(id, res) {
                var res = JSON.parse(res.responseText),
                    rows = [];
                
                res.forEach(function(s) {
                    rows.push(new Y.esc.Ship(s));
                });

                table.addRows(rows);
                
            }
        }
    });
});