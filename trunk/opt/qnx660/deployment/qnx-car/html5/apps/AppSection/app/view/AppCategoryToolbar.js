/**
 * Displays the menu tab items - all, favourites, vehicle, media, social and games
 * 
 * @author dkerr
 *
 * $Id: AppCategoryToolbar.js 5946 2013-03-26 15:53:00Z mlytvynyuk@qnx.com $
 */
Ext.define('AppSection.view.AppCategoryToolbar', {
	extend:'Ext.Toolbar',
	xtype:'appCategoryToolbar',

	requires:[
		'Ext.SegmentedButton',
	],

	config:{
		ui:'tb-ui',
		cls:'tb-cls',

		xtype:'toolbar',
		docked:'top',
		defaults:{
			minWidth:'100%'
		},
		items:[
			{ xtype:'spacer' },
			{
				xtype:'segmentedbutton',
				allowDepress:false,

				defaults:{
					flex:1,
					baseCls:'btn-base'
				},

				items:[
					{
						text:'ALL',
						pressed:true,
						id:'btnAll'
					},
					{
						text:'VEHICLE',
						id:'btnVeh'
					},
					{
						text:'MEDIA',
						id:'btnMed'
					},
					{
						text:'GAMES',
						id:'btnGames'
					},
					{
						text:'INTERNET',
						id:'btnSoc'
					}
				]
			},
			{ xtype:'spacer' }
		]
	}
});
