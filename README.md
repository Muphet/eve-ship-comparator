## Eve ship comparison tool

See it live [here](http://eve-ship-comparator.herokuapp.com/?frigate).

A ship comparison tool for Eve Online. This is mostly an exploration of sharing
code between a nodejs server and a javascript-enabled client. The client and
server share the same object model and many of the same templates. I anticipate
sharing more template code as the project progresses, eventually being able to
render everything client-side for pushstate-style page updates.

### Directory structure

    .
    ├── Procfile              - heroku configuration
    ├── comparator.js         - the main startup server file
    ├── data                  - the data that powers the system
    ├── controllers           - utility files for URL routing
    │   ├── ship.js          
    │   └── util.js          
    ├── lib                  
    │   ├── db.js             - the interaction layer with the SQLite DB
    │   ├── micro-template.js - A shared super-simple templating engine
    │   ├── ship-service.js   - Provides methods to query for ships
    │   └── skill-service.js  - Provides methods for querying for skills
    ├── model                 - The shared JS object model files
    │   ├── capacitor.js     
    │   ├── hpPool.js        
    │   ├── micro-template.js
    │   ├── ship.js          
    │   └── skill.js         
    ├── assets                - Client-side assets
    └── views                
        ├── compare.html     
        ├── index.html       
        └── shared            - Shared clinet-server templates
            ├── hp.html
            └── ship.html