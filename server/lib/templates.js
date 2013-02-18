/*global YUI */
YUI.add("esc-templates", function(Y) {
    "use strict";

    var MicroTemplate = Y.esc.util.MicroTemplate,
        baseDir = Y.config.global.process.cwd(),
        fs = YUI.require('fs');


    MicroTemplate.include = function(path, options) {
        return MicroTemplate.render(fs.readFileSync(baseDir + '/shared/views/' + path + '.html', 'utf8'), options);
    };

});