/**
Objects, classes, and methods related to hit point pools for ships in Eve Online. Includes calculating EHP based on a number of strategies (EFT, and CCP's own calculations) and different damage profiles (Gursita, Amarr, Serpentis, etc.).

@module esc-hp-pool
@namespace esc
**/
YUI.add('esc-hp-pool', function(Y) {

    var NS = Y.namespace('esc');

//
// --- Damage Profile -------------------------------------------------------
//

    /**
    A utility class that generates an EHP based on a provided HpPool instance.
    
    @class DamageProfile
    @extends View
    @constructor
    @param cfg {Object} A configuration object that accepts the following properties:
    
    * **em** - The proportion of EM damage.
    * **explosive** - The proportion of explosive damage.
    * **kinetic** - The proportion of kinetic damage.
    * **thermal** - The proportion of thermal damage.
    
    If the sum of all four damage levels is greater than 1, they will all be normalized in relation to each other to enforce a total value of 1.
    
    For example, passing `{ em: 1, explosive: 1, kinetic: 1, thermal: 1 }` will normalize each value to `0.25`.
    
    **/
    var DamageProfile = function(cfg) {
        cfg = Y.merge({ em: 0, explosive: 0, kinetic: 0, thermal: 0 }, cfg);
        
        var coeff = 1 / (cfg.em + cfg.explosive + cfg.kinetic + cfg.thermal);

        coeff = isFinite(coeff) ? coeff : 1;
        
        this.em        = cfg.em * coeff;
        this.explosive = cfg.explosive * coeff;
        this.kinetic   = cfg.kinetic * coeff;
        this.thermal   = cfg.thermal * coeff;
    };
    
    Y.mix(DamageProfile.prototype, {
        /**
        @property em {Number}
        @default 0
        **/
        em        : 0,

        /**
        @property explosive {Number}
        @default 0
        **/
        explosive : 0,

        /**
        @property kinetic {Number}
        @default 0
        **/
        kinetic   : 0,

        /**
        @property thermal {Number}
        @default 0
        **/
        thermal   : 0,
        
        /**
        @method ehp
        @param hpPool {HpPool} An HpPool instance to generate an EHP value from.
        @return {Number} The EHP of that hit point pool.
        **/
        ehp : function(hpPool) {
            var resistance = r.emResistance        * this.em +
                             r.explosiveResistance * this.explosive +
                             r.kineticResistance   * this.kinetic +
                             r.thermalResistance   * this.thermal;
                         
            return hpPool.hp / (1 - resistance);
        }
    });

    //
    // --- Damage constants -------------------------------------------------
    //
    // Damage profiles from <http://eve-survival.org/wikka.php?wakka=TankingGuide>
    //
    
    /**
    The standard even-distribution profile used by EFT.
    
    @property eft {esc.DamageProfile}
    @static
    **/
    DamageProfile.eft = new DamageProfile({ em: 1, explosive: 1, kinetic: 1, thermal: 1 });

    /**
    The Gurista damage profile.
    
    @property gurista {esc.DamageProfile}
    @static
    **/
    /**
    The EOM damage profile.
    
    @property eom {esc.DamageProfile}
    @static
    **/ 
    DamageProfile.gurista =
    DamageProfile.eom = new DamageProfile({ kinetic: 0.75, thermal: 0.25 });

    /**
    The Angel Cartell damage profile.
    
    @property angel {esc.DamageProfile}
    @static
    **/
    DamageProfile.angel = new DamageProfile({ kinetic: 0.75, thermal: 0.25 });

    /**
    The Sanshas Nation damage profile.
    
    @property sansha {esc.DamageProfile}
    @static
    **/
    /**
    The Blood Raider Covenant damage profile.
    
    @property bloodRaider {esc.DamageProfile}
    @static
    **/ 
    /**
    The Amarr Empire damage profile.
    
    @property amarr {esc.DamageProfile}
    @static
    **/  
    DamageProfile.sansha =
    DamageProfile.bloodRaider =
    DamageProfile.amarr = new DamageProfile({ em: 0.5, thermal: 0.5 });

    /**
    The Serpentis damage profile.
    
    @property serpentis {esc.DamageProfile}
    @static
    **/  
    /**
    The Caldari damage profile.
    
    @property caldari {esc.DamageProfile}
    @static
    **/
    DamageProfile.serpentis =
    DamageProfile.caldari = new DamageProfile({ kinetic: 0.5, thermal: 0.5 });

    /**
    The Gallente Federation damage profile.
    
    @property gallente {esc.DamageProfile}
    @static
    **/
    DamageProfile.gallente = new DamageProfile({ kinetic: 0.5, thermal: 0.4, em: 0.1 });
    
    /**
    The Minmatar damage profile.
    
    @property minmatar {esc.DamageProfile}
    @static
    **/
    DamageProfile.minmatar = new DamageProfile({ explosive: 0.5, em: 0.2, kinetic: 0.2, thermal: 0.1 });

    /**
    The Mercenaries (?) damage profile.
    
    @property mercenaries {esc.DamageProfile}
    @static
    **/
    DamageProfile.mercenaries = new DamageProfile({ thermal: 0.5, kinetic: 0.3, explosive: 0.1, em: 0.1 });
    
    /**
    The Rogue Drone damage profile.
    
    @property drones {esc.DamageProfile}
    @static
    **/
    DamageProfile.drones = new DamageProfile({ explosive: 0.7, kinetic: 0.2, thermal: 0.1 });


    /**
    The damage profile used by the in-game fitting tool. CCP uses a different strategy, they use the weakest of a pool's four resists to generate the EHP.
    
    @property eve {esc.DamageProfile}
    @static
    **/
    DamageProfile.eve = (function() {
        var eveDamageProfile = new DamageProfile();
        
        eveDamageProfile.ehp = function(h) {
            var minResist = Math.min(h.emResistance, h.explosiveResistance, h.kineticResistance, h.thermalResistance);
            return hpPool.hp / (1 - minResist);
        };
        
        return eveDamageProfile;
    }());
    
    /**
    HpPools will fall back to this damage profile if no damageProfile is provided to the instance. Defaults to the EFT profile.
    
    @property sharedDamageProfile {esc.DamageProfile}
    @static
    **/
    DamageProfile.sharedDamageProfile = DamageProfile.eft;
    
    NS.DamageProfile = DamageProfile;


//
// --- HP Pool --------------------------------------------------------------
//

    var getResistanceFn = function(type) {
        return function() { return 1 - this[type + 'Resonance']; };         
    };

    /**
    Represents one of the three HP 'pools' on a ship: shields, armor, and structure (hull)
        
    @class HpPool
    @constructor
    **/
    var HpPool = function(cfg) {
        Y.mix(this, cfg || {}, true, Object.keys(HpPool.prototype));
    };

    Y.mix(HpPool.prototype, {
        /**
        @property hp {Number}
        **/
        hp                 : 0,

        /**
        @property emResonance {Number}
        **/
        emResonance        : 0,
        
        /**
        @property explosiveResonance {Number}
        **/
        explosiveResonance : 0,
        
        /**
        @property kineticResonance {Number}
        **/
        kineticResonance   : 0,
        
        /**
        @property thermalResonance {Number}
        **/
        thermalResonance   : 0,
        
        /**
        @property damageProfile {esc.DamageProfile}
        @default null
        **/
        damageProfile      : null
    });

    /*
    HP pool resonances appear to be the inverse of that pool's resistances. Resistances aren't saved in the dataset
    I'm using, so I'm using an ECMA5 getter to generate that data as needed.
    */
    Object.defineProperties(HpPool.prototype, {
        /**
        @property emResistance {Number}
        @readOnly
        **/
        emResistance        : { writeable: false, get: getResistanceFn('em')        },

        /**
        @property explosiveResistance {Number}
        @readOnly
        **/
        explosiveResistance : { writeable: false, get: getResistanceFn('explosive') },
        
        /**
        @property kineticResistance {Number}
        @readOnly
        **/
        kineticResistance   : { writeable: false, get: getResistanceFn('kinetic')   },
        
        /**
        @property thermalResistance {Number}
        @readOnly
        **/
        thermalResistance   : { writeable: false, get: getResistanceFn('thermal')   },
            
        /**
        The effective hit points of this damage pool, calculated by:
            
        `EHP = HP / (1-RST)`
            
        Source: <http://community.eveonline.com/ingameboard.asp?a=topic&threadID=780756>
            
        @property ehp {Number}
        @readOnly
        **/
        ehp: {
            writeable: false,
            get: function() {
                var profile = this.damageProfile || DamageProfile.sharedDamageProfile;
                return profile.ehp(this);
            }
        }
    });

    NS.HpPool = HpPool;

//
// --- Shield ---------------------------------------------------------------
//

    var Shield, ShieldProto;

    /**
    A descendant of the HpPool object that has additional features related to shield rechage rates.
    
    @class Shield
    @extends esc.HpPool
    **/
    Shield = function(cfg) {
        HpPool.apply(this, arguments); // Generate HpPool's constructor behavior
        Y.mix(this, cfg || {}, true, Object.keys(Shield.prototype));
    };

    ShieldProto = Shield.prototype = Object.create(HpPool.prototype); // Inherit hpPool's methods and properties

    ShieldProto.constructor  = Shield; // Fix constructor
    
    /**
    @property rechargeRate {Number}
    **/
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

    NS.Shield = Shield;

});