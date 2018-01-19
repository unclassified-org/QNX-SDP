AUDIO_CONTROL = {};

/*
 * Audio events
 */
VOLUME_UPDATE = "volumeupdate";
AUDIOMIXER_UPDATE = "audiomixerupdate";

/*
 * Constants
 */
AUDIO_CONTROL.MIN_BALANCE = 0;
AUDIO_CONTROL.MAX_BALANCE = 100;
AUDIO_CONTROL.MIN_FADE = 0;
AUDIO_CONTROL.MAX_FADE = 100;
AUDIO_CONTROL.MIN_VOL = 0;
AUDIO_CONTROL.MAX_VOL = 100;
AUDIO_CONTROL.MIN_BASS = 0;
AUDIO_CONTROL.MAX_BASS = 100;
AUDIO_CONTROL.MIN_TREBLE = 0;
AUDIO_CONTROL.MAX_TREBLE = 100;

/**
 * Defines the amount to increment/decrement when a single tap
 * of the slider down/up buttons occur.
 */
AUDIO_CONTROL.SLIDER_STEP = 10;

/**
 * How quickly the user must double-tap in order for the
 * fade/balance control to reset to centre.
 */
AUDIO_CONTROL.FADE_DOUBLETAP_THRESHOLD_MS = 350;

/*
 * Global scoped variables
 */
AUDIO_CONTROL.activeDraggingSliderCtrl;
AUDIO_CONTROL.activeFadeBalancePositionCtrl;
AUDIO_CONTROL.startMousePos;
AUDIO_CONTROL.controlStartPos;
AUDIO_CONTROL.fadeBalCtrlMaxY;
AUDIO_CONTROL.fadeBalCtrlMaxX;
AUDIO_CONTROL.lastFadeControlTap;

/*
 * Control data initialization and interactivity handlers
 */
function initAudioControl() {
	console.log('Initializing Audio Control');
	
	// Listen for mixer updates
	car.audiomixer.watchAudioMixer(function(e){
		try {
			onMixerChange(e);
		} catch(ex) {
			console.warn('Unable to get data', ex);
		}
	},
		function(e){console.error(e)}
	);

	// get current status of mixer values
	car.audiomixer.get(function(e){
			try {
				onMixerChange(e);
			} catch(ex) {
				console.warn('Unable to get init data', ex);
			}
		},
		function(e){console.error(e)}
	);

	// Attach interactivity handlers
	/* Volume control */
	// Attach tap handlers for down/up buttons
	$('.sliderControl.volume > .btnDown, .sliderControl.volume > .btnUp').tap(function() {
		// Get the current volume level
		var currLevel = $(this).parent().data('level');

		if(currLevel == undefined)
		{
			currLevel = AUDIO_CONTROL.MIN_VOL;
		}
		
		if($(this).hasClass('btnDown'))
		{
			// Decreasing
			setVolumeLevel(Math.max(AUDIO_CONTROL.MIN_VOL, currLevel - AUDIO_CONTROL.SLIDER_STEP));
		}
		else
		{
			// Increasing
			setVolumeLevel(Math.min(AUDIO_CONTROL.MAX_VOL, currLevel + AUDIO_CONTROL.SLIDER_STEP));
		}
	});
	
	
	/* Bass control */
	// Attach tap handlers for down/up buttons
	$('.sliderControl.bass > .btnDown, .sliderControl.bass > .btnUp').tap(function() {
		var currLevel = $(this).parent().data('level');

		if(currLevel == undefined)
		{
			currLevel = AUDIO_CONTROL.MIN_BASS;
		}
		
		if($(this).hasClass('btnDown'))
		{
			// Decreasing
			setBassLevel(Math.max(AUDIO_CONTROL.MIN_BASS, currLevel - AUDIO_CONTROL.SLIDER_STEP));
		}
		else
		{
			// Increasing
			setBassLevel(Math.min(AUDIO_CONTROL.MAX_BASS, currLevel + AUDIO_CONTROL.SLIDER_STEP));
		}
	});

	/* Treble control */
	// Attach tap handlers for down/up buttons
	$('.sliderControl.treble > .btnDown, .sliderControl.treble > .btnUp').tap(function() {
		var currLevel = $(this).parent().data('level');

		if(currLevel == undefined)
		{
			currLevel = AUDIO_CONTROL.MIN_TREBLE;
		}
		
		if($(this).hasClass('btnDown'))
		{
			// Decreasing
			setTrebleLevel(Math.max(AUDIO_CONTROL.MIN_TREBLE, currLevel - AUDIO_CONTROL.SLIDER_STEP));
		}
		else
		{
			// Increasing
			setTrebleLevel(Math.min(AUDIO_CONTROL.MAX_TREBLE, currLevel + AUDIO_CONTROL.SLIDER_STEP));
		}
	});
	
	/* Mid profile slider control tap handler */
	$('body[data-currentProfile=mid] .sliderControl .display').bind('vmouseup', sliderControlRelease);	
	
	/* High profile slider Control drag handlers */
	$('body[data-currentProfile=high] .sliderControl .display').bind('vmousedown', startSliderControlDrag);
	$('body[data-currentProfile=high] #audioControl, .sliderControl').bind('vmouseup', stopSliderControlDrag);
	$('body[data-currentProfile=high] #audioControl').bind('vmousemove', sliderControlDrag);
	
	$('.fadeBalanceControl .fadeBalancePosition').bind('vmousedown', startBalanceFadePositionControlMove);
	$('.fadeBalanceControl, .fadeBalanceControl .fadeBalancePosition').bind('vmouseup', stopBalanceFadePositionControlMove);
	$('.fadeBalanceControl').bind('vmousemove', balanceFadePositionControlMove);
	/* Fade control */
	// Add a double tap handler so we can reset the balance/fade control to center
	$('.fadeBalanceControl .fadeBalancePosition').tap( function () {
		if(typeof(AUDIO_CONTROL.lastFadeControlTap) != 'undefined' && new Date().getTime() - AUDIO_CONTROL.lastFadeControlTap < AUDIO_CONTROL.FADE_DOUBLETAP_THRESHOLD_MS)
		{
			setFadeBalancePosition((AUDIO_CONTROL.MAX_BALANCE - AUDIO_CONTROL.MIN_BALANCE) / 2, (AUDIO_CONTROL.MAX_FADE - AUDIO_CONTROL.MIN_FADE) / 2);
		}

		AUDIO_CONTROL.lastFadeControlTap = new Date().getTime();

	});

	// postpone initialisation of FadeBal UI components until later otherwise we will have race condition
	$(document).delegate('#audioControl', 'pageshow', function(ele) {
		// Finally, cache some data for the fade/balance control to lighten the recalc on each mousemove event
		AUDIO_CONTROL.fadeBalCtrlMaxX = $('.fadeBalanceControl .boundingBox').width() - $('.fadeBalanceControl .fadeBalancePosition').width();
		AUDIO_CONTROL.fadeBalCtrlMaxY = $('.fadeBalanceControl .boundingBox').height() - $('.fadeBalanceControl .fadeBalancePosition').height();
	});
}


/*
 * Utility
 */
/**
 * Utility function to get the slider level (percentage) based on the position
 * of a touch event's pageX property.
 * @param sliderCtrl {Object} The slider control jQuery element
 * @param pageX {Number} The touch event's pageX value
 * @return {Number} The slider level (percentage) based on the position of the touch
 * 	within the slider's display bar.
 */
function getSliderLevelFromTouchPosition(sliderCtrl, pageX) {
	var sliderDisplay = $('.display', sliderCtrl);
	
	var value = ((pageX - sliderDisplay.offset().left) / sliderDisplay.width()) * 100;
	
	return value < 0 ? 0 : (value > 100 ? 100 : value);
}

/*
 * API update event handlers
 */

/** 
 * Method called when a mixer change event is received
 * @param e {Object} The change event
 */
function onMixerChange(e) {
	if (e && typeof(e) == "object") {

		for (var i=0; i<e.length; i++) {

			var audioMixerItem = e[i];

			switch(audioMixerItem.setting) {
				case car.audiomixer.AudioMixerSetting.VOLUME:
					if(validateVolumeLevel(audioMixerItem.value)) {
						$('.sliderControl.volume').data('level', audioMixerItem.value);
						updateSliderDisplay($('.sliderControl.volume'))
					}
					break;
				case car.audiomixer.AudioMixerSetting.BASS:
					if(validateVolumeLevel(audioMixerItem.value)) {
						$('.sliderControl.bass').data('level', audioMixerItem.value);
						updateSliderDisplay($('.sliderControl.bass'))
					}
					break;
				case car.audiomixer.AudioMixerSetting.TREBLE:
					if(validateVolumeLevel(audioMixerItem.value)) {
						$('.sliderControl.treble').data('level', audioMixerItem.value);
						updateSliderDisplay($('.sliderControl.treble'))
					}
					break;
				case car.audiomixer.AudioMixerSetting.BALANCE:
					if(validateVolumeLevel(audioMixerItem.value)) {
						$('.sliderControl.volume').data('balance', audioMixerItem.value);
						updateSliderDisplay($('.sliderControl.volume'))
					}
					break;
				case car.audiomixer.AudioMixerSetting.FADE:
					if(validateBalancePosition(audioMixerItem.value)) {
						$('.fadeBalanceControl').data('fade', audioMixerItem.value);
						updateFadeBalanceDisplay();
					}
					break;
			}
		}
	}
};


/*
 * Interactivity handlers
 */
/**
 * vmouseup handler for mid-profile slider controls. Updates the slider control level
 * depending on where the user has released a touch event on the slider control display.
 * @param e {Event} Touch event
 */
function sliderControlRelease(e) {
	var sliderCtrl = $(this).parent('.sliderControl');
	
	var level = getSliderLevelFromTouchPosition(sliderCtrl, e.pageX);
	
	// Call the appropriate set method
	if(sliderCtrl.hasClass('volume'))
	{
		setVolumeLevel(level);
	}
	else if(sliderCtrl.hasClass('bass'))
	{
		setBassLevel(level);
	}
	else if(sliderCtrl.hasClass('treble'))
	{
		setTrebleLevel(level);
	}
}

/**
 * Event handler for all slider control vmousedown events. Bootstraps
 * the data necessary to handle the draggring action of slider controls.
 * @param e {Event} Mouse event
 */
function startSliderControlDrag(e) {
	AUDIO_CONTROL.activeDraggingSliderCtrl = $(this).parent('.sliderControl');

	var level = getSliderLevelFromTouchPosition($(this).parent('.sliderControl'), e.pageX);
	AUDIO_CONTROL.activeDraggingSliderCtrl.data('level', level);
	updateSliderDisplay(AUDIO_CONTROL.activeDraggingSliderCtrl);		
	
	return false;
}

/**
 * Event handler for all slider control and page vmouseup events. Sets the
 * level value for the appropriate slider, and cleans up after the slider 
 * control drag action.
 * @param e {Event} Mouse event
 */
function stopSliderControlDrag(e) {
	if(typeof(AUDIO_CONTROL.activeDraggingSliderCtrl) != 'undefined' && AUDIO_CONTROL.activeDraggingSliderCtrl)
	{
		// Get the new slider level
		// Note that this method returns a percentage value based on where
		// the user has stopped dragging. Right now our slider controls all have a 
		// min/max of 0/100, and so we can set this value directly on the controls
		var newLevel = getSliderLevelFromTouchPosition(AUDIO_CONTROL.activeDraggingSliderCtrl, e.pageX);

		// Call the appropriate set method
		if(AUDIO_CONTROL.activeDraggingSliderCtrl.hasClass('volume'))
		{
			setVolumeLevel(newLevel);
		}
		else if(AUDIO_CONTROL.activeDraggingSliderCtrl.hasClass('bass'))
		{
			setBassLevel(newLevel);
		}
		else if(AUDIO_CONTROL.activeDraggingSliderCtrl.hasClass('treble'))
		{
			setTrebleLevel(newLevel);
		}

		AUDIO_CONTROL.activeDraggingSliderCtrl = false;
	}
}

/**
 * Event handler for page mousemove events. Handles the drag action of slider controls.
 * @param e {Event} Mouse event
 */
function sliderControlDrag(e) {
	if(typeof(AUDIO_CONTROL.activeDraggingSliderCtrl) != 'undefined' && AUDIO_CONTROL.activeDraggingSliderCtrl)
	{
		// Get the new slider level
		var newLevel = getSliderLevelFromTouchPosition(AUDIO_CONTROL.activeDraggingSliderCtrl, e.pageX);
		
		if(AUDIO_CONTROL.activeDraggingSliderCtrl.hasClass('volume') && newLevel > AUDIO_CONTROL.MAX_VOL)
		{
			newLevel = AUDIO_CONTROL.MAX_VOLUME;
		}
		else if(AUDIO_CONTROL.activeDraggingSliderCtrl.hasClass('bass') && newLevel > AUDIO_CONTROL.MAX_BASS)
		{
			newLevel = AUDIO_CONTROL.MAX_BASS;
		}
		else if(AUDIO_CONTROL.activeDraggingSliderCtrl.hasClass('treble') && newLevel > AUDIO_CONTROL.MAX_TREBLE)
		{
			newLevel = AUDIO_CONTROL.MAX_TREBLE;
		}
		
		// Update the display level, but do not set the new level data on the element
		// as this is a heavy process and this event handler is called on ever touchmove.
		updateSliderDisplay(AUDIO_CONTROL.activeDraggingSliderCtrl, newLevel);
	}
	
	return false;
}

/**
 * Invoked when the vmousedown event is fired for a fadeBalancePosition element
 * @param e {Event} Mouse event
 */
function startBalanceFadePositionControlMove(e) {
	// Store the fan control dials that we're going to rotate
	AUDIO_CONTROL.activeFadeBalancePositionCtrl = $(this);

	AUDIO_CONTROL.startMousePos = {x: e.pageX, y: e.pageY};
	AUDIO_CONTROL.controlStartPos = {x: AUDIO_CONTROL.activeFadeBalancePositionCtrl.position().left, 
										y: AUDIO_CONTROL.activeFadeBalancePositionCtrl.position().top};

	AUDIO_CONTROL.activeFadeBalancePositionCtrl.addClass('dragging');

	return false;
}

/**
 * Invoked when the vmousemove event is fired for a fadeBalanceControl element
 * @param e {Event} Mouse event
 */
function balanceFadePositionControlMove(e) {
	if(typeof(AUDIO_CONTROL.activeFadeBalancePositionCtrl) != 'undefined' && AUDIO_CONTROL.activeFadeBalancePositionCtrl)
	{
		// Prevent the fade control from going outside of the bounds of the parent control
		var newX = AUDIO_CONTROL.controlStartPos.x + e.pageX - AUDIO_CONTROL.startMousePos.x;
		if(newX < 0)
		{
			newX = 0;
		}
		else if(newX > AUDIO_CONTROL.fadeBalCtrlMaxX)
		{
			newX = AUDIO_CONTROL.fadeBalCtrlMaxX;
		}
		
		var newY = AUDIO_CONTROL.controlStartPos.y + e.pageY - AUDIO_CONTROL.startMousePos.y;
		if(newY < 0)
		{
			newY = 0;
		}
		else if(newY > AUDIO_CONTROL.fadeBalCtrlMaxY)
		{
			newY = AUDIO_CONTROL.fadeBalCtrlMaxY;
		}
		
		AUDIO_CONTROL.activeFadeBalancePositionCtrl.css('-webkit-transform', 'translate3d(' + newX + 'px, ' + newY + 'px, 0px)');
	}
}

/**
 * Invoked when the vmouseup event is fired for a fadeBalanceControlPosition element.
 * Sets the balance/fade setting based on the position of the control.
 * @param e {Event} Mouse event
 */
function stopBalanceFadePositionControlMove(e) {
	if(typeof(AUDIO_CONTROL.activeFadeBalancePositionCtrl) != 'undefined' && AUDIO_CONTROL.activeFadeBalancePositionCtrl)
	{
		// Set the balance/fade position on release
		var balance = AUDIO_CONTROL.activeFadeBalancePositionCtrl.position().left /
						(AUDIO_CONTROL.activeFadeBalancePositionCtrl.parent('.boundingBox').width() - AUDIO_CONTROL.activeFadeBalancePositionCtrl.width()) *
						AUDIO_CONTROL.MAX_BASS;
		
		// Ensure the balance position falls within the min/max
		balance = balance < AUDIO_CONTROL.MIN_BALANCE ? AUDIO_CONTROL.MIN_BALANCE : (balance > AUDIO_CONTROL.MAX_BALANCE ? AUDIO_CONTROL.MAX_BALANCE : balance);  

		var fade = AUDIO_CONTROL.activeFadeBalancePositionCtrl.position().top /
						(AUDIO_CONTROL.activeFadeBalancePositionCtrl.parent('.boundingBox').height() - AUDIO_CONTROL.activeFadeBalancePositionCtrl.height()) *
						AUDIO_CONTROL.MAX_FADE;

		// Ensure the fade position falls within the min/max
		fade = fade < AUDIO_CONTROL.MIN_FADE ? AUDIO_CONTROL.MIN_FADE : (fade > AUDIO_CONTROL.MAX_FADE ? AUDIO_CONTROL.MAX_FADE : fade);  
		
		// Clean up		
		AUDIO_CONTROL.activeFadeBalancePositionCtrl.removeClass('dragging');
		AUDIO_CONTROL.activeFadeBalancePositionCtrl = false;

		setFadeBalancePosition(balance, fade);
	}
}


/*
 * Data validation
 */
/**
 * Validates the supplied value as a valid volume level.
 * @param value {Number} The volume level
 * @returns {Boolean} True if the value is valid, false if not.
 */
function validateVolumeLevel(value) {
	var isValid = true;
	
	if(typeof(value) != 'number'
		|| value < AUDIO_CONTROL.MIN_VOL
		|| value > AUDIO_CONTROL.MAX_VOL)
	{
		isValid = false;
		console.error('Unrecognized volume level: ' + value);			
	}

	return isValid;
}

/**
 * Validates the supplied value as a valid bass level.
 * @param value {Number} The bass level
 * @returns {Boolean} True if the value is valid, false if not.
 */
function validateBassLevel(value) {
	var isValid = true;

	if(typeof(value) != 'number'
		|| value < AUDIO_CONTROL.MIN_BASS
		|| value > AUDIO_CONTROL.MAX_BASS)
	{
		isValid = false;
		console.error('Unrecognized bass level: ' + value);			
	}

	return isValid;
}

/**
 * Validates the supplied value as a valid treble level.
 * @param value {Number} The treble level
 * @returns {Boolean} True if the value is valid, false if not.
 */
function validateTrebleLevel(value) {
	var isValid = true;

	if(typeof(value) != 'number'
		|| value < AUDIO_CONTROL.MIN_TREBLE
		|| value > AUDIO_CONTROL.MAX_TREBLE)
	{
		isValid = false;
		console.error('Unrecognized treble level: ' + value);			
	}

	return isValid;
}

/**
 * Validates the supplied value as a valid fade position.
 * @param value {Number} The fade position value
 * @returns {Boolean} True if the value is valid, false if not.
 */
function validateFadePosition(value) {
	var isValid = true;

	if(typeof(value) != 'number'
		|| value < AUDIO_CONTROL.MIN_FADE
		|| value > AUDIO_CONTROL.MAX_FADE)
	{
		isValid = false;
		console.error('Unrecognized fade value: ' + value);			
	}

	return isValid;
}

/**
 * Validates the supplied value as a valid balance position.
 * @param value {Number} The balance position value
 * @returns {Boolean} True if the value is valid, false if not.
 */
function validateBalancePosition(value) {
	var isValid = true;

	if(typeof(value) != 'number'
		|| value < AUDIO_CONTROL.MIN_BALANCE
		|| value > AUDIO_CONTROL.MAX_BALANCE)
	{
		isValid = false;
		console.error('Unrecognized balance value: ' + value);			
	}

	return isValid;
}


/*
 * Setters
 */
/**
 * Sets the balance and fade values for the fadeBalanceControl, persists
 * the changes to the HVAC API, then updates the display.
 * @param {Number} The balance value
 * @param {Number} The fade value
 */
function setFadeBalancePosition(balance, fade) {
	// Update balance position
	if(validateBalancePosition(balance))
	{
		$('.fadeBalanceControl').data(car.audiomixer.AudioMixerSetting.BALANCE, balance);
		car.audiomixer.set(car.audiomixer.AudioMixerSetting.BALANCE, car.Zone.ALL, balance);
	}
	
	// Update fade position
	if(validateFadePosition(fade))
	{
		$('.fadeBalanceControl').data(car.audiomixer.AudioMixerSetting.FADE, fade);
		car.audiomixer.set(car.audiomixer.AudioMixerSetting.FADE, car.Zone.ALL, fade );
	}
}

/**
 * Sets the volume level
 * @param level {Number} The volume level
 */
function setVolumeLevel(level) {
	if(validateVolumeLevel(level))
	{
		$('.sliderControl.volume').data('level', level);

		// Persist to the API
		car.audiomixer.set(car.audiomixer.AudioMixerSetting.VOLUME, car.Zone.ALL, level );
	}
}

/**
 * Sets the bass level
 * @param level {Number} The bass level
 */
function setBassLevel(level) {
	if(validateBassLevel(level))
	{
		$('.sliderControl.bass').data('level', level);

		// Persist to API
		car.audiomixer.set(car.audiomixer.AudioMixerSetting.BASS, car.Zone.ALL, level );
	}
}

/**
 * Sets the treble level
 * @param level {Number} The treble level
 */
function setTrebleLevel(level) {
	if(validateTrebleLevel(level))
	{
		$('.sliderControl.treble').data('level', level);
		
		// Persist to API
		car.audiomixer.set(car.audiomixer.AudioMixerSetting.TREBLE, car.Zone.ALL, level );
	}
}


/*
 * Display update
 */
/**
 * Updates the display of a specific, or all slider controls
 * @param ctrl {Object} Optional. The slider control to update. If omitted, all slider controls are updated.
 * @param lvl {Number} Optional. The level to which the slider control(s) should be updated to. If omitted,
 * 	the level is pulled from the data of the control.
 */
function updateSliderDisplay(ctrl, lvl) {
	var sliderCtrls;
	if(ctrl != undefined && typeof(ctrl) == 'object')
	{
		sliderCtrls = ctrl;
	}
	else
	{
		sliderCtrls = $('.sliderControl');
	}
	
	sliderCtrls.each(function() {
		// We allow the display level to be fed into this function
		// in the event that we don't want to incur the performance
		// loss of getting the level data from the element using the
		// .data function. This is especially useful in instances where
		// the display is being updated quicky, such as during a drag event.
		var level;
		if(lvl == undefined)
		{
			level = $(this).data('level');
		}
		else
		{
			level = lvl;
		}

		// Check if the level needs to change
		var displayLevel = Math.round(level / AUDIO_CONTROL.SLIDER_STEP);

		if(!$(this).hasClass('level' + displayLevel))
		{
			// Remove all existing level classes
			$(this).removeClass(function(index, css) {
				return (css.match (/\blevel[0-9]+/g) || []).join(' ');
			});
			
			$(this).addClass('level' + displayLevel)
		}
	});
}

/**
 * Updates the display of all balanceFadeControle elements, but does
 * not update if the control is being interacted with.
 */
function updateFadeBalanceDisplay() {
	// We don't want to update the display of the control if the position control
	// is being interacted with.
	if(AUDIO_CONTROL.activeFadeBalancePositionCtrl == undefined || !AUDIO_CONTROL.activeFadeBalancePositionCtrl)
	{
		$('.fadeBalanceControl').each(function() {
			var balance = $('.fadeBalanceControl').data('balance');
			var fade = $('.fadeBalanceControl').data('fade');
		
			var boundingBox = $('.boundingBox', this);	
			var fadePosCtrl = $('.fadeBalancePosition', this);
		
			var x = (boundingBox.width() - fadePosCtrl.width()) * (balance / 100);
			var y = (boundingBox.height() - fadePosCtrl.height()) * (fade / 100);
		
			$(fadePosCtrl).css('-webkit-transform', 'translate3d(' + x + 'px,' + y + 'px,0px)');
		});
	}
}
