(function(NS, global, isNode) {
    if(NS.Poi) { return; } // Already loaded!
    
    function NO_OP() {}
    
    function bind() {
        var a = [].slice.call(arguments),
            fn = a.shift(),
            cx = a.shift();
                
        if(typeof fn === 'string') {
            return function() {
                fn = cx[fn];
                
                fn.apply(cx, a.concat([].slice.call(arguments)));
            }
        } else if(typeof fn === 'function') {
            return fn.bind(cx);
        }
    }
    
    function soon() {
        var a = [].slice.call(arguments),
            fn = a.shift();
        
        if(typeof setImmediate !== 'undefined') {
            setImmediate(function() {
                fn.apply(undefined, a);
            });
        } else {
            setTimeout(function() {
                fn.apply(undefined, a);
            },0);
        }
    }
    
    function has(o, p) {
        return Object.prototype.hasOwnProperty.call(o, p);
    }

    function mix() {
        var a = [].slice.call(arguments),
            r = a.shift(),
            overwrite = typeof a[a.length - 1] === 'boolean' ? a.pop() : false,
            i, l, p, s;
            
        for(i = 0, l = a.length; i < l; i += 1) {
            s = a[i];
            
            // NOTE CONTINUE - if item isn't "real" or is an array
            if(typeof s !== 'object' || !s || Array.isArray(s)) { continue; }
            
            for(p in s) {
                if(has(s, p) && (overwrite || (typeof r[p] === 'undefined'))) {
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
    
    function extend(r, s, px, sx) {
        if(!s || !r) {
            throw new Error("extend failed, verify dependencies");
        }
        
        var sp = s.prototype,
            rp = Object.create(sp);
        
        rp.constructor = r;
        r.superclass   = sp;
        
        if(s != Object && sp.constructor === Object.prototype.constructor) {
            sp.constructor = s;
        }
        
        if(px) {
            mix(rp, px, true);
        }
        if(sx) {
            mix(r, sx, true);
        }
    }
    
    /* ------------------------------------------------------------------- */
    
    function Promise(fn) {
        if(!(this instanceof Promise)) {
            return new Promise(fn);
        }
        
        var resolver = new Promise.Resolver(this);
        this._resolver = resolver;
        
        fn.call(resolver, bind('fulfill', resolver), bind('reject', resolver));
    };
    
    mix(Promise.prototype, {
        then: function() {
            return this._resolver.then.apply(this._resolver, arguments);
        },
        
        getStatus: function() {
            return this._resolver.getStatus.apply(this._resolver, arguments);
        },

        getResult: function() {
            return this._resolver.getResult.apply(this._resolver, arguments);
        }
    });

    function Resolver(promise) {
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
            this._status = 'resolved';
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
                this.fulfill(this._result);
            } else if (this._status === 'rejected') {
                this.reject(this._result);
            }

            return then;
        },
        reject: function(reason) {
            this._result = reason;
            this._notify(this._subs.reject, this._result);
            this._subs = { reject: [] };
            this._status = 'rejected';
            return this;
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
    
    Promise.Resolver = Resolver;
    
    /* ------------------------------------------------------------------- */

    function Module(name, fn, requires) {
        this.name = name;
        this.fn = fn || NO_OP;
        this.requires = requires || [];
    };
    
    mix(Module.prototype, {
        run: function(context) {
            this.fn.call(context, context, this.name);
        },
        toString: function() {
            return '[object Module:' + this.name + ']';
        }
    });
    
    /* ------------------------------------------------------------------- */
    
    function Poi(cfg) {
        if(!(this instanceof Poi)) {
            return new Poi(cfg);
        }
        
        this.config = mix({ }, this.config, cfg, true);
        this._env = {};
    };

    function loadBrowser(path, callback) {
        
    }
    
    function loadNode(path, callback) {
        var fs = require('fs');
        
    }

    function log() {
        global.console.log.apply(global.console, arguments);
    }

    function add(name, module, requires) {
        var mods = Poi._env.modules;
        
        if(mods[name]) {
            console.warn("Already a module loaded at name", name);
        }
        
        mods[name] = new Module(name, module, requires);
        
        return mods[name];
    }
    
    mix(Poi, {
        _env : {
            modules: {}
        },
        
        log     : log,
        bind    : bind,
        soon    : soon,
        has     : has,
        mix     : mix,
        each    : each,
        add     : add,
        extend  : extend,
        load    : NO_OP // shared loader utility, defined client or server-side
    });
    
    mix(Poi.prototype, {
        config: {
            win: NS,
            doc: NS.document,
            
            load: NO_OP,
            mapper: function(v) { return v; }
        },
        
        use: function(mods) {
            var env   = Poi._env,
                P     = this,                       // Poi instance
                cfg   = this.config,                // instance config
                a     = [].slice.call(arguments),
                paths = a.map(cfg.mapper.bind(P));  // paths to include
            
            return new Promise(function(resolve, reject) {
                var i, l;
                
                function complete(mod) {
                    l -= 1;
                    
                    mod.run(P);

                    if(l === 0) {
                        resolve(P);
                    }
                }
                
                // TODO: fix this, it's crappy
                for(i = 0, l = a.length; i < l; i += 1) {
                    if(env.modules[a[i]]) {
                        soon(complete); // already loaded, skip!
                    } else if(env.modules[a[i]] === false) {
                        console.log("ALREADY LOADING " + a[i]);
                    } else {
                        env.modules[a[i]] = false;
                        cfg.load.call(this, paths[i], complete, reject);                        
                    }
                }
            });
        }
    });
    
    Poi.Promise = Promise;
    
    
    NS.Poi = Poi;
    global.Poi = Poi;
    
}(
    (typeof exports === 'undefined' ? window : exports ),
    (typeof global === 'undefined' ? window : global),
    (typeof exports !== 'undefined')
));