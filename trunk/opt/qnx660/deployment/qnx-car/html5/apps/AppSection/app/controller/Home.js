/**
 * The abstract controller for the Home view.
 * @author dkerr
 *
 * $Id: Home.js 5946 2013-03-26 15:53:00Z mlytvynyuk@qnx.com $
 */
Ext.define('AppSection.controller.Home', {

	extend:'Ext.app.Controller',

	config:{
		refs:{
			home:{
				selector:'homeView'
			},
			modalWindow:{
				selector:'modalwindow',
				autoCreate:true
			},
			categoryButtonSet:{
				selector:'appCategoryToolbar segmentedbutton'
			},
			categoryButton:{
				selector:'appCategoryToolbar button'
			}
		},
		control:{
			'dataview':{
				itemtap:'onItemTap'
			},
			modalWindow:{
				hideanimationstart:'onModalWindowHideAnimationStart'
			}
		}
	},

    /** Defines that application cannot be launched */
    APP_STATUS_LOCKED: "locked",
    /** Defines that application can be launched */
    APP_STATUS_AVAILABLE: "",

	currentApp:null,
	launching:false, // defines is current application being launched, used to filter out mm-renderer events

	/**
	 * Initializes the controller on app startup
	 */
	init:function () {
		this.allStore = Ext.getStore('All');
		this.vehicleStore = Ext.getStore('Vehicle');
		this.mediaStore = Ext.getStore('Media');
		this.internetStore = Ext.getStore('Social');
		this.gamesStore = Ext.getStore('Games');

		this.getApplication().on({
			applicationPPS_event:this.onApplicationPPSEvent,
			reselect_event:this.onReselectEvent,
			resume_event:this.onResumeEvent,
			car_driving:this.onDrivingEvent.bind(this),
			scope:this
		});

		this.onApplicationPPSEvent();
	},

	/**
	 * Event handler invoked when list of app changes
	 * populates main applicaiton list
	 *
	 * @param event {Object} Not in use
	 * */
	onApplicationPPSEvent:function () {
		var obj = qnx.application.getList(),
			list = [];
		for (var item in obj) {
			list.push(obj[item])
		}

		// set data to the stores
		this.allStore.removeAll();
		this.allStore.add(list);
		this.vehicleStore.removeAll();
		this.vehicleStore.add(list);
		this.mediaStore.removeAll();
		this.mediaStore.add(list);
		this.internetStore.removeAll();
		this.internetStore.add(list);
		this.gamesStore.removeAll();
		this.gamesStore.add(list);
	},

	/**
	 * Event handler to handle tap on application
	 *
	 * @param dv : {Object} Ext.dataview.DataView
	 * @param index : {Object} Number The index of the item tapped
	 * @param item : {Object} Ext.Element/Ext.dataview.component.DataItem The element or DataItem tapped
	 * @param e : {Object} Ext.EventObject The event object
	 * */
	onItemTap:function (dv, index, item, e) {
		
		if (!dv.getDisabled()) {
			var record = dv.getStore().getAt(index);
			// should allow to start app only when vehicle is parked,

			if (record.get('status') != this.APP_STATUS_LOCKED) {
				this.currentApp = record.get('name');
				
				// PR:255626 - This patch prevents multiple taps. A timeout is easier to manage than 
				// handling app stop and error events.
				dv.disable();
				setTimeout(function() {
					dv.enable();
				},1500);

				// the receiver of this request should handle multiple requests
				qnx.application.start(this.currentApp);
			}
		}
	},

	/*
	 * Handles the reselect event. 
	 * @param args {Object} - for future use
	 */
	onReselectEvent: function (args) {
		// for future use
	},

	/**
	 * Handles the resume event. At present, the resume event may have optional args to launch or close applications.
	 * Launching is done by the Navigator - AppSection is essentially just an extension of the Navigator application.
	 * @param args {Object}
	 * Ex. args {
	 *	   req: {String} - the operation. either 'launch' or 'close'
	 *	   dat: {String} - application name to set as the current App
	 * }
	 */
	onResumeEvent: function (args) {
        // for future use
	},

	/**
	 * Method called when an event related to the user's driving is fired
	 * @param e {Object} The event details
	 */
	onDrivingEvent:function (e) {
		if (e && typeof e.isDriving != "undefined" && e.isDriving != null) {

			// push stores in array
			var stores = [this.allStore, this.vehicleStore, this.gamesStore, this.mediaStore, this.internetStore];

			// loop stores
			for (var s = 0; s < stores.length; s++) {
				var store = stores[s];
				if (store) {
					var self = this;
					// loop records in the store
					store.each(function (record) {
						//disable app items
						if (e.isDriving) {
							record.set('status', self.APP_STATUS_LOCKED);
						} else {
							record.set('status', self.APP_STATUS_AVAILABLE);
						}
					});
				}
			}
		}
	}
});