/**
 * Test application
 *
 * @author dkerr
 * $Id: index.js 4990 2012-11-12 21:20:53Z mlytvynyuk@qnx.com $
 */
var APPNAME = 'HTMLGears';

function QNXCAR_TestApp_() {
    var self = this;

    // private functions

    var onPause = function (args) {
        console.log(args);
        x$('#test_app').attr('value', args.action);
    };

    var onResume = function (args) {
        x$('#test_app').attr('value', args.action);
    };

    var onReselect = function (args) {
        x$('#test_app').attr('value', args.action);
    };

    // public functions

    self.init = function () {
        qnx.application.event.register(APPNAME);
        
        blackberry.event.addEventListener("pause", onPause);
        blackberry.event.addEventListener("resume", onResume);
        blackberry.event.addEventListener("reselect", onReselect);

        // getWindowGroup is a temporary function !!! Will not be available in the official release.
        // Please have your native application read directly from /pps/system/navigator/windowgroup
        // The APPNAME registered is the field name in the PPS object.
        var windowGroup = qnx.application.event.getWindowGroup(),
            x = 0, y = 25, w = 800, h = 395;

        x$('label[for=test_app]').html(APPNAME);
        
        x$('#window_group').attr('value', windowGroup);

        x$('#set').on('touchend', function (event) {
            if (qnx.gears.setParams({x:x, y:y, w:w, h:h, screenGroup:windowGroup}) != true) {
                x$('#message').html('error initializing gears application');
            } else {
                x$('#message').html('');
            }
        });

        x$('#start').on('touchend', function (event) {
			if (qnx.gears.setParams({x:x, y:y, w:w, h:h, screenGroup:windowGroup}) == true) {
				// workaround to remove background color from body
				document.body.className = "transparent";
				qnx.gears.start();
			} else {
				x$('#message').html('error starting gears application');
			}
        });

        x$('#stop').on('touchend', function (event) {
            qnx.gears.stop();
        });
    };
};

TestApp = new QNXCAR_TestApp_();