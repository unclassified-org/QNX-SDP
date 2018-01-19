/**
 * The abstract MediaNode proxy manages the media player instance used to interface with the car.mediaplayer
 * extension. Subclasses are expected to override the abstract readOperation function to specify the operation
 * to be executed on the media player instance to fetch the desired media node results.
 * 
 * @author lgreenway
 *
 * $Id: MediaNode.js 7179 2013-09-13 19:29:55Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.proxy.MediaNode', {
	extend: 'Ext.data.proxy.Proxy',
	alias: ['proxy.car.mediaplayer.medianode'],

	config: {
		/**
		 * The media source ID of the nodes to fetch.
		 */
		mediaSourceId: null,
		
		/**
		 * Specifies whether metadata should automatically be loaded for every MediaNode loaded via the proxy. Defaults to false.
		 * Setting this configuration value to true can result in slow load operations.
		 * @default false
		 */
		autoLoadMetadata: false
	},
	
	// FIXME: There's something very strange about having another instance of a car.mediaplayer.MediaPlayer here, I think. Use a singleton, maybe?
	/**
	 * The car.mediaplayer MediaPlayer instance used to fetch MediaNode data.
	 * @private
	 */
	mediaPlayer: null,
	
	initialize: function() {
		this.callParent();
		
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
		var me = this;
		
		// Define the success callback for the browse operation
		var readSuccess = function(data) {
			var nodes = [];
			
			for(var i = 0; i < data.length; i++) {
				// Create a MediaNode model instance from the data
				var node = Ext.create(me.getModel(), data[i]),
					mediaSource = Ext.getStore('MediaSources').findRecord('id', node.get('mediaSourceId'));
				
				// Verify that the node's mediaSourceId is known
				if(mediaSource) {
					// Load the metadata automatically if the autoload configuration is set to true
					if(me.getAutoLoadMetadata()) {
						if(node.get('type') === car.mediaplayer.MediaNodeType.AUDIO
								&& mediaSource.hasCapability('metadata')) {
							node.loadMetadata();
						} else if(node.get('type')  === car.mediaplayer.MediaNodeType.FOLDER
								&& mediaSource.hasCapability('extendedMetadata')) {
							node.loadMetadata(['folder_type']);
						}
					}
				} else {
					console.warn('MediaPlayer.proxy.MediaNode::read - Unknown media source ID: ' + node.get('mediaSourceId'));
				}
				
				nodes.push(node);
			}
			
			operation.setResultSet(Ext.create('Ext.data.ResultSet', {
				records: nodes,
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
		
		if(this.readOperation !== Ext.emptyFn) {
			this.readOperation(operation, readSuccess, readError);
		} else {
			console.error('MediaPlayer.proxy.MediaNode::read - readOperation function must be overridden in subclass.');
			readError('Unable to fetch requested data.');
		}
	},
	
	/**
	 * The read operation to execute in order to obtain the desired
	 * media node results. This function must be overridden by the subclass.
	 * @param {Ext.data.Operation} operation The Operation to perform.
	 * @param {Function} readSuccess Success callback.
	 * @param {Function} readError Error callback.
	 * @protected
	 */
	readOperation: Ext.emptyFn,
	
	update: function(operation, callback, scope) {
		operation.setException('Update not supported.');
		operation.setCompleted();
	},
	
	destroy: function(operation, callback, scope) {
		operation.setException('Destroy not supported.');
		operation.setCompleted();
	}

});