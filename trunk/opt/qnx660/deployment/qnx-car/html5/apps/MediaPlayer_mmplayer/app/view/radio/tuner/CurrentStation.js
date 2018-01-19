/**
 * Current radio station frequency/channel
 * @author lgreenway@lixar.com
 *
 * $Id: CurrentStation.js 5983 2013-04-02 15:37:49Z lgreenway@qnx.com $
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