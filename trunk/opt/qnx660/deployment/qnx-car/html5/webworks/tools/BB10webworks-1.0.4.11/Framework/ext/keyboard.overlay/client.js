/**
 * Client side of extension is empty, this is very custom extensions for Navigator
 * */
var _ID = require("./manifest.json").namespace;
/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Initialises extension
	 * @param settings {Objejct} object representing keyboard settings, all fields are mandatory
	 * Ex: {
	*		x:0,
			y:0,
			width:800,
			height:190,
			screenWidth:800,
			screenHeight:480
	 * }
	 * */
	init:function (settings) {
		window.webworks.execSync(_ID, "init", {
			settings:settings
		});
	}
};
