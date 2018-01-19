/**
 * The controller responsible for handling phone status events, and the call status view.
 * @author lgreenway
 *
 * $Id: CallStatus.js 7261 2013-09-26 14:53:11Z mlapierre@qnx.com $
 */
Ext.define('Communication.controller.CallStatus', {

	extend: 'Ext.app.Controller',

	config:{
		refs:{
			callStatusView: { selector: 'callStatusView', xtype: 'callStatusView', autoCreate: true },
			acceptCallButton:'callStatusView #acceptBt',
			declineCallButton:'callStatusView #declineBt',
			endCallButton:'callStatusView #hangupBt'
		},
		control:{
			acceptCallButton:{
				release:function (e) {
					this.onAcceptCall(e);
				}
			},
			declineCallButton:{
				release:function (e) {
					this.onDeclineCall(e);
				}
			},
			endCallButton:{
				release:function (e) {
					this.onEndCall(e);
				}
			}
		}
	},

	/**
	 * Initializes the controller on app startup
	 */
	init: function() {
		this.getApplication().on({
			callstatus_dialing: this.onDialing,
			scope: this
		});
		
		if (window.cordova) {
			// Register call status events
			document.addEventListener('phoneincoming', this.onIncomingCall.bind(this));
			document.addEventListener('phonedialing', this.onDialing.bind(this));
			document.addEventListener('phonecallactive', this.onCallActive.bind(this));
			document.addEventListener('phoneready', this.onPhoneReady.bind(this));

		} else {
			// Register call status events
			blackberry.event.addEventListener('phoneincoming', this.onIncomingCall.bind(this));
			blackberry.event.addEventListener('phonedialing', this.onDialing.bind(this));
			blackberry.event.addEventListener('phonecallactive', this.onCallActive.bind(this));
			blackberry.event.addEventListener('phoneready', this.onPhoneReady.bind(this));
		}
	},

	/**
	 * Application launch life cycle handler.
	 * */
	launch: function() {
	},

	/**
	 * Attempts to find the related qnx.bluetooth.pbap.Contact instance from the provided callId.
	 * If multiple matches are found for the provided callId, a null value is returned.
	 * @param {String} callId The callId (phone number) of the contact.
	 * @returns {Communication.model.Contact} A Contact model object populated with the found contact information.
	 */
	findContactByCallId: function(callId) {
		var fe = qnx.bluetooth.pbap.FilterExpression,
			rawCallId = typeof(callId) === 'string' ? callId.replace(/[^0-9]/g, '') : '',
			significantDigits = 7,	// NOTE: This assumes that the phone numbers we're checking against are significantly unique to 7 digits, starting from the right
			contact = null;
		
		// Get all contacts with a matching last digit of the callId
		if(rawCallId.length > 0) {
			var	pos = -1,	// The digit offset, starting from the right
				pattern = '%' + rawCallId.substr(pos,1),
				contacts = qnx.bluetooth.pbap.find(
									new fe(
											new fe(qnx.bluetooth.pbap.FIELD_HOME_PHONE, 'LIKE', pattern),
											'OR',
											new fe(
													new fe(qnx.bluetooth.pbap.FIELD_HOME_PHONE_2, 'LIKE', pattern),
													'OR',
													new fe(
															new fe(qnx.bluetooth.pbap.FIELD_WORK_PHONE, 'LIKE', pattern),
															'OR',
															new fe(
																	new fe(qnx.bluetooth.pbap.FIELD_WORK_PHONE_2, 'LIKE', pattern),
																	'OR',
																	new fe(
																			new fe(qnx.bluetooth.pbap.FIELD_MOBILE_PHONE, 'LIKE', pattern),
																			'OR',
																			new fe(qnx.bluetooth.pbap.FIELD_OTHER_PHONE, 'LIKE', pattern)))))));

			// Attempt to find an exact match in the results
			for (var i = 0; i < contacts.length; i++) {
				// Get the sanitized number data for this contact
				var numbers = this.getSanitizedContactNumbers(contacts[i]);
			
				// Check for a match
				if(numbers.homePhone === rawCallId
					|| numbers.homePhone2 === rawCallId
					|| numbers.workPhone === rawCallId
					|| numbers.workPhone2 === rawCallId
					|| numbers.mobilePhone === rawCallId
					|| numbers.otherPhone === rawCallId) {
					
					// We've found our contact
					contact = contacts[i];
					break;
				}
			}
			
			// If we haven't already found a match, begin partial matching on the results, but
			// only if the callId has enough significant digits.
			if(rawCallId.length >= significantDigits && contact === null) {
				// If no exact match was found, we can drill down by walking backwards through
				// the string and pruning contacts that don't have a phone number with the same
				// digit in that position.
				while(contacts.length >= 1 && Math.abs(pos) < significantDigits) {
					pos--;
					pattern = rawCallId.substr(pos,1);
					
					// Iterate through the contacts and prune any which don't adhere to the following rules:
					// 1) At least one number must be at least as long as the pattern we're matching against
					// 2) At least one number must have a matching digit at a given position
					for (var i = 0; i < contacts.length; i++) {
						var numbers = this.getSanitizedContactNumbers(contacts[i]);
					
						if((!numbers.homePhone || numbers.homePhone.length < Math.abs(pos) || numbers.homePhone.substr(pos,1) !== pattern)
							&& (numbers.homePhone2.length < Math.abs(pos) || numbers.homePhone2.substr(pos,1) !== pattern)
							&& (numbers.workPhone.length < Math.abs(pos) || numbers.workPhone.substr(pos,1) !== pattern)
							&& (numbers.workPhone2.length < Math.abs(pos) || numbers.workPhone2.substr(pos,1) !== pattern)
							&& (numbers.mobilePhone.length < Math.abs(pos) || numbers.mobilePhone.substr(pos,1) !== pattern)
							&& (numbers.otherPhone.length < Math.abs(pos) || numbers.otherPhone.substr(pos,1) !== pattern)) {
							
							// This contact doesn't adhere to the match rules, so remove it
							contacts.splice(i, 1);
							i = 0;
						}
					}
				}
				
				// Warn if we've found more than one result
				if(contacts.length > 1) {
					console.warn('Multiple contact matches found for callId ' + callId);
				}
				
				// Only one result permitted
				contact = contacts.length === 1 ? contacts[0] : null;
			}
		}
		
		// Finally, return the contact
		return Ext.create('Communication.model.Contact', contact);
	},

	/**
	 * Returns an object containing the contact's phone numbers, sanitized to remove
	 * any non-digit characters.
	 * @param {qnx.bluetooth.pbap.Contact} contact The PBAP Contact object instance. 
	 * @returns {Object} An object containing the sanitized Contact phone numbers.
	 */
	getSanitizedContactNumbers: function(contact) {
		return {
			homePhone: contact.homePhone ? contact.homePhone.replace(/[^0-9]/g, '') : '',
			homePhone2: contact.homePhone2 ? contact.homePhone2.replace(/[^0-9]/g, '') : '',
			workPhone: contact.workPhone ? contact.workPhone.replace(/[^0-9]/g, '') : '',
			workPhone2: contact.workPhone2 ? contact.workPhone2.replace(/[^0-9]/g, '') : '',
			mobilePhone: contact.mobilePhone ? contact.mobilePhone.replace(/[^0-9]/g, '') : '',
			otherPhone: contact.otherPhone ? contact.otherPhone.replace(/[^0-9]/g, '') : ''
		};
	},
	
	/**
	 * phonedialing event handler. Shows the status view with the state DIALING.
	 * @param e {Object} The phonedialing event data.
	 */
	onDialing: function(e) {
		if(e && e.service) {
			this.showCallStatusView(e.callId || null, e.service, this.getCallStatusView().STATE_DIALING);
		}
	},
	
	/**
	 * phoneincoming event handler. Shows the status view with the state INCOMING.
	 * @param e {Object} The phoneincoming event data.
	 */
	onIncomingCall: function(e) {
		if(e && e.service) {
			this.showCallStatusView(e.callId || null, e.service, this.getCallStatusView().STATE_INCOMING);
		}
	},
	
	/**
	 * phonecallactive event handler. Shows the status view with the state CONNECTED.
	 * @param e {Object} The phonecallactive event data.
	 */
	onCallActive: function(e) {
		if(e && e.service) {
			this.showCallStatusView(e.callId || null, e.service, this.getCallStatusView().STATE_CONNECTED);
		}
	},
	
	/**
	 * phoneready event handler. If the call status view is active when this is received, then it likely means
	 * that the active call has ended.
	 * @param e {Object} The phoneready event object.
	 */
	onPhoneReady: function(e) {
		this.getCallStatusView().setCallState(this.getCallStatusView().STATE_DISCONNECTED);
		this.hideCallStatusView();
	},
	
	/**
	 * Shows the incoming call view.
	 * @param callId {String} The call identifier (number, username, etc...).
	 * @param service {String} The phone service.
	 * @param state {String} The state of the call status (incoming, connected, dialing, disconnected).
	 */
	showCallStatusView: function(callId, service, state) {
		if(callId && service) {
			// Set the phone number and contact information on the view
			this.getCallStatusView().setCallId(callId);
			
			// Attempt to find the contact for this callId
			if(service == qnx.phone.SERVICE_HFP) {
				// This is a phone call, so do a phone number lookup
				this.getCallStatusView().setContact(this.findContactByCallId(callId));
			}
		} else {
			// Reset the incoming call view data since we have none
			this.getCallStatusView().setCallId(null);
			this.getCallStatusView().setContact(null);
		}
		
		// Hide the menu if it's currently shown
		this.getApplication().fireEvent('menu_hide');
		
		// Add the status view to the viewport if it hasn't already, and then show it
		Ext.Viewport.add(this.getCallStatusView());
		this.getCallStatusView().setCallState(state);
		this.getCallStatusView().show();
	},

	/**
	 * Hides the call status view.
	 */
	hideCallStatusView: function() {
		if(!this.getCallStatusView().isHidden()) {
			setTimeout(function() { this.getCallStatusView().hide(); }.bind(this), 3000);
		}
	},
	
	/**
	 * Accept call button handler.
	 * */
	onAcceptCall: function() {
		qnx.phone.accept();
	},

	/**
	 * Decline call button handler.
	 * */
	onDeclineCall: function() {
		qnx.phone.hangup();
	},
	
	/**
	 * End call button handler.
	 */
	onEndCall: function() {
		qnx.phone.hangup();
	},
	
});