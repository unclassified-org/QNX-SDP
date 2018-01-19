/**
 * Represents a single menu item
 * @author mlapierre
 *
 * $Id: MenuItem.js 5983 2013-04-02 15:37:49Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.model.MenuItem', {
	extend: 'Ext.data.Model',

	config: {
		fields: [
			{name: "label",	type: "string"},
			{name: "type",	type: "string"},
		]
	}
});
