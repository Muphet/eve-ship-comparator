

var Poi = require('./shared/poi').Poi;

Poi({
    load: function(path, success, fail) {
        var fs = require('fs'),
            vm = require('vm'),
            p  = require('path');
    
        fs.readFile(p.resolve(path), 'utf8', function(err, file) {
            try {
                console.log(Poi);
                success(vm.runInThisContext(file, p.resolve(path)));
            } catch (e) {
                fail(e);
            }
        });
    },
    mapper: function(m) { return './shared/model/' + m + '.js'; }

}).use('capacitor', 'ship', 'skill').then(function(P) {


}, function(err) {
    console.error(err);
    console.log(err.stack);
});