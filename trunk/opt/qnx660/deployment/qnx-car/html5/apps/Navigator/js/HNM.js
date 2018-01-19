Navigator.ns('Navigator');

/**
 *
 * @author dkerr
 * $Id: HNM.js 5174 2012-11-22 20:08:52Z dkerr@qnx.com $
 */
Navigator.HNM = new ((function() {

var self = this;

///// EVENTS /////
this.E_MODAL_SELECTED = 'Navigator.HNM.E_MODAL_SELECTED';

///// PRIVATE METHODS /////
var processDisplay = function (args) {
	var data = {},
		name, severity;

	for(var i = 0; i < args.length; i++) {
		switch(args[i].type) {
			case 'Overlay':
			case 'Fullscreen':
				data.app = args[i].name;
				data.Data = {action: args[i].view};
				self.dispatch(self.E_MODAL_SELECTED, data);
				break;
			case 'Notification':
				name = args[i].name.split(/::/)[0]; 
				severity = args[i].name.split(/::/)[1];
				qnx.navigator.overlay.show({
					type: 'notice',
					stay: true,
					text: name,
					title: severity,
					cls: severity.toLowerCase()
				});
				break;
			case 'Growl':
				name = args[i].name.split(/::/)[0];
				severity = args[i].name.split(/::/)[1];
				qnx.navigator.overlay.show({
					type: 'notice',
					stay: false,
					text: name,
					title: severity,
					cls: 'notice'
				});
				break;
		}
	}
};

var onHnmEvent = function (event) {
	var categories = Object.keys(event);

	for(var i = 0; i < categories.length; i++) {
		switch(categories[i]) {
			case 'display':
				processDisplay(event[categories[i]]);
				break;
			default:
				console.error('HNM: unknown category - ' + event[categories][i]);
				break;
		}
	}

};

///// PUBLIC METHODS /////
self.init = function () {
	blackberry.event.addEventListener("navigatorhnmstatus", onHnmEvent);
	blackberry.event.addEventListener("navigatorhnmnotification", onHnmEvent);
};

}).extend(Navigator.EventDispatcher))();