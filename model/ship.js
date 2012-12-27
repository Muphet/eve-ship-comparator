(function(NS, isNode) {

    var HpPool            = (isNode) ? require('./hpPool').HpPool           : NS.HpPool,
        Shield            = (isNode) ? require('./hpPool').Shield           : NS.Shield,
        Capacitor         = (isNode) ? require('./capacitor').Capacitor     : NS.Capacitor,
        SkillRequirements = (isNode) ? require('./skill').SkillRequirements : NS.SkillRequirements;

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
        this.heat              = {};
        this.hull              = new HpPool();
        this.armor             = new HpPool();
        this.shield            = new Shield();
        this.jumpDrive         = {};
        this.skillRequirements = new SkillRequirements();

        if(shipData) {
            this.fromShip(shipData);
        }
    };

    Ship.NOT_RESOLVED_ID = 0;

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
    ShipProto.heat                = null;
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
                } else if(!destObj[sourceKey]) {
                    destObj[sourceKey] = sourceVal;
                }
            });
        }

        propagate(ship, this);

        return this;
    };

    ShipProto.toString = function() { return '[object Ship]'; };

    NS.Ship = Ship;
    
}(typeof exports === 'undefined' ? window.esc || (window.esc = {}) : exports, (typeof exports !== 'undefined')));