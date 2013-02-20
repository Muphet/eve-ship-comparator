/*global YUI*/
YUI.add('esc-template-helpers', function(Y) {
    "use strict";

    var MT = Y.esc.util.MicroTemplate,
        NS = MT.helpers;

    NS.shipStatItem = MT.compile([
        '<${this.wrapper || "li"} class="${this.className} stat-item">',
        '<span class="label" title="${this.label}">${this.label}</span>',
        '<span class="value">${ $h.shipStat(this.value, this.percent) }</span>',
        '</${this.wrapper || "li"}>'
    ].join(''));

    NS.shipStat = function(s, percent) {

        if(percent) {
            s = (s * 100).toFixed(0) + '%';
        } else if(s > 1000) {
            s = (Math.round(s/100)/10).toFixed(1) + 'k';
        } else {
            s = Math.round(s);
        }

        return s;
    };

}, '', {
    requires: [ 'esc-micro-template' ]
});