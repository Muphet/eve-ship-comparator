/*jslint node:true */

"use strict";

var fs     = require('fs'),
    path   = require('path'),
    findit = require('findit'),
    Y      = require('yui').getInstance(),

    TEMPLATES_DIR = path.join(__dirname, '..', '..', 'shared', 'views'),
    
    templatesPromise;

exports.tmpl = function(req, res, next) {
    Y.use('esc-promise', 'esc-micro-template', function(Y) {
        var Promise = Y.esc.Promise,
            MicroTemplate = Y.esc.MicroTemplate,

            getTemplates = function(resolve, reject) {
                var finder = findit.find(TEMPLATES_DIR),
                    foundAllFiles = false,
                    filesToRead = 0,
                    files = [],
                    timeout = setTimeout(reject, 2000, 'timeout');

                finder.on('file', function(file, stat) {
                    if(path.extname(file) === '.html') {
                        filesToRead += 1;

                        fs.readFile(file, 'utf8', function(err, data) {
                            if(err) {
                                reject(err);
                            } else {
                                filesToRead -= 1;

                                files.push({
                                    path: file.replace(TEMPLATES_DIR + '/', '').replace('.html', ''),
                                    template: MicroTemplate.precompile(data)
                                });

                                if(filesToRead === 0 && foundAllFiles) {
                                    clearTimeout(timeout);
                                    resolve(files);
                                }
                            }
                        });
                    }
                });

                finder.on('end', function() {
                    foundAllFiles = true;

                    if(filesToRead === 0) {
                        clearTimeout(timeout);
                        resolve(files);
                    }
                });
            };

        // Regenerate the templates every time
        if(Y.config.debug || !templatesPromise) {
            templatesPromise = new Promise(getTemplates);
        }
    
        templatesPromise.then(function(tmpls) {
            res.set('Content-Type', 'text/javascript');
        
            var out = [
                'YUI.add("esc-templates", function(Y, NAME) {',
                'var NS = Y.namespace("esc.templates");'
            ];
            
            tmpls.forEach(function(t) {
                out.push('NS["' + t.path + '"] = ' + t.template + ';');
            });
        
            out.push([
                'if(Y.esc.MicroTemplate) {',
                '    Y.esc.MicroTemplate.include = function(path, options) {',
                '        return Y.esc.MicroTemplate.revive(NS[path])(options);',
                '    };',
                '    Y.esc.MicroTemplate.getTemplate = function(path) {',
                '        return Y.esc.MicroTemplate.revive(NS[path]);',
                '    };',
                '}'
            ].join('\n'));
        
            out.push('}, "", { requires: [ "esc-micro-template" ] });');
        
            res.send(out.join('\n'));
        
        }, function(err) {
            console.log(err);
        });
    });
    

};