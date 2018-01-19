/**
 * Radio tuner band preset
 * @author lgreenway
 *
 * $Id: RadioPreset.js 5983 2013-04-02 15:37:49Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.model.RadioPreset', {
	extend: 'Ext.data.Model',

	config: {
		fields: [
			{name: "station",	type: "float"},
		]
	}
});
