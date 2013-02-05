YUI.add('esc-skill', function(Y) {

    var NS = Y.namespace('esc');

    //
    // --- Skill ----------------------------------------------------------------
    //
    
    function Skill(cfg) {
        Y.mix(this, cfg || {}, true, Object.keys(Skill.prototype));
        
        if(!this.requirements) { this.requirements = []; }
    };
    
    Y.mix(Skill.prototype, {
        id: null,
        name: null,
        description: null,
        group: null,
        rank: null,
        requirements: null
    });
        
    NS.Skill = Skill;
    
    function SkillRequirement(cfg) {
        Y.mix(this, cfg || {}, true, Object.keys(SkillRequirement.prototype));
    };
    
    Y.mix(SkillRequirement.prototype, {
        id: null,
        level: null,
        skill: null,
        
        toString: function() {
            
        }
    });
    
    NS.SkillRequirement = SkillRequirement;

//
// --- Skill Requirements ---------------------------------------------------
//
    function SkillRequirements(sr) {
        this.skills = sr && sr.skills ? sr.skills.slice(0) : [];
        
        if(sr && sr.primary) {
            this.primary = sr.primary;
        }
        if(sr && sr.secondary) {
            this.secondary = sr.secondary;
        }
        if(sr && sr.tertiary) {
            this.tertiary = sr.tertiary;
        }
    };
    
    Y.mix(SkillRequirements.prototype, {
        skills: null,
        toString: function() {
            
        }
    })
    
    Object.defineProperties(SkillRequirements.prototype, {
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