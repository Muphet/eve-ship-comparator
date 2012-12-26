var Q = require('q'),
    https = require('https'),
    xml2js = require('xml2js'),
    Skill = require('../model/skill').Skill,
    SkillRequirement = require('../model/skill').SkillRequirement;

var SkillService, SkillServiceProto;

SkillService = function(url) {
    this.url = url;
};

SkillServiceProto = SkillService.prototype;

SkillServiceProto.url = null;
SkillServiceProto._skillTree = null;

SkillServiceProto._getSkillTree = function() {
    var defer = Q.defer(),
        request,
        that = this;
    
    function buildSkillTree(data) {
        var parser = new xml2js.Parser(),
            skillTree = {};
        
        parser.parseString(data, function(err, result) {
            var groups = result.eveapi.result[0].rowset[0].row,
                group, i, l,
                skills, skill, ii, ll;
                
            for(i = 0, l = groups.length; i < l; i += 1) {
                group = groups[i];
                skills = group.rowset[0].row;

                for(ii = 0, ll = skills.length; ii < ll; ii += 1) {
                    skill = skills[ii];
                    
                    if(skill['$'].published == '1') {
                    
                        skillTree[skill['$'].typeID] = new Skill({
                            id           : parseFloat(skill['$'].typeID),
                            name         : skill['$'].typeName,
                            group        : group['$'].groupName,
                            description  : skill.description[0],
                            rank         : parseFloat(skill.rank[0]),
                            requirements: skill.rowset[0].row ? skill.rowset[0].row.map(function(s) {
                                return new SkillRequirement({
                                    id: parseFloat(s['$'].typeID),
                                    level: parseFloat(s['$'].skillLevel)
                                }, that);
                                
                            }) : []
                        });
                        
                    }
                }
            }
            
            that._skillTree = skillTree
            defer.resolve(skillTree);
        });
    }
    
    if(this._skillTree && Q.isPromise(this._skillTree)) {
        return this._skillTree; // NOTE RETURN
    } else if(this._skillTree) {
        defer.resolve(this._skillTree);
        return defer.promise;
    } else {        
        this._skillTree = defer.promise;
        
        request = https.get(this.url, function(res) {
            var data = '';
            
            res.on('data', function(d) { data += d; });
            
            res.on('end', function() {
                buildSkillTree(data);
            });
        });
        
        return defer.promise;
    }
};

SkillServiceProto.get = function(id) {
    return this._getSkillTree().then(function(st) { return st[id]; });
};

SkillServiceProto._resolve = function(id) {
    if(this._skillTree[id]) {
        return this._skillTree[id];
    }
};



exports.SkillService = SkillService;