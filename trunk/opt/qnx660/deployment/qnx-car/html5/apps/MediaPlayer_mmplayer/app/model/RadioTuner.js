/**
 * Represents a radio tuner (e.g. AM, FM)
 * @author lgreenway
 *
 * $Id: RadioTuner.js 5983 2013-04-02 15:37:49Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.model.RadioTuner', {
	extend: 'Ext.data.Model',

	config: {
		fields: [
			{name: "type",		type: "string"},
			{name: "rangeMin",	type: "float"},
			{name: "rangeMax",	type: "float"},
			{name: "rangeStep",	type: "float"},
		]
	}
});
