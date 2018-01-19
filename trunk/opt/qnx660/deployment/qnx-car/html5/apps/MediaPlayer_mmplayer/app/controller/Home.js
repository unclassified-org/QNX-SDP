/**
 * The controller responsible for the media player landing page.
 * @author mlapierre
 *
 * $Id: Home.js 7081 2013-09-05 15:12:07Z lgreenway@qnx.com $
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
		Ext.Viewport.setActiveItem(this.getIndex());
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
		this.getApplication().fireEvent(record.get('event'));
		console.log(record.get('event'));
	}
});
