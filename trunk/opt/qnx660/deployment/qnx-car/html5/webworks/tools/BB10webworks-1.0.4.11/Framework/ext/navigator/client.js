/**
 * @module qnx_xyz_navigator
 * @description Provide utility functions for the management of applications
 *
 */

/* @author dkerr
 * $Id: client.js 4494 2012-10-01 18:51:48Z dkerr@qnx.com $
 */
 

var _ID = require("./manifest.json").namespace;

/*
 * Exports are the publicly accessible functions
 */
module.exports = {

    /**
     * Initialize the extension and the application's webview
     * @param {Object} args The dimensions of the webview 
     * @example
     *{
     *      x  (left),
     *      y: (top),
     *      w: (width),
     *      h: (height),
     *}
     */
    init: function (args) {
        window.webworks.execSync(_ID, "init", args);
    },

    /**
     * Start a new application or load a URL
     * @param {Object} args The list of params needed to create a webview 
     * @example
     *{
     *      scale: (boolean), //scale the contents to the width and height provided
     *      x: (left),
     *      y: (top),
     *      w: (width),
     *      h: (height),
     *      z: (zOrder), // z-order of the webview w.r.t. other webviews in-process
     *      name: (the application's name),
     *      id: (the application's Id),
     *      url: [optional], 
     *      packageName: [optional], // requires either a URL or a packageName
     *      outprocess: (boolean) // create the webview in-process or out-of-process
     *}
     *@returns {Number} The webview ID
     */
    start: function (args) {
        return window.webworks.execSync(_ID, "start", args);
    },

    /**
     * Stop an application.  This either: 
     * a) In the case of a URL the method destroys the webview and removes it from the collection 
     * b) In the case of a package the method stops the application, destroys the webview and removes it from the collection
     * @param {Number} id The webview ID
     */
    stop: function (id) {
        window.webworks.execAsync(_ID, "stop", {id: id});
    },
    
    /**
     * Select an application's webview by changing the zorder and visibility
     * @param {Number} id The webview ID
     * @returns {Object} The current and previous webview IDs
     * @example
     *{
     *      current: (webviewId),
     *      previous: (webviewId)
     *}
     */
    select: function (id) {
        return window.webworks.execSync(_ID, "select", {id: id});
    },

    /**
     * Trigger the pause event for the specified app
     * @param {String} id The app ID 
     */
    pause: function (id, data) {
        window.webworks.execAsync(_ID, 'pause', (data != null && typeof data == "object") ? { id: id, data: data } : { id: id });
    },
    
    /**
     * Trigger the resume event for the specified app
     * @param {String} id The app ID 
     */
    resume: function (id, data) {
        window.webworks.execAsync(_ID, 'resume', (data != null && typeof data == "object") ? { id: id, data: data } : { id: id });
    },
    
    /**
     * Trigger the reselect event for the specified app
     * @param {String} id The app ID 
     */
    reselect: function (id, data) {
        window.webworks.execAsync(_ID, 'reselect', (data != null && typeof data == "object") ? { id: id, data: data } : { id: id });
    },

    /**
     * Provide the data object for the specified app
     * @param {String} id The app ID 
     * @param {Object} data The data object
     */
    appData: function (id, data) {
        window.webworks.execSync(_ID, 'appData', (data != null && typeof data != "undefined") ? { id: id, data: data } : { id: id });
    },
     
    /**
     * Set a webview param
     * @param {Object} obj The webview ID and parameter(s) to set
     * @example
     *{
     *      id (webviewId),
     *      {
     *          zorder (value or -value for hidden),
     *          visible (boolean),
     *          geometry x:(x), y:(y), w:(w), h:(h)
     *      }
     *}
     */
     
    set: function (id, obj) {
        window.webworks.execSync(_ID, "set", {
            id: id, 
            obj: obj
        });
    },

    /**
     * Get the list of webviews
     * @returns {Array} An array of webview names
     */
    getList: function () {
        return window.webworks.execSync(_ID, "getList");
    },

    /**
     * Loads the content of a deferred webview
     * @param {String} id The app ID
     */
    loadDeferred: function (id) {
        window.webworks.execAsync(_ID, "loadDeferred", {id:id});
    },

    /**
     * Saves the last tab selected (ie. the current tab) to the history object 
     * @param {String} appId The unique identifier specified by the app's config.
     */
    setLastTab: function (appId) {
        window.webworks.execAsync(_ID, "setLastTab", {appId:appId});
    },

    /**
     * Retrieves the last tab selected (ie. the current tab) from the history object 
     * @returns {String} The 'last_tab' field from the history object
     */
    getLastTab: function () {
        return window.webworks.execSync(_ID, "getLastTab");
    }
};

