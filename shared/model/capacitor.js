Poi.add('capacitor', function(NS) {

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

});