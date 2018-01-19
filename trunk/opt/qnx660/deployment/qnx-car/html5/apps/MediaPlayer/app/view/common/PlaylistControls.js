/**
 * Displays the playlist controls - repeat one, repeat all and shuffle buttons
 * @author mlapierre
 *
 * $Id: PlaylistControls.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.view.common.PlaylistControls', {
	extend: 'Ext.Container',
	xtype: 'playlistControls',

	requires: [
		'Ext.Button',
	],

	config: {
		layout: 'hbox',
		defaults: {
			xtype: 'button',
		},
		items: [
			{
				action: 'repeatall',
				cls: 'button-small button-repeat-all',
			},{
				action: 'repeatone',
				cls: 'button-small button-repeat-one',
			},{
				action: 'shuffle',
				cls: 'button-small button-shuffle',
			}
		]		
	},
});