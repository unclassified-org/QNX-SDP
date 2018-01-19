/**
 * Represents an item on the home page
 * @author mlapierre
 *
 * $Id: HomeItem.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('Navigation.model.HomeItem', {
	extend: 'Ext.data.Model',

	config: {
		fields: [
			{ name: "label",	type: "string" },
			{ name: "cls",		type: "string" },
			{ name: "safe",		type: "boolean" },
			{ name: "event",	type: "string" },
		]
	},

	/**
	 * Sets the 'driving' class state
	 * @param isDriving {Boolean} true or false
	 */
	setDriving: function(isDriving) {
		if (isDriving) {
			if (this.get('cls').indexOf('driving') < 0) {
				this.set('cls', this.get('cls') + 'driving');
			}
		} else {
			if (this.get('cls').indexOf('driving') >= 0) {
				this.set('cls', this.get('cls').replace('driving', ''));
			}
		}
	},
});
