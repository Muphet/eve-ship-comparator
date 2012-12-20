(function() {
    var defineModel = function(NS) {

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
// --- Capacitor ------------------------------------------------------------
//

        var Capacitor, CapacitorProto;

        Capacitor = function() {};

        CapacitorProto = Capacitor.prototype;

        CapacitorProto.capacity = 0;
        CapacitorProto.recharge = 0;

        /*
        The peak recharge of a capacitor appears to happen on or near the 25% mark and is defined by:

        dC/dt = ( SQRT( Cx/Cmax ) - C/Cmax ) * 2 * Cmax / tau

        Where:

        dC/dt = The amount the capacitor will recharge per second
        Cx    = The current amount of energy in the capacitor
        Cmax  = The total amount of energy in a fully-charged capacitor
        tau   = A constant that's either t/5 or t/4.8 where t is the recharge rate in seconds. (I chose 5) 

        Source: <http://wiki.eveonline.com/en/wiki/Capacitor_recharge_rate>
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

        function getResistanceFn(type) {
            return function() { return 1 - this[type + 'Resonance']; };
        };

        var HpPool, HpPoolProto;

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
            
            strength: {
                writeable: false,
                get: function() {
                    var avgResist = (
                        this.emResistance +
                        this.explosiveResistance +
                        this.kineticResistance + 
                        this.thermalResistance ) / 4
                        
                    return this.hp + this.hp * avgResist;
                }
            }
        });

        HpPoolProto.toString = function() { return '[object HpPool]'; };


//
// --- Shield ---------------------------------------------------------------
//

        var Shield, ShieldProto;

        Shield = function() {};

        ShieldProto = Shield.prototype = new HpPool(); // Inherits frmo HpPool

        ShieldProto.constructor  = Shield;
        ShieldProto.rechargeRate = 0;

        /*
        The peak recharge of a shield is defined by:

            R = 2.4 * S / R

        Where R is the recharge rate, S is the maximum shield size, and R is the recharge rate in seconds.

        Source: <http://wiki.eveonline.com/en/wiki/Shield_recharge>
        */
        Object.defineProperty(ShieldProto, 'peakRecharge', {
            writeable: false,
            get: function() { return this.hp * 2.4 / ( this.rechargeRate / 1000); }
        });

        ShieldProto.toString = function() { return '[object Shield]'; };

        NS.Shield = Shield;


//
// --- Ship -----------------------------------------------------------------
//

        var Ship, ShipProto;

        Ship = function(shipData) {
            this.sensors         = {};
            this.slots           = {};
            this.capacitor       = new Capacitor();
            this.drones          = {};
            this.heatAttenuation = {};
            this.hull            = new HpPool();
            this.armor           = new HpPool();
            this.shield          = new Shield();

            if(shipData) {
                this.fromShip(shipData);
            }
        };

        Ship.NOT_RESOLVED_ID = -1;

        ShipProto = Ship.prototype;

        ShipProto.id              = Ship.NOT_RESOLVED_ID;
        ShipProto.name            = null;
        ShipProto.capacity        = null;
        ShipProto.type            = null;
        ShipProto.race            = null;
        ShipProto.meta            = null;
        ShipProto.agility         = null;
        ShipProto.velocity        = null;

        ShipProto.sensors         = null;
        ShipProto.slots           = null;
        ShipProto.capacitor       = null;
        ShipProto.drones          = null;
        ShipProto.heatAttenuation = null;
        ShipProto.hull            = null;
        ShipProto.armor           = null;
        ShipProto.shield          = null;

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

    if(typeof YUI === 'undefined') {
        defineModel(exports);
    } else {
        YUI.add('ship-model', function(Y, NAME) {
            defineModel(Y.namespace('esc'));
        });
    }

}());

