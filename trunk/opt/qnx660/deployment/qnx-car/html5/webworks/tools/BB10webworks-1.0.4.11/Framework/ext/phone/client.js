/**
 * Provide the functionality of a phone
 *
 * <h3>Events</h3>
 * <dl><dt><h4>phoneready</h4></dt>
 * <dd><p>Triggered when phone is idle (no incoming, outgoing, active calls) and ready to accept commands</p>
 * <h5>callback parameter event</h5>
 * <p>{Object}</p>
 * <h5>Example</h5>
 *<pre><code>{
 *      service: {String}       // identifies the phone service
 *}</code></pre></dd></dl>
 *
 * <h4>phonecallactive</h4>
 * <p>Triggered when active phone call (recipient accepted the outgoing call or incoming call accepted locally)</p>
 * <h5>callback parameter event</h5> 
 * <p>{Object}</p>
 * <h5>Example</h5>
 *<pre><code>{
 *      service: {String}		// identifies the phone service
 *      callId: {String}		// incoming call phone number in case of Handsfree, can be BBID etc
 *}</code></pre></dd></dl>
 * 
 * <h4>phoneincoming</h4>
 * <p>Triggered when there is incoming call, phone is ringing</p>
 * <h5>callback parameter event</h5>
 * <p>{Object}</p>
 * <h5>Example</h5>
 * <pre><code>{
 *      service: {String}	// identifies the phone service
 *      callId: {String}	// incoming call phone number in case of Handsfree, can be BBID etc
 *}</code></pre></dd></dl>
 *
 * @module qnx_xyz_phone
 */

/* @author mlytvynyuk
 * $Id: client.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
 
 /*
  * TODO Add more granularity to phone events we need to be 
  * able handle dialing, ringing, on hold, etc as well.
  * TODO currently funnels everything via Handfsree service by default, 
  * make implementation more generic
  */

var _ID = require("./manifest.json").namespace;

/*
 * Exports are the publicly accessible functions
 */
module.exports = {	
	/**
	 * Defines identifier for HFP service
	 * */
	SERVICE_HFP: "SERVICE_HFP",

	/**
	 * 
	 * Dial a number
	 * @param {String} number Number to dial
	 * @param {String} service [optional] Identifier of the phone service; 
	 * if no parameter specified, function call will be routed to default, currently Handsfree, service 
	 * TODO Currently service is not in use
	 */
	dial: function (number, service) {
		window.webworks.execAsync(_ID, 'dial', { number: number });
	},
	/**
	 * Accept incoming call
	 * @param {String} callId ID to identify a call
	 * TODO Currently callId is not in use, because with existing implementation of Handsfree we can have only one active call
	 * @param {String} service [optional] Identifier of the phone service; if no parameter specified, 
	 * function call will be routed to default, currently Handsfree, service 
	 * TODO Currently service is not in use
	 */
	accept: function (callId, service) {
	    window.webworks.execAsync(_ID, 'accept');
	},
	/**
	 * Hang up current active call
	 * @param {String} callId ID to identify a call
	 * TODO Currently callId is not in use, because with existing implementation of Handsfree we can have only one active call
	 * @param {String} service [optional]Identifier of the phone service, if no parameter specified, function call will be routed to default, currently Handsfree, service 
	 * TODO Currently service is not in use
	 * */
	hangup: function (callId, service) {
	    window.webworks.execAsync(_ID, 'hangup');
	},
	/**
	 * Redial last called number
	 * @param {String} service [optional] Identifier of the phone service; if no parameter specified, function call will be routed to default, currently Handsfree, service 
	 * TODO Currently service is not in use
	 * */
	redial: function (service) {
	    window.webworks.execAsync(_ID, 'redial');
	},
	/**
	 * Put a call on hold
	 * @param {String} callId ID to identify a call
	 * TODO Currently callId is not in use, because with existing implementation of Handsfree we can have only one active call
	 * @param {Boolean} value True to put current call on hold, false to release current call from hold
	 * @param {String} service [optional] Identifier of the phone service; if no parameter specified, function call will be routed to default, currently Handsfree, service 
	 * TODO Currently service is not in use
	 * */
	hold: function (callId, value, service) {
		//TODO Implement this function and add appropriate events
	},
	/**
	 * Mute audio input for incoming phone call (mute mic)
	 * @param {String} callId ID to identify a call
	 * TODO Currently callId is not in use, because with existing implementation of Handsfree we can have only one active call
	 * @param {Boolean} value True to mute, false to unmute
	 * @param {String} service [optional] Identifier of the phone service; if no parameter specified, function call will be routed to default, currently Handsfree, service 
	 * TODO Currently service is not in use
	 * */
	mute: function (callId, value, service) {
		//TODO Implement this function and add appropriate events
	},
	/**
	 * Return the current state of the phone
	 * @param {String} service [optional] Identifier of the phone service; if no parameter specified, function call will be routed to default, currently Handsfree, service 
	 * TODO Currently service is not in use
	 * @returns {String} Current state of the phone
	 * */
	getState: function (service) {
		return window.webworks.execSync(_ID, 'getState');
	},
	/**
	 * Call this method to return the list of active calls
	 * @param {String} service Identifier of the phone service, if no parameter specified function call will be routed to default, currently Handsfree, service [optional]
	 * TODO Currently service is not in use
	 * @return {Object} List of active calls
	 * */
	getActiveCalls: function (service) {
		//TODO Implement this function
	}
};