/**
 * Represents an item on the media home page
 * @author mlapierre
 *
 * $Id: HomeItems.js 6632 2013-06-20 15:18:00Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.model.HomeItems', {
	extend: 'Ext.data.Model',

	config: {
		fields: [
			{name: "label",		type: "string"},
			{name: "cls",		type: "string"},
			{name: "safe",		type: "boolean"},
			{name: "available",	type: "boolean"},
			{name: "event",		type: "string"},
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
