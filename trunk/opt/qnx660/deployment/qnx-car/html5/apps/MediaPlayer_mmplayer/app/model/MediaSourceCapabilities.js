/**
 * A media source's capabilities.
 * @author lgreenway
 *
 * $Id: MediaSourceCapabilities.js 7179 2013-09-13 19:29:55Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.model.MediaSourceCapabilities', {
	extend: 'Ext.data.Model',
	
	config: {
		fields: [
			{name: "play",			type: "boolean"},
			{name: "pause",			type: "boolean"},
			{name: "stop",			type: "boolean"},
			{name: "next",			type: "boolean"},
			{name: "previous",		type: "boolean"},
			{name: "seek",			type: "boolean"},
			{name: "playbackRate",	type: "boolean"},
			{name: "position",		type: "boolean"},
			{name: "shuffle",		type: "boolean"},
			{name: "repeatOne",		type: "boolean"},
			{name: "repeatAll",		type: "boolean"},
			{name: "metadata",		type: "boolean"},
			{name: "extendedMetadata",	type: "boolean"},
			{name: "search",		type: "boolean"}
		],
	}
}); 