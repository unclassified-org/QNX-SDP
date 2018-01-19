/**
 * @module qnx_xyz_gears
 * @description Access the client interface for the HTMLGears application
 *
 */
 
/* @author dkerr
 * $Id: client.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

 var _ID = require("./manifest.json").namespace;

/*
 * Exports are the publicly accessible functions
 */
module.exports = {

    /**
     * Set the OpenGL app parameters
     * @param {Object} args Dimensions (x,y,w,h) and screenGroup
     * @returns true|false
     */
    setParams: function(args) {
        return window.webworks.execSync(_ID, 'setParams', args);
    },
    
    /**
     * Write the activation code and start the animation
     */
    start: function() {
        window.webworks.execSync(_ID, 'start' );
    },

    /**
     * Write the deactivation code and stop the animation
     */
    stop: function() {
        window.webworks.execSync(_ID, 'stop' );
    }

};
