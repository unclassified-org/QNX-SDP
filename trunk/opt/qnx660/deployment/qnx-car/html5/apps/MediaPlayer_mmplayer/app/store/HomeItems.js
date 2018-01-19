/**
 * A genre store used to show genres in the menus
 * @author mlapierre
 *
 * $Id: HomeItems.js 6632 2013-06-20 15:18:00Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.store.HomeItems', {
	extend: 'Ext.data.Store',

	requires: [
		'MediaPlayer.model.HomeItems',
	],

	config: {
		model: 'MediaPlayer.model.HomeItems',
		data: [
			{ label: 'PLAY RADIO', 		cls: 'safe home-radio',		safe: true,	available: true,	event: 'radio_index'},
			{ label: 'PLAY MUSIC', 		cls: 'safe home-music',		safe: true,	available: true,	event: 'audio_index'},
			{ label: 'PLAY VIDEO', 		cls: 'safe home-video',		safe: true,	available: true,	event: 'video_index'},
			//{ label: 'IMPORT MUSIC', 	cls: 'unsafe home-import',	safe: false,	available: true,	event: 'import_index'},
			//{ label: 'MANAGE MUSIC', 	cls: 'unsafe home-manage',	safe: false,	available: true,	event: 'manage_index'},
			{ label: 'SEARCH', 			cls: 'unsafe home-search',	safe: true,	available: true,	event: 'search_index'},
		]
	},
});