(function(NS, isNode) {
    
    // Stolen from juan dopazo
    
    var slice = [].slice;
    
    function bind() {
        var a = slice.call(arguments),
            fn = a.shift(),
            cx = a.shift();
                
        if(typeof fn === 'string') {
            return function() {
                cx[fn].apply(cx, a.concat(slice.call(arguments)));
            }
        } else if(typeof fn === 'function') {
            fn.bind(cx);
        }
    }
    
    function soon() {
        var a = slice.call(arguments),
            fn = a.shift();
        
        if(setImmediate) {
            setImmediate(function() {
                fn.apply(undefined, a);
            });
        } else {
            setTimeout(function() {
                fn.apply(undefined, a);
            },0);
        }
    }
    
    var Promise, PromiseProto;
    
    Promise = function(fn) {
        if(!(this instanceof Promise)) {
            return new Promise(fn);
        }
        
        var resolver = new Promise.Resolver(this);
        this._resolver = resolver;
        
        fn.call(resolver, bind('fulfill', resolver), bind('reject', resolver));
    };

    PromiseProto.then = function() {
        return this._resolver.then.apply(this._resolver, arguments);
    };
    
    PromiseProto.getStatus = function() {
        return this._resolver.getStatus.apply(this._resolver, arguments);
    };
    
    PromiseProto.getResult = function() {
        return this._resolver.getResult.apply(this._resolver, arguments);
    };
    
    
    
    var Resolver, ResolverProto;
    
    Resolver = function(promise) {
        this._subs = {
            resolve: [],
            reject: []
        };
        
        this.promise = promise;
        this._status = 'pending';
    };
    
    ResolverProto = Resolver.prototype;
    
    ResolverProto.fulfill = function(value) {
            this._result = value;
            this._notify(this._subs.resolve, this._result);
            this._subs = { resolve: [] };
            this._status = 'resolve';
            return this;
        };
        
    ResolverProto.reject = function(reason) {
        this._result = reason;
        this._notify(this._subs.reject, this._result);
        this._subs = { reject: [] };
        this._status = 'rejected';
        return this;
    };
    
    ResolverProto.then = function(callback, errback) {
        // When the current promise is resolved or rejected, either the
        // callback or errback will be executed via the function pushed onto
        // this._subs.resolve or this._sub.reject.  However, to allow then()
        // chaining, the execution of either function needs to be represented
        // by a Resolver (the same Resolver can represent both flow paths), and
        // its promise returned.

        var promise = this.promise,
            thenFullfill, thenReject,

            // using promise constructor allows for customized promises to be
            // returned instead of plain ones
            then = new promise.constructor(function (fulfill, reject) {
                thenFullfill = fulfill;
                thenReject = reject;
            }),

            resolveSubs = this._subs.resolve || [],
            rejectSubs  = this._subs.reject  || [];

        // Because the callback and errback are represented by a Resolver, it
        // must be resolved or rejected to propagate through the then() chain.
        // The same logic applies to resolve() and reject() for fulfillment.

        function wrap(fn) {
            return function () {
                // The args coming in to the callback/errback from the
                // resolution of the parent promise.
                var args = arguments;

                // Wrapping all callbacks in Y.soon to guarantee
                // asynchronicity. Because setTimeout can cause unnecessary
                // delays that *can* become noticeable in some situations
                // (especially in Node.js)
                soon(function () {

                    // Call the callback/errback with promise as `this` to
                    // preserve the contract that access to the deferred is
                    // only for code that may resolve/reject it.
                    // Another option would be call the function from the
                    // global context, but it seemed less useful.
                    var result;

                    // Promises model exception handling through callbacks
                    // making both synchronous and asynchronous errors behave
                    // the same way

                    try {
                        result = fn.apply(promise, args);
                    } catch (e) {
                        return thenReject(e);
                    }

                    // Returning a promise from a callback makes the current
                    // promise sync up with the returned promise
                    if (result && typeof result.then === 'function') {
                        result.then(thenFullfill, thenReject);
                    } else {
                        // Non-promise return values always trigger resolve()
                        // because callback is affirmative, and errback is
                        // recovery.  To continue on the rejection path, errbacks
                        // must return rejected promises or throw.
                        thenFullfill(result);
                    }
                });
            };
        }
            
        resolveSubs.push( typeof callback === 'function' ? wrap(callback) : thenFullfill );
        rejectSubs.push(  typeof errback === 'function'  ? wrap(errback)  : thenReject   );

        if (this._status === 'resolved') {
            this.resolve(this._result);
        } else if (this._status === 'rejected') {
            this.reject(this._result);
        }

        return then;
    };
    
    ResolverProto.getStatus = function() {
        return this._status;
    };

    ResolverProto.getResult = function() {
        return this._result;
    };
    
    ResolverProto._notify = function(subs, result) {
        var i, len;
            
        if (subs) {
            for (i = 0, len = subs.length; i < len; ++i) {
                subs[i](result);
            }
        }
    };
    
    NS.Promise = Promise;
    NS.Promise.Resolver = Resolver;
    
}(typeof exports === 'undefined' ? window : exports, (typeof exports !== 'undefined')));


