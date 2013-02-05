## Eve ship comparison tool

See it live [here](http://eve-ship-comparator.herokuapp.com/?frigate).

API documentation (in progress) can be found [here](http://nhusher.github.com/eve-ship-comparator/apidocs/).

A ship comparison tool for Eve Online. This is mostly an exploration of sharing code between a nodejs server and a
javascript-enabled client. The client and server share the same object model and many of the same templates. I 
anticipate sharing more template code as the project progresses, eventually being able to render everything client-side
for pushstate-style page updates.

### Directory structure

    .
    ├── Procfile
    ├── client
    │   ├── css
    │   │   └── ship-comparator.css
    │   ├── favicon.ico
    │   ├── img
    │   │   ├── badges
    │   │   │   ├── faction.png
    │   │   │   ├── tech-1.png
    │   │   │   ├── tech-2.png
    │   │   │   ├── tech-3.png
    │   │   ├── icons
    │   │   └── ships
    │   │       └── 12345.png
    │   └── js
    │       └── comparator.js
    ├── comparator.js
    ├── conf
    │   ├── config.js
    │   └── config.json
    ├── package.json
    ├── server
    │   ├── controllers
    │   │   ├── ship.js
    │   │   └── util.js
    │   ├── data
    │   │   └── database.sqlite
    │   └── lib
    │       ├── select.js
    │       ├── ship-service.js
    │       ├── skill-service.js
    │       └── sqlite.js
    ├── server.js
    ├── shared
    │   ├── model
    │   │   ├── hp-pool.js
    │   │   ├── ship-properties.js
    │   │   ├── ship.js
    │   │   └── skill.js
    │   ├── utils
    │   │   ├── micro-template.js
    │   │   └── promise.js
    │   └── views
    │       ├── compare.html
    │       ├── index.html
    │       ├── layouts
    │       │   └── main.html
    │       └── partials
    │           └── ship.html
    └── yuidoc.json

