
YUI({
    skin: 'night',
    insertBefore: 'main-styles'
}).use('io', 'template', 'autocomplete', 'ship-model', 'datatable', 'datatable-sort', function(Y) {

    var micro = new Y.Template(),
        shipResult = micro.compile([
            '<img class="ship-result-image" src="/img/ships/<%= this.id %>.png" width="32" height="32" />',
            '<span class="ship-result-name"><%= this.name %></span>',
            '<span class="ship-result-type"><%= this.type %></span>',
            '<span class="ship-faction-name"><%= this.race %></span>'
        ].join('')),
                
        picker = Y.one('#ship-picker').plug(Y.Plugin.AutoComplete, {
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
        
    picker.ac.after('select', function(evt) {
        table.addRow(new Y.esc.Ship(evt.result.raw));
    });
    
    Y.one('#empty-table').on('click', function() {
        table.set('data', []);
    })
    
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
    
    function getDurability(ship) {
        return ship.hull.strength + ship.armor.strength + ship.shield.strength;
    }

    var table = new Y.DataTable({
        columns: [
            {
                key: "id",
                label: ' ',
                allowHTML: true,
                formatter: function(o) {
                    return '<img src="/img/ships/' + o.value + '.png" />';
                },
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
                key: "durability",
                label: "Durability",
                formatter: function(o) {
                    return Math.round(getDurability(o.data));
                },
                sortFn: function(a, b, desc) {
                    var da = getDurability(a.getAttrs()),
                        db = getDurability(b.getAttrs());
                                        
                    return (da - db) * (desc ? -1 : 1)
                }
            },
            {
                key: "hull",
                label: "Hull Strength",
                formatter: function(o) { return Math.round(o.value.strength * 100) / 100; },
                sortFn: sortNested('hull.strength')
            },
            {
                key: "armor",
                label: "Armor Strength",
                formatter: function(o) { return Math.round(o.value.strength * 100) / 100; },
                sortFn: sortNested('armor.strength')
            },
            {
                key: "shield",
                label: "Shield Strength",
                formatter: function(o) { return Math.round(o.value.strength * 100) / 100; },
                sortFn: sortNested('shield.strength')
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

    table.delegate('click', function(evt) {
        table.getRecord(evt.target).destroy();
    }, 'img');

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