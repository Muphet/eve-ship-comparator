YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "esc.Capacitor",
        "esc.Capacity",
        "esc.DamageProfile",
        "esc.Drones",
        "esc.Heat",
        "esc.HpPool",
        "esc.JumpDrive",
        "esc.Sensors",
        "esc.Shield",
        "esc.Ship",
        "esc.Skill",
        "esc.SkillRequirement",
        "esc.SkillRequirements",
        "esc.Slots"
    ],
    "modules": [
        "esc-hp-pool",
        "esc-ship",
        "esc-ship-properties",
        "esc-skill"
    ],
    "allModules": [
        {
            "displayName": "esc-hp-pool",
            "name": "esc-hp-pool",
            "description": "Objects, classes, and methods related to hit point pools for ships in Eve Online. Includes calculating EHP based on a number of strategies (EFT, and CCP's own calculations) and different damage profiles (Gursita, Amarr, Serpentis, etc.)."
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
            "displayName": "esc-skill",
            "name": "esc-skill",
            "description": "Classes and objects having to do with skill requirements for ships."
        }
    ]
} };
});