Poi.add('skill', function(NS) {

    var Skill, SkillProto;
    
    Skill = function(s) {
        this.id           = s && s.id           ? s.id           : null;
        this.name         = s && s.name         ? s.name         : null;
        this.description  = s && s.description  ? s.description  : null;
        this.group        = s && s.group        ? s.group        : null;
        this.rank         = s && s.rank         ? s.rank         : null;
        this.requirements = s && s.requirements ? s.requirements : [];
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
    
    SkillRequirement = function(sr) {
        this.id    = sr && sr.id    ? sr.id    : null;
        this.level = sr && sr.level ? sr.level : null;
    };
    
    SkillRequirementProto = SkillRequirement.prototype;
    
    SkillRequirementProto.id = null;
    SkillRequirementProto.level = null;
    
    
    NS.SkillRequirement = SkillRequirement;

//
// --- Skill Requirements ---------------------------------------------------
//
    var SkillRequirements, SkillRequirementsProto;
        
    SkillRequirements = function(sr) {
        this.skills = sr && sr.skills ? sr.skills.slice(0) : [];
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