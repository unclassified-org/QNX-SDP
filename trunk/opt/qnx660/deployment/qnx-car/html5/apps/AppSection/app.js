/**
 * This is the application definition file
 * @author dkerr
 *
 * $Id: app.js 5946 2013-03-26 15:53:00Z mlytvynyuk@qnx.com $
 */

Ext.Loader.setConfig({ enabled: true, disableCaching: false });
Ext.application({
	name: 'AppSection',

	eventPublishers: {
		touchGesture: {
			moveThrottle: 5 * (screen.height / 480)
		}
	},

	profiles: [
		'high',
		'mid'
	],

	controllers: ['QnxCar'],

	models: ['AppItem'],

	stores: [
		'All',
		'Vehicle',
		'Media',
		'Social',
		'Games'
	],

	views: ['ModalWindow'],

	launch: function () {
		Ext.Viewport.add([
			Ext.create('AppSection.view.ModalWindow')
		]);

		qnx.application.event.register(this.getApplication().getName());
	}

});
