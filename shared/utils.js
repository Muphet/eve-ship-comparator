(function(ns) {

    function mix (receiver, supplier, overwrite) {
        var exists,
            key,
            hasOwn = Object.prototype.hasOwnProperty;

        for (key in supplier) {
            if (!hasOwn.call(supplier, key)) {
                continue;
            }

            exists = overwrite ? false : key in receiver;

            if (!exists) {
                receiver[key] = supplier[key];
            }
        }

        return receiver;
    }

    function extend (receiver, supplier, receiverProperties, receiverStatics) {
        var supplierProto = supplier.prototype,
            receiverProto = Object.create(supplierProto);

        receiver.prototype = receiverProto;

        receiverProto.constructor = receiver;
        receiver.superclass = supplierProto;

        if (supplier != Object && supplierProto.constructor == Object.prototype.constructor) {
            supplierProto.constructor = supplier;
        }

        // add prototype overrides
        if (receiverProperties) {
            mix(receiverProto, receiverProperties, true);
        }

        // add object overrides
        if (receiverStatics) {
            mix(receiver, receiverStatics, true);
        }

        return receiver;
    }
    
    function sub(s, o) {
        return s.replace ? s.replace(/\{\s*([^|}]+?)\s*(?:\|([^}]*))?\s*\}/g, function (match, key) {
            return typeof o[key] === 'undefined' ? match : o[key];
        }) : s;
    }

    ns.sub = sub;
    ns.mix = mix;
    ns.extend = extend;

}(typeof process !== 'undefined' ? exports : window));
