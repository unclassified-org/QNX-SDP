/**
 * The controller for the dab-quality Radio view.
 * @author lgreenway
 *
 * $Id$
 */
Ext.define('MediaPlayer.controller.dab.Radio', {
	extend: 'MediaPlayer.controller.Radio',
	
	requires: ['MediaPlayer.store.Dab3Frequencies','MediaPlayer.store.DabLFrequencies'],

	config: {
		band: 'DAB3',
		curFreq: 0,
		curServ: '',
		curComp: '',
		
		refs: {
			bandSelect: '#dabBandSelectBtn',
			freqList: 'list[id=dabFreqList]',
			servList: 'list[id=dabServList]',
			compList: 'list[id=dabCompList]'
		},
		control: {
			bandSelect: {
				tap : 'onBandSelect'
			},
			freqList: {
				itemtap: 'onFreqTap',
			},
			servList: {
				itemtap: 'onServTap',
			},
			compList: {
				itemtap: 'onCompTap',
			},
		},
	},

	onRadioEvent: function() {
		console.log('DAB onRadioEvent');
		this.callParent(arguments);
		
	},
	
	onRadioStatusEvent: function() {
		console.log("DAB onRadioStatusEvent");
	},
	
	onBandSelect: function(btn,e, eOpts){
		this.getServList().hide(); //hide when change band
		this.getCompList().hide();
	
		if (btn.getText() == 'DAB3'){
			btn.setText('DABL');
			this.setBand('DABL');
			
			this.getFreqList().setStore(Ext.getStore('dabLFreqs'));
		} else {
			btn.setText('DAB3');
			this.setBand('DAB3');
			
			this.getFreqList().setStore(Ext.getStore('dab3Freqs'));
		}
	},
	
	onFreqTap: function(dv, index, target, record) {
		console.log('tune_freq: ' + record.data.freq);
		this.getServList().hide(); //hide when change frequency
		this.getCompList().hide();
		
		this.setCurFreq(record.data.freq);
		QnxCar.Media.Radio.tuneFreq(this.getBand(), record.data.freq);
		
		this.getServList().show();
	},
	
	onServTap: function(dv, index, target, record) {
		console.log('select_service: ' + record.data.serv);
		this.getCompList().hide(); //hide when change service
		
		this.setCurServ(record.data.serv);
		// <insert select Service command>
		
		this.getCompList().show();
	},
	
	onCompTap: function(dv, index, target, record) {
		console.log('select_component: ' + record.data.comp);
		
		this.setCurComp(record.data.comp);
		// <insert select Component command>
		
		console.log('tune complete: band-' + this.getBand() + ', freq-' + this.getCurFreq() + ', serv-' + this.getCurServ() + ',comp-' + this.getCurComp());
	},
	
	/**
	 * Event handler for when the selected station on the radio tuner dial control
	 * changes.
	 * @param {Event} e Event data containing the new station (e.station).
	 */
	onTunerStationChange: function(e) {
		QnxCar.Media.Radio.tuneFreq(this.getBand(), e.station);
		QnxCar.Media.Radio.saveLastFreq(this.getBand(),e.station);
	},

});

