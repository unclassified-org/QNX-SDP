/**
 * The AppCarousel is an {@link Ext.Carousel Carousel} component which contains
 * the application category card views.
 *
 * @author lgreenway@lixar.com
 *
 * $Id: AppCarousel.js 5946 2013-03-26 15:53:00Z mlytvynyuk@qnx.com $
 */
Ext.define('AppSection.view.AppCarousel', {
	extend:'Ext.Carousel',
	requires:[
		'AppSection.view.AllCard',
		'AppSection.view.VehicleCard',
		'AppSection.view.MediaCard',
		'AppSection.view.SocialCard',
		'AppSection.view.GamesCard'
	],
	xtype:'appCarousel',

	config:{
		title:'ALL',
		cls:'card card1',
		indicator:false,


		items:[
			{xtype:'all_card'},
			{xtype:'vehicle_card'},
			{xtype:'media_card'},
			{xtype:'games_card'},
			{xtype:'social_card'}
		]
	}
});

         
            