(function(NS) {
    
    var rebuild = document.querySelector('.rebuild-table'),
        compare = document.querySelector('.compare-columns')
    
    
    NS.each = function(objOrArray, fn) {
        for(var k in objOrArray) {
            if(objOrArray.hasOwnProperty(k)) {
                fn(objOrArray[k], k);
            }
        }
    };
    
    
    for(var i = 0, l = NS.model.ships.length; i < l; i += 1) {
        NS.model.ships[i] = new NS.Ship(NS.model.ships[i]);
    }
    
    
    rebuild.addEventListener('click', function() {
        var o = '';
        
        NS.model.ships.reverse();
        
        NS.model.ships.forEach(function(ship, i) {
            o += esc.MicroTemplate.include('/views/shared/ship', ship);
        });
        
        compare.innerHTML = o;
        
    }, false);
    
}(window.esc || (window.esc = {})));