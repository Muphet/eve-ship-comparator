
var fs = require('fs'),
    MicroTemplate = require('../../shared/lib/micro-template').MicroTemplate;


MicroTemplate.include = function(path, options) {
    return MicroTemplate.render(fs.readFileSync(__dirname + '/../../shared/views/' + path + '.html', 'utf8'), options);
};

module.exports = function(path, options, fn) {
    
    console.log(__dirname);
    
    if(typeof options === 'function') {
        fn = options;
        options = {};
    }
    
    options.filename = path;
        
    fs.readFile(path, 'utf8', function(err, file) {
        if(err) {
            fn(err);
        } else {
            fn(null, MicroTemplate.render(file, options));
        }
    });
};