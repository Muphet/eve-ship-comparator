/**
@module esc-ship
@namespace esc
**/
YUI.add('esc-ship', function(Y) {

    var NS = Y.namespace('esc');

    var Capacitor         = NS.Capacitor,
        Capacity          = NS.Capacity,
        Drones            = NS.Drones,
        HpPool            = NS.HpPool,
        Heat              = NS.Heat,
        JumpDrive         = NS.JumpDrive,
        Sensors           = NS.Sensors,
        Shield            = NS.Shield,
        SkillRequirements = NS.SkillRequirements,
        Slots             = NS.Slots;

    /*
    @class Ship
    @constructor
    @param cfg {Object} An object literal describing a ship.
    */
    var Ship = function(cfg) {
        cfg = cfg || {};
        
        Y.mix(this, cfg, true, Object.keys(Ship.prototype));
        
        this.capacity          = new Capacity(cfg.capacity);
        this.sensors           = new Sensors(cfg.sensors);
        this.slots             = new Slots(cfg.slots);
        this.capacitor         = new Capacitor(cfg.capacitor);
        this.drones            = new Drones(cfg.drones);
        this.heat              = new Heat(cfg.heat);
        this.hull              = new HpPool(cfg.hull);
        this.armor             = new HpPool(cfg.armor);
        this.shield            = new Shield(cfg.shield);
        this.jumpDrive         = new JumpDrive(cfg.jumpDrive);
        this.skillRequirements = new SkillRequirements(cfg.skillRequirements);
    };

    Ship.NOT_RESOLVED_ID = 0;

    Y.mix(Ship.prototype, {
        id                  : Ship.NOT_RESOLVED_ID,
        name                : null,

        type                : null,
        description         : null,
        race                : null,

        meta                : 0,
        techLevel           : 1,

        signature           : null,
        agility             : null,
        velocity            : null,
        warpSpeed           : null,
        warpSpeedMultiplier : null,

        cpu                 : null,
        powerGrid           : null
    });
    
    Ship.prototype.toString = function() {
        var out = [];

        out.push(this.name + ' - ' + this.type + ' [' + this.id + ']');
        
        return out.join('\n');
    };


    Object.defineProperties(Ship.prototype, {
        resolved: {
            writeable: false,
            get: function() { return this.id === Ship.NOT_RESOLVED_ID; }
        }
    });

    NS.Ship = Ship;
    
}, '', {
    requires: [ 'esc-hp-pool', 'esc-skill', 'esc-ship-properties' ]
});