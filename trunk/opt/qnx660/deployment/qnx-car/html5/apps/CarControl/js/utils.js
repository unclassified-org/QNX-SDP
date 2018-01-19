// $Id: utils.js 6518 2013-06-12 14:13:53Z mlytvynyuk@qnx.com $
/**
 * Gets the x,y coordinates for the center of the supplied control
 * @param {Object} The visible DOM object for which to get the centre x,y coordinates
 * @returns {Array} An array containing two values: x,y coordinates in pixels
 */
function getControlCentre(ctrl) {
	var controlOffset = $(ctrl).offset();
	var controlCentreX = controlOffset.left + $(ctrl).width() / 2;
	var controlCentreY = controlOffset.top + $(ctrl).height() / 2;

	return Array(controlCentreX, controlCentreY);
}

/**
 * Utility function to convert degrees to radians
 * @param {Number} Degrees
 * @returns {Number} Radians
 */
function degToRad(deg)
{
	return deg * (Math.PI/180);
}

/**
 * Utility function to convert radians to degrees
 * @param {Number} Radians
 * @returns {Number} Degrees
 */
function radToDeg(rad)
{
	return rad * (180 / Math.PI);
}

/**
 * Returns a string representation of a date object in the format
 * dd/mm/yy h:mm:ss AM/PM
 * @param {Date} The date
 * @returns {String} The date string
 */
function dateToStr(date)
{
	var str = '';
	if(typeof(date) != 'undefined' && date instanceof Date)
	{
		str += (date.getDate() < 10 ? '0' : '') + date.getDate() + '/';
		str += (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1) + '/';
		str += ('' + date.getFullYear()).substr(2) + ' ';
		if(date.getHours() == 0)
		{
			str += '12' + ':';
		}
		else
		{
			str += (date.getHours() <= 12 ? date.getHours() : date.getHours() - 12) + ':';	
		}
		str += (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ':';
		str += (date.getSeconds() < 10 ? '0' : '') + date.getSeconds() + ' ';
		str += (date.getHours() <= 11 ? 'AM' : 'PM');
	}
	return str;
}

/**
 * Returns the supplied number of days in milliseconds
 * @param {Number} The number of days
 * @return {Number} Milliseconds
 */
function daysToMs(days)
{
	return days*24*60*60*1000;
}

/**
 * Enables the use of event binding on a jQM double tap
 */
(function($) {
	$.fn.doubleTap = function(doubleTapCallback) {
		return this.each(function(){
			var elm = this;
			var lastTap = 0;
			$(elm).bind('vmousedown', function (e) {
				var now = (new Date()).valueOf();
				var diff = (now - lastTap);
				lastTap = now ;
				if (diff < 250) {
					if($.isFunction( doubleTapCallback ))
					{
						doubleTapCallback.call(elm);
					}
				}     
			});
		});
	}
})(jQuery);

/**
 * Created a UI blocking overlay with an animation and text prompting the user that the application is
 * currently processing.
 * @param args {Object} configuration options for the overlay
 * 		Example:
 * 			{
 * 				action: {String} ["show" | "hide"],
 * 				text: {String}
 * 			}
 */
function loadingOverlay(args) {
	var tmpOverlay = new function() {
		var self = this;
		var loadingOverlay;
		
		// Create a loading animation overlay
		self.show = function() {
			// If the loading overlay doesn't exist, create one and create a local reference to it, else, create a local reference to
			// the existing overlay
			if($(".loadingOverlay").length === 0) {
				loadingOverlay = $('<div class="loadingOverlay"><div class="loadingText"></div><div class="loadingAnimation"></div></div>').prependTo("body");
			} else {
				loadingOverlay = $(".loadingOverlay");
			}

			// Insert the text provided in the argument
			$(".loadingText", loadingOverlay).text(args.text || "");
		};

		// Kill all loading animation overlays
		self.hide = function() {
			$(".loadingOverlay").remove();
		};

		// Run the hide/show function immediately
		self[args.action || "show"]();
	}
}

/**
 * Return the language appropriate value for a specified code
 * 
 * @param code {String} code referencing a translation in the language file loaded
 * 
 * @returns {String} the value of the translation code requested
 */
function getTranslation(code) {
	try {
		var returnString = "";

		// If the language file is loaded
		if(typeof translations != "undefined") {
			var evalCode = eval("translations." + code);
	
			// If the translation does not exist, throw an error, otherwise return the value
			if(evalCode == undefined) {
				throw("Translation code not found")
			} else {
				returnString = evalCode;
			}
		} else {
			throw("No translation file is loaded.")
			returnString = code;
		}

		return returnString;
	} catch(err) {
		console.error("getTranslation()", err);

		return code;
	}
}

/**
 * Casts a value to the data type provided
 * 
 * @param dataType {String} the JavaScript data type of the value to be casted
 * @param value {String} value to be casted according to the "dataType" argument
 * 
 * @returns {Object, String, Number, Boolean} return the appropriately casted version of the value provided in the argument list
 */
function typeCast(dataType, value) {
	try {
		var returnValue = value;
	
		// Everything comes in as a string by default, so a process to explicitly
		// set the correct data type defined in the mapping is required
		switch(dataType) {
			case "boolean":
				returnValue = (value == "true"); // Cast to boolean
				break;
			case "number":
				returnValue = parseFloat(value); // Cast to numeric/float
				break;
			case "json":
				returnValue = JSON.parse(value); // Cast the object to a JSON string
				break;
		}
		
		return returnValue;
	} catch(err) {
		console.error("typeCast()", err);
	}
}

/**
 * Function performs a deep comparison of 2 objects
 */
function compareObjects(obj1, obj2) {
	// Are the objects provided the same type
	if(typeof obj1 !== typeof obj2) { return false; }

	switch (typeof obj1) {
		case "object":
			// Are the number of properties the same
			if(Object.keys(obj1).length !== Object.keys(obj2).length) { return false; };

			// Loop through each property to ensure appropriate deep comparison
			for (var propertyKey in obj1) {
				if (typeof obj2[propertyKey] === "undefined" || !compareObjects(obj1[propertyKey], obj2[propertyKey])) {
					return false;
				}
			}

			break;

		default:
			return (obj1 === obj2);
	}

	return true;
};

/**
 * Utility function to escape HTML entities
 * @param str {String} string to be escaped, eg <html/>
 * @return {String } escaped string &lt;html/&gt;
 * */
function htmlEscape(str) {
	return String(str)
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

/**
 * Utility function to un-escape HTML entities
 * @param str {String} string to be escaped, eg &lt;html/&gt;
 * @return {String } escaped string <html/>
 * */
function htmlUnescape(value){
	return String(value)
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&amp;/g, '&');
}