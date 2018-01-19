/**
 * Radio tuner band preset
 * @author lgreenway
 *
 * $Id: RadioPreset.js 2475 2012-05-14 20:43:55Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.model.RadioPreset', {
	extend: 'Ext.data.Model',

	config: {
		fields: [
			{name: "freq",	type: "float"},
		]
	}
});
