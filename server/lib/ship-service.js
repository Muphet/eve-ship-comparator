
var fs         = require('fs'),

    Ship       = require('../../shared/model/ship').Ship,
    Select     = require('./db').Select,
    markdown   = require("node-markdown").Markdown,
    toMarkdown = require('to-markdown').toMarkdown,
    UNDEFINED;

function setValue(o, path, val) {
    var i,
        p = path.split('.'),
        leafIdx = p.length - 1,
        ref = o;
         
    if (leafIdx >= 0) {
        for (i = 0; ref !== UNDEFINED && i < leafIdx; i++) {
            ref = ref[p[i]];
        }
         
        if (ref !== UNDEFINED) {
            ref[p[i]] = val;
        } else {
            return UNDEFINED;
        }
    }

    return o;
}

function getValue(o, path) { 
    var i,
        p = path.split('.'),
        l = p.length;
         
    for (i = 0; o !== UNDEFINED && i < l; i++) {
        o = o[p[i]];
    }
         
    return o;
}


var ShipService = function(db) {
    this.db = db;
    this.shipColors = {};
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

ShipService.BY_NAME_QUERY = new Select(ShipService.COLUMNS).
    where('invGroups.categoryID == 6').
    andWhere('invTypes.marketGroupID == invmarketgroups.marketGroupID').
    andWhere('invTypes.groupID == invGroups.groupID').
    andWhere('invTypes.published == 1').
    andWhere(function(v) {
        var names = Array.isArray(v.name) ? v.name : [ v.name ];
        
        return '( ' + names.map(function(n) { return "invTypes.typeName LIKE '%" + n + "%'"; }).join(' OR ') + ' )';
    });


ShipService.BY_ID_QUERY = new Select(ShipService.COLUMNS).
    where('invGroups.categoryID == 6').
    andWhere('invTypes.published == 1').
    andWhere('invTypes.marketGroupID == invmarketgroups.marketGroupID').
    andWhere('invTypes.groupID == invGroups.groupID').
    andWhere(function(v) {
        var ids = Array.isArray(v.id) ? v.id : [ v.id ];

        return '( ' + ids.map(function(id) { return 'invTypes.typeID == ' + id }).join(' OR ') + ' )';
    });


ShipService.BY_NAME_OR_TYPE_QUERY = new Select(ShipService.COLUMNS).
    where('invGroups.categoryID == 6').
    andWhere('invTypes.published == 1').
    andWhere('invTypes.marketGroupID == invmarketgroups.marketGroupID').
    andWhere('invTypes.groupID == invGroups.groupID').
    andWhere(function(v) {
        var s = Array.isArray(v.name) ? v.name : [ v.name ];

        var o = '( ' + s.map(function(t) {
            return "invTypes.typeName LIKE '%" + t + "%' OR invGroups.groupName LIKE '%" + t + "%'";
        }).join(' OR ') + ' )';
        return o;
    });
    

ShipService.BY_NAME_OR_TYPE_OR_ID_QUERY = new Select(ShipService.COLUMNS).
    where('invGroups.categoryID == 6').
    andWhere('invTypes.published == 1').
    andWhere('invTypes.marketGroupID == invmarketgroups.marketGroupID').
    andWhere('invTypes.groupID == invGroups.groupID').
    andWhere(function(v) {
        var s = Array.isArray(v.name) ? v.name : [ v.name ];

        var o = '( ' + s.map(function(t) {
            if(isNaN(parseInt(t,10))) {
                return "invTypes.typeName LIKE '%" + t + "%' OR invGroups.groupName LIKE '%" + t + "%'";
            } else {
                return "invTypes.typeID == " + parseInt(t,10);
            }
        }).join(' OR ') + ' )';
            
        return o;
    });


//
// -- INSTANCE VALUES -------------------------------------
//

ShipServiceProto.db = null;

ShipServiceProto.shipColors = null;


ShipServiceProto.getByName = function(name) {    
    var d = this.db.all(ShipService.BY_NAME_QUERY.eval({ name: name }));

    d = d.then(ShipServiceProto._cleanDescription.bind(this));

    return d.then(ShipServiceProto._resolve.bind(this));
}

ShipServiceProto.getByNameOrType = function(nameOrType) {
    var d = this.db.all(ShipService.BY_NAME_OR_TYPE_QUERY.eval({ name: nameOrType }));

   d = d.then(ShipServiceProto._cleanDescription.bind(this));

    return d.then(ShipServiceProto._resolve.bind(this));
}

ShipServiceProto.getByNameOrTypeOrId = function(nameOrType) {
    var d = this.db.all(ShipService.BY_NAME_OR_TYPE_OR_ID_QUERY.eval({ name: nameOrType }));

   d = d.then(ShipServiceProto._cleanDescription.bind(this));

    return d.then(ShipServiceProto._resolve.bind(this));
}


ShipServiceProto.getById = function(id) {
    var d = this.db.one(ShipService.BY_ID_QUERY.eval({ id: id })).then(ShipServiceProto._cleanDescription.bind(this));

    return d.then(ShipServiceProto._resolve.bind(this));
}

ShipServiceProto.getAttributes = function(ships) {
    var shipIds;

    ships = (Array.isArray(ships)) ? ships : [ships];
    shipIds = ships.map(function(s) { return s.typeID });
    
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
    'capacity'                                  : 'capacity.cargo',
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
    'attributes.heatGenerationMultiplier'       : 'heat.generationMultiplier',
    'attributes.heatAttenuationHi'              : 'heat.highAttenuation',
    'attributes.heatAttenuationMed'             : 'heat.mediumAttenuation',
    'attributes.heatAttenuationLow'             : 'heat.lowAttenuation',
    'attributes.heatDissipationRateHi'          : 'heat.highDissipation',
    'attributes.heatDissipationRateMed'         : 'heat.mediumDissipation',
    'attributes.heatDissipationRateLow'         : 'heat.lowDissipation',
    'attributes.heatCapacityHi'                 : 'heat.highCapacity',
    'attributes.heatCapacityMed'                : 'heat.mediumCapacity',
    'attributes.heatCapacityLow'                : 'heat.lowCapacity',

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
    'attributes.jumpDriveCapacitorNeed'         : 'jumpDrive.capacitorNeed',
    
    // Skill Requirements
    'attributes.requiredSkill1'                 : 'skillRequirements.primary.id',
    'attributes.requiredSkill1Level'            : 'skillRequirements.primary.level',
    'attributes.requiredSkill2'                 : 'skillRequirements.secondary.id',
    'attributes.requiredSkill2Level'            : 'skillRequirements.secondary.level',
    'attributes.requiredSkill3'                 : 'skillRequirements.tertiary.id',
    'attributes.requiredSkill3Level'            : 'skillRequirements.tertiary.level'
};

ShipService.shipFromDbRow = function(dbRow) {
    var ship = new Ship(),
        mappings = ShipService.ROW_PROPERTY_MAPPINGS,
        dbValue,
        dbProperty,
        shipProperty;

    for(dbProperty in mappings) {
        if(mappings.hasOwnProperty(dbProperty)) {
            shipProperty = mappings[dbProperty];
            dbValue = getValue(dbRow, dbProperty);

            if(dbValue) {
                setValue(ship, shipProperty, dbValue);
            }
        }
    }

    return ship;
};

ShipServiceProto._cleanDescription = function(ships) {
    var i, l, ship, desc;
    
    ships = (Array.isArray(ships)) ? ships : [ships];
    
    for(i = 0, l = ships.length; i < l; i += 1) {
        ship = ships[i];

        // console.log();        
        // console.log(ship.description);
        
        // Fix the newline horribleness, 
        desc = ship.description.
            replace(/\\n\\n/g, '\n\n'). // replace stupid /r/n with double newline (that seems to be the intent)
            replace(/(\\r){0,1}\\n/g, '  \n'). // replace single newlines with markdown-style brs
            replace(/\\u([A-Fa-f0-9]{4})/g, '&#x$1;'). // replace unicode characters with html entities
            replace(/<a[^>]+>/ig, ''). // strip any inline links, since they're Eve-specific
            replace(/\n[^\n\S]+/g,'\n'). // strip leading whitespace to prevent preformatted markdown text
            replace(/\n-/, '\n&mdash;'); // replace leading dash with an emdash for strategic cruiser text (not perfect)


        // Convert the remaining html to markdown
        desc = toMarkdown(desc);
        
        // Strip out any remaining markup that can't be represented by markdown
        desc = desc.replace(/(<([^>]+)>)/ig, '');
        
        // Convert the markdown to HTML.
        ship.description = markdown(desc);

        // console.log();
        // console.log(desc);
        
    }

    return ships;
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