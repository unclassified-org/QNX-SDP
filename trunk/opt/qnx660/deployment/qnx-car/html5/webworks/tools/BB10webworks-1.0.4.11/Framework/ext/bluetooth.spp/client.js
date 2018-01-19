/**
 * Allows access to serial data over Bluetooth SPP.
 *
 * <h3>Events</h3>
 *     
 * <dl><dt><h4>bluetoothsppopened</h4></dt>
 * <dd><p>Fired when a SPP connection has been sucessfully opened.</p>
 * <h5>Event data</h5>
 * <p>{String} a connection identifier that represents the opened connection</p>
 * </dd></dl>
 * 
 * <dl><dt><h4>bluetoothsppclosed</h4></dt>
 * <dd><p>Fired when a SPP connection has been sucessfully closed.</p>
 * <h5>Event data</h5>
 * <p>{String} a connection identifier that represents the connection that has closed</p>
 * </dd></dl>
 *
 * <dl><dt><h4>bluetoothsppnewdata</h4></dt>
 * <dd><p>Fired when new data has been received on a SPP connection</p>
 * <h5>Event data</h5>
 * <p>{Object}</p>
 * <h5>Example</h5>
 * <pre><code>{
 *      conn:{String},      // a connection identifier object
 *      data:{String},      // The new data that has been received on the SPP connection, encoded in Base64.
 * }</code></pre></dd></dl>
 *
 * <dl><dt><h4>bluetoothspperror</h4></dt>
 * <dd><p>Fired when an error has occured with the SPP connection</p>
 * <h5>Event data</h5>
 * <p>{Object}</p>
 * <h5>Example</h5>
 * <pre><code>{
 *      conn:{String},      // a connection identifier object
 *      errno:{Number},     // The errno for the error that occured
 * }</code></pre></dd></dl>
 *
 * @module qnx_xyz_bluetooth_xyz_spp
 */
 
 /*
 * @author chhitchcock@qnx.com
 * $Id: $
 */

var _ID = require("./manifest.json").namespace;


/*
 * Exports are the publicly accessible functions
 */
module.exports = {

    /**
     * Opens an SPP stream
     * @param mac {String} The MAC addresss of the bluetooth device to open the SPP connection on
     * @param service_id {String} This is the UUID that identifies the SPP service open.
     * @return {Object} The object for this connection.  Returns undefined if there was an error
     */
    open: function(mac, service_id) {
        return window.webworks.execSync(_ID, 'open', {mac: mac, service_id: service_id});
    },
    
    /**
     * Close a SPP connection.
     * @param {Object} conn The SPP connection to close.
     */ 
    close: function(conn) {
        window.webworks.execAsync(_ID, 'close', {conn: conn});
    },

    /**
     * Write the specified Base64-encoded data to write the SPP connection.
     * @param {Object} conn The SPP connection to write the data to.
     * @param {String} data The Base64-encoded data to write to the SPP connection .
     */
    write: function(conn, data) {
        window.webworks.execAsync(_ID, 'write', {conn: conn, data: data});
    }

};