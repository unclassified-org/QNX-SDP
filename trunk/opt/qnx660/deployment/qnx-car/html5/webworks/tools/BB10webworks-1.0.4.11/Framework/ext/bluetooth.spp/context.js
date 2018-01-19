/**
 * The event context for SPP new data events.
 *
 * @author chhitchcock
 * $Id:  $
 */

var _spp = require("./spp");

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
    /**
     * Method called when the first listener is added for an event
     * @param event {String} The event name
     * @param trigger {Function} The trigger function to call when the event is fired
     */
    addEventListener: function (event, trigger) {
        if (event && trigger) {
            switch (event) {
                case "bluetoothsppopened":
                    _spp.setStreamOpenedTrigger(trigger);
                    break;
                case "bluetoothsppclosed":
                    _spp.setStreamClosedTrigger(trigger);
                    break;
                case "bluetoothspperror":
                    _spp.setErrorTrigger(trigger);
                    break;
                case "bluetoothsppnewdata":
                    _spp.setNewDataTrigger(trigger);
                    break;                                                          
            }
        }
    },

    /**
     * Method called when the last listener is removed for an event
     * @param event {String} The event name
     */
    removeEventListener: function (event) {
        if (event) {
            switch (event) {
                case "bluetoothsppopened":
                    _spp.setStreamOpenedTrigger(null);
                    break;
                case "bluetoothsppclosed":
                    _spp.setStreamClosedTrigger(null);
                    break;
                case "bluetoothspperror":
                    _spp.setErrorTrigger(null);
                    break;
                case "bluetoothsppnewdata":
                    _spp.setNewDataTrigger(null);
                    break;                                                          
            }
        }
    }
};
