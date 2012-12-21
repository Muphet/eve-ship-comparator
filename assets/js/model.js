(function() {
    /*
    The defineModel function here just generates the necessary class and method code to set up our data model. It is
    called in one of two ways at the bottom of this file depending on environment.
    */
    var defineModel = function(NS) {
        /**
        @module Model
        @namespace esc
        **/

        var UNDEFINED;

        NS.setValue = function(o, path, val) {
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
        };

        NS.getValue = function(o, path) { 
            var i,
                p = path.split('.'),
                l = p.length;
         
            for (i = 0; o !== UNDEFINED && i < l; i++) {
                o = o[p[i]];
            }
         
            return o;
        };

        NS.each = function(o, callback, context) {
            if(Array.isArray(o)) {
                o.forEach(callback, context);
            } else {
                var k,v;

                for(k in o) {
                    if(o.hasOwnProperty(k)) {
                        callback.call(context || UNDEFINED, o[k], k, o);
                    }
                }
            }
        };
        
//
// --- Damage Profile -------------------------------------------------------
//

        NS.DamageProfile = function(r) {
            return NS.DamageProfile[NS.DamageProfile.profile](r);
        };
        
        NS.DamageProfile.profile = 'eft';
        
        NS.DamageProfile.eve = function(r) {
            return Math.min(r.emResistance, r.explosiveResistance, r.kineticResistance, r.thermalResistance);
        };
        
        NS.DamageProfile.eft = function(r) {
            var balance = NS.DamageProfile.damageBalance;
            
            return r.emResistance        * balance.EM +
                   r.explosiveResistance * balance.EXPLOSIVE +
                   r.kineticResistance   * balance.KINETIC +
                   r.thermalResistance   * balance.THERMAL;
        };
        
        NS.DamageProfile.damageBalance = {
            EM:        0.25,
            EXPLOSIVE: 0.25,
            KINETIC:   0.25,
            THERMAL:   0.25
        };

//
// --- Capacitor ------------------------------------------------------------
//

        var Capacitor, CapacitorProto;

        /**
        @class Capacitor
        @constructor
        **/
        Capacitor = function() {};

        CapacitorProto = Capacitor.prototype;

        CapacitorProto.capacity = 0;        
        CapacitorProto.recharge = 0;

        /*
        A read-only synthetic property that's the peak recharge rate of a capacitor.
        
        The peak recharge of a capacitor appears to happen on or near the 25% mark and is defined by:

        `dC/dt = ( SQRT( Cx/Cmax ) - C/Cmax ) * 2 * Cmax / tau`

        Where:

        * `dC/dt` is the amount the capacitor will recharge per second
        * `Cx` is the current amount of energy in the capacitor
        * `Cmax` is the total amount of energy in a fully-charged capacitor
        * `tau` is a constant that's either t/5 or t/4.8 where t is the recharge rate in seconds. (I chose 5) 

        Source: <http://wiki.eveonline.com/en/wiki/Capacitor_recharge_rate>

        @property peakRecharge {Number}
        @readOnly
        */
        Object.defineProperty(CapacitorProto, 'peakRecharge', {
            writeable: false,
            get: function() { return (Math.sqrt(0.25) - 0.25) * 2 * this.capacity / (this.recharge / 5000); }
        });

        CapacitorProto.toString = function() { return '[object Capacitor]'; };

        NS.Capacitor = Capacitor;

//
// --- HP Pool --------------------------------------------------------------
//

        var HpPool, HpPoolProto,

            getResistanceFn = function(type) {
                return function() { return 1 - this[type + 'Resonance']; };         
            };

        /**
        Represents one of the three HP 'pools' on a ship: shields, armor, and structure (hull)
        
        @class HpPool
        @constructor
        **/
        HpPool = function() {};
        
        HpPoolProto = HpPool.prototype;

        HpPoolProto.hp                 = 0;
        HpPoolProto.emResonance        = 0;
        HpPoolProto.explosiveResonance = 0;
        HpPoolProto.kineticResonance   = 0;
        HpPoolProto.thermalResonance   = 0;

        /*
        HP pool resonances appear to be the inverse of that pool's resistances. Resistances aren't saved in the dataset
        I'm using, so I'm using an ECMA5 getter to generate that data as needed.
        */
        Object.defineProperties(HpPoolProto, {
            emResistance        : { writeable: false, get: getResistanceFn('em')        },
            explosiveResistance : { writeable: false, get: getResistanceFn('explosive') },
            kineticResistance   : { writeable: false, get: getResistanceFn('kinetic')   },
            thermalResistance   : { writeable: false, get: getResistanceFn('thermal')   },
            
            /**
            The effective hit points of this damage pool, calculated by:
            
            `EHP = HP / (1-RST)`
            
            Source: <http://community.eveonline.com/ingameboard.asp?a=topic&threadID=780756>
            
            @property ehp
            @readOnly
            **/
            ehp: {
                writeable: false,
                get: function() {
                    return this.hp / (1 - NS.DamageProfile(this));
                }
            }
        });

        HpPoolProto.toString = function() { return '[object HpPool]'; };


//
// --- Shield ---------------------------------------------------------------
//

        var Shield, ShieldProto;

        /**
        @class Shield
        @extends HpPool
        **/
        Shield = function() {};

        ShieldProto = Shield.prototype = new HpPool(); // Inherit from HpPool

        ShieldProto.constructor  = Shield;
        ShieldProto.rechargeRate = 0;

        /*
        The peak recharge rate of a shield is defined by:

        `R = 2.4 * S / R`

        Where R is the recharge rate, S is the maximum shield size, and R is the recharge rate in seconds.

        Source: <http://wiki.eveonline.com/en/wiki/Shield_recharge>
        
        @property peakRecharge {Number}
        @readOnly
        */
        Object.defineProperty(ShieldProto, 'peakRecharge', {
            writeable: false,
            get: function() { return this.hp * 2.4 / ( this.rechargeRate / 1000); }
        });

        ShieldProto.toString = function() { return '[object Shield]'; };

        NS.Shield = Shield;
        

//
// --- Skill Requirements ---------------------------------------------------
//
        var SkillRequirements, SkillRequirementsProto;
        
        SkillRequirements = function() {
            this.skills = [];
        };
        
        SkillRequirementsProto = SkillRequirements.prototype;
        
        SkillRequirementsProto.skills = null;
        
        Object.defineProperties(SkillRequirementsProto, {
            primary: {
                get: function() { return this.skills[0]; },
                set: function(val) { this.skills[0] = val; }
            },
            secondary: {
                get: function() { return this.skills[1]; },
                set: function(val) { this.skills[1] = val; }
            },
            tertiary: {
                get: function() { return this.skills[2]; },
                set: function(val) { this.skills[2] = val; }
            }
        });


//
// --- Ship -----------------------------------------------------------------
//

        var Ship, ShipProto;

        /*
        @class Ship
        @constructor
        @param shipData {Object} An object literal describing a ship.
        */
        Ship = function(shipData) {
            this.capacity          = {};
            this.sensors           = {};
            this.slots             = {};
            this.capacitor         = new Capacitor();
            this.drones            = {};
            this.heatAttenuation   = {};
            this.hull              = new HpPool();
            this.armor             = new HpPool();
            this.shield            = new Shield();
            this.jumpDrive         = {};
            this.skillRequirements = [];

            if(shipData) {
                this.fromShip(shipData);
            }
        };

        Ship.NOT_RESOLVED_ID = -1;

        ShipProto = Ship.prototype;

        ShipProto.id                  = Ship.NOT_RESOLVED_ID;
        ShipProto.name                = null;
        
        ShipProto.type                = null;
        ShipProto.description         = null;
        ShipProto.race                = null;

        ShipProto.meta                = null;
        ShipProto.techLevel           = null;
        
        ShipProto.signature           = null;
        ShipProto.agility             = null;
        ShipProto.velocity            = null;
        ShipProto.warpSpeed           = null;
        ShipProto.warpSpeedMultiplier = null;

        ShipProto.cpu                 = null;
        ShipProto.powerGrid           = null;
                                      
        ShipProto.capacity            = null;
        ShipProto.sensors             = null;
        ShipProto.slots               = null;
        ShipProto.capacitor           = null;
        ShipProto.drones              = null;
        ShipProto.heatAttenuation     = null;
        ShipProto.hull                = null;
        ShipProto.armor               = null;
        ShipProto.shield              = null;
        ShipProto.jumpDrive           = null;


        ShipProto.skillRequirements   = null;


        Object.defineProperties(ShipProto, {
            resolved: {
                writeable: false,
                get: function() { return this.id === Ship.NOT_RESOLVED_ID; }
            }
        });

        ShipProto.fromShip = function(ship) {
            function propagate(sourceObj, destObj) {
                NS.each(sourceObj, function(sourceVal, sourceKey) {
                    if(typeof sourceVal === 'object' && destObj[sourceKey]) {
                        propagate(sourceVal, destObj[sourceKey]);
                    } else {
                        destObj[sourceKey] = sourceVal;
                    }
                });
            }

            propagate(ship, this);

            return this;
        };


        ShipProto.toString = function() { return '[object Ship]'; };

        NS.Ship = Ship;
    };


    /*
    This code implicitly examines the environment and determines if it has been loaded from nodejs or YUI. If it's been
    loaded from nodejs, it attaches itself to the `exports` constant. Otherwise, it generates a YUI module plugged into
    the `Y.esc` namespace.
    */
    if(typeof YUI === 'undefined') {
        defineModel(exports);
    } else {
        YUI.add('ship-model', function(Y, NAME) {
            defineModel(Y.namespace('esc'));
        });
    }

}());

