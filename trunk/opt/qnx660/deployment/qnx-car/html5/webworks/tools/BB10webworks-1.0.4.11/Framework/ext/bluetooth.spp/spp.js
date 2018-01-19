/**
 * The abstraction layer for Bluetooth SPP functionality.
 *
 * @author chhitchcock@qnx.com
 * $Id:  $
 */

var _pps = require('../../lib/pps/ppsUtils'),
    _connList,
    _newDataTrigger,
    _streamOpenedTrigger,
    _streamClosedTrigger,
    _errorTrigger;


/**
 * SPP stream PPS object change handler. Responsible for firing
 * the extension events.
 * @param conn {String} The connection identifier for this PPS connection
 * @param event {Event} The PPS change event
 */
function handleOnChange(conn, event) {
    if (conn && event.data) {
        if (event.data.res) {
            if (event.data.err) {
                if (_errorTrigger) {
                    var errorEvent = {
                        conn: conn,
                        errno: event.data.err
                    };
            
                    _errorTrigger(errorEvent);  
                }  
              
                // Close the PPS connection if this error was encountered while t
                // trying to close the stream
                if (event.data.res == "close_stream") {
                    closePPS(conn);
                }
            }
            else {
                switch (event.data.res) {
                    case "open_stream":
                        if (_streamOpenedTrigger) {
                            _streamOpenedTrigger(conn);
                        }
                        break;
                    case "close_stream":
                        if (_streamClosedTrigger) {
                            _streamClosedTrigger(conn);
                        }
                        
                        // Close the PPS object
                        closePPS(conn);
                        
                        break;                        
                    case "write_data":
                        // Data written to the SPP port successfully.  
                        break;
                    default:
                        console.log("qnx.bluetooth.spp: Unknown response from PPS: " + event.data.res);
                        break;
                }    
            }
   
        }
        else if (event.data.msg) {
            if (event.data.msg == "new_data") {
                if (event.data.dat && _newDataTrigger) {
                    var newDataEvent = {
                        conn: conn,
                        data: event.data.dat
                    };
                    
                    _newDataTrigger(newDataEvent);
                }
                else {
                    console.log("qnx.bluetooth.spp: new_data even received but no data is available");
                }
            }
            else {
                console.log("qnx.bluetooth.spp: Unknown message from PPS: " + event.data.msg);
            }
        }
        else {
            console.log("qnx.bluetooth.spp: Unknown data from PPS: " + event.data);
        }
    }
}

function buildKey (mac, service_id, additionalID) {
    // Basic identifier.  Can expand this in the future to make it more unique.
    return (mac + "/" + service_id + "/" + additionalID);
}

function closePPS (connListKey) {
    if (connListKey) {
        ppsStream = _connList[connListKey];      
        
        if (ppsStream) {  
            ppsStream.close();
            delete(_connList[connListKey]);
        }
    }            
}

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
    /** Constants **/
    
    /**
     * Initializes the extension.
     */
    init: function() {
        _connList = [];
    },
    
    /**
     * Sets the trigger function to call when the new data event is fired
     * @param trigger {Function} The trigger function to call when an event is fired
     */
    setNewDataTrigger: function(trigger) {
        _newDataTrigger = trigger;
    },
    
    /**
     * Sets the trigger function to call when the stream opened event is fired
     * @param trigger {Function} The trigger function to call when an event is fired
     */
    setStreamOpenedTrigger: function(trigger) {
        _streamOpenedTrigger = trigger;
    },
    
    /**
     * Sets the trigger function to call when the stream closed event is fired
     * @param trigger {Function} The trigger function to call when an event is fired
     */
    setStreamClosedTrigger: function(trigger) {
        _streamClosedTrigger = trigger;
    },
    
    /**
     * Sets the trigger function to call when the error event is fired
     * @param trigger {Function} The trigger function to call when an event is fired
     */
    setErrorTrigger: function(trigger) {
        _errorTrigger = trigger;
    },
    
    /**
     * Opens the SPP connection on the specified bluetooth device.
     * @param mac {String} The MAC addresss of the bluetooth device to open the SPP connection on
     * @param service_id {String} This is the UUID that identifies the SPP service open.
     * @return {String} The identifier for this connection.  Returns null if there was an error
     */
    open: function(mac, service_id) {
        
        if (mac && service_id) {
            var ppsStream = null,
                connListKey = null;

            ppsStream = _pps.createObject();
            ppsStream.init();
            
            // Use the MAC, UUID and the instance ID for the ppsStream to uniquely
            // identify this PPS client/server connection.
            connListKey = buildKey(mac, service_id, ppsStream.getId());
            
            if (connListKey) {                              
                ppsStream.onChange = function (event) {
                    handleOnChange(connListKey, event);
                };
            
                try {
                    ppsStream.open("/pps/services/bluetooth/spp/spp?delta", JNEXT.PPS_RDWR );
            
                    ppsStream.onReady = function() {
                        ppsStream.write({
                            msg: "open_stream",
                            id: "1",
                            dat: {
                                    mac: mac,
                                    uuid: service_id
                                }
                        });
                    };
                    
                     _connList[connListKey] = ppsStream;
                 }
                 catch (e) {
                    console.log("qnx.bluetooth.spp: Unable to open PPS connection");
                    connListKey = null;
                 }   
            }
            else {
                console.log("qnx.bluetooth.spp: Error creating key while opening connection");
            }
                                
         }
         else {
            console.log("qnx.bluetooth.spp: Unable to open connection due to invalid arguments");
         }

         return connListKey;                        
                
    },
    
    /**
     * Closes the SPP connection
     * @param conn {String} The connection identifier returned by the call to bluetooth.spp.open
     */
    close: function(conn) {
        if (conn) {
            var ppsStream = null;
            
            ppsStream = _connList[conn];
            
            if (ppsStream) {            
                ppsStream.write({
                    msg: "close_stream",
                    id: "1"
                });
            }
            else {
                console.log("qnx.bluetooth.spp: Unable to find connection to close");
            }
        }  
    },
    
    /**
     * Writes data to the SPP connection
     * @param conn {String} The connection identifier returned by the call to bluetooth.spp.open
     * @param data {String} Data encoded as a Base64 string
     */
    write: function(conn, data) {
        if (conn && data) {
            var ppsStream = null;
            
            ppsStream = _connList[conn];      
            
            if (ppsStream) {        
                ppsStream.write({
                    msg: "write_data",
                    id: "2",
                    dat: data
                });
            }
            else {
                console.log("qnx.bluetooth.spp: Unable to find connection to write data to");
            }
        }
    }
};
