
YUI({
	skin: 'night',
	insertBefore: 'main-styles'
}).use('io', 'template', 'node-event-delegate', 'autocomplete', function(Y) {
	var micro = new Y.Template(),
		list = Y.one('.ship-comparator-table .ship-list'),

		comparisons = [],

		shipRow = micro.compile([
			'<tr class="ship-row">',
				'<td class="ship-image"><img class="ship-image" src="/img/ships/<%= this.typeID %>.png" /></td>',
				'<td class="ship-type-name"><%= this.typeName %></td>',
				'<td><%= this.attributes.hp %></td>',
				'<td><%= this.attributes.armorHP %></td>',
				'<td><%= this.attributes.shieldCapacity %></td>',
				'<td><%= this.attributes.powerOutput %></td>',
				'<td><%= this.attributes.cpuOutput %></td>',
				'<td><%= this.attributes.capacitorCapacity %></td>',
				'<td><%= this.attributes.rechargeRate / 1000 %>s</td>',
				'<td><%= this.peakRecharge.toFixed(1) %></td>',
				'<td><%= this.attributes.signatureRadius %></td>',
				'<td class="slot-col high-slot-col"><%= this.attributes.hiSlots %></td>',
				'<td class="slot-col med-slot-col"><%= this.attributes.medSlots %></td>',
				'<td class="slot-col low-slot-col"><%= this.attributes.lowSlots %></td>',
				'<td><%= this.attributes.maxVelocity %>m/s</td>',
			'</tr>'
		].join('')),

		 shipResult = micro.compile([
			'<img class="ship-result-image" src="/img/ships/<%= this.typeID %>.png" width="32" height="32" />',
			'<span class="ship-result-name"><%= this.typeName %></span>',
			'<span class="ship-result-type"><%= this.groupName %></span>',
			'<span class="ship-faction-name"><%= this.marketGroupName %></span>'
		].join(''));


	function showShip(newShipId) {
		shipId = newShipId;

		var img = new Image();
		img.src = '/img/ships/' + newShipId + '.png'; // preload new ship image

		Y.io('/ship/byId/' + newShipId, {
			on: {
				success: function(id, res) {
					var shipData = JSON.parse(res.responseText),
						maxCap = shipData.attributes.capacitorCapacity,
						rechargeTime = shipData.attributes.rechargeRate;

					shipData.peakRecharge = Math.sqrt(0.25) * 2 * maxCap / (rechargeTime / 5000);

					list.get('parentNode').removeClass('empty');
					list.append(shipRow(shipData))

				}
			}
		});
	}

	Y.one('.ship-comparator-table .ship-list').delegate('click', function(evt) {
		this.get('parentNode').remove();
	}, 'td');

	var item = Y.one('#ship-picker').plug(Y.Plugin.AutoComplete, {
		source: '/ship/byNameOrType/{query}',
		resultHighlighter: 'phraseMatch',
		resultTextLocator: 'typeName',
		minQueryLength: 2,

		resultFormatter: function(query, results) {
			return Y.Array.map(results, function(r) {
				// r.raw.factionName = FACTIONS[r.raw.raceID];

				return shipResult(r.raw);
			});
		}
	});

	item.ac.after('select', function(e) {
		showShip(e.result.raw.typeID);
		item.set('value', '');
		comparisons.push(e.result.raw.typeID);
	});

	/*
	Y.one('#save-comparison').on('click', function(evt) {
		Y.io('/save/comparisons', {
			data: comparisons,
			on: {
				success: function(id, res) {
					console.log(res);
				}
			}
		});
	});
	*/
});