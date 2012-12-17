
YUI({
	skin: 'night',
	insertBefore: 'main-styles'
}).use('io', 'template', 'node-event-delegate', 'autocomplete', function(Y) {

	var micro = new Y.Template();

	var shipResult = micro.compile([
			'<img class="ship-result-image" src="/img/ships/<%= this.id %>.png" width="32" height="32" />',
			'<span class="ship-result-name"><%= this.name %></span>',
			'<span class="ship-result-type"><%= this.type %></span>',
			'<span class="ship-faction-name"><%= this.race %></span>'
		].join(''));

		item = Y.one('#ship-picker').plug(Y.Plugin.AutoComplete, {
			source: '/ship/byNameOrType/{query}',
			resultHighlighter: 'phraseMatch',
			resultTextLocator: 'name',
			minQueryLength: 2,

			resultFormatter: function(query, results) {
				return Y.Array.map(results, function(r) {
					return shipResult(r.raw);
				});
			}
		});

	item.ac.on('select', function(evt) {
		window.ship = new esc.Ship(evt.result.raw);

		Y.one('#ship-display').setHTML(JSON.stringify(window.ship, null, '\t'));
	});
});