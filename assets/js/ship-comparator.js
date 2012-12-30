(function(NS) {
    
    var rebuild = document.querySelector('.rebuild-table'),
        compare = document.querySelector('.compare-columns')
    
    
    rebuild.addEventListener('click', function() {
        var o = '';
        
        NS.model.ships.forEach(function(ship, i) {
            // <%== this.include('/views/shared/ship', ship) %>
            // <% if(i%4 == 3) { %>
            //     <div style="clear:both; border-top: 1px solid #ddddc5; padding: 0 0 10px"></div>
            // <% } %> 
            
            o += esc.MicroTemplate.include('/views/shared/ship', ship);
            
            if(i%4 === 3) {
                o += '<div style="clear:both; border-top: 1px solid #ddddc5; padding: 0 0 10px"></div>';
            }
        });
        
        compare.innerHTML = o;
        
    }, false);
    
}(window.esc || (window.esc = {})));