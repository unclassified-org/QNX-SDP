/**
 * The controller responsible for the radio app.
 * @author lgreenway
 *
 * $Id: Radio.js 6512 2013-06-11 14:40:47Z lgreenway@qnx.com $
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
		// Slide down menu handler		
		this.getMenuShowButton().element.on({
			touchstart: function() { this.getApplication().fireEvent('menu_show'); },
			scope: this
		});
		
		// Event handlers for radio API status change event
		blackberry.event.addEventListener("radiometadatachanged", this.onRadioMetadataChanged.bind(this));
		blackberry.event.addEventListener("radiopresetschanged", this.onRadioPresetsChanged.bind(this));
		blackberry.event.addEventListener("radiotunerchanged", this.onRadioTunerChanged.bind(this));
		blackberry.event.addEventListener("radiostationchanged", this.onRadioStationChanged.bind(this));
		
		// Populate the radio data
		this.onRadioMetadataChanged(qnx.radio.getMetadata());
		this.onRadioTunerChanged(qnx.radio.getActiveTuner());
		this.onRadioStationChanged(qnx.radio.getStation());
		
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
	 * @param {Object} [presets] The qnx.radio presets object.
	 * @private
	 */
	refreshPresets: function(presets) {
		// Use the supplied presets, or get the presets for the current tuner if unspecified
		var presetsObj = presets === undefined ? qnx.radio.getPresets() : presets; 
		
		// Remove existing presets from the store
		this.getTunerPresetStore().removeAll();

		// Add the presets to the store. The dataview in the view will automatically update
		var presetInstances = [];
		if(presetsObj.fm !== undefined) {
			for (var i = 0; i < presetsObj.fm.length; i++)
			{
				presetInstances.push({ station: presetsObj.fm[i] });
			}
		} else {
			for (var i = 0; i < presetsObj.am.length; i++)
			{
				presetInstances.push({ station: presetsObj.am[i] });
			}
		}
		this.getTunerPresetStore().add(presetInstances);
		
		// Reselect presets
		this.selectPresets(qnx.radio.getStation());
	},
	
	/**
	 * Sets the preset button(s) for the specified station as selected.
	 * @param {Float} station The station.
	 * @private
	 */
	selectPresets: function(station) {
		// Deselect existing preset buttons
		this.getTunerPresets().deselectAll();

		// Find all the preset buttons that match the specified station
		var presets = [];
		for(var i = 0; i < this.getTunerPresetStore().getCount(); i++) {
			var preset = this.getTunerPresetStore().getAt(i);
			if(preset.get('station') === station) {
				presets.push(preset);
			}
		}
		
		// Select the preset buttons, if they exist
		if(presets.length > 0) {
			this.getTunerPresets().select(presets);
		}
	},
	
	/**
	* Event handler for the Radio Metadata change event
	* @param {Event} e Radio change event
	*/
	onRadioMetadataChanged: function(e){
		this.getStationInfo().setStationName(e.stationName);
		this.getStationInfo().setGenre(e.genre);
		this.getStationInfo().setArtist(e.artist);
		this.getStationInfo().setTitle(e.song);
		this.getStationInfo().setHd(e.hd);
	},
	
	/**
	* Event handler for the Radio Presets change event
	* @param {Event} e Radio change event
	*/
	onRadioPresetsChanged: function(e){
		this.refreshPresets(e);
	},
	
	/**
	* Event handler for the Radio tuner change event
	* @param {Event} e Radio change event
	*/
	onRadioTunerChanged: function(e){
		this.getTunerToggle().select(this.getTunerStore().findRecord('type',e));
		
		// Refresh the presets for the current tuner
		this.refreshPresets();
	},
	
	/**
	* Event handler for the Radio Station change event
	* @param {Event} e Radio change event
	*/
	onRadioStationChanged: function(e) {
		// Select the appropriate preset if one exists
		this.selectPresets(qnx.radio.getStation());
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
		
			qnx.radio.setStation(record.data.station);
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
		qnx.radio.setPreset(index);
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
			
			qnx.radio.setTuner(record.data.type);
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
		qnx.radio.seek('down');
	},
	
	/**
	 * Event handler for when the seek button has been tapped on its right side.
	 */
	onSeekRight: function() {
		this.scanStop();
		qnx.radio.seek('up');
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
			qnx.radio.scan('down');
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
			qnx.radio.scan('up');
			this.setScanDirection(MediaPlayer.controller.Radio.SCAN_UP);
		}
	},

	/**
	 * @private
	 * Stops scan up/down and updates the scanDirection property.
	 */
	scanStop: function() {
		qnx.radio.scanStop();
		this.setScanDirection(MediaPlayer.controller.Radio.SCAN_NONE);
	}

});

