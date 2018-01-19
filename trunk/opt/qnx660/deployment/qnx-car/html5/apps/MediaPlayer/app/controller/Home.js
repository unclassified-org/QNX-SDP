/**
 * The controller responsible for the media player landing page.
 * @author mlapierre
 *
 * $Id: Home.js 5984 2013-04-02 17:46:01Z dkerr@qnx.com $
 */
Ext.define('MediaPlayer.controller.Home', {
	extend: 'Ext.app.Controller',

	config: {
		refs: {
			index: 'homeView',
		},
		control: {
			'homeView > dataview': {
				itemtouchend: 'onItemTap'
			}
		},
	},

	/**
	 * Initializes the controller on app startup
	 */
	init: function() {
		this.getApplication().on({
			home_index: this.onHomeIndex,
			car_driving: this.onDrivingEvent,
			scope: this
		});
	},
	
	/**
	 * Show the home view
	 */
	onHomeIndex: function(args) {
	    if (args && typeof args.action != 'undefined') {
	        switch (args.action) {
	            case 'radio':
	                this.getApplication().fireEvent('radio_index');
	                break;
	
	            case 'audio':
                    this.getApplication().fireEvent('audio_index');
	                break;
	
	            case 'video':
                    this.getApplication().fireEvent('video_index');
	                break;

	            case 'search':
                    this.getApplication().fireEvent('search_index');
	                break;

	            case 'pandora':
	            	this.getApplication().fireEvent('pandora_remote');
	            	break;

				default: 
					Ext.Viewport.setActiveItem(this.getIndex());
	        }
	    } else {
			Ext.Viewport.setActiveItem(this.getIndex());
		}
	},
	
	/**
	 * Method called when an event related to the user's driving is fired
	 * @param e {Object} The event details
	 */
	onDrivingEvent: function(e) {
		//redraw the touch buttons for the new driving state
		Ext.getStore('HomeItems').each(function(record) {
			record.setDriving(e.isDriving);
		}, this);
		
		//if we are in the search view, go back to the index
		if (e.isDriving && Ext.Viewport.getActiveItem().getXTypes().match(/searchView/)) {
			this.onHomeIndex();
		}
	},
	
	/**
	 * Event handler triggered when home view items are tapped
	 * @param dv {Object} The dataview containing the item
	 * @param index {Number} The index of the tapped item
	 * @param item {Object} The item that was tapped
	 * @param e {Object} The triggered event
	 */
	onItemTap: function (dv, index, item, e) {
		var record = dv.getStore().getAt(index);
		if (record.get('safe') || qnx.sensors.get('speed') == 0)
		{
			this.getApplication().fireEvent(record.get('event'));
			console.log(record.get('event'));
		}
	}
});
