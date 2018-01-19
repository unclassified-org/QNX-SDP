/**
 * The extension interface for the HTMLGears application
 *
 * @author dkerr
 * $Id: index.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var _wwfix = require("../../lib/wwfix"),
    _gears = require("./gears");

/**
 * Initializes the extension 
 */
function init() {
    _gears.init();
}
init();

/**
 * Exports are the publicly accessible functions
 */
module.exports = {

    /*
     * Initializes the dimensions & screen window group
     * @param success {Function} Function to call if the operation is a success
     * @param fail {Function} Function to call if the operation fails
     * @param args {Object} The arguments supplied. 
                            Arguments: (x,y,w,h,screenGroup)
     * @param env {Object} Environment variables
     */
    setParams: function(success, fail, args, env) {
        try {
            args = _wwfix.parseArgs(args);
            success(_gears.setParams(args));
        } catch (e) {
            fail(-1, 'fail ' + e);
        }
    },
    
    /**
     * Starts the Gears animation
     * @param success {Function} Function to call if the operation is a success
     * @param fail {Function} Function to call if the operation fails
     * @param args {Object} The arguments supplied. Available arguments for this call are: n/a
     * @param env {Object} Environment variables
     */
    start: function(success, fail, args, env) {
        try {
            _gears.start();
            success();
        } catch (e) {
            fail(-1, 'fail ' + e);
        }
    },

    /**
     * Stops the Gears animation
     * @param success {Function} Function to call if the operation is a success
     * @param fail {Function} Function to call if the operation fails
     * @param args {Object} The arguments supplied. Available arguments for this call are: n/a
     * @param env {Object} Environment variables
     */
    stop: function(success, fail, args, env) {
        try {
            _gears.stop();
            success();
        } catch (e) {
            fail(-1, 'fail ' + e);
        }
    }

};

