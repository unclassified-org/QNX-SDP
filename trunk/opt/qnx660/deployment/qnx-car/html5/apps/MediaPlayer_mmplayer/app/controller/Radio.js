/**
 * The controller responsible for the radio app.
 * @author lgreenway
 *
 * $Id: Radio.js 7732 2013-12-02 19:33:45Z mlapierre@qnx.com $
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
		currentStation: null,
		currentTuner: null,
		
		scanDirection: 'scanNone',
		
		refs: {
			radio			: 'radioView',
			index			: 'radioTunerView',
			tunerToggle		: 'radioTunerView dataview[id=radiotuners]',
			tunerPresets	: 'radioTunerView dataview[id=radiopresets]',
			stationInfo		: 'radioTunerView radiostationinfo',
			menuShowButton	: 'radioTunerView menuShowButton',
			seekButton		: 'radioTunerView rockerbutton[id=seek]',
			scanButton		: 'radioTunerView rockerbutton[id=scan]',
		},
		control: {
			tunerPresets: {
				itemtouchstart: 'onPresetTouchStart',
				itemtap: 'onPresetTap',
				itemtaphold: 'onPresetTapHold',
			},
			tunerToggle: {
				itemtouchend: 'onTunerTap',
			},
			seekButton: {
				tapleft: 'onSeekLeft',
				tapright: 'onSeekRight'
			},
			scanButton: {
				tapleft: 'onScanLeft',
				tapright: 'onScanRight'
			},
		},
	},
	
	/**
	 * Initializes the controller on app startup
	 */
	init: function() {
		// Radio view show handler
		this.getApplication().on({
			radiotuner_index	: this.onRadioTunerIndex,
			radio_index			: this.onRadioIndex,
			scope				: this
		});
		
		this.setTunerStore(Ext.getStore('RadioTuners'));
		this.setTunerPresetStore(Ext.getStore('RadioPresets'));
	},

	/**
	 * Method called when app is ready to launch
	 */
	launch: function() {
		car.radio.watchPresets(this.refreshPresets.bind(this));

		// FIXME: ST2.1 workaround
		// Workaround for ST2.1 bug where selected dataview items are not displayed as selected if the dataview
		// is not visible.
		// Re-select selected items whenever the tunerToggle or tunerPresets dataviews are painted
		var dataviewReselect = function() {
			if(this instanceof Ext.dataview.DataView) {
				var selected = this.getSelection();
				if(selected.length > 0) {
					// Deselect all items and re-select to trigger the display update
					this.deselectAll();
					this.select(selected);
				}
			}
		};
		
		this.getTunerToggle().on('painted', dataviewReselect);
		this.getTunerPresets().on('painted', dataviewReselect);
	},
	
	/**
	 * @protected
	 * scanDirection update hook, sets the scan button control's press direction based on the
	 * scan direction.
	 * @param value {String} The new scanDirection value
	 * @param oldValue {String} The previous scanDirection value  
	 */
	updateScanDirection: function(value, oldValue) {
		if(this.getScanButton() !== undefined)
		{
			var pressDirection = MediaPlayer.view.radio.tuner.RockerButton.PRESS_NONE;
			if(value == MediaPlayer.controller.Radio.SCAN_DOWN)
			{
				pressDirection = MediaPlayer.view.radio.tuner.RockerButton.PRESS_LEFT;
			}
			else if(value == MediaPlayer.controller.Radio.SCAN_UP)
			{
				pressDirection = MediaPlayer.view.radio.tuner.RockerButton.PRESS_RIGHT;
			}
			
			this.getScanButton().setPressDirection(pressDirection);
		}
	},

	/**
	 * Shows the radio tuner view.
	 */
	onRadioTunerIndex: function() {
		this.getRadio().setActiveItem(this.getIndex());
		
		// Fire the application-level radio_index event rather than
		// showing the view immediately since there may be other
		// listeners.
		this.getApplication().fireEvent('radio_index');
	},
	
	/**
	 * Shows the radio view
	 */
	onRadioIndex: function() {
		Ext.Viewport.setActiveItem(this.getRadio());
	},
	
	/**
	 * Refreshes the presets dataview with the specified presets, or the presets for the current
	 * tuner if unspecified.
	 * @param {Object} [presets] The car.radio presets object.
	 * @private
	 */
	refreshPresets: function(presets) {
		// Use the supplied presets, or get the presets for the current tuner if unspecified
		if (presets == undefined) {
			car.radio.getPresets(this.refreshPresets.bind(this));
			return;
		}

		// Remove existing presets from the store
		this.getTunerPresetStore().removeAll();
		this.getTunerPresetStore().add(presets);
		
		// Reselect presets
		car.radio.getStatus(function(data) {
			this.selectPresets(data.station);
		}.bind(this));
	},
	
	/**
	 * Sets the preset button(s) for the specified station as selected.
	 * @param {Float} station The station.
	 * @private
	 */
	selectPresets: function(station) {
		// Find all the preset buttons that match the specified station
		var presets = [];
		for(var i = 0; i < this.getTunerPresetStore().getCount(); i++) {
			var preset = this.getTunerPresetStore().getAt(i);
			if(preset.get('station') === station) {
				presets.push(preset);
			}
		}
		
		// Select the preset buttons, if they exist
		this.getTunerPresets().select(presets, false, true);
	},

	/**
	 * Method called when radio status changes
	 * @param {Object} e The status event object
	 */
	onRadioStatusChanged: function(e) {
		if (typeof e.tuner !== undefined && e.tuner) {
			if (this.getTunerToggle().getSelection().length == 0 || e.tuner !== this.getCurrentTuner()) {
				this.setCurrentTuner(e.tuner);
				this.getTunerToggle().select(this.getTunerStore().findRecord('type', e.tuner));
				this.refreshPresets();
			}
		}

		if (typeof e.station !== undefined && e.station !== this.getCurrentStation()) {
			this.setCurrentStation(e.station);
			this.selectPresets(e.station);
		}

		if (typeof e.stationName !== undefined && e.stationName !== this.getStationInfo().getStationName()) {
			this.getStationInfo().setStationName(e.stationName);
		}

		if (typeof e.genre !== undefined && e.genre !== this.getStationInfo().getGenre()) {
			this.getStationInfo().setGenre(e.genre);
		}

		if (typeof e.artist !== undefined && e.artist !== this.getStationInfo().getArtist()) {
			this.getStationInfo().setArtist(e.artist);
		}

		if (typeof e.song !== undefined && e.song !== this.getStationInfo().getTitle()) {
			this.getStationInfo().setTitle(e.song);
		}

		if (typeof e.hd !== undefined && e.hd !== this.getStationInfo().getHd()) {
			this.getStationInfo().setHd(e.hd);
		}
	},
	
	/**
	 * Event handler for when a preset button is touched. Used for UX
	 * @param dv {Ext.dataview.DataView} The source dataview.
	 * @param index {Number} The index of the dataview item.
	 * @param target {Ext.Element/Ext.dataview.component.DataItem} The dataview dataitem.
	 * @param record {MediaPlayer.model.RadioPreset} The radio preset model instance for the data item.
	 */
	onPresetTouchStart: function(dv, index, target, record) {
		this.selectPresets(record.data.station);
	},

	/**
	 * Event handler for when a preset button is tapped. Sets the selected station
	 * to the preset's value.
	 * @param dv {Ext.dataview.DataView} The source dataview.
	 * @param index {Number} The index of the dataview item.
	 * @param target {Ext.Element/Ext.dataview.component.DataItem} The dataview dataitem.
	 * @param record {MediaPlayer.model.RadioPreset} The radio preset model instance for the data item.
	 */
	onPresetTap: function(dv, index, target, record) {
		if(record instanceof MediaPlayer.model.RadioPreset)
		{
			// Stop any scanning in progress
			this.scanStop();
			car.radio.setStation(record.data.station);
		}
		else
		{
			console.error('Invalid radio preset data', record);
		}
	},
	
	/**
	 * Event handler for when a preset button is held. Updates the selected preset
	 * with the currently selected station.
	 * @param dv {Ext.dataview.DataView} The source dataview.
	 * @param index {Number} The index of the dataview item.
	 * @param target {Ext.Element/Ext.dataview.component.DataItem} The dataview dataitem.
	 * @param record {MediaPlayer.model.RadioPreset} The radio preset model instance for the data item.
	 */
	onPresetTapHold: function(dv, index, target, record) {
		// Set on API
		car.radio.setPreset(index);
	},
	
	/**
	 * Event handler for when the tuner (i.e. AM/FM) buttons are pressed.
	 * @param dv {Ext.dataview.DataView} The source dataview.
	 * @param index {Number} The index of the dataview item.
	 * @param target {Ext.Element/Ext.dataview.component.DataItem} The dataview dataitem.
	 * @param record {MediaPlayer.model.RadioPreset} The radio preset model instance for the data item.
	 */
	onTunerTap: function(dv, index, target, record) {
		if(record instanceof MediaPlayer.model.RadioTuner)
		{
			// Stop any scanning in progress
			this.scanStop();
			
			car.radio.setTuner(record.data.type);
		}
		else
		{
			console.error('Invalid radio tuner data', record);
		}
	},
	
	/**
	 * Event handler for when the seek button has been tapped on its left side.
	 */
	onSeekLeft: function() {
		this.scanStop();
		car.radio.seek('down');
	},
	
	/**
	 * Event handler for when the seek button has been tapped on its right side.
	 */
	onSeekRight: function() {
		this.scanStop();
		car.radio.seek('up');
	},

	/**
	 * Event handler for when the scan button has been tapped on its left side.
	 */
	onScanLeft: function() {
		if(this.getScanDirection() == MediaPlayer.controller.Radio.SCAN_DOWN)
		{
			this.scanStop();
		}
		else
		{
			car.radio.scan('down');
			this.setScanDirection(MediaPlayer.controller.Radio.SCAN_DOWN);
		}
	},
	
	/**
	 * Event handler for when the scan button has been tapped on its right side.
	 */
	onScanRight: function() {
		if(this.getScanDirection() == MediaPlayer.controller.Radio.SCAN_UP)
		{
			this.scanStop();
		}
		else
		{
			car.radio.scan('up');
			this.setScanDirection(MediaPlayer.controller.Radio.SCAN_UP);
		}
	},

	/**
	 * @private
	 * Stops scan up/down and updates the scanDirection property.
	 */
	scanStop: function() {
		car.radio.scanStop();
		this.setScanDirection(MediaPlayer.controller.Radio.SCAN_NONE);
	}

});

