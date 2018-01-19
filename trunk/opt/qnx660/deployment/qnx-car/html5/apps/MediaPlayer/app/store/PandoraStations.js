/**
 * A store used for the Pandora Station list.
 * @author lgreenway@lixar.com
 *
 * $Id: PandoraStations.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('MediaPlayer.store.PandoraStations', {
	extend: 'Ext.data.Store',
	requires: [
		'MediaPlayer.model.PandoraStation',
	],
	
	config: {
		model: 'MediaPlayer.model.PandoraStation'
	}
});