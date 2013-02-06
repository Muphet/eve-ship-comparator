YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "esc.CompareView",
        "esc.model.Capacitor",
        "esc.model.Capacity",
        "esc.model.DamageProfile",
        "esc.model.Drones",
        "esc.model.Heat",
        "esc.model.HpPool",
        "esc.model.JumpDrive",
        "esc.model.Sensors",
        "esc.model.Shield",
        "esc.model.Ship",
        "esc.model.Skill",
        "esc.model.SkillRequirement",
        "esc.model.SkillRequirements",
        "esc.model.Slots",
        "esc.service.ShipService",
        "esc.service.SkillService",
        "esc.util.Criteria",
        "esc.util.Database",
        "esc.util.MicroTemplate",
        "esc.util.Promise",
        "esc.util.Promise.Resolver",
        "esc.util.Query",
        "esc.util.Select"
    ],
    "modules": [
        "esc-compare-view",
        "esc-hp-pool",
        "esc-micro-template",
        "esc-promise",
        "esc-select",
        "esc-ship",
        "esc-ship-properties",
        "esc-ship-service",
        "esc-skill",
        "esc-skill-service",
        "esc-sqlite"
    ],
    "allModules": [
        {
            "displayName": "esc-compare-view",
            "name": "esc-compare-view"
        },
        {
            "displayName": "esc-hp-pool",
            "name": "esc-hp-pool",
            "description": "Objects, classes, and methods related to hit point pools for ships in Eve Online. Includes calculating EHP based on a number of strategies (EFT, and CCP's own calculations) and different damage profiles (Gursita, Amarr, Serpentis, etc.)."
        },
        {
            "displayName": "esc-micro-template",
            "name": "esc-micro-template"
        },
        {
            "displayName": "esc-promise",
            "name": "esc-promise",
            "description": "Wraps the execution of asynchronous operations, providing a promise object that\ncan be used to subscribe to the various ways the operation may terminate.\n\nWhen the operation completes successfully, call the Resolver's `fulfill()`\nmethod, passing any relevant response data for subscribers.  If the operation\nencounters an error or is unsuccessful in some way, call `reject()`, again\npassing any relevant data for subscribers.\n\nThe Resolver object should be shared only with the code resposible for\nresolving or rejecting it. Public access for the Resolver is through its\n_promise_, which is returned from the Resolver's `promise` property. While both\nResolver and promise allow subscriptions to the Resolver's state changes, the\npromise may be exposed to non-controlling code. It is the preferable interface\nfor adding subscriptions.\n\nSubscribe to state changes in the Resolver with the promise's\n`then(callback, errback)` method.  `then()` wraps the passed callbacks in a\nnew Resolver and returns the corresponding promise, allowing chaining of\nasynchronous or synchronous operations. E.g.\n`promise.then(someAsyncFunc).then(anotherAsyncFunc)`"
        },
        {
            "displayName": "esc-select",
            "name": "esc-select",
            "description": "A tool to make it easier to build complex SQL queries."
        },
        {
            "displayName": "esc-ship",
            "name": "esc-ship"
        },
        {
            "displayName": "esc-ship-properties",
            "name": "esc-ship-properties"
        },
        {
            "displayName": "esc-ship-service",
            "name": "esc-ship-service"
        },
        {
            "displayName": "esc-skill",
            "name": "esc-skill",
            "description": "Classes and objects having to do with skill requirements for ships."
        },
        {
            "displayName": "esc-skill-service",
            "name": "esc-skill-service"
        },
        {
            "displayName": "esc-sqlite",
            "name": "esc-sqlite"
        }
    ]
} };
});