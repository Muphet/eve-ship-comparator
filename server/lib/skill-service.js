/*global YUI*/
/**
 @module esc-skill-service
 @namespace esc.service
 */
YUI.add('esc-skill-service', function (Y) {
    "use strict";

    var NS = Y.namespace('esc.service'),
        Skill = Y.esc.model.Skill,
        SkillRequirement = Y.esc.model.SkillRequirement,
        Promise = Y.esc.util.Promise,

        xml2js = YUI.require('xml2js'),
        https = YUI.require('https');

    /**
     @class SkillService
     @constructor
     @extends esc.util.Promise
     @example

         SkillService.retrieve('https://api.eveonline.com/eve/SkillTree.xml.aspx').getSkill(12345).then(function(s) {
            console.log(s.name);
         });
     **/
    function SkillService(resolver) {
        SkillService.superclass.constructor.apply(this, arguments);
    }

    /**
     @method retrieve
     @static
     @param url {String}
     @return {esc.service.SkillService}
     */
    SkillService.retrieve = function (url) {
        return new SkillService(function (fulfill, reject) {
            var data = '';

            https.get(url,function (res) {
                res.on('data', function (d) {
                    data += d;
                });

                res.on('end', function () {
                    var parser = new xml2js.Parser(),
                        skillTree = {};

                    parser.parseString(data, function (err, result) {
                        var groups = result.eveapi.result[0].rowset[0].row,
                            group, i, l,
                            skills, skill, ii, ll;

                        for (i = 0, l = groups.length; i < l; i += 1) {
                            group = groups[i];
                            skills = group.rowset[0].row;

                            for (ii = 0, ll = skills.length; ii < ll; ii += 1) {
                                skill = skills[ii];

                                if (skill.$.published === '1') {

                                    skillTree[skill.$.typeID] = new Skill({
                                        id           : parseFloat(skill.$.typeID),
                                        name         : skill.$.typeName,
                                        group        : group.$.groupName,
                                        description  : skill.description[0],
                                        rank         : parseFloat(skill.rank[0]),
                                        requirements : skill.rowset[0].row ? skill.rowset[0].row.map(function (s) {
                                            return new SkillRequirement({
                                                id    : parseFloat(s.$.typeID),
                                                level : parseFloat(s.$.skillLevel)
                                            });

                                        }) : []
                                    });

                                }
                            }
                        }

                        fulfill(skillTree);
                    });
                });
            }).on('error', function (e) {
                    reject(e);
                });

        });
    };

    /**
     @method resolveSkillsFromTree
     @static
     @param ids {Array|Number} A list of ids
     @param tree {Object} The skill tree to pull the ids out of.
     @return {Object} Skills
     */
    SkillService.resolveSkillsFromTree = function (ids, tree) {
        ids = Array.isArray(ids) ? ids : [ ids ];

        var i, l, ii, iii, ll, lll, skills = [], skill, reqs;

        for (i = 0, l = ids.length; i < l; i += 1) {
            skill = tree[ids[i]];

            if (skill && skill.requirements && skill.requirements.length) {
                reqs = SkillService.resolveSkillsFromTree(skill.requirements.map(function (i) {
                    return i.id;
                }), tree);

                for (ii = 0, ll = reqs.length; ii < ll; ii += 1) {
                    for (iii = 0, lll = skill.requirements.length; iii < lll; iii += 1) {
                        if (reqs[ii].id === skill.requirements[iii].id) {
                            skill.requirements[iii].skill = reqs[ii];
                        }
                    }
                }
            }

            skills.push(skill);
        }

        return skills;
    };

    Y.extend(SkillService, Promise, {
        /**
         @method getSkill
         @params ids {Number|Number[]} A single id or list of ids to resolve.
         @return {Skill[]}
        **/
        getSkill : function (ids) {
            return this.then(function (tree) {
                var res = SkillService.resolveSkillsFromTree(ids, tree);

                return res.length === 1 ? res[0] : res;
            });
        }
    });

    NS.SkillService = SkillService;

}, '', {
    requires : [ 'esc-promise' ]
});