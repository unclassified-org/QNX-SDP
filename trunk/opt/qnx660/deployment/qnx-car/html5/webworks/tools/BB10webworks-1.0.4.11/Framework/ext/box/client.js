/**
 * @module qnx_xyz_box
 * @description custom extension for Test Track application, implements box.com APIs
 *
 * @author mlytvynyuk
 * $Id:$
 */
var _ID = require("./manifest.json").namespace;
var Constants = require("./common.js");
var Events = require("./events.js");

/**
 * Function registers callback handlers and associates callback with specified event names
 * when events are triggered appropriate callback will be invoked
 * @param {Function} success callback to be triggered when corresponding event triggered
 * @param {String} successEvent event name which will be associated with success callback
 * @param {Function} error callback to be triggered when corresponding event triggered
 * @param {String} errorEvent event name which will be associated with error callback
 * */
function registerEventHandlers(success, successEvent, error, errorEvent) {
	var callbackSuccess;
	var callbackError;

	callbackSuccess = function (data) {
		if (data) {
			// cleanup Error event handler
			window.webworks.event.remove(_ID, errorEvent, callbackError);
			if (success && typeof success === "function") {
				success(data);
			}
		}
	};

	callbackError = function (data) {
		if (data) {
			// cleanup Success event handler
			window.webworks.event.remove(_ID, successEvent, callbackSuccess);
			if (error && typeof error === "function") {
				error(data);
			}
		}
	};

	if (!window.webworks.event.isOn(successEvent)) {
		window.webworks.event.once(_ID, successEvent, callbackSuccess);
	}

	if (!window.webworks.event.isOn(errorEvent)) {
		window.webworks.event.once(_ID, errorEvent, callbackError);
	}
}

/**
 * Created and initialises event handler XHR to get metadata for file or folder
 * @param {Function} success Handler will be invoked when there is a response available
 * @param {Function} error Handler will be invoked when there error happened
 * @returns instance of nely created XHR object
 * */
function prepareXHR(success, error) {
	var requestToken = new XMLHttpRequest();

	requestToken.onreadystatechange = function receiveRequestToken() {
		if (requestToken.readyState == 4) {
			if (requestToken.responseText.length > 0) {
				var responceObj = JSON.parse(requestToken.responseText);
				if (responceObj && success) {
					success(responceObj)
				} else if (!responceObj && error) {
					error("Error: Failed to obtain metadata");
				}
			} else {
				error("Error: Failed to obtain metadata");
			}
		}
	};
	return requestToken;
}

/**
 * Check is there are tokens stored in localStorage , when stored we are assuming that we are authorised
 * @returns true if authorised, false if not
 * */
function isAuthorised() {
	return (localStorage.access_token && localStorage.access_token !== "undefined" && localStorage.refresh_token && localStorage.refresh_token !== "undefined");
}

/**
 * Exports are the publicly accessible functions
 */
module.exports = {

	clientId:null,
	clientSecret:null,

	/**
	 * Initialises box extension.
	 * @param {String} clientId Client id provided by box.com when registering application, part of OAuth2 authorisation process
	 * @param {String} clientSecret Client secret provided by box.com when registering application, part of OAuth2 authorisation process
	 * @param {Function} success Handler will be invoked when there is a response available
	 * @param {Function} error Handler will be invoked when there error happened
	 * */
	authorise:function (clientId, clientSecret, success, error) {
		this.clientId = clientId;
		this.clientSecret = clientSecret;

		registerEventHandlers(success, Events.EVENT_ACCESS_TOKEN_READY, error, Events.EVENT_ACCESS_TOKEN_ERROR);

		return window.webworks.execAsync(_ID, "authorise", { clientId:this.clientId, clientSecret:this.clientSecret });
	},

	/**
	 * Fires up XHR to get metadata for the folder
	 * @param {String} id of the folder
	 * @param {Function} success Handler will be invoked when there is a response available
	 * @param {Function} error Handler will be invoked when there error happened
	 * */
	getFolder:function (id, success, error) {
		if (!id) {
			error({message:"Error: No Id Specified"});
		} else if (!isAuthorised()) {
			error({message:"Error: Not Authorised"});
		} else {
			var access_token = localStorage.access_token;

			var requestToken = prepareXHR(success, error);

			requestToken.open('GET', Constants.BASE_URL + Constants.FOLDERS + '/' + id, true); // root folder
			requestToken.setRequestHeader("Authorization", "Bearer " + access_token);
			requestToken.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			requestToken.send();
		}
	},

	/**
	 * Fires up XHR to get metadata for the file
	 * @param {String} id of the file
	 * @param {Function} success Handler will be invoked when there is a response available
	 * @param {Function} error Handler will be invoked when there error happened
	 * */
	getFile:function (id, success, error) {
		if (!id) {
			error({message:"Error: No Id Specified"});
		} else if (!isAuthorised()) {
			error({message:"Error: Not Authorised"});
		} else {
			var access_token = localStorage.access_token;

			var requestToken = prepareXHR(success, error);

			requestToken.open('GET', Constants.BASE_URL + Constants.FILES + '/' + id, true); // root folder
			requestToken.setRequestHeader("Authorization", "Bearer " + access_token);
			requestToken.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			requestToken.send();
		}
	},

	/**
	 * Function returns URL for the file with specified id
	 * @param {String} id id of the file
	 * */
	getFileURL:function (id) {
		var result = Constants.BASE_URL + Constants.FILES_CONTENT.replace('{id}', id);
		return result;
	},

	/**
	 * Function returns content of file with specified id
	 * @param {String} id id of the file
	 * @param {Function} success Callback will be invoked when there are file content available
	 * @param {Function} error Callback will be invoked when there there is an error
	 * */
	getFileContent:function (id, success, error) {
		if (!id) {
			error({message:"Error: No Id Specified"});
		} else if (!isAuthorised()) {
			error({message:"Error: Not Authorised"});
		} else {

			var access_token = localStorage.access_token;
			var requestToken = new XMLHttpRequest();

			requestToken.onreadystatechange = function receiveRequestToken() {
				if (requestToken.readyState == 4) {
					if (requestToken && requestToken.responseText.length > 0 && success) {
						success(requestToken.responseText)
					}
				}
			};

			requestToken.open('GET', Constants.BASE_URL + Constants.FILES_CONTENT.replace('{id}', id), true);
			requestToken.setRequestHeader("Authorization", "Bearer " + access_token);
			requestToken.send();
		}
	},

	/**
	 * Function returns content of image with specified id
	 * @param {String} id id of the file
	 * @param {Function} success Callback will be invoked when there are file content available
	 * @param {Function} error Callback will be invoked when there there is an error
	 * */
	getImage:function (id, success, error) {
		if (!id) {
			error({message:"Error: No Id Specified"});
		} else if (!isAuthorised()) {
			error({message:"Error: Not Authorised"});
		} else {

			var access_token = localStorage.access_token;
			var requestToken = new XMLHttpRequest();
			requestToken.overrideMimeType('text/plain; charset=x-user-defined')

			requestToken.onreadystatechange = function receiveRequestToken() {
				if (requestToken.readyState == 4) {
					if (success)
						success(requestToken.response);
				}
			};

			requestToken.open('GET', Constants.BASE_URL + Constants.FILES_CONTENT.replace('{id}', id), true);
			requestToken.setRequestHeader("Authorization", "Bearer " + access_token);
			requestToken.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			requestToken.responseType = 'arraybuffer'
			requestToken.send();
		}
	},

	/**
	 * Function starts download of specified bar file then installs downloaded bar file
	 * Download is specific for box.com
	 * @param {String} id File id
	 * @param {Function} success Callback will be invoked when there are file content available
	 * @param {Function} error Callback will be invoked when there there is an error
	 */
	install:function (id, success, error) {
		registerEventHandlers(success, Events.EVENT_INSTALLATION_PROGRESS, error, Events.EVENT_ERROR);
		return window.webworks.execAsync(_ID, 'install', { id:id });
	},

	/**
	 * Function starts uninstallation of specified application
	 * @param {Object} name Application name
	 * @param {Function} success Callback will be invoked when there are file content available
	 * @param {Function} error Callback will be invoked when there there is an error
	 */
	uninstall:function (name, success, error) {
		registerEventHandlers(success, Events.EVENT_INSTALLATION_PROGRESS, error, Events.EVENT_ERROR);
		return window.webworks.execAsync(_ID, 'uninstall', { name:name });
	}
};

/**
 * Register implicit getter and setter for Install progress event handlers
 */
Object.defineProperty(module.exports, "onInstallProgress", {
	get:function () {
		return this.installprogresscb;
	},
	/**
	 * Sets the specified callback as callback to handle all Installation progress events
	 * @param cb {Function} callback
	 * */
	set:function (cb) {
		this.installprogresscb = cb;
		window.webworks.event.add('blackberry.event', Events.EVENT_INSTALLATION_PROGRESS, this.installprogresscb);
	}
});

/**
 * Register implicit getter and setter for UnInstall progress event handlers
 */
Object.defineProperty(module.exports, "onUnInstallProgress", {
	get:function () {
		return this.uninstallprogresscb;
	},
	/**
	 * Sets the specified callback as callback to handle all UnInstallation progress events
	 * @param cb {Function} callback
	 * */
	set:function (cb) {
		this.uninstallprogresscb = cb;
		window.webworks.event.add('blackberry.event', Events.EVENT_UNINSTALLATION_PROGRESS, this.uninstallprogresscb);
	}
});