(function(ns) {
    if(typeof process !== 'undefined') { // is nodejs
        extend = require('./utils').extend;
        Promise = require('./promise').Promise;
        hash = require('./utils').hash;
    }

    function ListPromise() {
        ListPromise.superclass.constructor.apply(this, arguments);
    };
    
    function arrayMethod(method) {
        return function() {
            var args = arguments;
            
            return this.then(function(r) {
                if(!Array.isArray(r)) {
                    r = [ r ];
                }
                
                if(method === 'reduceRight' || method === 'reduceLeft') {
                    // TODO: implement
                    return r[method].apply(r, args);
                } else {
                    return collect(r[method].apply(r, args));
                }
            });
        };
    }
    
    extend(ListPromise, Promise, {
        forEach     : arrayMethod('forEach'),
        every       : arrayMethod('every'),
        some        : arrayMethod('some'),
        filter      : arrayMethod('filter'),
        map         : arrayMethod('map'),
        reduce      : arrayMethod('reduce'),
        reduceRight : arrayMethod('reduceRight'),

        hash        : function() {
            var args = [].slice.call(arguments);
            return this.then(function(r) {
                return hash(args, r);
            }).as(Promise);
        }
    });
    
    ns.ListPromise = ListPromise;

    function collect(promises) {
        var doFulfill,
            doReject,
            promise,
            remaining = promises.length,
            results = new Array(promises.length);

        if(arguments.length > 1) {
            return collect([].slice.call(arguments));
        }

        promise = new ListPromise(function(fulfill, reject) {
            doFulfill = fulfill;
            doReject = reject;
        });
        
        if(remaining) {
            promises.forEach(function(p, i) {
                if(Promise.isPromise(p)) {
                    p.then(function(result) {
                        
                        remaining -= 1;
                        results[i] = result;

                        if(remaining === 0) {
                            doFulfill(results);
                        }
                    }, doReject);
                } else {
                    results[i] = p;
                    remaining -= 1;

                    if(remaining === 0) {
                        doFulfill(results);
                    }
                }
            });
        } else {
            doFulfill(promises);
        }

        return promise;
    }

    ns.Promise = Promise;
    ns.collect = collect;

}(typeof process !== 'undefined' ? exports : window));
