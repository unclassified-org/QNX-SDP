/**
 * This is the application definition file
 * @author mlapierre
 *
 * $Id: app.js 6410 2013-05-30 15:55:43Z lgreenway@qnx.com $
 */
Ext.Loader.setConfig({ enabled: true, disableCaching: false });

Ext.application({
	name		: 'Home',
	profiles	: ['mmcontrol', 'mmplayer'],
	controllers	: ['QnxCar', 'Media', 'Navigation', 'Messages'],
	models		: ['Contact', 'Message'],
	stores		: ['AllMessages'],
	views 		: ['Index'],

	/**
	 * Method called after all the controller init but before controller launch
	 */
	launch: function() {
		Ext.Viewport.add([
			Ext.create('Home.view.Index'),
		]);
	}
});
