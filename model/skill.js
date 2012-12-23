(function(NS, isNode) {

//
// --- Skill Requirements ---------------------------------------------------
//
    var SkillRequirements, SkillRequirementsProto;
        
    SkillRequirements = function() {
        this.skills = [];
    };
        
    SkillRequirementsProto = SkillRequirements.prototype;
        
    SkillRequirementsProto.skills = null;
        
    Object.defineProperties(SkillRequirementsProto, {
        primary: {
            get: function() { return this.skills[0]; },
            set: function(val) { this.skills[0] = val; }
        },
        secondary: {
            get: function() { return this.skills[1]; },
            set: function(val) { this.skills[1] = val; }
        },
        tertiary: {
            get: function() { return this.skills[2]; },
            set: function(val) { this.skills[2] = val; }
        }
    });
    
    NS.SkillRequirements = SkillRequirements;
    
}(typeof exports === 'undefined' ? win.esc || (win.esc = {}) : exports), (typeof exports !== 'undefined'));
