var DB          = new (require('./lib/db').ItemDB)('data/cutting-edge-current-db.sqlite'),
	ShipService = new (require('./lib/ship').ShipService)(DB);
	
var static      = require('node-static'),
	http        = require('http'),
	file        = new (static.Server)('./assets');


function service(method, resolve, req, res) {
	var name = decodeURI(req.url.split('/').pop());

	ShipService[method](name, resolve).then(function(ship) {
		if( (Array.isArray(ship) && ship.length) || typeof ship !== 'null') {
			res.writeHead(200, { 'Content-Type': 'text/json' });
			res.end(JSON.stringify(ship, '\t'));
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
			service('getByName', false, req, res);
		},
		byId: function(req, res) {
			service('getById', true, req, res);
		},
		byNameOrType: function(req, res) {
			service('getByNameOrType', false, req, res);
		}
	}
};


http.createServer(function(req, res) {
	var path = req.url.split('/').slice(1);

	if(routes[path[0]] && routes[path[0]][path[1]]) {
		routes[path[0]][path[1]](req, res);
	} else {

		req.addListener('end', function() {
			file.serve(req, res);
		});		
	}

}).listen(8080);



// ShipService.getByName('rifter', true).then(function(rifter) {
// 	console.log(rifter);
// }, function(e) {
// 	console.log(e);
// });



// var RIFTER_ID = 587;

// ShipService.getByName("rifter").then(function(rifter) {
// 	rifter = rifter.pop();

// 	ShipService.getAttributes(rifter).then(function(rifterAttrs) {
// 		console.log(rifterAttrs);
// 	}, function(e) {
// 		console.log(e);
// 	});
// //	console.log(rifter);
// }, function() {
// 	console.log(arguments);
// });

