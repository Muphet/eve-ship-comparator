
var path    = require('path'),
    express = require('express'),
    routes  = require('./routes'),
    queries = require('./util/sqlite-queries'),
    sqlite  = require('./lib/sqlite-promise'),
    db      = sqlite(path.join( __dirname, './data/odyssey10.sqlite' )),
    app     = express();
    

db.trace(function(f) { console.log(f); });

// --------------------------------------------------------------------------

app.get('/', function(req, res) {
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
            path.push(sect);
            
            if(sect.parent) {
                return next(sect.parent);
            } else {
                return path;
            }
        });
    }

    return next(leafId);
}

app.get('/market/tree', function(req, res) {
    resolveMarketSections().then(function(result) {
       res.header('Access-Control-Allow-Origin', '*');
       res.json(result.children || []);
   });
});

app.get('/market/path/:id', function(req, res) {
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

app.get('/item/list', function(req, res) {
    db.all(queries.LIST_ITEMS).then(function(result) {
        res.header('Access-Control-Allow-Origin', '*');
        res.json(result || []);
    });
});

app.get('/item/search', function(req, res) {
    console.log(req.query.q);
    db.all(queries.SEARCH_ITEMS, { $q: '%' + req.query.q + '%' }).then(function(result) {
        res.header('Access-Control-Allow-Origin', '*');
        res.json(result || []);
    });
});

app.get('/item/:id', function(req, res) {
    db.one(queries.ITEM_ID_QUERY, { $id: req.params.id }).then(function(result) {
        res.header('Access-Control-Allow-Origin', '*');
        res.json(result || {});
    }, function(err) {
        throw err;
    });
});

app.get('/item/:id/skills', function(req, res) {
    resolvePrerequisites(req.params.id).then(function(result) {
        res.header('Access-Control-Allow-Origin', '*');
        res.json(result.prerequisites || []);
    });
});

app.get('/item/:id/attributes', function(req, res) {
    db.all(queries.ATTRIBUTE_QUERY, { $id: req.params.id }).then(function(result) {
        res.header('Access-Control-Allow-Origin', '*');
        res.json(result || []);
    });
});

app.listen(8080);
