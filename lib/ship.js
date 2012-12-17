
var Q = require('q'),
    esc = require('../assets/js/model');


var ShipService = function(db) {
    this.db = db;
}

var ShipServiceProto = ShipService.prototype;

ShipService.SHIP_COLUMNS_PREDICATE = (function() {
    var out = [],
        cols = {
            invTypes: [
                'typeID', 'typeName', 'raceID', 'groupID', 'marketGroupID', 'published', 'capacity', 'description'
            ],
            invGroups: [
                'groupID', 'groupName'
            ],
            invmarketgroups: [
                'marketGroupID', 'marketGroupName'
            ]
        };

    Object.keys(cols).forEach(function(table) {

        cols[table].forEach(function(column) {
            out.push(table + '.' + column);
        });
    });

    return out.join(', ');

}());

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
    });

    return '( ' + predicate.join(' OR ') + ' )';
}());

//
// --- STATIC PROPERTIES ----------------------------------
//

ShipService.ATTRIBUTE_QUERY = [
    'SELECT dgmAttributeTypes.attributeID, attributeName, displayName, value, dgmTypeAttributes.typeID',
    'FROM dgmAttributeTypes, dgmTypeAttributes',
    'WHERE dgmAttributeTypes.attributeID == dgmTypeAttributes.attributeID',
    'AND published == 1' ].join(' ');

ShipService.BY_NAME_QUERY = [
    'SELECT ' + ShipService.SHIP_COLUMNS_PREDICATE,
    'FROM invGroups, invTypes, invmarketgroups',
    'WHERE invGroups.categoryID == 6',
    'AND invTypes.marketGroupID == invmarketgroups.marketGroupID',
    'AND invTypes.published == 1',
    'AND invTypes.groupID == invGroups.groupID',
    'AND invTypes.typeName LIKE ####',
    'ORDER BY invTypes.groupID, invTypes.raceID' ].join(' ');

ShipService.BY_ID_QUERY = [
    'SELECT ' + ShipService.SHIP_COLUMNS_PREDICATE,
    'FROM invGroups, invTypes, invmarketgroups',
    'WHERE invGroups.categoryID == 6',
    'AND invTypes.published == 1',
    'AND invTypes.marketGroupID == invmarketgroups.marketGroupID',
    'AND invTypes.groupID == invGroups.groupID',
    'AND invTypes.typeID == ?' ].join(' ');

ShipService.BY_NAME_OR_TYPE_QUERY = [
    'SELECT ' + ShipService.SHIP_COLUMNS_PREDICATE,
    'FROM invGroups, invTypes, invmarketgroups',
    'WHERE invGroups.categoryID == 6',
    'AND invTypes.published == 1',
    'AND invTypes.marketGroupID == invmarketgroups.marketGroupID',
    'AND invTypes.groupID == invGroups.groupID',
    'AND (',
        'invTypes.typeName LIKE ####',
        'OR invGroups.groupName LIKE ####',
    ') ORDER BY invTypes.groupID, invTypes.raceID, invTypes.marketGroupID'].join(' ')

//
// -- INSTANCE VALUES -------------------------------------
//

ShipServiceProto.db = null;


ShipServiceProto.getByName = function(name) {
    var d = this.db.all(ShipService.BY_NAME_QUERY.replace(/####/g, "'%" + name + "%'"));

    return d.then(ShipServiceProto._resolve.bind(this));
}

ShipServiceProto.getByNameOrType = function(nameOrType) {
    var d = this.db.all(ShipService.BY_NAME_OR_TYPE_QUERY.replace(/####/g, "'%" + nameOrType + "%'"));

    return d.then(ShipServiceProto._resolve.bind(this));
}

ShipServiceProto.getById = function(name) {
    var d = this.db.one(ShipService.BY_ID_QUERY, name);

    return d.then(ShipServiceProto._resolve.bind(this));
}

ShipServiceProto.getAttributes = function(ships) {
    var idPredicate;

    ships = (Array.isArray(ships)) ? ships : [ships];
    idPredicate = ships.map(function(s) { return 'dgmTypeAttributes.typeID == ' + s.typeID; }).join(' OR ');

    return this.db.all(ShipService.ATTRIBUTE_QUERY + ' AND (' + idPredicate + ')').then(function(attrs) {
        var i, l,
            out = {},
            attr;

        for(i = 0, l = attrs.length; i < l; i += 1) {
            attr = attrs[i];

            if(!out[attr.typeID]) {
                out[attr.typeID] = {};
            }

            out[attr.typeID][attr.attributeName] = attr.value;
        }

        return out;
    });
}

ShipService.ROW_PROPERTY_MAPPINGS = {
    'typeID'                                    : 'id',
    'typeName'                                  : 'name',
    'cargoHold'                                 : 'capacity',
    'groupName'                                 : 'type',        // TODO: make this point at the right field
    'description'                               : 'description',
    'marketGroupName'                           : 'race',        // TODO: "

    'attributes.metaLevel'                      : 'meta',
    'attributes.techLevel'                      : 'techLevel',

    'attributes.agility'                        : 'agility',
    'attributes.maxVelocity'                    : 'velocity',

    'attributes.cpuOutput'                      : 'cpu',
    'attributes.powerOutput'                    : 'powerGrid',
    
    'attributes.maxLockedTargets'               : 'sensors.lockedTargets',
    'attributes.maxTargetRange'                 : 'sensors.range',
    'attributes.scanResolution'                 : 'sensors.resolution',
    'attributes.scanGravimetricStrength'        : 'sensors.gravimetricStrength',
    'attributes.scanMagnetometricStrength'      : 'sensors.magnetometricStrength',
    'attributes.scanRadarStrength'              : 'sensors.radarStrength',
    'attributes.scanLadarStrength'              : 'sensors.ladarStrength',

    // Slots
    'attributes.hiSlots'                        : 'slots.high',
    'attributes.medSlots'                       : 'slots.medium',
    'attributes.lowSlots'                       : 'slots.low',
    'attributes.rigSlots'                       : 'slots.rig',
    'attributes.upgradeCapacity'                : 'slots.rigCalibration',
    'attributes.turretSlotsLeft'                : 'slots.turrets',
    'attributes.launcherSlotsLeft'              : 'slots.launchers',

    // Capacitor
    'attributes.capacitorCapacity'              : 'capacitor.capacity',
    'attributes.rechargeRate'                   : 'capacitor.recharge',

    // Drones
    'attributes.droneBandwidth'                 : 'drones.bandwidth',
    'attributes.droneCapacity'                  : 'drones.capacity',

    // Heat
    'attributes.heatAttenuationHi'              : 'heatAttenuation.high',
    'attributes.heatAttenuationMed'             : 'heatAttenuation.medium',
    'attributes.heatAttenuationLow'             : 'heatAttenuation.low',

    // Structure
    'attributes.hp'                             : 'hull.hp',
    'attributes.emDamageResonance'              : 'hull.emResonance',
    'attributes.explosiveDamageResonance'       : 'hull.explosiveResonance',
    'attributes.kineticDamageResonance'         : 'hull.kineticResonance',
    'attributes.thermalDamageResonance'         : 'hull.thermalResonance',

    // Armor
    'attributes.armorHP'                        : 'armor.hp',
    'attributes.armorEmDamageResonance'         : 'armor.emResonance',
    'attributes.armorExplosiveDamageResonance'  : 'armor.explosiveResonance',
    'attributes.armorKineticDamageResonance'    : 'armor.kineticResonance',
    'attributes.armorThermalDamageResonance'    : 'armor.thermalResonance',

    // Shield
    'attributes.shieldCapacity'                 : 'shield.hp',
    'attributes.shieldEmDamageResonance'        : 'shield.emResonance',
    'attributes.shieldExplosiveDamageResonance' : 'shield.explosiveResonance',
    'attributes.shieldKineticDamageResonance'   : 'shield.kineticResonance',
    'attributes.shieldThermalDamageResonance'   : 'shield.thermalResonance',
    'attributes.shieldRechargeRate'             : 'shield.rechargeRate'
};

ShipService.shipFromDbRow = function(dbRow) {
    var ship = new esc.Ship(),
        mappings = ShipService.ROW_PROPERTY_MAPPINGS,
        dbProperty,
        shipProperty;

    for(dbProperty in mappings) {
        if(mappings.hasOwnProperty(dbProperty)) {
            shipProperty = mappings[dbProperty];

            esc.setValue(ship, shipProperty, esc.getValue(dbRow, dbProperty));
        }
    }

    return ship;
};



ShipServiceProto._resolve = function(ships) {
    if((Array.isArray(ships) && ships.length) || (ships && ships.typeID)) {
        return this.getAttributes(ships).then(function(shipAttrs) {
            var i, l, ship;

            if(Array.isArray(ships)) {
                for(i = 0, l = ships.length; i < l; i += 1) {
                    ship = ships[i];

                    ship.attributes = shipAttrs[ship.typeID];

                    ships[i] = ShipService.shipFromDbRow(ship);
                }
            } else {
                ships.attributes = shipAttrs[ships.typeID];

                ships = ShipService.shipFromDbRow(ships);
            }

            return ships;
        });
    } else {
        return ships;
    }
};


exports.ShipService = ShipService;