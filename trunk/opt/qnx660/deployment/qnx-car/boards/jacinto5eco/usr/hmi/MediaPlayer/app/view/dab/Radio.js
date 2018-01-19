/**
 * The hd-quality Radio view.
 * @author lgreenway@lixar.com
 *
 * $Id$
 */
Ext.define('MediaPlayer.view.dab.Radio', {
	extend: 'MediaPlayer.view.Radio',
	
	requires: [
		'MediaPlayer.store.Dab3Frequencies'
	],
	
	config: {
		layout: 'hbox',
		items: [
			{
				xtype: 'container',
				items: [
					{
						xtype: 'button',
						id: 'dabBandSelectBtn',
						text: 'DAB3'
					},
					
				]
			},
			{
				xtype: 'list',
				id: 'dabFreqList',
				height: 350,
				width: 150,
				store: 'dab3Freqs',
				itemTpl: '<div class="freqList">{name}-{freq}</div>'
			},
			{
				xtype: 'list',
				id: 'dabServList',
				height: 350,
				width: 150,
				store: 'dabServices',
				itemTpl: '<div class="servList">{serv}</div>'
			},
			{
				xtype: 'list',
				id: 'dabCompList',
				height: 350,
				width: 150,
				store: 'dabComponents',
				itemTpl: '<div class="compList">{comp}</div>'
			},
		]
	},
});