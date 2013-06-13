(function(ns) {

    var Micro = {};
 
    Micro.options = {
        code         : /<%([\s\S]+?)%>/g,
        escapedOutput: /\$\{([\s\S]+?)\}/g,
        rawOutput    : /\$\{\{([\s\S]+?)\}\}/g,
        stringEscape : /\\|'|\r|\n|\t|\u2028|\u2029/g,
 
        stringReplace: {
            '\\'    : '\\\\',
            "'"     : "\\'",
            '\r'    : '\\r',
            '\n'    : '\\n',
            '\t'    : '\\t',
            '\u2028': '\\u2028',
            '\u2029': '\\u2029'
        }
    };
 
    Micro.compile = function (text, precompile) {
        /*jshint evil:true */
 
        var blocks     = [],
            tokenClose = "\uffff",
            tokenOpen  = "\ufffe",
            source;
 
        options = Micro.options;
 
        source = "var $b='', $v=function (v){return v || v === 0 ? v : $b;}, $t='" +
 
            text.replace(/\ufffe|\uffff/g, '')
 
            .replace(options.rawOutput, function (match, code) {
                return tokenOpen + (blocks.push("'+\n$v(" + code + ")+\n'") - 1) + tokenClose;
            })
 
            .replace(options.escapedOutput, function (match, code) {
                return tokenOpen + (blocks.push("'+\n$e($v(" + code + "))+\n'") - 1) + tokenClose;
            })
 
            .replace(options.code, function (match, code) {
                return tokenOpen + (blocks.push("';\n" + code + "\n$t+='") - 1) + tokenClose;
            })
 
            .replace(options.stringEscape, function (match) {
                return options.stringReplace[match] || '';
            })
 
            .replace(/\ufffe(\d+)\uffff/g, function (match, index) {
                return blocks[parseInt(index, 10)];
            })
 
            .replace(/\n\$t\+='';\n/g, '\n') +
 
            "';\nreturn $t;";
 
        if (precompile) {
            return "function ($e, data) {\n" + source + "\n}";
        }
 
        return this.revive(new Function('$e', 'data', source));
    };

    Micro.precompile = function (text, options) {
        return this.compile(text, true);
    };
 
    Micro.render = function (text, data) {
        return this.compile(text)(data);
    };

    Micro.HTML_CHARS = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
        '`': '&#x60;'
    };

    Micro.escape = function (string) {
        return (string + '').replace(/[&<>"'\/`]/g, function (match) {
            return Micro.HTML_CHARS[match];
        });
    }
 
    Micro.revive = function (precompiled) {
        return function (data) {
            data || (data = {});
            return precompiled.call(data, Micro.escape, data);
        };
    };

    ns.Micro = Micro;
    
}(typeof process !== 'undefined' ? exports : window));
