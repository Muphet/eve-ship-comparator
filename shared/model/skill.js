/*global YUI*/
/**
 Classes and objects having to do with skill requirements for ships.

 @module esc-skill
 @namespace esc
 */
YUI.add('esc-skill', function (Y) {
    "use strict";

    var NS = Y.namespace('esc');

    //
    // --- Skill ----------------------------------------------------------------
    //

    /**
     A representation of a skill in the Eve skill tree. Matains a list of skills that are required to train this skill, as well as things like group, rank, and description.

     @class Skill
     @constructor
     */
    function Skill(cfg) {
        Y.mix(this, cfg || {}, true, Object.keys(Skill.prototype));

        if (!this.requirements) {
            this.requirements = [];
        }
    }

    Y.mix(Skill.prototype, {
        /**
         The ID of the skill in the Eve database.

         @property id {Number}
         */
        id           : null,

        /**
         The name of the skill.

         @property name {String}
         */
        name         : null,

        /**
         The description of the skill.

         @property description {String}
         */
        description  : null,

        /**
         The group this skill belongs to.

         @property group {String}
         */
        group        : null,

        /**
         The rank of the skill.

         @property rank {Number}
         */
        rank         : null,

        /**
         The prereqs for this skill.

         @property requirements {Array}
         */
        requirements : null
    });

    NS.Skill = Skill;

    /**
     A representation of a required skill, either to fly a ship or as a prereq for a skill to fly a ship.

     @class SkillRequirement
     @constructor
     */
    function SkillRequirement(cfg) {
        Y.mix(this, cfg || {}, true, Object.keys(SkillRequirement.prototype));
    }

    Y.mix(SkillRequirement.prototype, {
        /**
         The ID of the skill that is required.

         @property id {Number}
         */
        id : null,

        /**
         The level of the skill that is required.
         @property level {Number}
         */
        level : null,

        /**
         The resolved skill that is required.

         @property skill {esc.Skill}
         */
        skill : null
    });

    NS.SkillRequirement = SkillRequirement;

//
// --- Skill Requirements ---------------------------------------------------
//
    /**
     @class SkillRequirements
     @constructor
     */
    function SkillRequirements(sr) {
        this.skills = sr && sr.skills ? sr.skills.slice(0) : [];

        if (sr && sr.primary) {
            this.primary = sr.primary;
        }
        if (sr && sr.secondary) {
            this.secondary = sr.secondary;
        }
        if (sr && sr.tertiary) {
            this.tertiary = sr.tertiary;
        }
    }

    Y.mix(SkillRequirements.prototype, {
        /**
         @property skills {Array}
         */
        skills : null
    });

    Object.defineProperties(SkillRequirements.prototype, {

        /**
         @property primary {esc.SkillRequirement}
         */
        primary : {
            get : function () {
                if (!this.skills[0]) {
                    this.skills[0] = new SkillRequirement();
                }
                return this.skills[0];
            },
            set : function (val) {
                this.skills[0] = val;
            }
        },

        /**
         @property secondary {esc.SkillRequirement}
         */
        secondary : {
            get : function () {
                if (!this.skills[1]) {
                    this.skills[1] = new SkillRequirement();
                }
                return this.skills[1];
            },
            set : function (val) {
                this.skills[1] = val;
            }
        },

        /**
         @property tertiary {esc.SkillRequirement}
         */
        tertiary : {
            get : function () {
                if (!this.skills[2]) {
                    this.skills[2] = new SkillRequirement();
                }
                return this.skills[2];
            },
            set : function (val) {
                this.skills[2] = val;
            }
        }
    });

    NS.SkillRequirements = SkillRequirements;
});