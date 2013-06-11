
var path      = require('path'),
    express   = require('express'),
    routes    = require('./routes'),
    sanitizer = require('sanitizer'),
    queries = require('./util/sqlite-queries'),
    sqlite  = require('./lib/sqlite-promise'),
    db      = sqlite(path.join( __dirname, './data/odyssey10.sqlite' )),
    app     = express();
    
db.then(function(db) {
    console.log("database connected.");
}, function(err) {
    console.error(err);
    process.exit(1);
})

db.trace(function(f) { console.log(f); });

app.use(express.static('public'));
app.use('/shared', express.static('shared'));

// --------------------------------------------------------------------------

app.get('/api', function(req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.json(routes);
});

// --------------------------------------------------------------------------

function resolveMarketSections(marketSection) {
    marketSection = marketSection || { id: null };
    
    return db.all(queries.MARKET_TREE, { $parentId: marketSection.id }).map(function(sect) {
        return resolveMarketSections(sect);
    }).then(function(result) {
        marketSection.children = result;
        
        return marketSection;
    });
}

function resolveMarketPath(leafId) {
    var path = [];

    function next(id) {
        return db.one(queries.MARKET_PATH, { $id: id }).then(function(sect) {
            var parent = sect.parent;

            delete sect.parent;
            path.push(sect);
            
            if(parent) {
                return next(parent);
            } else {
                return path;
            }
        });
    }

    return next(leafId);
}

app.get('/api/market/tree', function(req, res) {
    resolveMarketSections().then(function(result) {
       res.header('Access-Control-Allow-Origin', '*');
       res.json(result.children || []);
   });
});

app.get('/api/market/path/:id', function(req, res) {
    resolveMarketPath(req.params.id).then(function(result) {
        res.header('Access-Control-Allow-Origin', '*');
        res.json(result || []);
    })
});


// --------------------------------------------------------------------------

function resolvePrerequisites(skill) {
    if(typeof skill === 'string') {
        skill = { id: skill };
    }
    
    return db.all(queries.SKILL_QUERY, { $id: skill.id }).map(function(prereq) {

        return resolvePrerequisites(prereq);
    }).then(function(result) {

        skill.prerequisites = result;
        return skill;
    });
}

var descriptionSanitizer = (function() {
    var stack,
        emit = function(t, o) {
            o.push(t);
        },
        mdownMapping = {
            'br'     : '\n',
            'b'      : '**',
            'strong' : '**',
            'i'      : '*',
            'em'     : '*'
        };


    return sanitizer.makeSaxParser({
        startTag: function(tag, attributes, out) {
            if(mdownMapping[tag]) {
                out.push(mdownMapping[tag]);
            }
        },
        endTag: function(tag, out) {
            if(mdownMapping[tag]) {
                out.push(mdownMapping[tag]);
            }
        },
        pcdata: emit,
        rcdata: emit,
        cdata: emit
    });
}());


function cleanupDescription(item) {
    var cleanup = [];

    descriptionSanitizer(item.description, cleanup);
    item.description = cleanup.join('').replace(/\n/g, '\n\n');

    return item;
}

app.get('/api/item/list', function(req, res) {
    db.all(queries.LIST_ITEMS).then(function(result) {
        res.header('Access-Control-Allow-Origin', '*');
        res.json(result || []);
    });
});

app.get('/api/item/search', function(req, res) {
    console.log(req.query.q);
    db.all(queries.SEARCH_ITEMS, { $q: '%' + req.query.q + '%' }).then(function(result) {
        res.header('Access-Control-Allow-Origin', '*');
        res.json(result || []);
    });
});

app.get('/api/item/:id', function(req, res) {
    db.one(queries.ITEM_ID_QUERY, { $id: req.params.id }).
        then(cleanupDescription).
        then(function(result) {
            res.header('Access-Control-Allow-Origin', '*');
            res.json(result || {});
        }, function(err) {
            console.error(err);
        });
});

app.get('/api/item/:id/skills', function(req, res) {
    resolvePrerequisites(req.params.id).then(function(result) {
        res.header('Access-Control-Allow-Origin', '*');
        res.json(result.prerequisites || []);
    });
});

app.get('/api/item/:id/attributes', function(req, res) {
    db.all(queries.ATTRIBUTE_QUERY, { $id: req.params.id }).then(function(result) {
        res.header('Access-Control-Allow-Origin', '*');
        res.json(result || []);
    });
});

console.log("starting on port", (process.env.PORT || 8080));

app.listen(process.env.PORT || 8080);
