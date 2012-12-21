var DB          = new (require('./lib/db').ItemDB)('data/cutting-edge-current-db.sqlite'),
    ShipService = new (require('./lib/ship').ShipService)(DB);
    
var static      = require('node-static'),
    http        = require('http'),
    url         = require('url'),
    file        = new (static.Server)('./assets');
    
function service(method, req, res) {
    var name = decodeURI(req.url.split('/').pop());

    ShipService[method](name).then(function(ship) {
        if( (Array.isArray(ship) && ship.length) || typeof ship !== 'null') {
            res.writeHead(200, { 'Content-Type': 'text/json' });
            res.end(JSON.stringify(ship, null, '\t'));
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end("Nothing found with argument " + name);                 
        }
    }, function(e) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(e.toString());
    }).fail(function(e) {
        console.log(e);
    });
}

var routes = {
    ship: {
        byName: function(req, res) {
            service('getByName', req, res);
        },
        byId: function(req, res) {
            service('getById', req, res);
        },
        byNameOrType: function(req, res) {
            service('getByNameOrType', req, res);
        }
    }
};

ShipService.getByName('Kestrel').then(function(s) {
    console.log(s);
});


http.createServer(function(req, res) {
    var path = req.url.split('?')[0].split('/').slice(1);

    if(routes[path[0]] && routes[path[0]][path[1]]) {
        routes[path[0]][path[1]](req, res);
    } else {

        req.addListener('end', function() {
            file.serve(req, res);
        });
    }

}).listen(8080);
