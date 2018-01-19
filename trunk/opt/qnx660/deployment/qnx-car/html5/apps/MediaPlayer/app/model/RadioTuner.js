/**
 * Represents a radio tuner (e.g. AM, FM)
 * @author lgreenway
 *
 * $Id: RadioTuner.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
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
