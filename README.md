## Eve ship comparison tool

See it live [here](http://eve-ship-comparator.herokuapp.com/?frigate).

A ship comparison tool for Eve Online. This is mostly an exploration of sharing code between a nodejs server and a
javascript-enabled client. The client and server share the same object model and many of the same templates. I 
anticipate sharing more template code as the project progresses, eventually being able to render everything client-side
for pushstate-style page updates.

### Directory structure

    .
    ├── Procfile                     - heroku configuration
    ├── client                       - resources available to the client only
    │   ├── css
    │   ├── favicon.ico
    │   ├── img
    │   └── js
    ├── comparator.js                - startup server file
    ├── package.json
    ├── server                       - files available only to the server
    │   ├── controllers
    │   │   ├── ship.js
    │   │   └── util.js
    │   ├── data                     - the sqlite database
    │   │   └── database.sqlite
    │   └── lib                      - service layer
    │       ├── db.js                - db service
    │       ├── micro-template.js    - express-compatible template library
    │       ├── ship-service.js      - query ships from the sqlite database
    │       └── skill-service.js     - query the skill tree for skill info
    └── shared                       - files that both the server and client can make use of
        ├── model                    - the data model shared between client and server
        │   ├── capacitor.js
        │   ├── hpPool.js
        │   ├── ship.js
        │   └── skill.js
        ├── utils                    - utilities that aren't part of the data model
        │   ├── micro-template.js
        │   └── promise.js
        └── views                    - view markup

            
### Templates

The template engine is extremely simple and based off of the YUI Template.Micro utility that [Ryan 
Grove](https://github.com/rgrove) wrote for YUI 3.8.0. I tore it apart and rebuilt it to work without YUI and to
support subtemplate inclusion natively with the special `$` character. For example:

    $('/my/inner/template', { 'with': "DATA" })
    
Will include the template at that path (either on the file system for nodejs, or attached to a global templates object
on the client) with a set of data. Templates are provided by a synthetic memoized URL that collects everything in the
`shared` directory and precompiles them into runnable JS template code.

### Promises

I'm trying to make extensive use of promises, rather than callbacks. I started with the `Q` promise library, but I'm in
the process of porting to [Juan Dopazo](https://github.com/juandopazo)'s [Promises
A+](https://github.com/juandopazo/yui3/pull/4) implementation. It's easier to understand and has a cleaner API, and I
can share it between client and server in novel ways.