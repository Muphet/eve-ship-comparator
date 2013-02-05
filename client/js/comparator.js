
YUI(ESC_CONFIG).use('io', 'esc-templates', function(Y) {
 
     Y.io('/search?arbitrator', {
         on: {
             success: function(r) {
                 
                 console.log(arguments);
             }
         }
     })
 
 });