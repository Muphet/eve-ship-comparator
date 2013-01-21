YUI.add('esc-hp-pool', function(Y) {

    var NS = Y.namespace('esc');

//
// --- Damage Profile -------------------------------------------------------
//

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
        em        : 0,
        explosive : 0,
        kinetic   : 0,
        thermal   : 0,
        
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
    DamageProfile.eft = new DamageProfile({ em: 1, explosive: 1, kinetic: 1, thermal: 1 });
    
    DamageProfile.gurista =
    DamageProfile.eom = new DamageProfile({ kinetic: 0.75, thermal: 0.25 });

    DamageProfile.angel = new DamageProfile({ kinetic: 0.75, thermal: 0.25 });

    DamageProfile.sansha =
    DamageProfile.bloodRaider =
    DamageProfile.amarr = new DamageProfile({ em: 0.5, thermal: 0.5 });

    DamageProfile.serpentis =
    DamageProfile.caldari = new DamageProfile({ kinetic: 0.5, thermal: 0.5 });

    DamageProfile.gallente = new DamageProfile({ kinetic: 0.5, thermal: 0.4, em: 0.1 });
    DamageProfile.minmatar = new DamageProfile({ explosive: 0.5, em: 0.2, kinetic: 0.2, thermal: 0.1 });

    DamageProfile.mercenaries = new DamageProfile({ thermal: 0.5, kinetic: 0.3, explosive: 0.1, em: 0.1 });
    DamageProfile.drones = new DamageProfile({ explosive: 0.7, kinetic: 0.2, thermal: 0.1 });


    // Eve's EHP calculation uses the weakest resistance to generate the number.
    DamageProfile.eve = (function() {
        var eveDamageProfile = new DamageProfile();
        
        eveDamageProfile.ehp = function(h) {
            var minResist = Math.min(h.emResistance, h.explosiveResistance, h.kineticResistance, h.thermalResistance);
            return hpPool.hp / (1 - minResist);
        };
        
        return eveDamageProfile;
    }());
    
    // HpPools will fall back to this if no damageProfile is provided on the instance
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
    
    HpPoolProto = HpPool.prototype;

    Y.mix(HpPool.prototype, {
        hp                 : 0,
        emResonance        : 0,
        explosiveResonance : 0,
        kineticResonance   : 0,
        thermalResonance   : 0,
        damageProfile      : null
    });

    /*
    HP pool resonances appear to be the inverse of that pool's resistances. Resistances aren't saved in the dataset
    I'm using, so I'm using an ECMA5 getter to generate that data as needed.
    */
    Object.defineProperties(HpPool.prototype, {
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
    @class Shield
    @extends HpPool
    **/
    Shield = function(cfg) {
        HpPool.apply(this, arguments); // Generate HpPool's constructor behavior
        Y.mix(this, cfg || {}, true, Object.keys(Shield.prototype));
        
    };

    ShieldProto = Shield.prototype = Object.create(HpPoolProto); // Inherit hpPool's methods and properties

    ShieldProto.constructor  = Shield; // Fix constructor
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