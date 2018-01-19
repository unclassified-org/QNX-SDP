/**
 * The event context for navigator events
 *
 * @author dkerr
 * $Id: context.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var _navigator = require("./navigator"),
    _hnm = require("./hnm");

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
                case "navigatorstartrequest":
                    _navigator.setStartTrigger(trigger);
                    break;
                case "navigatorstoprequest":
                    _navigator.setStopTrigger(trigger);
                    break;
                case "navigatorappstarted":
                    _navigator.setStartedTrigger(trigger);
                    break;
                case "navigatorappstopped":
                    _navigator.setStoppedTrigger(trigger);
                    break;
                case "navigatorapperror":
                    _navigator.setErrorTrigger(trigger);
                    break;
                case "navigatorhnmstatus":
                    _hnm.setStatusTrigger(trigger);
                    break;
                case "navigatorhnmnotification":
                    _hnm.setNotificationTrigger(trigger);
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
                case "navigatorstartrequest":
                    _navigator.setStartTrigger(null);
                    break;
                case "navigatorstoprequest":
                    _navigator.setStopTrigger(null);
                    break;
                case "navigatorappstarted":
                    _navigator.setStartedTrigger(null);
                    break;
                case "navigatorappstopped":
                    _navigator.setStoppedTrigger(null);
                    break;
                case "navigatorapperror":
                    _navigator.setErrorTrigger(null);
                    break;
                case "navigatorhnmstatus":
                    _hnm.setStatusTrigger(null);
                    break;
                case "navigatorhnmnotification":
                    _hnm.setNotificationTrigger(null);
                    break;
            }
        }
    }
};
