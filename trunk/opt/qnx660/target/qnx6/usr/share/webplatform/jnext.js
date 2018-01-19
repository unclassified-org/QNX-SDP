///////////////////////////////////////////////////////////////////
// This is the main JavaScript framework for JNEXT
///////////////////////////////////////////////////////////////////

function JNEXT_() {

    var self = this;
    var m_bFirstRequire = true;

    self.m_arEvents = new Object();

    self.enabled = function() {
        return objJSExt["sendCmd"] != undefined;
    };

    self.require = function(strLibrary) {

        // This means that JNext is not loaded
        if (!self.enabled()) {
            console.error("JNEXT not loaded.");
            return false;
        }

        // Load a required JNEXT plugin
        var strCmd;
        var strVal;
        var arParams;

        if (m_bFirstRequire) {

            strCmd = "userAgent " + navigator.userAgent;
            strVal = objJSExt.sendCmd(strCmd);
            arParams = strVal.split(" ");

            if (arParams[0] != "Ok") {
                console.error(strVal);
                return false;
            }
            self.m_bFirstRequire = false;
        }

        strCmd = "Require " + strLibrary;
        strVal = objJSExt.sendCmd(strCmd);
        arParams = strVal.split(" ");

        if (arParams[0] != "Ok") {
            console.error(strVal);
            return false;
        }

        return true;
    };

    self.createObject = function(strObjName) {

        // This means that JNext is not loaded
        if (!self.enabled()) {
            console.error("JNEXT not loaded.");
            return false;
        }

        // Create an instance of a native object
        var strVal;
        var arParams;
        strVal = objJSExt.sendCmd("CreateObject " + strObjName);
        arParams = strVal.split(" ");

        if (arParams[0] != "Ok") {
            console.error(strVal);
            return "";
        }

        return arParams[1];
    };

    self.invoke = function(strObjId, strMethod, strParams) {

        // This means that JNext is not loaded
        if (!self.enabled()) {
            console.error("JNEXT not loaded.");
            return false;
        }

        // Invoke a method of a given instance of a native object
        var strCmd = "InvokeMethod " + strObjId + " " + strMethod;
        if (typeof(strParams) != "undefined") {
            strCmd += " " + strParams;
        }

        return objJSExt.sendCmd(strCmd);
    };

    self.registerEvents = function(objNotify) {

        var strId = objNotify.getId();
        self.m_arEvents[strId] = objNotify;
    };

    self.unregisterEvents = function(objNotify)	{

        var strId = objNotify.getId();
        delete self.m_arEvents[strId];
    };

    self.processEvent = function(strNativeEvt) {

        // Process an event received from native code. The event
        // contains the target JavaScript object id and the
        // relevant parameters.

        var arParams = strNativeEvt.split(" ");
        var strObjId = arParams[0];
        var strEvent = strNativeEvt.substring(strObjId.length + 1);

        var objNotify = self.m_arEvents[strObjId];
        if (typeof(objNotify) == "undefined") {

            console.warning("No object with Id " + strObjId + " found for event " + strEvent);
            return;
        }

        // This will now be handled by the appropriate JavaScript
        // JNEXT extension object
        objNotify.onEvent(strEvent);
    };
}

var JNEXT = new JNEXT_();
