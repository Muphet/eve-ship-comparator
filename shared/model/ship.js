/*global YUI */
/**
@module esc-ship
@namespace esc.model
**/
YUI.add('esc-ship', function (Y) {
    "use strict";

    var NS = Y.namespace('esc.model'),

        Capacitor         = NS.Capacitor,
        Capacity          = NS.Capacity,
        Drones            = NS.Drones,
        HpPool            = NS.HpPool,
        Heat              = NS.Heat,
        JumpDrive         = NS.JumpDrive,
        Sensors           = NS.Sensors,
        Shield            = NS.Shield,
        SkillRequirements = NS.SkillRequirements,
        Slots             = NS.Slots;

    /**
    @class Ship
    @constructor
    @param cfg {Object} An object literal describing a ship.
    **/
    function Ship(cfg) {
        cfg = cfg || {};

        Y.mix(this, cfg, true, Object.keys(Ship.prototype));

        /**
         The ship's capacity.
         @property capacity {esc.Capacity}
        **/
        /**
         The ship's sensors.
         @property sensors {esc.Sensors}
         **/
        /**
         The ship's hardpoint slots.
         @property slots {esc.Slots}
         **/
        /**
         The ship's capacitor propereties.
         @property capacitor {esc.Capacitor}
         **/
        /**
         The ship's drones capacity.
         @property drones {esc.Drones}
         **/
        /**
         The ship's heat capacity.
         @property heat {esc.Heat}
         **/
        /**
         The ship's hull hp and durability.
         @property hull {esc.HpPool}
         **/
        /**
         The ship's armor hp and durability.
         @property armor {esc.HpPool}
         **/
        /**
         The ship's shield hp, durability, and recharge rate.
         @property shield {esc.Shield}
         **/
        /**
         The ship's jump drive properties (if any).
         @property jumpDrive {esc.JumpDrive}
         **/
        /**
         The skill requirements to sit in the seat.
         @property skillRequirements {esc.SkillRequirements}
         **/
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
    }

    Y.mix(Ship.prototype, {
        /**
         The ship's asset ID in the Eve database. This is a unique identifier.

         @property id {Number}
         **/
        id : 0,

        /**
         The ship's name.

         @property name {String}
         **/
        name : null,

        /**
         The ship's type (e.g. Cruiser, Assault Ship, or Titan)

         @property type {String}
         **/
        type : null,

        /**
         The ship's description, cleaned and normalized into a chunk of HTML.

         @property description {String}
         **/
        description : null,

        /**
         The faction or race the ship belongs to. This is incorrect for pirate-faction ships.

         @property race {String}
         **/
        race : null,

        /**
         The meta-level of the item. Here's a loose collection of values and what they mean:

         * 0 - Tech-level 1
         * 1-4 - "Named" equipment, not used for ships.
         * 5 - Tech-level 2 and 3.
         * 6 - Special edition gifts or unusual craft (e.g. the echelon or zephyr)
         * 7 - ??
         * 8 - Pirate- or Navy-faction.
         * 9 - Special

         @property meta {Number}
         **/
        meta : 0,

        /**
         The tech level (1, 2, or 3)

         @property techLevel {Number}
         **/
        techLevel : 1,

        /**
         The signature radius

         @property signature {Number}
         **/
        signature : null,

        /**
         @property agility {Number}
         */
        agility : null,

        /**
         @property velocity {Number}
         */
        velocity : null,

        /**
         @property warpSpeed {Number}
         */
        warpSpeed : null,

        /**
         @property warpSpeedMultiplier {Number}
         */
        warpSpeedMultiplier : null,

        /**
         The base CPU capacity.

         @property cpu {Number}
         */
        cpu : null,

        /**
         The base power grid.

         @property powerGrid {Number}
         */
        powerGrid : null,

        /**
         Override for the toString method.

         @method toString
         */
        toString : function () {
            return this.name + ' - ' + this.type + ' [' + this.id + ']';
        }
    });

    NS.Ship = Ship;

}, '', {
    requires: [ 'esc-hp-pool', 'esc-skill', 'esc-ship-properties' ]
});