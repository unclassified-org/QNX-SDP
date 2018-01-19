/*
 * Copyright (C) 2012 Research In Motion Limited. All rights reserved.
 */
(function () {
    chrome = {};
    chrome.internal = {};
    chrome.internal.webEvent = function (webViewId, eventName, value, eventId) {
        // console.log(eventName + " " + webViewId + " " + value + " " + eventId);
        var a = qnx.weblauncher.webview.registeredEvents[webViewId];
        if (!a)
            return;

        var jsonvalue = value;
        if (eventName.substring(0, 8) !== 'Property') {
            try {
                jsonvalue = JSON.parse(value);
            } catch (err) {
                console.warn("Event sent invalid json: \"" + value + "\".  Error: " + err);
                jsonvalue = {};
            }
        }

        for (reg in a) {
            // There can only be one return value so last one wins
            var returnValue;
            if (a[reg].eventName === eventName)
                returnValue = a[reg].call(a[reg].webview, jsonvalue, eventId);
            if (a[reg].eventName === '*')
                returnValue = a[reg].call(a[reg].webview, value, eventId, eventName);
        }
        return returnValue;
    }

    chrome.native = {};
    chrome.native.error = function (errorMsg) { console.log(errorMsg); }

    if (window.qnx.weblauncher === undefined) {
        qnx.weblauncher = {};
        qnx.weblauncher.webview = {};
        qnx.weblauncher.webview.registeredEvents = {};
    }

    var gen = function (className, functionName) {
        var that = this;
        this.qnxcall = function (functionName, sarguments) {
            var args = [functionName];
            args = args.concat(Array.prototype.slice.call(sarguments, 0));
            return qnx.callExtensionMethod.apply(qnx, args);
        }
        this.webviewcall = function (functionName, windowId, sarguments) {
            var args = [functionName, windowId];
            args = args.concat(Array.prototype.slice.call(sarguments, 0));
            return qnx.callExtensionMethod.apply(qnx, args);
        }
        if (className === 'webview' && functionName != 'create')
            return function () { return that.webviewcall(className + '.' + functionName, this.id, arguments); };
        return function () { return that.qnxcall(className + '.' + functionName, arguments); };
    }

    var bindings = qnx.callExtensionMethod('bindingManager.listBindings').split('\n');
    for(var line in bindings) {
        var t = bindings[line].split('.');
        var className = t[0];
        var functionName = t[1];
        if (!qnx.weblauncher[className]) qnx.weblauncher[className] = {};
        (qnx.weblauncher[className])[functionName] = gen(className, functionName);
    }

    qnx.weblauncher.webview.onEvent = function (eventName, callback) {
        var a = qnx.weblauncher.webview.registeredEvents[this.id];
        if (undefined === a) a = [];
        a.push({call: callback, eventName: eventName, webview: this});
        qnx.weblauncher.webview.registeredEvents[this.id] = a;
    }
}())
