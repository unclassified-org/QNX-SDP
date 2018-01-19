/**
 * This is the application definition file
 * @author mlapierre
 *
 * $Id: app.js 7261 2013-09-26 14:53:11Z mlapierre@qnx.com $
 */
Ext.Loader.setConfig({ enabled: true,  disableCaching: false  });

//Common components
Ext.Loader.setPath('QnxCar', 'file:///apps/common/ui-framework/sencha/');

Ext.application({
	name: 'Communication',

    requires: [
        'Ext.MessageBox'
    ],
	
    eventPublishers: {
        touchGesture: {
            moveThrottle: 10 * (screen.height / 480),
        },
    },

    profiles:	[
             	 'high',
             	 'mid',
             	 ],

 	 controllers: [
 	               'Application',
 	               'AddressBook',
 	               'Message',
 	               'Menu',
 	               'DialPad',
 	               'CallStatus',
 	               'Home',
 	               'SearchContacts',
 	               ],
	              
	models: ['Contact', 'HomeItem', 'MenuItem', 'Message'],

 	views : [
		'Home',
 		'Menu',
 		'DialPad',
 		'CallStatus',
 		'SearchContacts',
	 ],

	 stores: [
		'HomeItems',
 		'MainMenu',
 		'MessagesMenu',
 		'AllMessages',
 		'EmailMessages',
 		'TextMessages',
 		'AddressBook',
 		'SearchContacts',
	 ],

	 launch: function() {
		Ext.Viewport.add([
		   Ext.create('Communication.view.Home'),
		   Ext.create('Communication.view.Menu'),
		   Ext.create('Communication.view.DialPad'),
		   Ext.create('Communication.view.SearchContacts'),
		]);

		// Register this application to receive application events
		qnx.application.event.register(this.getApplication().getName());
		 
		if(this.getCurrentProfile() != null)
		{
			Ext.getBody().set( { 'data-currentProfile': this.getCurrentProfile().getName() } );
		}
		
		// Override default message box z-index
		Ext.Msg.setZIndex(9999);
	 }
});
