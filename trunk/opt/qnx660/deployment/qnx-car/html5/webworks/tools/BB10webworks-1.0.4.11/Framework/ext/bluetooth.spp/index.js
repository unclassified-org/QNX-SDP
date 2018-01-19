/**
 * Allows access to a Bluetooth SPP stream
 *
 * @author chhitchcock
 * $Id:  $
 */
var _wwfix = require("../../lib/wwfix"),
    _event = require("../../lib/event"),
    _utils = require("./../../lib/utils"),
    _actionMap = {
        /**
         * @event
         * Fired when the SPP connection has been opened successfully.
         */
        bluetoothsppopened: {
            context: require("./context"),
            event: "bluetoothsppopened",
            trigger: function (args) {
                _event.trigger("bluetoothsppopened", args);
            }
        },
        
        /**
         * @event
         * Fired when the SPP connection has been closed.
         */
        bluetoothsppclosed: {
            context: require("./context"),
            event: "bluetoothsppclosed",
            trigger: function (args) {
                _event.trigger("bluetoothsppclosed", args);
            }
        },
        
        /**
         * @event
         * Fired when an error was encountered with the SPP connection.
         */        
        bluetoothspperror: {
            context: require("./context"),
            event: "bluetoothspperror",
            trigger: function (args) {
                _event.trigger("bluetoothspperror", args);
            }
        },      
        
        /**
         * @event
         * Fired when an there is new data received on the SPP connection.
         */           
        bluetoothsppnewdata: {
            context: require("./context"),
            event: "bluetoothsppnewdata",
            trigger: function (args) {
                _event.trigger("bluetoothsppnewdata", args);
            }
        }
    },
    _spp = require("./spp");

/**
 * Initializes the extension 
 */
function init() {
    try {
        var eventExt = _utils.loadExtensionModule("event", "index");
        eventExt.registerEvents(_actionMap);
        _spp.init();
    } catch (ex) {
        console.error('Error in webworks ext: blueooth.spp/index.js:init():', ex);
    }
}
init();

/**
 * Exports are the publicly accessible functions
 */
module.exports = {

    
    /**
     * Opens an SPP stream
     * @param success {Function} Function to call if the operation is a success
     * @param fail {Function} Function to call if the operation fails
     * @param args {Object} The arguments supplied. Available arguments for this call are:
     *  {
     *      mac: {String} The MAC addresss of the bluetooth device to open the SPP connection on
     *      service_id: {String} This is the UUID that identifies the SPP service open.
     *  }
     * @param env {Object} Environment variables
     */
    open: function(success, fail, args, env) {
        try {
            args = _wwfix.parseArgs(args);
            success(_spp.open(args.mac, args.service_id));
        } catch (e) {
            fail(-1, e);
        }
    },
    
    /**
     * Closes an SPP stream
     * @param success {Function} Function to call if the operation is a success
     * @param fail {Function} Function to call if the operation fails
     * @param args {Object} The arguments supplied. Available arguments for this call are:
     *  {
     *      conn: {String} The connection identifier returned by the call to bluetooth.spp.open
     *  }
     * @param env {Object} Environment variables
     */    
    close: function(success, fail, args, env) {
        try {
            args = _wwfix.parseArgs(args);
            _spp.close(args.conn)
            success();
        } catch (e) {
            fail(-1, e);
        }
    },
    
    /**
     * Write the specified Base64-encoded data to write the SPP connection.
     * @param success {Function} Function to call if the operation is a success
     * @param fail {Function} Function to call if the operation fails
     * @param args {Object} The arguments supplied. Available arguments for this call are: 
     *  {
     *      conn: {String} The connection identifier returned by the call to bluetooth.spp.open
     *      b64Data: {String} the data to write to the SPP stream in Base64 encoding
     *  }    
     * @param env {Object} Environment variables
     */
    write: function(success, fail, args, env) {
        try {
            args = _wwfix.parseArgs(args);
            _spp.write(args.conn, args.data)
            success();
        } catch (e) {
            fail(-1, e);
        }
    }

        
};

