(function(ns) {
    if(process) {
        extend = require('./utils').extend;
        Promise = require('./promise').Promise;
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
        reduceRight : arrayMethod('reduceRight')
    });
    
    ns.ListPromise = ListPromise;

    function collect(promises) {
        var doFulfill,
            doReject,
            promise,
            remaining = promises.length,
            results = new Array(promises.length);
        
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
