/**
 * The controller for the mid-quality Radio view.
 * @author lgreenway
 *
 * $Id: Radio.js 7058 2013-08-30 17:21:50Z mlapierre@qnx.com $
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
	 * Method called when app is ready to launch
	 */
	launch: function() {
		// Event handlers for radio API status change event
		car.radio.watchRadio(this.onRadioStatusChanged.bind(this));
		
		// Populate the radio data
		car.radio.getStatus(this.onRadioStatusChanged.bind(this));
	},

	/*
	 * Event handler for the Radio tuner change event
	 * @param {Event} e Radio change event
	 */
	onRadioStatusChanged: function(e){
		this.callParent(arguments);

		if (typeof e.tuner !== "undefined") {
			car.radio.getTuners(function(tuners) {
				for (var i=0; i<tuners.length; i++){
					if(tuners[i].tuner == e.tuner){
						this.getTunerSlider().setTuner(Ext.create('MediaPlayer.model.RadioTuner', {
							type: tuners[i].type,
							rangeMin: tuners[i].settings.rangeMin,
							rangeMax: tuners[i].settings.rangeMax,
							rangeStep: tuners[i].settings.rangeStep 
						}));
					}
				}
			}.bind(this));
		}

		// Set the selected station on the tuner dial
		if (typeof e.station !== "undefined") {
			this.getTunerSlider().setSelectedStation(e.station);
		}
	},
	
	
	/**
	 * Event handler for when the selected station on the radio tuner slider control
	 * changes.
	 * @param {Event} e Event data containing the new station (e.station).
	 */
	onTunerStationChange: function(e) {
		// Stop any scanning in progress
		this.scanStop();
		
		car.radio.setStation(e.station);
	}
	
});

