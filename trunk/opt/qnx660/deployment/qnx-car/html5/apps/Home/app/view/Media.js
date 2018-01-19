/**
 * Displays the media panel 
 * @author mlapierre
 *
 * $Id: Media.js 6692 2013-06-26 19:32:03Z lgreenway@qnx.com $
 */
Ext.define('Home.view.Media', {
	extend: 'Ext.Panel',
	xtype: 'mediaWidget',
	
	requires: [
		'Home.view.ProgressBar',
		'Home.view.media.Artwork',
	],

	initialize: function() {
		this.callParent(arguments);
		
		// Change the nothing playing wording if we're in the mmplayer profile
		if(Home.app.getCurrentProfile() instanceof Home.profile.mmplayer
			&& this.down('container[action=nothingplaying]'))
		{
			this.down('container[action=nothingplaying]').setHtml('No songs selected.');
		}
	},

	config: {
		layout: 'vbox', 
		scroll: false,
		cls: 'home-media',

		items: [
			{
				html: 'NOW PLAYING',
				cls: 'box-title',
			},{
				layout: 'hbox',
				items: [
					{
						action: 'albumart',
						xtype: 'mediaArtwork'
					},{
						action: 'mediadetails',
						layout: 'card',
						cls: 'media-rightcol',
						items: [
							{
								action: 'nothingplaying',
								cls: 'media-nothingplaying',
								html: 'There are no songs.'
							},{
								action: 'nowplaying',
								cls: 'media-nowplaying',
								layout: 'vbox',
								items: [
									{
										action: 'source',
										cls: 'media-source',
									},{
										action: 'songtitle',
										cls: 'media-songtitle',
									},{
										action: 'artist',
										cls: 'media-artist',
									},{
										action: 'album',
										cls: 'media-album',
									},{
										action: 'progressbar',
										xtype: 'progressbar',
										cls: 'media-progressbar progressbar'
									},{
										action: 'progresstime',
										cls: 'media-progresstime',
									}
								]
							}
						]
					}
				]
			}
		],	
	}

});