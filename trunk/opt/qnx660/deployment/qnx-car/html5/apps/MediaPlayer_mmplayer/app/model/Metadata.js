/**
 * Represents a single media item, audio or video, distinguished by its type.
 * @author lgreenway
 *
 * $Id$
 */
Ext.define('MediaPlayer.model.Metadata', {
	extend: 'Ext.data.Model',
	
	requires: [ 'MediaPlayer.proxy.Metadata' ],

	statics: {
		/**
		 * @override
		 * Loads a metadata object.
		 * @param {Number} mediaSourceId The media source ID.
		 * @param {String} mediaNodeId The media node ID.
		 * @param {String[]?} properties The list of extended metadata properties to retrieve.
		 * @param {Object} [config] Config object containing success, failure and callback functions, plus optional scope.
		 * @param {Object} [scope] The scope to use for callback execution.
		 * @static
		 */
		load: function(mediaSourceId, mediaNodeId, properties, config, scope) {
			var proxy = this.getProxy(),
			record = null,
			params = {},
			callback, operation;

			scope = scope || (config && config.scope) || this;
			if (Ext.isFunction(config)) {
				config = {
					callback: config,
					scope: scope
				};
			}
	
			params.mediaSourceId = mediaSourceId;
			params.mediaNodeId = mediaNodeId;
			params.properties = properties;
			
			config = Ext.apply({}, config);
			config = Ext.applyIf(config, {
				action: 'read',
				params: params,
				model: this
			});
	
			operation  = Ext.create('Ext.data.Operation', config);
	
			if (!proxy) {
				Ext.Logger.error('You are trying to load a model that doesn\'t have a Proxy specified');
			}
	
			callback = function(operation) {
				if (operation.wasSuccessful()) {
					record = operation.getRecords()[0] || null;
					Ext.callback(config.success, scope, [record, operation]);
				} else {
					Ext.callback(config.failure, scope, [record, operation]);
				}
				Ext.callback(config.callback, scope, [record, operation]);
			};
	
			proxy.read(operation, callback, this);
		}
	},
	
	config: {
		proxy: { type: 'car.mediaplayer.metadata' },
		
		fields: [
			{name: "title",		type: "string"},
			{name: "duration",	type: "int"},
			{name: "artwork",	type: "string"},
			{name: "artist",	type: "string"},
			{name: "album",		type: "string"},
			{name: "genre",		type: "string"},
			{name: "year",		type: "string"},
			{name: "disc",		type: "int"},
			{name: "track",		type: "int"},
			{name: "width",		type: "int"},
			{name: "height",	type: "int"},
		]
	},
	
	/**
	 * Adds an extended metadata property to this model instance.
	 * @param {String} name The property name.
	 * @param {Mixed} value The value for the new property.
	 */
	addExtendedMetadataProperty: function(name, value) {
		var fields = this.getFields(),
			data = this.getData();
		
		fields.add(name, Ext.create('Ext.data.Field', {name: name, type: 'auto'}));

		// Set the new fields
		this.setFields(fields);
		
		// Add the new property and value to the data
		data[name] = value;
		
		// Restore the data
		this.setData(data);
	}
});