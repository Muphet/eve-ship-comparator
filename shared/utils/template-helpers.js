/*global YUI*/
YUI.add('esc-template-helpers', function(Y) {
    "use strict";

    var MT = Y.esc.util.MicroTemplate,
        NS = MT.helpers;

    NS.shipStatItem = MT.compile([
        '<${this.wrapper || "li"} class="${this.className} stat-item">',
        '<span class="label" title="${this.label}">${this.label}</span>',
        '<span class="value">${this.value}</span>',
        '</${this.wrapper || "li"}>'
    ].join(''));

}, '', {
    requires: [ 'esc-micro-template' ]
});