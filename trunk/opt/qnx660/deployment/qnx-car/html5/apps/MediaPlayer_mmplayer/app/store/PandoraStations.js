/**
 * A store used for the Pandora Station list.
 * @author lgreenway@lixar.com
 *
 * $Id: PandoraStations.js 5983 2013-04-02 15:37:49Z lgreenway@qnx.com $
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