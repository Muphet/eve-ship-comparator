Poi.add('hpPool', function(NS) {

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

    NS.HpPool = HpPool;

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

});