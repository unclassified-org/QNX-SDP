var page = require('webpage').create(),
    system  = require('system'),
    fs = require('fs');

/**
 *  error handler logic, updates should be below this section
 */
page.onConsoleMessage = function(msg){
  console.log(msg);
};

function handleError(err, stack) {
    console.log("== Unhandled Error ==");
    phantom.defaultErrorHandler(err, stack);
    phantom.exit(2);
}

page.onError = phantom.onError = handleError

/* end error handler setup */

if(system.args.length < 2) {
    console.log("usage:");
    console.log("\tsencha slice capture -page <path to html file> [-image-file <image name> -widget-file <widget data file>]:");
    phantom.exit(1);
}

/**
 * args:
 * 0 => this script's file name
 * 1 => the html file to render (on windows, be mindful of '\\' chars)
 * 2 => the name of the screen shot image (default: screenshot.png)
 * 3 => the name of the widget data file (default: widgetdata.json)
 */
var url = system.args[1].replace("\\", "/"),
    screenCapFileName = ((system.args.length > 2) && system.args[2]) || "screenshot.png",
    widgetDataFile = ((system.args.length > 3) && system.args[3]) || "widgetdata.json";

console.log("loading page " + url);

function waitFor(test, ready, timeout) {
    var maxtimeOutMillis = timeout
            ? timeout
            : 30 * 1000,
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                condition = test();
            } else {
                if(!condition) {
                    console.log('failed to render widgets within 30 sec.');
                    phantom.exit(1);
                } else {
                    clearInterval(interval);
                    ready();
                }
            }
        }, 100);
};

page.open(url, function(status){
    if(status === 'success'){
        waitFor(function(){
            return page.evaluate(function(){
                return !!(window['Ext'] && window['Ext'].AllWidgetsCreated);
            });
        }, function(){
            try {
                console.log('capturing screenshot');
                page.render(screenCapFileName);
                data = page.evaluate(function(){
                    return componentData || null;
                });
                if(data) {
                console.log('capturing widget location data');
                fs.write(
                    widgetDataFile,
                    JSON.stringify(data, null, '  '),
                    'w');
                }
                console.log('widget capture complete');
                phantom.exit();
            } catch (e) {
                console.log("Error capturing page : " + e);
                phantom.exit(100);
            }
        });
    } else {
        console.log('failed to load page');
        phantom.exit(100);
    }
});