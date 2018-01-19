/**
 * The Metadata proxy is designed to be assigned directly to the Metadata model object, and is used to load metadata
 * information for MediaNodes via the MediaNode's loadMetadata function.
 * 
 * @author lgreenway
 *
 * $Id: Metadata.js 7179 2013-09-13 19:29:55Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.proxy.Metadata', {
	extend: 'Ext.data.proxy.Proxy',
	alias: ['proxy.car.mediaplayer.metadata'],

	config: {
	},
	
	// FIXME: There's something very strange about having another instance of a car.mediaplayer.MediaPlayer here, I think. Use a singleton, maybe?
	/**
	 * The car.mediaplayer MediaPlayer instance used to fetch MediaNode data.
	 * @private
	 */
	mediaPlayer: null,
	
	initialize: function() {
		try{
			// FIXME: Shouldn't be referencing the MediaPlayer controller here. This information would be better situated in an app config
			this.mediaPlayer = new car.mediaplayer.MediaPlayer(MediaPlayer.controller.MediaPlayer.PLAYER_NAME);
		} catch(ex) {
			// TODO: This is a fatal exception
			console.error('Error creating media player instance with name: ' + MediaPlayer.controller.MediaPlayer.PLAYER_NAME);
		}
	},
	
	create: function(operation, callback, scope) {
		operation.setException('Create not supported.');
		operation.setCompleted();
	},

	read: function(operation, callback, scope) {
		var me = this,
			params = operation.getParams();
		
		if(typeof params.mediaSourceId !== 'undefined' && typeof params.mediaSourceId !== 'null'
			&& typeof params.mediaNodeId !== 'undefined' && typeof params.mediaNodeId !== 'null') {
			var readSuccess = function(data) {
				operation.setResultSet(Ext.create('Ext.data.ResultSet', {
					records: Ext.Array.from(data)
				}));
				
				// Set the operation as successful and completed
				operation.setSuccessful();
				operation.setCompleted();
				
				if(typeof callback === 'function') {
					callback.call(scope || me, operation);
				}
			};
			
			// Define the error callback for the browse operation
			var readError = function(error) {
				operation.setException(error);
				operation.setCompleted();
				
				if(typeof callback === 'function') {
					callback.call(scope || me, operation);
				}
			};
			
			if(params.properties) {
				this.mediaPlayer.getExtendedMetadata(params.mediaSourceId, params.mediaNodeId, params.properties, readSuccess, readError);
			} else {
				this.mediaPlayer.getMetadata(params.mediaSourceId, params.mediaNodeId, readSuccess, readError);
			}
		}
	},
	
	update: function(operation, callback, scope) {
		operation.setException('Update not supported.');
		operation.setCompleted();
	},
	
	destroy: function(operation, callback, scope) {
		operation.setException('Destroy not supported.');
		operation.setCompleted();
	},

});