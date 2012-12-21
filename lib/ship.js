
var Q = require('q'),
    esc = require('../assets/js/model'),
    Select=  require('./db').Select;


var ShipService = function(db) {
    this.db = db;
}

var ShipServiceProto = ShipService.prototype;

//
// --- STATIC PROPERTIES ----------------------------------
//

ShipService.COLUMNS = {
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


ShipService.SHIP_COLUMNS_PREDICATE = (function() {
    var out = [],
        cols = ShipService.COLUMNS;

    Object.keys(cols).forEach(function(table) {
        cols[table].forEach(function(column) {
            out.push(table + '.' + column);
        });
    });

    return out.join(', ');

}());

ShipService.ATTRIBUTE_QUERY = new Select({
        dgmAttributeTypes: [ 'attributeID', 'attributeName', 'displayName' ],
        dgmTypeAttributes: [ 'typeID', 'value' ]
    }).
    where('dgmAttributeTypes.attributeID == dgmTypeAttributes.attributeID').
    andWhere(function(v) {
        var ids = Array.isArray(v.shipIds) ? v.shipIds : [ v.shipIds ];
        
        return '( ' + ids.map(function(id) { return 'dgmTypeAttributes.typeID == ' + id; }).join(' OR ') + ' )';
    });



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
    var shipIds;

    ships = (Array.isArray(ships)) ? ships : [ships];
    shipIds = ships.map(function(s) { return s.typeID });
    
    console.log(ShipService.ATTRIBUTE_QUERY.eval({ shipIds: shipIds }));

    return this.db.all(ShipService.ATTRIBUTE_QUERY.eval({ shipIds: shipIds })).then(function(attrs) {
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

    'groupName'                                 : 'type',        // TODO: make this point at the right field
    'description'                               : 'description',
    'marketGroupName'                           : 'race',        // TODO: "

    'attributes.metaLevel'                      : 'meta',
    'attributes.techLevel'                      : 'techLevel',

    'attributes.signatureRadius'                : 'signature',
    'attributes.agility'                        : 'agility',
    'attributes.maxVelocity'                    : 'velocity',
    'attributes.warpSpeedMultiplier'            : 'warpSpeed',

    'attributes.cpuOutput'                      : 'cpu',
    'attributes.powerOutput'                    : 'powerGrid',

    // Capacity
    'cargoHold'                                 : 'capacity.cargo',
    'attributes.shipMaintenanceBayCapacity'     : 'capacity.shipMaintenenance',
    'attributes.fleetHangarCapacity'            : 'capacity.fleetHangar',
    'attributes.maxJumpClones'                  : 'capacity.jumpClones',
    'attributes.specialFuelBayCapacity'         : 'capacity.fuel',
    'attributes.specialOreHoldCapacity'         : 'capacity.ore',
    
    // Sensors
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

    // Hull
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
    'attributes.shieldRechargeRate'             : 'shield.rechargeRate',
    
    // Jump Drive
    'attributes.canJump'                        : 'jumpDrive.canJump',
    'attributes.jumpDriveConsumptionType'       : 'jumpDrive.fuelType',
    'attributes.jumpDriveRange'                 : 'jumpDrive.range',
    'attributes.jumpDriveConsumptionAmount'     : 'jumpDrive.fuelConsumption',
    'attributes.capacitorNeed'                  : 'jumpDrive.capacitorNeed'.
    
    // Skill Requirements
    'attributes.requiredSkill1'                 : 'skillRequirements.primary',
    'attributes.requiredSkill2'                 : 'skillRequirements.secondary',
    'attributes.requiredSkill3'                 : 'skillRequirements.tertiary'
    
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

            console.log(shipAttrs);


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