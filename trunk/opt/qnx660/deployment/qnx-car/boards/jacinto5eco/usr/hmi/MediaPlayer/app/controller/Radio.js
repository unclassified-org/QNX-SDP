/**
 * The controller responsible for the radio app.
 * @author lgreenway
 *
 * $Id$
 */
Ext.define('MediaPlayer.controller.Radio', {
	extend: 'Ext.app.Controller',

	statics: {
		SCAN_DOWN: 'scanDown',
		SCAN_UP: 'scanUp',
		SCAN_NONE: 'scanNone',
	},

	config: {
		tunerStore: null,
		tunerPresetStore: null,
		
		scanDirection: 'scanNone',
		
		refs: {
			index			: 'radioView',
			menuShowButton	: 'radioView menuShowButton',
		},
		control: {
			
		},
	},
	
	/**
	 * Initializes the controller on app startup
	 */
	init: function() {
		// Initialize the radio API
		console.log('Initializing QnxCar.Media.Radio API');
		QnxCar.Media.Radio.init();
		
		// Radio view show handler
		this.getApplication().on({
			radio_index	: this.onRadioIndex,
			scope		: this
		});
		
		this.setTunerPresetStore(Ext.getStore('hdRadioPreset'));
		
	},

	/**
	 * Method called when app is ready to launch
	 */
	launch: function() {
		console.log("Radio controller launched");
		// Slide down menu handler		
		/*this.getMenuShowButton().element.on({
			touchstart: function() { this.getApplication().fireEvent('menu_show'); },
			scope: this
		});*/
		
		var loadPresetEn = false; // change to true if want to load specified presets in QnxCar.Media.Radio.saveAllPreset()
		
		var lastFreq = QnxCar.Media.Radio.getLastFreq('AM');
		if (loadPresetEn || ((lastFreq+"").length < 1) ) {
			QnxCar.Media.Radio.saveAllPreset();
		}
		
		// Register onchange events for HD radio and setup the tunerDial
		if ( QnxCar.System.Settings.get('mediaPlayer_profile') == 'hd' ) {
		
			// Event handlers for radio API status change event
			QnxCar.Media.Radio.on(QnxCar.Media.Radio.E_UPDATE, this.onRadioEvent.bind(this));
			QnxCar.Media.Radio.on(QnxCar.Media.Radio.E_STATUS_UPDATE, this.onRadioStatusEvent.bind(this));
			
			this.getTunerDial().setTuner(Ext.create('MediaPlayer.model.RadioTuner',
					{ type: 'FM',
					rangeMin: 87.1,
					rangeMax: 108.1,
					rangeStep: 0.2 }));
		} 
		// Register onchange events for DAB radio and setup the tunerDial
		else if ( QnxCar.System.Settings.get('mediaPlayer_profile') == 'dab' ) {
			// TO-DO: insert DAB related launch commands
		}
	},
	
	/**
	 * When radio is selected, start the radio
	 */
	onRadioIndex: function() {
		Ext.Viewport.setActiveItem(this.getIndex());
		
		// initialize Digital radio with respective tuner_select
		if ( QnxCar.System.Settings.get('mediaPlayer_profile') == 'hd' ) {
			var lastFreq = QnxCar.Media.Radio.getLastFreq('FM');
			this.getTunerDial().setSelectedStation(lastFreq);
			
			QnxCar.Media.Radio.tunerSelect(1);
			
			setTimeout(function() {
				QnxCar.Media.Radio.bandSelect('FM');
				setTimeout(function() {QnxCar.Media.Radio.tuneFreq('FM', lastFreq);}, 1000);
			} , 2000);
			
			
			// Get the presets for this tuner
			var presets = QnxCar.Media.Radio.getPresets('FM');
			// Remove existing presets from the store
			this.getTunerPresetStore().removeAll();
			// Add the presets to the store. The list in the view will automatically update
			var presetInstances = [];
			for(var i = 0; i < presets.length; i++)
			{
				presetInstances.push({ freq: presets[i] });
			}
			this.getTunerPresetStore().add(presetInstances);
		} 
		else if ( QnxCar.System.Settings.get('mediaPlayer_profile') == 'dab' ) {
			// TO-DO: insert DAB related commands
			/*QnxCar.Media.Radio.tunerSelect(0);
			
			setTimeout(function() {
				QnxCar.Media.Radio.bandSelect('DAB3');
				setTimeout(function() {QnxCar.Media.Radio.tuneFreq('DAB3', 0000);}, 1000);
			} , 2000);*/
		}
	},
	
	/**
	 * Event handler for Radio API Rds change events.
	 * @param {Event} e Radio Rds change event.
	 */
	onRadioEvent: function(e) {
	},

});

