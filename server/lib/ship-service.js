/*global YUI*/

/**
 @module esc-ship-service
 @namespace esc.service
 **/
YUI.add('esc-ship-service', function (Y) {
    "use strict";

    var NS = Y.namespace('esc.service'),
        UNDEFINED,

        Select = Y.esc.util.Select,
        Criteria = Y.esc.util.Criteria,
        Ship = Y.esc.model.Ship,
        markdown = YUI.require("node-markdown").Markdown,
        toMarkdown = YUI.require('to-markdown').toMarkdown;

    function setValue(o, path, val) {
        var i,
            p = path.split('.'),
            leafIndex = p.length - 1,
            ref = o;

        for (i = 0; i < leafIndex; i += 1) {
            if (ref[p[i]] === UNDEFINED) {
                ref[p[i]] = {};
            }
            ref = ref[p[i]];
        }

        ref[p[i]] = val;

        return o;
    }

    function getValue(o, path) {
        var i,
            p = path.split('.'),
            l = p.length;

        for (i = 0; o !== UNDEFINED && i < l; i += 1) {
            o = o[p[i]];
        }

        return o;
    }

    /**
    @class ShipService
    @constructor
    **/

    function ShipService(database, skillService) {
        this.db = database;
        this.skillService = skillService;
    }

    /**
     @property TYPE_ID_COLUMNS {Object}
     @static
     **/
    ShipService.TYPE_ID_COLUMNS = {
        invTypes        : [
            'typeID', 'typeName', 'raceID', 'groupID', 'marketGroupID', 'published', 'capacity', 'description'
        ],
        invGroups       : [
            'groupID', 'groupName', 'categoryID'
        ],
        invmarketgroups : [
            'marketGroupID', 'marketGroupName'
        ]
    };

    /**
     @property ATTRIBUTE_COLUMNS {Object}
     @static
     **/
    ShipService.ATTRIBUTE_COLUMNS = {
        dgmAttributeTypes : [ 'attributeID', 'attributeName', 'displayName', 'published' ],
        dgmTypeAttributes : [ 'typeID', 'value' ]
    };

    /**
     @property SKILL_COLUMNS {Object}
     @static
     **/
    ShipService.SKILL_COLUMNS = {
        "dgmTypeAttributes AS SkillName"  : [ 'value AS skillId', 'typeID' ],
        "dgmTypeAttributes AS SkillLevel" : [ 'attributeId', 'value' ]
    };

    /**
     @property SEARCH_QUERY {esc.util.Select}
     @static
     **/
    ShipService.SEARCH_QUERY = Select.from(ShipService.TYPE_ID_COLUMNS)
        .where('invGroups.categoryID').is(6)
        .and('invTypes.published').is(1)
        .and('invTypes.marketGroupID').is('invmarketgroups.marketGroupID')
        .and('invTypes.groupID').is('invGroups.groupID')
        .and(function (ids) {
            ids = Array.isArray(ids) ? ids : [ ids ];

            return '( ' + ids.map(function (t) {
                var out;
                if (isNaN(parseInt(t, 10))) {
                    out = "invTypes.typeName LIKE '%" + t + "%' OR invGroups.groupName LIKE '%" + t + "%'";
                } else {
                    out = "invTypes.typeID == " + parseInt(t, 10);
                }
                return out;
            }).join(' OR ') + ' )';
        })
        .orderBy('invTypes.typeID');

    /**
     @property ATTRIBUTE_QUERY {esc.util.Select}
     @static
     **/
    ShipService.ATTRIBUTE_QUERY = Select.from(ShipService.ATTRIBUTE_COLUMNS)
        .where('dgmAttributeTypes.attributeID').is('dgmTypeAttributes.attributeID')
        .and('published').is(1)
        .and(function (ids) {
            ids = Array.isArray(ids) ? ids : [ ids ];

            return '( ' + ids.map(function (id) {
                return 'dgmTypeAttributes.typeID == ' + id;
            }).join(' OR ') + ' )';
        });

    /**
     @property SKILL_QUERY {esc.util.Select}
     @static
     **/
    ShipService.SKILL_QUERY = Select.from(ShipService.SKILL_COLUMNS)
        .where('SkillLevel.typeID').is('SkillName.typeID')
        .and(function (ids) {
            ids = Array.isArray(ids) ? ids : [ ids ];

            return '( ' + ids.map(function (t) {
                return "SkillName.typeID == " + parseInt(t, 10);
            }).join(' OR ') + ' )';
        })
        .and((function () {
            var joinCriteria,
                pointer,
                mappings = {
                    '182'  : 277,
                    '183'  : 278,
                    '184'  : 279,
                    '1285' : 1286,
                    '1289' : 1287,
                    '1290' : 1288
                };

            Y.Object.each(mappings, function (value, key) {
                var c = new Criteria('SkillName.attributeID').is(key);

                c.and('SkillLevel.attributeID').is(value);

                if (pointer) {
                    pointer = pointer.or(c);
                } else {
                    joinCriteria = pointer = new Criteria(c);
                }
            });

            return joinCriteria;
        }()));

    /**
     @property ROW_PROPERTY_MAPPINGS {Object}
     @static
     **/
    ShipService.ROW_PROPERTY_MAPPINGS = {
        // Basic ship properties
        'typeID'                                    : 'id',
        'typeName'                                  : 'name',
        'groupName'                                 : 'type',
        'description'                               : 'description',
        'marketGroupName'                           : 'race',
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
        'attributes.shieldRechargeRate'             : 'shield.recharge',

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

    Y.mix(ShipService.prototype, {
        /**
         @property skillService {esc.util.SkillService}
         **/
        skillService : null,

        /**
         @property db {esc.util.Database}
         **/
        db           : null,

        /**
         @method search
         @param query {String|Number\Array} A single or list of ids, ship names, or ship types.
         @return {esc.util.Query} A promise of ships.
         **/
        search : function (query) {
            var d = this.db;

            return this.db.all(ShipService.SEARCH_QUERY.exec(query))
                .then(this.cleanDescription.bind(this))
                .then(this.queryAttributes.bind(this))
                .then(this.querySkills.bind(this))
                .then(this.mapResultsToShips.bind(this))
                .then(this.resolveSkills.bind(this));
        },

        /**
         @method resolveSkills
         @private
         @param ships {Object[]}
         @return {esc.util.SkillService} A promise of ships.
         **/
        resolveSkills : function (ships) {
            var out,
                i,
                l,
                requiredSkills = {};

            if (this.skillService) {
                if (ships.length === 0) {
                    return ships;
                }

                for (i = 0, l = ships.length; i < l; i += 1) {
                    ships[i].skillRequirements.skills.forEach(function (sr) {
                        if (sr && sr.id) {
                            requiredSkills[sr.id] = true;
                        }
                    });
                }

                out = this.skillService.getSkill(Object.keys(requiredSkills)).then(function (skills) {
                    skills = Array.isArray(skills) ? skills : [ skills ];
                    var i, l;

                    for (i = 0, l = ships.length; i < l; i += 1) {
                        ships[i].skillRequirements.skills.forEach(function (sr) {
                            skills.forEach(function (sk) {
                                if (sk.id === sr.id) {
                                    sr.skill = sk;
                                }
                            });
                        });
                    }

                    return ships;
                });
            } else {
                out = ships;
            }

            return out;
        },

        /**
         @method queryAttributes
         @private
         @param ships {Object[]}
         @return {esc.util.Query} A promise of ships.
         **/
        queryAttributes : function (ships) {
            if (ships.length === 0) {
                return ships;
            }

            var ids = ships.map(function (s) {
                return s.typeID;
            });

            return this.db.all(ShipService.ATTRIBUTE_QUERY.exec(ids)).then(function (attrs) {
                var attrMap = {},
                    item, i, l;

                for (i = 0, l = attrs.length; i < l; i += 1) {
                    item = attrs[i];

                    if (!attrMap[item.typeID]) {
                        attrMap[item.typeID] = {};
                    }

                    attrMap[item.typeID][item.attributeName] = item.value;
                }

                for (i = 0, l = ships.length; i < l; i += 1) {
                    item = ships[i];

                    if (attrMap[item.typeID]) {
                        item.attributes = attrMap[item.typeID];
                    }
                }

                return ships;
            });
        },

        /**
         @method querySkills
         @private
         @param ships {Object[]}
         @return {esc.util.Query} A promise of ships.
         **/
        querySkills : function (ships) {
            if (ships.length === 0) {
                return ships;
            }

            var ids = ships.map(function (s) {
                return s.typeID;
            });

            return this.db.all(ShipService.SKILL_QUERY.exec(ids)).then(function (skills) {
                var skillMap = {},
                    item, i, l, attrs;

                for (i = 0, l = skills.length; i < l; i += 1) {
                    item = skills[i];

                    if (!skillMap[item.typeID]) {
                        skillMap[item.typeID] = {};
                    }

                    skillMap[item.typeID][item.skillId] = item.value;
                }

                for (i = 0, l = ships.length; i < l; i += 1) {
                    item = ships[i];
                    attrs = item.attributes;

                    if (skillMap[item.typeID]) {
                        if (skillMap[item.typeID][attrs.requiredSkill1]) {
                            attrs.requiredSkill1Level = skillMap[item.typeID][attrs.requiredSkill1];
                        }
                        if (skillMap[item.typeID][attrs.requiredSkill2]) {
                            attrs.requiredSkill2Level = skillMap[item.typeID][attrs.requiredSkill2];
                        }
                        if (skillMap[item.typeID][attrs.requiredSkill3]) {
                            attrs.requiredSkill2Level = skillMap[item.typeID][attrs.requiredSkill3];
                        }
                    }
                }

                return ships;
            });
        },

        /**
         @method cleanDescription
         @private
         @param ships {Object[]}
         @return {esc.service.SkillService} A promise of ships.
         **/
        cleanDescription : function (ships) {
            /*jslint continue:true, regexp:true */

            var i, l, ship, desc;
            for (i = 0, l = ships.length; i < l; i += 1) {
                ship = ships[i];

                if (!ship.description) {
                    continue; // NOTE CONTINUE
                }

                // Fix the newline horribleness,
                desc = ship.description.
                    replace(/\\n\\n/g, '\n\n').// replace stupid /r/n with double newline (that seems to be the intent)
                    replace(/(\\r){0,1}\\n/g, '  \n').// replace single newlines with markdown-style brs
                    replace(/\\u([A-Fa-f0-9]{4})/g, '&#x$1;').// replace unicode characters with html entities
                    replace(/<a[^>]+>/ig, '').// strip any inline links, since they're Eve-specific
                    replace(/\n[^\n\S]+/g, '\n').// strip leading whitespace to prevent preformatted markdown text
                    replace(/\n-/, '\n&mdash;'); // replace leading dash with an emdash for strategic cruiser text

                // Convert the remaining html to markdown
                desc = toMarkdown(desc);

                // Strip out any remaining markup that can't be represented by markdown
                desc = desc.replace(/(<([^>]+)>)/ig, '');

                // Convert the markdown to HTML.
                ship.description = markdown(desc);
            }

            /*jslint continue:false, regexp:false */

            return ships;
        },

        /**
         @method mapResultsToShips
         @private
         @param ships {Object[]}
         @return {esc.model.Ships[]}
         **/
        mapResultsToShips : function (ships) {
            var i, l;

            if (ships.length === 0) {
                return ships;
            }

            for (i = 0, l = ships.length; i < l; i += 1) {
                ships[i] = new Ship(this.mapDatabaseRowToShip(ships[i]));
            }

            return ships;
        },

        /**
         @method mapDatabaseRowToShip
         @private
         @param ships {Object[]}
         @return {Object[]}
         **/
        mapDatabaseRowToShip : function (dbRow) {
            var ship = {},
                mappings = ShipService.ROW_PROPERTY_MAPPINGS,
                dbValue,
                dbProperty,
                shipProperty;

            for (dbProperty in mappings) {
                if (mappings.hasOwnProperty(dbProperty)) {
                    shipProperty = mappings[dbProperty];
                    dbValue = getValue(dbRow, dbProperty);

                    if (dbValue !== UNDEFINED) {
                        setValue(ship, shipProperty, dbValue);
                    }
                }
            }

            return ship;
        }
    });

    NS.ShipService = ShipService;

}, '', {
    requires : [ 'esc-sqlite', 'esc-select', 'esc-ship' ]
});