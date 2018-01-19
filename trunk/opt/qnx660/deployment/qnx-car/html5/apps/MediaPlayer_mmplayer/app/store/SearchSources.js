/**
 * The store responsible for storing searchable media sources. This store would typically
 * act as a filtered proxy to the MediaSources store.
 * @author lgreenway
 *
 * $Id: SearchSources.js 7035 2013-08-28 14:19:55Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.store.SearchSources', {
	extend: 'Ext.data.Store',
	requires: [
		'MediaPlayer.model.MediaSource',
	],
	
	config: {
		model: 'MediaPlayer.model.MediaSource',
		
		sorters: [
			{
				sorterFn: function(record1, record2) {
					var r1id = record1.get('id'),
						r2id = record2.get('id'),
						r1type = record1.get('type'),
						r2type = record2.get('type'),
						r1name = record1.get('name').substr(0, 1).toLowerCase(),
						r2name = record2.get('name').substr(0, 1).toLowerCase();
					
					// Priority goes to the radio media source - it should always be listed first
					return r1type === MediaPlayer.model.MediaSource.TYPE_RADIO ? -1 :
							r2type === MediaPlayer.model.MediaSource.TYPE_RADIO ? 1 :
							r1type > r2type ? 1 :		// Then to the media source type
							r1type < r2type ? -1 :
							r1name > r2name ? 1 :		// Then to the media source name's first character
							r1name < r2name ? -1 :
							r1id > r2id ? 1 :			// And finally, the ID
							r1id < r2id ? -1 : 0;
				},
				direction: 'ASC'
			}
		],
		filters: [
			Ext.create('Ext.util.Filter', {
				filterFn: function(item) {
					var pass = false;
					if(item instanceof MediaPlayer.model.MediaSource
							&& item.get('capabilities') instanceof MediaPlayer.model.MediaSourceCapabilities) {
						pass = item.get('capabilities').get('search'); 
					}
					return pass;
				},
				root: 'data'
			})
		]
	}
});