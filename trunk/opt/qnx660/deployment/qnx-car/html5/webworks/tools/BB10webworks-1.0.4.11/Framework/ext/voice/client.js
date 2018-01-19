/**
 * @module qnx_xyz_voice
 * @description Allow access to voice services
 *
 */

/* 
 * @author mlapierre
 * $Id: client.js 4280 2012-09-25 19:22:34Z dkerr@qnx.com $
 */

var _ID = require("./manifest.json").namespace;

/*
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Tell the system to listen for a voice command
	 */
	listen: function () {
		window.webworks.execSync(_ID, 'listen');
	},
	
	/**
	 * Tell the system that you are finished saying your voice command
	 */
	stopListening: function() {
		window.webworks.execSync(_ID, 'stopListening');
	},
	
	/**
	 * Tell the system to cancel voice recognition in progress
	 */
	cancel: function() {
		window.webworks.execSync(_ID, 'cancel');
	},
	
	/**
	 * Say a string using text-to-speech
	 * @param {String} text The string to say
	 */
	say: function(text) {
		window.webworks.execSync(_ID, 'say', { text: text });
	},

	/**
	 * Inform the system of a set of available applications it can launch
	 * @param {Array} list The list of applications
	 */
	setList: function(list) {
		window.webworks.execSync(_ID, 'setList', { app_list: list });
	},

	/**
	 *Add an item to the list of available applications the system can launch
	 * @param {String} item The name of the item
	 */
	addItem: function(item) {
		window.webworks.execSync(_ID, 'addItem', { item: item });
	},
	
	/**
	 * Retrieve the state of the voice req service
	 * @return {String} The state of the voice req service; possible values: 'idle', 'prompting', 'listening', 'processing'
	 */
	getState: function() {
	    return window.webworks.execSync(_ID, 'getState');
	},

	/**
	 * Retrieve the state of the speech attribute
	 * @return {String} The state of the speech attribute; possible values: 'processing', 'handled'
	 *  
	 */
	getSpeechState: function() {
	    return window.webworks.execSync(_ID, 'getSpeechState');
	}

};
