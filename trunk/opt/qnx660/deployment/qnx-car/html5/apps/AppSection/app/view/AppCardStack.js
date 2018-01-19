/**
 * The AppCardStack is a simple {@link Ext.Panel Panel} component containing
 * the application category card views. Does not support swiping between views.
 *
 * @author lgreenway@lixar.com
 *
 * $Id: AppCardStack.js 5946 2013-03-26 15:53:00Z mlytvynyuk@qnx.com $
 */
Ext.define('AppSection.view.AppCardStack', {
	extend:'Ext.Panel',
	requires:[
		'AppSection.view.AllCard',
		'AppSection.view.VehicleCard',
		'AppSection.view.MediaCard',
		'AppSection.view.SocialCard',
		'AppSection.view.GamesCard'
	],
	xtype:'appCardStack',

	config:{
		title:'ALL',
		cls:'card card1',

		layout:'card',

		items:[
			{xtype:'all_card'},
			{xtype:'vehicle_card'},
			{xtype:'media_card'},
			{xtype:'games_card'},
			{xtype:'social_card'}
		]
	}
});

         
            