YUI.add('esc-skill', function(Y) {

    var NS = Y.namespace('esc');

    var Skill, SkillProto;
    
    Skill = function(cfg) {
        Y.mix(this, cfg || {}, true, Object.keys(Skill.prototype));
        
        if(!this.requirements) { this.requirements = []; }
    };
    
    SkillProto = Skill.prototype;
    
    SkillProto.id = null;
    SkillProto.name = null;
    SkillProto.description = null;
    SkillProto.group = null;
    SkillProto.rank = null;
    SkillProto.requirements = null;    
    
    NS.Skill = Skill;
    
//
// --- Skill ----------------------------------------------------------------
//

    var SkillRequirement, SkillRequirementProto;
    
    SkillRequirement = function(cfg) {
        Y.mix(this, cfg || {}, true, Object.keys(SkillRequirement.prototype));
    };
    
    SkillRequirementProto = SkillRequirement.prototype;
    
    SkillRequirementProto.id = null;
    SkillRequirementProto.level = null;
    SkillRequirementProto.skill = null;

    NS.SkillRequirement = SkillRequirement;

//
// --- Skill Requirements ---------------------------------------------------
//
    var SkillRequirements, SkillRequirementsProto;
        
    SkillRequirements = function(sr) {
        this.skills = sr && sr.skills ? sr.skills.slice(0) : [];
        
        if(sr.primary) {
            this.primary = sr.primary;
        }
        if(sr.secondary) {
            this.secondary = sr.secondary;
        }
        if(sr.tertiary) {
            this.tertiary = sr.tertiary;
        }
    };
        
    SkillRequirementsProto = SkillRequirements.prototype;

    SkillRequirementsProto.skills = null;
    
    Object.defineProperties(SkillRequirementsProto, {
        primary: {
            get: function() {
                if(!this.skills[0]) {
                    this.skills[0] = new SkillRequirement();
                }
                return this.skills[0];
            },
            set: function(val) { this.skills[0] = val; }
        },
        secondary: {
            get: function() {
                if(!this.skills[1]) {
                    this.skills[1] = new SkillRequirement();
                }
                return this.skills[1];
            },
            set: function(val) { this.skills[1] = val; }
        },
        tertiary: {
            get: function() {
                if(!this.skills[2]) {
                    this.skills[2] = new SkillRequirement();
                }
                return this.skills[2];
            },
            set: function(val) { this.skills[2] = val; }
        }
    });
    
    NS.SkillRequirements = SkillRequirements;
    
});