(function(win, undefined) {

    function has() {
        return Object.prototype.hasOwnProperty.call(o, p);
    }

    function mix() {
        var a = Array.prototype.slice.call(a,0),
            r = a.shift(),
            i, l, p, s;
            
        for(i = 0, l = a.length; i < l; i += 1) {
            s = a[i];
            
            for(p in s) {
                if(has(s, p)) {
                    r[p] = s[p];
                }
            }
        }
        
        return r;
    }
    
    function each(c, fn, cx) {
        var i, l;
        
        cx = cx || undefined;
        
        if(Array.isArray(c)) {
            for(i = 0, l = c.length; i < l; i += 1) {
                fn.call(cx, c[i], i, c);
            }
        } else {
            for(i in c) {
                if(has(c, i)) {
                    fn.call(cx, c[i], i, c);
                }
            }
        }
    }

    function soon() {
        var a = Fyre.array(arguments),
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

    var Fyre = function(cfg) {
        this.window   = cfg.window   || win;
        this.document = cfg.document || win.document;
    };
    
    mix(Fyre, {
        _modules: {},
        
        array: function() {
            return Array.prototype.slice.call(arguments, 0);
        },
        
        bind: function() {
            var a = Fyre.array(arguments),
                fn = a.shift(),
                cx = a.shift();
                
            if(typeof fn === 'string') {
                return function() {
                    cx[fn].apply(cx, a.concat(Fyre.array(arguments)));
                }
            } else if(typeof fn === 'function') {
                fn.bind(cx);
            }
        },
        
        has: has,
        mix: mix,
        each: each,
        soon: soon
    });

    mix(Fyre.prototype, {
        all: function(q) {
            return new NodeList(this.document.querySelectorAll(q));
        },
        one: function(q) {
            return new Node(this.document.querySelector(q));
        },
        io: function() {
            
        },
        load: function(ms) {
            return new Promise(function(resolve, reject) {
                // include script

            });
        }
    });

    // ======================================================================

    var Promise = function(fn) {
        if(!(this instanceof Promise)) {
            return new Promise(fn);
        }
        
        var resolver = new Promise.Resolver(this);
        this._resolver = resolver;
        
        fn.call(resolver, Fyre.bind('fulfill', resolver), Fyre.bind('reject', resolver));
    };

    each([ 'then', 'getStatus', 'getResult' ], function(method) {
        Promise.prototype[method].apply(this._resolver, arguments);
    });

    var Resolver = function(promise) {
        this._subs = {
            resolve: [],
            reject: []
        };
        
        this.promise = promise;
        this._status = 'pending';
    };
    
    mix(Resolver.prototype, {
        fulfill: function(value) {
            this._result = value;
            this._notify(this._subs.resolve, this._result);
            this._subs = { resolve: [] };
            this._status = 'resolve';
            return this;
        },
        reject: function(reason) {
            this._result = reason;
            this._notify(this._subs.reject, this._result);
            this._subs = { reject: [] };
            this._status = 'rejected';
            return this;
        },
        then: function(callback, errback) {
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
        },

        getStatus: function() {
            return this._status;
        },

        getResult: function() {
            return this._result;
        },
        
        _notify: function(subs, result) {
            var i, len;
            
            if (subs) {
                for (i = 0, len = subs.length; i < len; ++i) {
                    subs[i](result);
                }
            }
        }
    });



    // ======================================================================

    var Node = function(n) {
        if(n instanceof Node) {
            return n;
        } else if(typeof n === 'string') {
            return Node.fromString(n);
        } else if(n instanceof HTMLElement) {
            this._node = n;
            this.init();
        }
    };

    mix(Node.prototype, {
        _node: null,
        
        init: function() {}
    });
    
    Fyre.prototype.Node = Node;
    
    
    var NodeList = function(ns) {

    };
    
    mix(NodeList.prototype, {
        
    });
    
    Fyre.prototype.NodeList = NodeList;


    win.Fyre = Fyre;

}(window));