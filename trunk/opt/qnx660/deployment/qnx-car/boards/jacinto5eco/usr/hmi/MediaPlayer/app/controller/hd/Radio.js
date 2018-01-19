/**
 * The controller for the hd-quality Radio view.
 * @author lgreenway
 *
 * $Id$
 */
Ext.define('MediaPlayer.controller.hd.Radio', {
	extend: 'MediaPlayer.controller.Radio',

	config: {
		band: 'FM',
		
		refs: {
			centralpanel: 'hdcentralpanel',
			
			tunerDial	: 'radioView radiotunerdial',
			bandSelect	: '#bandSelectBtn',
			pgrmSelectPanel	: '#pgrmSelectPanel',
			pgrmBtnPanel: '#pgrmBtnPanel',
			hdlogo		: '#hd_logo',
			trafficPanel: '#hdTrafficPanel',
			
			showHdStatusBtn: '#showHdStatusBtn',
			presetList: 'radioView list[id=presetList]',
			
			lotImage: '#LotImage',
			stationName	: '#stationName',
			genreName	: '#genreName',
			albumName	: '#albumName',
			artistName	: '#artistName',
			songName	: '#songName',
			
			statusAcquireBtn: '#hdAcquireBtn',
			statusSignal: '#stat_signal',
			statusSis: '#stat_sis',
			statusAudio: '#stat_audio',
			statusDaai: '#stat_daai',
			statusQi: '#stat_qi',
			statusCdno: '#stat_cdno',
			statusCurpgm: '#stat_curpgm',
			statusPgmAvail: '#stat_pgmAvail',
			statusPsMode: '#stat_psmode',
		},
		control: {
			tunerDial: {
				stationchange: 'onTunerStationChange',
			},
			bandSelect: {
				tap : 'onBandSelect'
			},
			hdlogo: {
				tap : 'pgrmSelect'
			},
			presetList: {
				itemtap: 'onPresetTap',
				itemtaphold: 'onPresetTapHold',
			},
			showHdStatusBtn:{
				tap: 'showHdStatus' 
			},
			statusAcquireBtn: {
				tap: 'onHdAcquire'
			},
		},
	},

	/**
	 * Event handler for Radio API change events.
	 * @param {Event} e Radio change event.
	 */
	onRadioEvent: function(e) {
		console.log('Rds change');
		this.callParent(arguments);
		
		if (e.data.hd) {
			this.getPgrmSelectPanel().show();
			this.getStationName().setHtml(e.data.station);
			
			var lotImageFile = e.data.AlbumArt;
			if (lotImageFile.length > 4) { //valid filename is longer than 4 characters
				this.getLotImage().setHtml('<img src="http://localhost:8080/MediaPlayer/resources/img/radio/albumArt/' + e.data.AlbumArt + '" style="max-height:160px;"></img>');
				this.getLotImage().show();
			} else {
				this.getLotImage().hide();
			}
			
			if ( (e.data.TrafficAlert).length > 1) {
				this.getTrafficPanel().setHtml('Traffic: ' + e.data.TrafficAlert);
				this.getTrafficPanel().show();
			} else {
				this.getTrafficPanel().hide();
			}
		} else {
			this.getStationName().setHtml(e.data.station + '-' + this.getBand()); //attach -AM or -FM after station code
			this.getPgrmSelectPanel().hide();
			this.getLotImage().hide();
			this.getTrafficPanel().hide();
		}
		
		if ( (e.data.album).length > 1 ) {
			this.getAlbumName().setHtml(e.data.album);
			this.getAlbumName().show();
		} else {
			this.getAlbumName().hide();
		}
		if ( (e.data.genre).length > 1) {
			this.getGenreName().setHtml(e.data.genre);
			this.getGenreName().show();
		} else {
			this.getGenreName().hide();
		}
		this.getArtistName().setHtml(e.data.artist);
		this.getSongName().setHtml(e.data.song);
	},
	
	/**
	 * Event handler for Radio API ti_status change events.
	 * @param {Event} e Radio ti_status change event.
	 */
	onRadioStatusEvent: function(e) {
		console.log("onRadioStatusEvent: hd_pgmAvail-" + e.data.hd_pgmAvail);
		this.getPgrmBtnPanel().removeAll();
		for (var i=0; i<8; i++) {
			if (e.data.hd_pgmAvail & (1<<i) ){
				if (i==e.data.hd_curpgm) {
					this.getPgrmBtnPanel().add({html:(i+1),cls:'hdPgrmBtnSelected'})
				} else {
					this.getPgrmBtnPanel().add({html:(i+1),cls:'hdPgrmBtnAvailable'})
				}
			}
		}
		
		// Update status fields only if HdCentralStatus is active
		if ( this.getShowHdStatusBtn().getText() == 'Show Feature' ) {
			this.getStatusSignal().setHtml(e.data.hd_signal);
			this.getStatusSis().setHtml(e.data.hd_sis);
			this.getStatusAudio().setHtml(e.data.hd_audio);
			this.getStatusDaai().setHtml(e.data.hd_daai);
			this.getStatusQi().setHtml(e.data.hd_qi);
			this.getStatusCdno().setHtml(e.data.hd_cdno);
			this.getStatusCurpgm().setHtml(e.data.hd_curpgm);
			this.getStatusPgmAvail().setHtml(e.data.hd_pgmAvail);
			this.getStatusPsMode().setHtml(e.data.hd_psmode);
			setTimeout(function() {QnxCar.Media.Radio.hdGetStatus();}, 1000);
		}
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
	
	onBandSelect: function(btn,e, eOpts){
		if (btn.getText() == 'AM'){
			QnxCar.Media.Radio.bandSelect('FM');
			btn.setText('FM');
			this.setBand('FM');
			
			this.getTunerDial().setTuner(Ext.create('MediaPlayer.model.RadioTuner',
				{ type: 'FM',
				rangeMin: 87.1,
				rangeMax: 108.1,
				rangeStep: 0.2 }));
			
			var lastFreq = QnxCar.Media.Radio.getLastFreq('FM');
			setTimeout(function() {QnxCar.Media.Radio.tuneFreq('FM', lastFreq);}, 1500);
			this.getTunerDial().setSelectedStation(lastFreq);
			
			// Get the presets for FM
			var presets = QnxCar.Media.Radio.getPresets('FM');
		} else {
			QnxCar.Media.Radio.bandSelect('AM');
			btn.setText('AM');
			this.setBand('AM');
			
			this.getTunerDial().setTuner(Ext.create('MediaPlayer.model.RadioTuner',
				{ type: 'AM',
				rangeMin: 880,
				rangeMax: 1710,
				rangeStep: 10 }));
			
			var lastFreq = QnxCar.Media.Radio.getLastFreq('AM');
			setTimeout(function() {QnxCar.Media.Radio.tuneFreq('AM', lastFreq);}, 1500);
			this.getTunerDial().setSelectedStation(lastFreq);
			
			// Get the presets for FM
			var presets = QnxCar.Media.Radio.getPresets('AM');
		}
		
		// Remove existing presets from the store
		this.getTunerPresetStore().removeAll();
		// Add the presets to the store. The list in the view will automatically update
		var presetInstances = [];
		for(var i = 0; i < presets.length; i++)
		{
			presetInstances.push({ freq: presets[i] });
		}
		this.getTunerPresetStore().add(presetInstances);
	},
	
	pgrmSelect: function(){
		var pgmAvail = QnxCar.Media.Radio.getStatus().hd_pgmAvail;
		var totalPgms = 0;
		for (var i=0; i<8; i++) {
			if ( pgmAvail & (1<<i) ){
				totalPgms++;
			}
		}
		var curpgm = QnxCar.Media.Radio.getStatus().hd_curpgm;
		if (curpgm == totalPgms-1) {
			QnxCar.Media.Radio.hdSpsCtrl(0);
		} else {
			QnxCar.Media.Radio.hdSpsCtrl((+curpgm)+1);
		}
		setTimeout(function() {QnxCar.Media.Radio.hdGetStatus();} , 500);
	},
	
	showHdStatus: function() {
		if (this.getShowHdStatusBtn().getText() == 'Show Status'){
			this.getCentralpanel().animateActiveItem(1,{type:'slide',direction:'down',duration:'1000ms'});
			this.getShowHdStatusBtn().setText('Show Feature');
			QnxCar.Media.Radio.hdGetStatus(); // trigger the onRadioStatusEvent
		} else {
			this.getCentralpanel().animateActiveItem(0,{type:'slide',direction:'up',duration:'1000ms'});
			this.getShowHdStatusBtn().setText('Show Status');
		}
	},
	
	onPresetTap: function(dv, index, target, record) {

		QnxCar.Media.Radio.tuneFreq(this.getBand(), record.data.freq);
		/* update last frequency in pps/radio/tuners */
		QnxCar.Media.Radio.saveLastFreq(this.getBand(),record.data.freq);
		
		this.getTunerDial().setSelectedStation(record.data.freq);
	},
	
	onPresetTapHold: function(dv, index, target, record, e) {
		var myStore = Ext.getStore('hdRadioPreset');
		var station = this.getTunerDial().getSelectedStation();
		station = Math.round(station * 10)/10; // necessary to avoid displaying trailing decimals
		myStore.getAt(index).set('freq',station);
		QnxCar.Media.Radio.savePreset(this.getBand(), station, index);
	},
	
	onHdAcquire: function() {
		QnxCar.Media.Radio.hdAcquire();
	},

});

