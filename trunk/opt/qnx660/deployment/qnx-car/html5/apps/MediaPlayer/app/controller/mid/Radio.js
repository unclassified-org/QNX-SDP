/**
 * The controller for the mid-quality Radio view.
 * @author lgreenway
 *
 * $Id: Radio.js 6512 2013-06-11 14:40:47Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.controller.mid.Radio', {
	extend: 'MediaPlayer.controller.Radio',

	config: {
		refs: {
			tunerSlider	: 'radioTunerView radiotunerslider',
			currentStation: 'radioTunerView radiocurrentstation'
		},
	
		control: {
			'radioTunerView radiotunerslider': {
				stationchange: 'onTunerStationChange'
			}
		}
	},

	/**
	* Event handler for the Radio tuner change event
	* @param {Event} e Radio change event
	*/
	
	onRadioTunerChanged: function(e){
		this.callParent(arguments);
		var tuner = qnx.radio.getTuners();
		for(type in tuner){
			if(type == e){
				this.getTunerSlider().setTuner(Ext.create('MediaPlayer.model.RadioTuner',
				{ 	type: tuner[type].type,
					rangeMin: tuner[type].rangeMin,
					rangeMax: tuner[type].rangeMax,
					rangeStep: tuner[type].rangeStep }));
			}
		}
		
		// Set the selected station on the tuner slider
		this.getTunerSlider().setSelectedStation(qnx.radio.getStation());
	},
	
	/**
	* Event handler for the Radio Station change event
	* @param {Event} e Radio change event
	*/
	onRadioStationChanged: function(e){
		this.callParent(arguments);
		// Set the selected station on the tuner dial
		this.getTunerSlider().setSelectedStation(qnx.radio.getStation());
	},
	
	/**
	 * Event handler for when the selected station on the radio tuner slider control
	 * changes.
	 * @param {Event} e Event data containing the new station (e.station).
	 */
	onTunerStationChange: function(e) {
		// Stop any scanning in progress
		this.scanStop();
		
		qnx.radio.setStation(e.station);
	}
	
});

