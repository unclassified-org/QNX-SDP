/**
 * Container view to hold browse and app views
 *
 * @author mlytvynyuk
 *
 * $Id:$
 */
Ext.define('AppBox.view.Main', {
    extend: 'QnxCar.view.menu.StackedMenu',
    xtype: 'mainView',
	cls:'mainView',
	require: [
		'AppBox.view.Browse',
		'AppBox.view.App'
	],
    config: {
		fullscreen:true,
        items: [
			{
				xtype:'browseView'
			}
        ]
    }
});
