/**
 * Displays a map maneuver
 * @author mlapierre
 *
 * $Id: Maneuver.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('Navigation.view.map.Maneuver', {
	extend: 'Ext.Container',
	xtype: 'mapManeuver',
	
	config: {
		layout: 'hbox',
		items: [
			{
				cls: 'maneuver-image',
				xtype: 'image',
			},{
				layout: 'vbox',
				cls: 'maneuver-info',
				items: [
					{
						action: 'streetname',
						cls: 'streetname',
						docked: 'top',
					},{
						action: 'distance',
						cls: 'distance',
						docked: 'bottom',
					}
				]
			}
		]
	},
});