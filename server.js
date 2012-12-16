var DB          = new (require('./lib/db').ItemDB)('data/cutting-edge-current-db.sqlite'),
	ShipService = new (require('./lib/ship').ShipService)(DB);
	
var static      = require('node-static'),
	http        = require('http'),
	file        = new (static.Server)('./assets');


var routes = {
	ship: {
		byName: function(req, res) {
			var name = decodeURI(req.url.split('/').pop());

			ShipService.getByName(name).then(function(ship) {
				if(ship && ship.length) {
					res.writeHead(200, { 'Content-Type': 'text/json' });
					res.end(JSON.stringify(ship, '\t'));
				} else {
					res.writeHead(404, { 'Content-Type': 'text/plain' });
					res.end("Ship not found with name " + name);					
				}
			}, function(e) {
				res.writeHead(500, { 'Content-Type': 'text/plain' });
				res.end(e.toString());
			}).fail(function(e) {
				console.log(e);
			});

		},
		byId: function(req, res) {
			var id = req.url.split('/').pop();

			ShipService.getById(id, true).then(function(ship) {
				if(ship) {
					res.writeHead(200, { 'Content-Type': 'text/json' });
					res.end(JSON.stringify(ship, '\t'));
				} else {
					res.writeHead(404, { 'Content-Type': 'text/plain' });
					res.end("Ship not found with id " + id);					
				}
			}, function(e) {
				res.writeHead(500, { 'Content-Type': 'text/plain' });
				res.end(e.toString());
			}).fail(function(e) {
				console.log(e);
			});
		},
		byNameOrType: function(req, res) {
			var name = decodeURI(req.url.split('/').pop());

			ShipService.getByNameOrType(name).then(function(ship) {
				if(ship && ship.length) {
					res.writeHead(200, { 'Content-Type': 'text/json' });
					res.end(JSON.stringify(ship, '\t'));
				} else {
					res.writeHead(404, { 'Content-Type': 'text/plain' });
					res.end("Ship not found with name " + name);					
				}
			}, function(e) {
				res.writeHead(500, { 'Content-Type': 'text/plain' });
				res.end(e.toString());
			}).fail(function(e) {
				console.log(e);
			});
		}
	}
}


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

