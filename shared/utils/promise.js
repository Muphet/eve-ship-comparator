/*global YUI*/
YUI.add('esc-promise', function (Y) {
    "use strict";

    var NS = Y.namespace('esc.util');

    function soon() {
        var a = [].slice.call(arguments),
            fn = a.shift(),
            soonFn = Y.config.global.setImmediate || Y.config.global.setTimeout;


        soonFn(function () {
            fn.apply(undefined, a);
        }, 0);
    }


    /**
     Wraps the execution of asynchronous operations, providing a promise object that
     can be used to subscribe to the various ways the operation may terminate.

     When the operation completes successfully, call the Resolver's `fulfill()`
     method, passing any relevant response data for subscribers.  If the operation
     encounters an error or is unsuccessful in some way, call `reject()`, again
     passing any relevant data for subscribers.

     The Resolver object should be shared only with the code resposible for
     resolving or rejecting it. Public access for the Resolver is through its
     _promise_, which is returned from the Resolver's `promise` property. While both
     Resolver and promise allow subscriptions to the Resolver's state changes, the
     promise may be exposed to non-controlling code. It is the preferable interface
     for adding subscriptions.

     Subscribe to state changes in the Resolver with the promise's
     `then(callback, errback)` method.  `then()` wraps the passed callbacks in a
     new Resolver and returns the corresponding promise, allowing chaining of
     asynchronous or synchronous operations. E.g.
     `promise.then(someAsyncFunc).then(anotherAsyncFunc)`

     @module esc-promise
     @namespace esc.util
     **/

    /**
     The public API for a Resolver. Used to subscribe to the notification events for
     resolution or progress of the operation represented by the Resolver.

     @class Promise
     @constructor
     @param {Function} fn A function where to insert the logic that resolves this
     promise. Receives `fulfill` and `reject` functions as parameters
     **/
    function Promise(fn) {
        if (!(this instanceof Promise)) {
            return new Promise(fn);
        }

        var resolver = new Promise.Resolver(this);

        /**
         Schedule execution of a callback to either or both of "fulfill" and
         "reject" resolutions for this promise. The callbacks are wrapped in a new
         promise and that promise is returned.  This allows operation chaining ala
         `functionA().then(functionB).then(functionC)` where `functionA` returns
         a promise, and `functionB` and `functionC` _may_ return promises.

         Asynchronicity of the callbacks is guaranteed.

         @method then
         @param {Function} [callback] function to execute if the promise
         resolves successfully
         @param {Function} [errback] function to execute if the promise
         resolves unsuccessfully
         @return {Promise} A promise wrapping the resolution of either "resolve" or
         "reject" callback
         **/
        this.then = function () {
            return resolver.then.apply(resolver, arguments);
        };

        /**
         Returns the current status of the operation. Possible results are
         "pending", "fulfilled", and "rejected".

         @method getStatus
         @return {String}
         **/
        this.getStatus = function () {
            return resolver.getStatus.apply(resolver, arguments);
        };

        fn.call(this, Y.bind('fulfill', resolver), Y.bind('reject', resolver));
    }

    /**
     Checks if an object or value is a promise. This is cross-implementation
     compatible, so promises returned from other libraries or native components
     that are compatible with the Promises A+ spec should be recognized by this
     method.

     @method isPromise
     @param {Any} obj The object to test
     @return {Boolean} Whether the object is a promise or not
     @static
     **/
    Promise.isPromise = function (obj) {
        return Y.Lang.isObject(obj) && typeof obj.then === 'function';
    };

    NS.Promise = Promise;

    /**
     Represents an asynchronous operation. Provides a
     standard API for subscribing to the moment that the operation completes either
     successfully (`fulfill()`) or unsuccessfully (`reject()`).

     @class Promise.Resolver
     @constructor
     @param {Promise} promise The promise instance this resolver will be handling
     **/
    function Resolver(promise) {
        this._fulfillSubs = [];
        this._rejectSubs = [];

        /**
         The promise for this Resolver.

         @property promise
         @type Promise
         **/
        this.promise = promise;

        /**
         The status of the operation.

         @property _status
         @type String
         @private
         **/
        this._status = 'pending';
    }

    Y.mix(Resolver.prototype, {
        /**
         Resolves the promise, signaling successful completion of the
         represented operation. All "onFulfilled" subscriptions are executed and passed
         the value provided to this method. After calling `fulfill()`, `reject()` and
         `notify()` are disabled.

         @method fulfill
         @param {Any} value Value to pass along to the "onFulfilled" subscribers
         **/
        fulfill: function (value) {
            if (this._status === 'pending') {
                this._result = value;
            }

            if (this._status !== 'rejected') {
                this._notify(this._fulfillSubs, this._result);

                this._fulfillSubs = [];
                this._rejectSubs = null;

                this._status = 'fulfilled';
            }
        },

        /**
         Resolves the promise, signaling *un*successful completion of the
         represented operation. All "onRejected" subscriptions are executed with
         the value provided to this method. After calling `reject()`, `resolve()`
         and `notify()` are disabled.

         @method reject
         @param {Any} value Value to pass along to the "reject" subscribers
         **/
        reject: function (reason) {
            if (this._status === 'pending') {
                this._result = reason;
            }

            if (this._status !== 'fulfilled') {
                this._notify(this._rejectSubs, this._result);

                this._fulfillSubs = null;
                this._rejectSubs = [];

                this._status = 'rejected';
            }
        },

        /**
         Schedule execution of a callback to either or both of "resolve" and
         "reject" resolutions for the Resolver.  The callbacks
         are wrapped in a new Resolver and that Resolver's corresponding promise
         is returned.  This allows operation chaining ala
         `functionA().then(functionB).then(functionC)` where `functionA` returns
         a promise, and `functionB` and `functionC` _may_ return promises.

         @method then
         @param {Function} [callback] function to execute if the Resolver
         resolves successfully
         @param {Function} [errback] function to execute if the Resolver
         resolves unsuccessfully
         @return {Promise} The promise of a new Resolver wrapping the resolution
         of either "resolve" or "reject" callback
         **/
        then: function (callback, errback) {
            // When the current promise is fulfilled or rejected, either the
            // callback or errback will be executed via the function pushed onto
            // this._subs.resolve or this._sub.reject.  However, to allow then()
            // chaining, the execution of either function needs to be represented
            // by a Resolver (the same Resolver can represent both flow paths), and
            // its promise returned.

            var promise = this.promise,
                thenFullfill,
                thenReject,

            // using promise constructor allows for customized promises to be
            // returned instead of plain ones
                then = new promise.constructor(function (fulfill, reject) {
                    thenFullfill = fulfill;
                    thenReject = reject;
                }),

                resolveSubs = this._fulfillSubs || [],
                rejectSubs  = this._rejectSubs  || [];

            // Because the callback and errback are represented by a Resolver, it
            // must be fulfilled or rejected to propagate through the then() chain.
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
                        if (Promise.isPromise(result)) {
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

            resolveSubs.push(typeof callback === 'function' ? wrap(callback) : thenFullfill);
            rejectSubs.push(typeof errback === 'function' ? wrap(errback) : thenReject);

            if (this._status === 'fulfilled') {
                this.fulfill(this._result);
            } else if (this._status === 'rejected') {
                this.reject(this._result);
            }

            return then;
        },

        /**
         Returns the current status of the Resolver as a string "pending",
         "fulfilled", or "rejected".

         @method getStatus
         @return {String}
         **/
        getStatus: function () {
            return this._status;
        },

        /**
         Returns the result of the Resolver.  Use `getStatus()` to test that the
         promise is fulfilled before calling this.

         @method getResult
         @return {Any} Value passed to `resolve()` or `reject()`
         **/
        getResult: function () {
            return this._result;
        },

        /**
         Executes an array of callbacks from a specified context, passing a set of
         arguments.

         @method _notify
         @param {Function[]} subs The array of subscriber callbacks
         @param {Any} result Value to pass the callbacks
         @protected
         **/
        _notify: function (subs, result) {
            var i, len;

            if (subs) {
                for (i = 0, len = subs.length; i < len; i += 1) {
                    subs[i](result);
                }
            }
        }

    }, true);

    NS.Promise.Resolver = Resolver;

});
