/**
 * Radio tuner band preset
 * @author lgreenway
 *
 * $Id: RadioPreset.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.model.RadioPreset', {
	extend: 'Ext.data.Model',

	config: {
		fields: [
			{name: "station",	type: "float"},
		]
	}
});
