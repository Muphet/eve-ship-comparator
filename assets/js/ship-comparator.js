
YUI().use('io', 'template', 'node-event-delegate', 'autocomplete', function(Y) {
	var micro = new Y.Template(),
		list = Y.one('.ship-comparator-table .ship-list'),

		shipRow = micro.compile([
			'<tr class="ship-row">',
				'<td><img class="ship-image" src="/img/ships/<%= this.typeID %>.png" /></td>',
				'<td><%= this.typeName %></td>',
				'<td><%= this.attributes.hp %></td>',
				'<td><%= this.attributes.armorHP %></td>',
				'<td><%= this.attributes.shieldCapacity %></td>',
				'<td><%= this.attributes.signatureRadius %></td>',
				'<td><%= this.attributes.maxVelocity %></td>',
			'</tr>'
		].join('')),

		 shipResult = micro.compile([
			'<img class="ship-result-image" src="/img/ships/<%= this.typeID %>.png" width="32" height="32" />',
			'<span class="ship-result-name"><%= this.typeName %></span>',
			'<span class="ship-result-type"><%= this.groupName %></span>'
		].join(''));

		shipId = 582;

	function showShip(newShipId) {
		shipId = newShipId;

		var img = new Image();
		img.src = '/img/ships/' + newShipId + '.png'; // preload new ship image

		Y.io('/ship/byId/' + newShipId, {
			on: {
				success: function(id, res) {
					var shipData = JSON.parse(res.responseText);

					list.append(shipRow(shipData))

				}
			}
		});
	}

	Y.one('.ship-comparator-table .ship-list').delegate('click', function(evt) {
		this.get('parentNode').remove();
	}, 'td');

	var item = Y.one('#ship-picker input').plug(Y.Plugin.AutoComplete, {
		source: '/ship/byNameOrType/{query}',
		resultHighlighter: 'phraseMatch',
		resultTextLocator: 'typeName',
		minQueryLength: 3,

		resultFormatter: function(query, results) {
			return Y.Array.map(results, function(r) {
				return shipResult(r.raw);
			});
		}
	});

	item.ac.after('select', function(e) {
		showShip(e.result.raw.typeID);
		item.set('value', '');
	});


});