(function(NS, isNode) {

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
    
}(typeof exports === 'undefined' ? win.esc || (win.esc = {}) : exports), (typeof exports !== 'undefined'));
