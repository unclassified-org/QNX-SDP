/**
 * The client interface for the HTMLGears application
 *
 * @author dkerr
 * $Id: client.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var _ID = 'qnx.custom.gears';

/**
 * Exports are the publicly accessible functions
 */
module.exports = {

    /*
     * Sets openGL app parameters.
     * @param args {Object} The args are dimensions (x,y,w,h) and screenGroup
     * @returns true|false
     */
    setParams: function(args) {
        return window.webworks.execSync(_ID, 'init', args);
    },
    
    /**
     * Writes the activation code and starts the animation
     */
    start: function() {
        window.webworks.execSync(_ID, 'start' );
    },

    /**
     * Writes the deactivation code and stops the animation.
     */
    stop: function() {
        window.webworks.execSync(_ID, 'stop' );
    }

};
