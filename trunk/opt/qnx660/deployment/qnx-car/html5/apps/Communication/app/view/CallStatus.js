/**
 * Call status view. This view is used when the user is dialing out, and for when the user
 * is in an active phone call.
 * @author lgreenway
 *
 * $Id: CallStatus.js 6099 2013-04-23 18:41:37Z nschultz@qnx.com $
 */
Ext.define('Communication.view.CallStatus', {
	extend: 'Ext.Panel',
	xtype: 'callStatusView',

	/**
	 * @private
	 * The call duration timer interval handle.
	 */
	callDurationTimer: null,
	
	/**
	 * @private
	 * The call duration.
	 */
	callDuration: 0,
	
	/**
	 * Connected state constant.
	 */
	STATE_CONNECTED: 'CONNECTED',
	/**
	 * Disconnected state constant.
	 */
	STATE_DISCONNECTED: 'DISCONNECTED',
	/**
	 * Incoming call state constant.
	 */
	STATE_INCOMING: 'INCOMING',
	/**
	 * Dialing state constant.
	 */
	STATE_DIALING: 'DIALING',
	
	/**
	 * Initialize life cycle handler.
	 */
	initialize: function() {
		// Attach handlers to disable buttons once they've been pressed to prevent double presses.
		// The setCallState function will be responsible for re-enabling the view buttons.
		var buttons = this.query('button');
		for(var button in buttons) {
			buttons[button].on('release', function() {
				for(var i = 0; i < buttons.length; i++) {
					buttons[i].setDisabled(true);
				}
			});
		}
	},
	
	config: {
		cls: 'callStatusView',
		callState: null,
		modal: true,
		centered: true,
		scrollable: false,
		showAnimation: {
			type: 'slide',
			duration: 500,
			direction: 'down'
		},
		hideAnimation: {
			type: 'slide',
			duration: 500,
			direction: 'up',
			out: true
		},
		items: [
		        {
		        	layout: {
		        		type: 'hbox',
		        	},
		        	items: [
		    		        {
		    		        	id: "callStatus",
		    		        	flex: 1,
		    		        	html: ''
		    		        },
		    		        {
		    		        	id: "duration",
		    		        	html: '',
		    		        }
		        	        ]
		        },
		        {
		        	cls: 'contactInfo',
		        	layout: {
		        		type: 'hbox',
		        		align: 'center',
		        		pack: 'start',
			        	flex: 1,
		        	},
		        	items: [
		        	        {
		        	        	xtype: "component",
		        	        	id: "contactLogo",
		        	        },
		        	        {
		        	        	layout: {
		        	        		type: 'vbox',
		        	        		pack: 'start',
		        	        		align: 'start',
		    			        	flex: 1,
		        	        	},
		        	        	defaults: {
		        	        		xtype: 'label',
		        	        		cls: 'infoLabel',
		        	        	},
		        	        	items: [
		        	        	        {
		        	        	        	id: "contactName",
		        	        	        	html: ''
		        	        	        },
		        	        	        {
		        	        	        	id: "contactCompany",
		        	        	        	html: ''
		        	        	        },
		        	        	        {
		        	        	        	id: "contactJobTitle",
		        	        	        	html: ''
		        	        	        },
		        	        	        ]
		        	        }
		        	        ]
		        },
    	        {
    	        	id: "callId",
    	        	xtype: 'label',
    	        	align: 'center',
    	        	pack: 'center',
    	        	html: ''
    	        },
		        {
		        	cls: "buttons",
		        	layout: {
		        		type: 'hbox',
		        		align: 'center',
		        		pack: 'center'
		        	},
		        	items: [
		        	        {
		        	        	xtype:"button",
		        	        	id:"acceptBt"
		        	        },
		        	        {
		        	        	xtype:"button",
		        	        	id:"declineBt"
		        	        },
		        	        {
		        	        	xtype:"button",
		        	        	id:"hangupBt"
		        	        },
		        	        ]
		        }
		        ]
	},
	
	/**
	 * Displays the specified callId in the view.
	 * @param callId {String} The call ID (e.g. phone number).
	 */
	setCallId: function(callId) {
		this.down('#callId').setHtml(callId || 'Unknown');
	},
	
	/**
	 * Sets the contact information for the view.
	 * @param {Communication.model.Contact} contact The contact model object.
	 */
	setContact: function(contact) {
		var contactName = 'Unknown';
		
		if(contact) {
			if((contact.get('firstName') || contact.get('lastName'))) {
				contactName = (contact.get('firstName') + ' ' || '') + (contact.get('lastName') || '');
			}
			this.down('#contactCompany').setHtml(contact.get('company') ? contact.get('company') || '' : '');
			this.down('#contactJobTitle').setHtml(contact.get('jobTitle') ? contact.get('jobTitle') || '' : '');
			this.down('#contactLogo').element.dom.style.backgroundImage = contact.get('picture') ? 'url(file://' + contact.get('picture')+')' : '';
		}
		
		this.down('#contactName').setHtml(contactName);
	},
	
	/**
	 * @private
	 * Starts the call duration timer.
	 */
	startCallDurationTimer: function() {
		this.setCallDuration(0);
		
		// Stop the timer if it's already going
		if(this.callDurationTimer) {
			this.stopCallDurationTimer();			
		}
		
		// Create the timer
		this.callDurationTimer = setInterval(function() { this.setCallDuration(this.callDuration + 1); }.bind(this), 1000);
	},
	
	/**
	 * @private
	 * Stops the call duration timer.
	 */
	stopCallDurationTimer: function() {
		if(this.callDurationTimer) {
			clearInterval(this.callDurationTimer);
			this.callDurationTimer = null;
		}
	},

	/**
	 * @private
	 * Sets the call duration and updates the view.
	 */
	setCallDuration: function(duration) {
		this.callDuration = duration;

		var hours = Math.floor(this.callDuration / 3600);
		var remainsMinutes = this.callDuration - hours * 3600;
		var minutes = Math.floor(remainsMinutes / 60);
		var seconds = remainsMinutes - minutes * 60;

		var hoursString = (hours > 0 ? (hours > 9 ? hours : '0' + hours) + ':' : '');
		var minutesString = (minutes > 9 ? minutes : '0' + minutes) + ':';
		var secondsString = (seconds > 9 ? seconds : '0' + seconds);

		this.down('#duration').setHtml(hoursString + minutesString + secondsString);
	},
	
	/**
	 * callState configuration option update hook. This function is responsible for showing/hiding
	 * necessary controls and starting/stopping the call timer for the specified state.
	 * @param {String} newState The new call state. Ex:
	 * - INCOMING
	 * - DIALING
	 * - CONNECTED
	 * - DISCONNECTED
	 * @param {String} oldState The previous call state.
	 */
	updateCallState: function(newState, oldState) {
		if(newState == this.STATE_INCOMING) {
			// Change the call status text
			this.down('#callStatus').setHtml('Incoming Call...');
			
			// Show/hide appropriate buttons
			this.down('#acceptBt').show().setDisabled(false);
			this.down('#declineBt').show().setDisabled(false);
			this.down('#hangupBt').hide();
			
			// Hide the call duration
			this.down('#duration').hide();
		} else if(newState == this.STATE_DIALING) {
			// Set the call status text
			this.down('#callStatus').setHtml('Dialing...');
			
			// Show/hide appropriate buttons
			this.down('#acceptBt').hide();
			this.down('#declineBt').hide();
			this.down('#hangupBt').show().setDisabled(false);
			
			// Hide the call duration
			this.down('#duration').hide();
		} else if(newState == this.STATE_CONNECTED) {
			// Start the call duration timer
			this.startCallDurationTimer();

			// Set the call status text
			this.down('#callStatus').setHtml('In Call');
			
			// Show/hide appropriate buttons
			this.down('#acceptBt').hide();
			this.down('#declineBt').hide();
			this.down('#hangupBt').show().setDisabled(false);
			
			// Show the call duration
			this.down('#duration').show();
		} else if(newState == this.STATE_DISCONNECTED) {
			// Stop the call duration timer
			this.stopCallDurationTimer();

			// Set the call status text
			this.down('#callStatus').setHtml('Call Ended');

			// Disable the end call button since it can no longer be used
			this.down('#acceptBt').setDisabled(true);
			this.down('#declineBt').setDisabled(true);
			this.down('#hangupBt').setDisabled(true);
		}
	}
	
});