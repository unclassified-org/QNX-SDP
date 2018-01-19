/**
 * Current radio station frequency/channel
 * @author lgreenway@lixar.com
 *
 * $Id: CurrentStation.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.view.radio.tuner.CurrentStation', {
	extend: 'Ext.Label',
	xtype: 'radiocurrentstation',

	config: {
		scroll: false,
		cls: 'radiocurrentstation',

		/**
		 * The radio station
		 */
		station: '',
	},
	
	/**
	 * Updates the station name element in the control.
	 */
	updateStation: function(value, oldValue) {
		this.element.setHtml(value);
	},
});