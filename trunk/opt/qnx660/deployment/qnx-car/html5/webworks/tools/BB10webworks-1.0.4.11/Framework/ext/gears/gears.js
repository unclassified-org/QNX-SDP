/**
* The abstraction layer for volume functionality
 *
 * @author dkerr
 * $Id: gears.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var _pps = require("lib/pps/ppsUtils"),
    _gearsCtrlPPS;


/**
 * Exports are the publicly accessible functions
 */
module.exports = {
    /**
     * Initializes the extension 
     */
    init: function () {
        _gearsCtrlPPS = _pps.createObject();
        _gearsCtrlPPS.init();
        _gearsCtrlPPS.open("/pps/services/gears/control", JNEXT.PPS_WRONLY);
    },
    
    /**
     * Sets the parameters for the Gears application
     */
    setParams: function(args) {
        var rc = true;
        
        // otherwise uses application defaults
        _gearsCtrlPPS.write({ x: args.x, y: args.y, w: args.w, h: args.h });
        
        // otherwise uses no screen group and appears fullscreen, on top of all other windows
        if (typeof args.screenGroup != 'undefined') {
            _gearsCtrlPPS.write({ screenGroup: args.screenGroup });
        } else {
            rc = false;
        }
        
        return rc;
    },

    /**
     * Writes the activation command to the pps object
     * 
     */
    start: function() {
        _gearsCtrlPPS.write({ activated: 1 });
    },

    /**
     * Writes the pause command to the pps object
     * 
     */
    stop: function() {
        _gearsCtrlPPS.write({ activated: 0 });
    }

};

