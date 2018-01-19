/**
 * A lightweight representation of a folder, or media item. Used in browse results, search, and track sessions,
 * where a full set of metadata may not necessarily be required.
 * @author lgreenway
 *
 * $Id$
 */
Ext.define('MediaPlayer.model.MediaNode', {
	extend: 'Ext.data.Model',

	requires: [ 'MediaPlayer.model.Metadata' ],
	
	config: {
		useCache: false,
		fields: [
			{name: "id",		type: "string"},
			{name: "mediaSourceId",	type: "int"},
			{name: "name",		type: "string"},
			{name: "type",		type: "int"},
			{name: "count",	type: "int"},
			{name: "metadata",	type: "auto"},
		]
	},
	
	/**
	 * Loads metadata or extended metadata for the media node.
	 * @param {String[]?} properties The optional set of extended metadata properties to retrieve. If omitted, the
	 * standard set of metadata properties will be loaded.
	 */
	loadMetadata: function(properties) {
		// Ensure we have the node's mediaSourceId, and that the associated media source supports the metadata 
		// or extendedMetadata capabilities
		var mediaSource = Ext.getStore('MediaSources').findRecord('id', this.get('mediaSourceId'));
		if(this.get('id') && mediaSource
				&& ((!properties && mediaSource.hasCapability('metadata'))
					|| (properties && mediaSource.hasCapability('extendedMetadata')))) {
			MediaPlayer.model.Metadata.load(
					this.get('mediaSourceId'),
					this.get('id'),
					properties,
					{
						scope: this,
						success: function(record, operation) {
							// Begin editing the model instance
							this.beginEdit();
							
							// We need to make sure we have at least an empty metadata object
							if(!this.get('metadata')) {
								this.set('metadata', Ext.create('MediaPlayer.model.Metadata'));
							}
							
							if(properties) {
								// Requested extended metadata properties
								// Iterate through each of the properties and add a field in this record's metadata
								// instance for each.
								for(var property in record) {
									this.get('metadata').addExtendedMetadataProperty(property, record[property]);
								}
							} else {
								// Regular metadata request, just set the data
								this.get('metadata').setData(record);
							}
							
							// Commit the changes
							this.endEdit();
							this.fireEvent('metadataLoadSuccess');
						},
						failure: function(record, operation) {
							// Create an empty metadata object
							this.set('metadata', Ext.create('MediaPlayer.model.Metadata'));
							this.fireEvent('metadataLoadFailure');
						}
					}
				);
		}
	}
});