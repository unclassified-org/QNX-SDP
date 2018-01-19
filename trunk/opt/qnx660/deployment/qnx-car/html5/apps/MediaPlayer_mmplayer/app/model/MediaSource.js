/**
 * A media source.
 * @author lgreenway
 *
 * $Id: MediaSource.js 7035 2013-08-28 14:19:55Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.model.MediaSource', {
	extend: 'Ext.data.Model',
	
	statics: {
		TYPE_RADIO: 0xFFFFFFFF
	},
	
	requires: [ 'MediaPlayer.model.MediaSourceCapabilities' ],
	
	config: {
		fields: [
			{name: "id",			type: "string"},
			{
				name: "name",
				type: "string",
				convert: function(value) {
					return value || 'Unnamed';
				}
			},
			{name: "uid",			type: "string"},
			{name: "viewName",		type: "string"},
			{name: "type",			type: "int"},
			{name: "ready",			type: "boolean"},
			{name: "capabilities",	type: "auto", defaultValue: {}}
		]
	},
	
	/**
	 * Convenience function to check if this media source supports the specified capability.
	 * @param {String} capability The capability name.
	 * @returns {Boolean} True if the media source supports the specified capability, False if not.
	 */
	hasCapability: function(capability) {
		var hasCapability = false;
		
		if(this.get('capabilities') instanceof MediaPlayer.model.MediaSourceCapabilities
			&& this.get('capabilities').get(capability)) {
			hasCapability = true;
		}
		
		return hasCapability;
	}
});