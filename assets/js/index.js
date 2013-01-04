YUI({
    skin: 'night',
    insertBefore: 'main-styles'
}).use('io', 'autocomplete', 'datatable', 'datatable-sort', function(Y) {

    var micro = window.esc.MicroTemplate,
        shipResult = micro.compile([
            '<img class="ship-result-image" src="/img/ships.new/<%= this.id %>.png" width="32" height="32" />',
            '<span class="ship-result-name"><%= this.name %></span>',
            '<span class="ship-result-type"><%= this.type %></span>',
            '<span class="ship-faction-name"><%= this.race %></span>'
        ].join('')),
                
        picker = Y.one('#ship-picker').plug(Y.Plugin.AutoComplete, {
            source: '/data/ship/getByNameOrType?{query}',
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
        table.addRow(new window.esc.Ship(evt.result.raw));
    });
    
    Y.one('#empty-table').on('click', function() {
         table.set('data', []);
    });
    
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
        return ship.hull.ehp + ship.armor.ehp + ship.shield.ehp;
    }

    var table = new Y.DataTable({
        columns: [
            {
                key: "id",
                label: ' ',
                allowHTML: true,
                formatter: function(o) {
                    return '<img height="32" width="32" src="/img/ships.new/' + o.value + '.png" />';
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
                label: "EHP ( Hull / Armor / Shield )",
                formatter: function(o) {
                    var dur = Math.round(getDurability(o.data));
                    
                    return dur + ' ( ' + [
                        o.data.hull.ehp.toFixed(0),
                        o.data.armor.ehp.toFixed(0),
                        o.data.shield.ehp.toFixed(0)].join(' / ') + ' )'
                },
                sortFn: function(a, b, desc) {
                    var da = getDurability(a.getAttrs()),
                        db = getDurability(b.getAttrs());
                                        
                    return (da - db) * (desc ? -1 : 1)
                }
            },
            {
                key: "shield",
                label: "Sh Rchg",
                formatter: function(o) { return o.value.peakRecharge.toFixed(2); },
                sortFn: sortNested('shield.peakRecharge')
            },
            {
                key: "capacitor",
                label: "Cap Rchg",
                formatter: function(o) { return o.value.peakRecharge.toFixed(2); },
                sortFn: sortNested('capacitor.peakRecharge')
            },
            {
                key: "sensors",
                label: "Sensors",
                formatter: function(o) {
                    var str = o.value.strength;

                    return  o.value.resolution + ' @ ' + o.value.range/1000 + 'km / ' + str;
                },
                sortFn: function(a, b, desc) {
                    var as = a.get('sensors'),
                        bs = b.get('sensors');
                    
                    return (as.resolution * as.range - bs.resolution * bs.range) * (desc ? -1 : 1);
                }
            },
            {
                key: "slots",
                label: "(H/M/L)",
                formatter: function(o) { return [o.value.high,o.value.medium,o.value.low].join(' / ') },
                sortFn: function(a, b, desc) {
                    var as = a.get('slots'),
                        bs = b.get('slots');
                        
                    return ((as.high + as.medium + as.low) - (bs.high + bs.medium + bs.low)) * (desc ? -1 : 1);
                }
            },
            {
                key: "velocity",
                label: "Velocity",
                formatter: function(o) { return o.value + 'm/s'; }
            },
            {
                key: "signature",
                label: "Sig."
            }
        ],
        sortable: true
    }).render('#ship-display');

    table.delegate('click', function(evt) {
        table.getRecord(evt.target).destroy();
    }, 'img');

    var rows = [];
    window.esc.model.ships.forEach(function(s) {
        rows.push(new window.esc.Ship(s));
    });
    table.addRows(rows);
});