/**
 * Represents a Playlist
 * @author nschultz
 *
 * $Id: Playlist.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.model.Playlist', {
	extend: 'Ext.data.Model',
	
	config: {
		fields: [
			{name: "id",		type: "int"},
			
		]
	}
});
