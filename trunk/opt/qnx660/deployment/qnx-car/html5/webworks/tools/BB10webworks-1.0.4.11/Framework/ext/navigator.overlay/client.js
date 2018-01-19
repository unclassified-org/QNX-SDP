/**
 * @module qnx_xyz_navigator_xyz_overlay
 *
 * @description Allow access to the UI resources on the overlay webview
 *
 */

/* @author dkerr
 * $Id: client.js 4612 2012-10-16 17:27:19Z dkerr@qnx.com $
 */

var _ID = require("./manifest.json").namespace;

/*
 * Exports are the publicly accessible functions
 */
module.exports = {

    /**
     * Set the overlayWebview object to the URL specified 
     *@param args URL for overlay; point back to the Navigator application
     */
    init: function (args) {
        window.webworks.execSync(_ID, 'init', args);
    },

    /**
     * Display the UI element specified by the type key in the arguments
     * @param {Object} args The UI element and parameters
     * @example for voice (1):
     *{
     *      type: {String}, // 'voice' the type of UI element
     *      opts: {Object}  {
     *          state: {String}, //time required to navigate the entire route, in seconds
     *                      }
     *}
     * for voice (2):
     *{
     *      type: {String}, // 'voice' the type of UI element
     *      opts: {Object}  {
     *          results: {Object}   {
     *              utterance: {String},
     *              confidence: {Number}
     *                              } 
     *                      }
     *}
     * for notice:
     *{
     *      type: {String}, //  'notice' the type of UI element
     *      opts: {Object}  {
     *          text: {String}, // the text contained within the notice
     *          title: {String}, // the title of the notice
     *          stay: {Boolean}, // if true, the notice must be dismissed by touch
     *          stayTime: {Time}, // in milliseconds
     *          klass: {String}, // optional class for css styling ie. notice, error, success
     *                      }
     *}
     *
     */
    show: function (args) {
        window.webworks.execSync(_ID, 'show', args);
    },
    
    /**
     * Remove the UI element specified by the type key in the arguments
     * @param {Object} args The UI element and parameters. 
     *@example
     *(voice)
     *{
     *      type: {String}, // the type of UI element: voice|notice|info
     *}
     */
    hide: function (args) {
        window.webworks.execSync(_ID, 'hide', args);
    }
};
