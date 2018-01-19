/**
 * Current radio station name, programming info, etc.
 * @author lgreenway@lixar.com
 *
 * $Id: StationInfo.js 6126 2013-04-29 20:58:48Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.view.radio.tuner.StationInfo', {
	extend: 'Ext.Container',
	xtype: 'radiostationinfo',

	config: {
		layout: 'vbox', 
		scroll: false,
		cls: 'radio-stationinfo',

		/**
		 * The radio station name
		 */
		stationName: '',
		
		/**
		 * The radio station genre
		 */
		genre: '',
		
		/**
		 * The song/show artist currently playing
		 */
		artist: '',
		
		/**
		 * The title of the song/show currently playing
		 */	
		title: '',
		
		/**
		 * Whether the broadcast is in high-definition
		 */
		hd: false,

		items: [
			{
				action: 'stationName',
				cls: 'stationName'
			},{
				action: 'genre',
				cls: 'genre'
			},{
				action: 'artist',
				cls: 'artist'
			},{
				action: 'title',
				cls: 'title'
			},{
				action: 'hd',
				cls: 'hd'
			}
		]
	},
	
	/**
	 * Updates the station name element in the control.
	 */
	updateStationName: function(value, oldValue) {
		this.child('container[action=stationName]').setHtml(value);
	},

	/**
	 * Updates the station genre element in the control.
	 */
	updateGenre: function(value, oldValue) {
		this.child('container[action=genre]').setHtml(value);
	},

	/**
	 * Updates the artist element in the control.
	 */
	updateArtist: function(value, oldValue) {
		this.child('container[action=artist]').setHtml(value);
	},

	/**
	 * Updates the title element in the control.
	 */
	updateTitle: function(value, oldValue) {
		this.child('container[action=title]').setHtml(value);
	},

	/**
	 * Updates the HD indicator element in the control.
	 */
	updateHd: function(value, oldValue) {
		this.child('container[action=hd]').setHtml(value ? 'HD' : '');
	}
	
});