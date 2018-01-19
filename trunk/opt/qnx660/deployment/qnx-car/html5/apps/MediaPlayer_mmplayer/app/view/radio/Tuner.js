/**
 * The abstract radio tuner view
 * @author lgreenway@lixar.com
 *
 * $Id: Tuner.js 5983 2013-04-02 15:37:49Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.view.radio.Tuner', {
	extend: 'Ext.Panel',
	xtype: 'radioTunerView',
	
	requires: [
		'QnxCar.view.menu.ShowButton',
	],
	
	config: {
		layout: 'vbox',
		cls: 'media-panel',
	},
	
	initialize: function() {
		// Add the menu show button as the first child of the vbox
		// so that all view subclasses will have it.
		this.insert(0, {xtype: 'menuShowButton'});
	},
});