YUI.add('esc-ship-properties', function(Y) {
    var NS = Y.namespace('esc');

//
// --- Sensors --------------------------------------------------------------
//
    
    var Sensors, SensorsProto;
    
    Sensors = function(cfg) {
        Y.mix(this, cfg || {}, true, Object.keys(Sensors.prototype));
    };
    
    Y.mix(Sensors.prototype, {
        gravimetricStrength   : null,
        magnetometricStrength : null,
        ladarStrength         : null,
        radarStrength         : null,
        range                 : null,
        resolution            : null,
        lockedTargets         : null
    });
    
    Object.defineProperty(Sensors.prototype, 'strength', {
        writeable: false,
        get: function() {
            return this.gravimetricStrength || this.magnetometricStrength || this.ladarStrength || this.radarStrength;
        }
    });
    
    NS.Sensors = Sensors;
    
//
// --- Heat --------------------------------------------------------------
//

    var Heat = function(cfg) {
        Y.mix(this, cfg || {}, true, Object.keys(Heat.prototype));
    };
    
    Y.mix(Heat.prototype, {
        generationMultiplier: 0,
        
        highAttenuation: 0,
        mediumAttenuation: 0,
        lowAttenuation: 0,
        
        highDissipation: 0,
        mediumDissipation: 0,
        lowDissipation: 0,
        
        highCapacity: 0,
        mediumCapacity: 0,
        lowCapacity: 0
    });
    
    NS.Heat = Heat;
    
    var Capacity = function(cfg) {
        Y.mix(this, cfg || {}, true, Object.keys(Capacity.prototype));
    };
    
    Y.mix(Capacity.prototype, {
        cargo: 0,
        fleetHangar: 0,
        jumpClones: 0,
        fuel: 0,
        ore: 0
    });
    
    NS.Capacity = Capacity;
    
//
// --- Slots --------------------------------------------------------------
//

    var Slots = function(cfg) {
        Y.mix(this, cfg || {}, true, Object.keys(Slots.prototype));
    };
    
    Y.mix(Slots.prototype, {
        high: 0,
        medium: 0,
        low: 0,
        rig: 0,
        rigCalibration: 0,
        turrets: 0,
        launchers: 0
    });
    
    NS.Slots = Slots;
    
//
// --- Drones --------------------------------------------------------------
//
    
    var Drones = function(cfg) {
        Y.mix(this, cfg || {}, true, Object.keys(Drones.prototype));
    };
    
    Y.mix(Drones.prototype, {
        bandwidth: 0,
        capacity: 0
    });
    
    NS.Drones = Drones;

//
// --- JumpDrive --------------------------------------------------------------
//

    var JumpDrive = function(cfg) {
        if(cfg) {cfg.canJump = !!cfg.canJump; } // coerce to boolean
        
        Y.mix(this, cfg || {}, true, Object.keys(JumpDrive.prototype));
    };
    
    Y.mix(JumpDrive.prototype, {
        canJump: false,
        fuelType: 0,
        range: 0,
        fuelConsumption: 0,
        capacitorNeed: 0
    });
    
    NS.JumpDrive = JumpDrive;

//
// --- Capacitor ------------------------------------------------------------
//

    var Capacitor, CapacitorProto;

    /**
    @class Capacitor
    @constructor
    **/
    Capacitor = function(cfg) {
        Y.mix(this, cfg || {}, true, Object.keys(Capacitor.prototype));
    };
    
    Y.mix(Capacitor.prototype, {
        capacity : 0,
        recharge : 0
    });
    
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
    Object.defineProperty(Capacitor.prototype, 'peakRecharge', {
        writeable: false,
        get: function() { return (Math.sqrt(0.25) - 0.25) * 2 * this.capacity / (this.recharge / 5000); }
    });

    NS.Capacitor = Capacitor;
    
});