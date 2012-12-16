
var Q = require('q');


var ShipService = function(db) {
	this.db = db;
}

var ShipServiceProto = ShipService.prototype;

ShipService.SHIP_GROUP_PREDICATE = (function() {
	var predicate = [],
		groups = [ '25', '26', '27', '28', '30', '31', '237', '324', '358', '380', '419', '420', '463', '485', '513',
			'540', '541', '543', '547', '659', '830', '831', '832', '833', '834', '883', '893', '894', '898', '900',
			'902', '906', '941', '1022' ];

	groups.forEach(function(g) {
		predicate.push('invTypes.groupID == ' + g);
	})

	return '( ' + predicate.join(' OR ') + ' )';
}());

ShipService.SHIP_RACE_PREDICATE = (function() {
	var predicate = [],
		groups = [ 1, 2, 4, 8 ];

	groups.forEach(function(g) {
		predicate.push('invTypes.raceID == ' + g);
	})

	return '( ' + predicate.join(' OR ') + ' )';
}());

//
// --- STATIC PROPERTIES ----------------------------------
//

ShipService.ATTRIBUTE_QUERY = [
	'SELECT dgmAttributeTypes.attributeID, attributeName, displayName, value',
	'FROM dgmAttributeTypes, dgmTypeAttributes',
	'WHERE dgmAttributeTypes.attributeID == dgmTypeAttributes.attributeID',
	'AND published == 1',
	'AND dgmTypeAttributes.typeID == ?' ].join(' ');

ShipService.BY_NAME_QUERY = [
	'SELECT * FROM invTypes, invGroups',
	'WHERE ' + ShipService.SHIP_GROUP_PREDICATE,
	'AND ' + ShipService.SHIP_RACE_PREDICATE,
	'AND invTypes.published == 1',
	'AND invTypes.groupID == invGroups.groupID',
	'AND invTypes.typeName LIKE ####',
	'ORDER BY invTypes.groupID, invTypes.raceID' ].join(' ');

ShipService.BY_ID_QUERY = [
	'SELECT * FROM invTypes, invGroups',
	'WHERE ' + ShipService.SHIP_GROUP_PREDICATE,
	'AND ' + ShipService.SHIP_RACE_PREDICATE,
	'AND invTypes.published == 1',
	'AND invTypes.groupID == invGroups.groupID',
	'AND invTypes.typeID == ?' ].join(' ');

ShipService.BY_NAME_OR_TYPE_QUERY = [
	'SELECT * FROM invTypes, invGroups',
	'WHERE ' + ShipService.SHIP_GROUP_PREDICATE,
	'AND ' + ShipService.SHIP_RACE_PREDICATE,
	'AND invTypes.published == 1',
	'AND invTypes.groupID == invGroups.groupID',
	'AND (',
		'invTypes.typeName LIKE ####',
		'OR invGroups.groupName LIKE ####',
	') ORDER BY invTypes.groupID, invTypes.raceID'].join(' ')

//
// -- INSTANCE VALUES -------------------------------------
//

ShipServiceProto.db = null;


ShipServiceProto.getByName = function(name, resolve) {
	var d = this.db.all(ShipService.BY_NAME_QUERY.replace(/####/g, "'%" + name + "%'"));

	return resolve ? d.then(ShipServiceProto._resolve.bind(this)) : d;
}

ShipServiceProto.getByNameOrType = function(nameOrType, resolve) {
	var d = this.db.all(ShipService.BY_NAME_OR_TYPE_QUERY.replace(/####/g, "'%" + nameOrType + "%'"));

	return resolve ? d.then(ShipServiceProto._resolve.bind(this)) : d;
}

ShipServiceProto.getById = function(name, resolve) {
	var d = this.db.one(ShipService.BY_ID_QUERY, name);

	return resolve ? d.then(ShipServiceProto._resolve.bind(this)) : d;
}

ShipServiceProto.getAttributes = function(ship) {
	if(ship && ship.typeID) {
		return this.db.all(ShipService.ATTRIBUTE_QUERY, ship.typeID);
	} else {
		throw new Error("Couldn't get attributes without a [typeID]");
	}
}

ShipServiceProto._resolve = function(ship) {
	ship = (Array.isArray(ship)) ? ship.pop() : ship;

	if(ship) {
		return this.getAttributes(ship).then(function(shipAttrs) {
			ship.attributes = {};

			shipAttrs.forEach(function(shipAttr) {
				ship.attributes[shipAttr.attributeName] = shipAttr.value;
			});

			return ship;
		});		
	} else {
		return;
	}
};


exports.ShipService = ShipService;