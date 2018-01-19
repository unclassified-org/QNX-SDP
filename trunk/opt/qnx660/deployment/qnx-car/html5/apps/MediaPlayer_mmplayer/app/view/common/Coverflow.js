/**
 * The coverflow component is used to display and allow the user to select
 * songs in a playlist in a graphical way.
 * @author lgreenway@lixar.com
 *
 * $Id: Coverflow.js 7329 2013-10-10 17:32:51Z nschultz@qnx.com $
 */
Ext.define('MediaPlayer.view.common.Coverflow', {
	extend: 'Ext.Container',
	xtype: 'coverflow',

	requires: [
		'MediaPlayer.view.common.CoverflowItem',
	],

	config: {
		/**
		 * @evented
		 * @cfg {Number} selectedIndex The idx from the Store that will be active first. Only one item can be active at a
		 * time
		 */
		selectedIndex: 0,

		/**
		 * @evented
		 * @cfg {Number} The idx of the Coverflow Item which should be previewed. Items cannot be both selected and previewed
		 * simultaneously, so setting the selectedIndex will override this setting.
		 */
		previewIndex: null,

		/**
		 * @cfg {Number} maxDisplayedItems The maximum number of CoverflowItem components
		 * to include in the DOM.
		 */
		maxDisplayedItems: 20,

		/**
		 * @cfg {Number} dragReindexDelay The number of milliseconds to wait before reindexing while the user is dragging
		 * through coverflow items.
		 */
		dragReindexDelay: 400,

		/**
		 * @cfg {Number} gap
		 * The gap between the coverflow items.
		 */
		gap: 100,

		/**
		 * @cfg {Boolean} freeFlow
		 * If true, then the component is draggable, animating as the user drags across the screen.
		 * If false, the component is not draggable, but reacts to swipe left/right gestures to change
		 * tracks.
		 */
		freeFlow: true,

		/**
		 * @cfg {Number} maxDragDelta
		 * The maximum number of pixels the coverflow component can be translated during each
		 * touchmove event. This can be used to balance coverflow item bufferring and rendering
		 * performance.
		 */
		maxDragDelta: 45,

		/**
		 * @property {Number}
		 * The number of drag deltas to store for velocity calculations.
		 */
		maxLastDragDeltas: 6,

		/**
		 * @property {Number}
		 * The dividend, in milliseconds, used to calculate the weight of drag deltas.
		 * Any deltas that occur within the specified number of milliseconds are given
		 * more weight than those that occur after the specified number of milliseconds.
		 */
		deltaWeightDividend: 150,

		/**
		 * @property
		 * Multiplier constant to use to calculate velocity.
		 */
		velocityMultiplier: 0.35,

		/**
		 * @property
		 * Transition time multiplier for velocity transitions.
		 */
		transitionTimeMultiplier: 2.5,

		/**
		 * @property
		 * Minimum transition time in milliseconds.
		 */
		minTransitionTime: 500,

		/**
		 * @property
		 * Maximum transition time in milliseconds.
		 */
		maxTransitionTime: 1000,

		/**
		 * @cfg {String} coverflowItemCls
		 * The class to apply to the coverflow items created by this control.
		 */
		coverflowItemCls: 'coverflow-item',

		/**
		 * @cfg
		 * The class to apply to the currently selected coverflow item.
		 */
		selectedCls: 'selected',

		/**
		 * @cfg
		 * The class to apply to the previewed coverflow item.
		 */
		previewCls: 'previewing',

		/**
		 * @cfg
		 * The class to apply to the coverflow component if it is empty (i.e. no records in the associated store)
		 */
		emptyCls: 'x-empty',

		/**
		 * @cfg {Object/Ext.data.Store} store
		 * Can be either a Store instance or a configuration object that will be turned into a Store.
		 * The Store is used to populate the set of coverflow items that will be rendered in the Coverflow component.
		 */
		store: null,
	},

	/**
	 * @private
	 * The left offset of the scroller container.
	 */
	offset: 0,

	/**
	 * @private
	 * Stores the timeout timer reference when scrolling around and previewing
	 * other items, so that if a new item is not selected before the timeout
	 * occurs, the selection will snap back to the currently selected item.
	 */
	reselectTimeout: null,

	/**
	 * @private
	 * Stores the timeout timer reference created by the startReindexTimeout function.
	 */
	reindexTimeout: null,

	/**
	 * @private
	 * Stores a timeout timer reference to restore the scroller transition duration
	 * after a velocity animation has completed.
	 */
	resetScrollerTransitionTimeout: null,

	/**
	 * @private
	 * Flag indicating whether the coverflow component is currently being
	 * dragged. Prevents display updates from occurring when setSelectedIndex is called.
	 */
	dragging: false,

	/**
	 * @private
	 * Used to store an array of the 'bound' free flow touchstart, touchmove, and touchend
	 * handlers so that they can be removed if the freeFlow configuration option
	 * changes at runtime.
	 */
	freeFlowHandlers: [],

	/**
	 * @private
	 * The left offset, based on the width of the container, used to center the
	 * coverflow items.
	 */
	centerOffset: 0,

	/**
	 * @private
	 * The last x coordinate from a drag gesture.
	 */
	lastDragX: 0,

	/**
	 * @private
	 * An array of the last touch inputs with the time at which they occurred.
	 */
	lastDragDeltas: [],

	/**
	 * @private
	 * Flag indicating whether this control has been painted at least once, which
	 * means the elements exist in the DOM.
	 */
	painted: false,

	/**
	 * @private
	 * Flag indicating whether the coverflow has no items.
	 */
	empty: true,

	/**
	 * Initialize life cycle method. Registers interactivity handlers, and store
	 * event handlers.
	 */
	initialize: function() {
		this.callParent();

		// Register interactivity handlers. Note that this the handlers are dependent
		// on the freeFlow configuration options.
		this.registerInteractivityHandlers();

		this.on({
			painted: 'onPainted',
			single: true,
			scope: this
		});

		// Add a data update handler so we can update the selected index whenever NowPlaying information changes.
		this.on('updatedata', this.onUpdateData);

		// Default to empty state since we may not have a store configured
		this.setEmpty(true);
	},

	/**
	 * updatedata handler. If the record set on this component is a NowPlaying model object, then the selected
	 * index is updated to the NowPlaying index.
	 * @param {Object} component This component.
	 * @param {Object} data The updated data.
	 */
	onUpdateData: function(component, data) {
		// Get the record
		var nowPlaying = this.getRecord();
		if (nowPlaying instanceof MediaPlayer.model.NowPlaying && nowPlaying.get('index') >= 0) {
			this.setSelectedIndex(nowPlaying.get('index'));
		}
	},

	// -----------------
	// Utility functions
	// -----------------

	/**
	 * @private
	 * Returns the scroller container element.
	 */
	getScrollerContainer: function() {
		return this.element.child(".x-body");
	},

	/**
	 * Updates the coverflow's state to show that it's empty.
	 * @param {Boolean} [empty=true] True to set as empty, False if not.
	 * @private
	 */
	setEmpty: function(empty) {
		if (empty || empty === undefined) {
			this.empty = true;
			this.addCls(this.getEmptyCls());
		} else {
			this.empty = false;
			this.removeCls(this.getEmptyCls());
		}
	},

	/**
	 * Returns the coverflowItem child component corresponding to the
	 * supplied index value. Note that this is not the index of the child
	 * in the container, but rather the idx property of the child component.
	 * @param idx {Number} The idx value of the child coverflowItem component.
	 * @return {MediaPlayer.view.common.CoverflowItem} The coverflow item, or null if
	 * 	no coverflow item exists with the supplied idx value.
	 */
	findCoverflowItemByIndex: function(idx) {
		var coverflowItem = null;

		for (var i = 0; i < this.getItems().length; i++) {
			if (this.getAt(i).getIdx() == idx) {
				coverflowItem = this.getAt(i);
				break;
			}
		}

		return coverflowItem;
	},

	/**
	 * @private
	 * Gets the idx value of the coverflow item assumed to be the selected item
	 * based on the offset of the scroller container.
	 * @param offset {Number} (optional) Get the idx of the item from the specified offset
	 * rather than from the current offset of the scroller container.
	 */
	getIdxFromOffset: function(offset) {
		var idx = Math.round((offset ? -offset : -this.getOffset()) / this.getGap());

		// Need to limit based on the idxs of the items we can see, too
		if (idx < this.getAt(0).getIdx()) {
			idx = this.getAt(0).getIdx();
		} else if (idx > this.getAt(this.getItems().length - 1).getIdx()) {
			idx = this.getAt(this.getItems().length - 1).getIdx();
		}

		return idx;
	},

	/**
	 * @private
	 * Calculates the coverflow item's left offset based on the supplied
	 * idx value.
	 * @param idx {Number} The idx of which to calculate the left offset
	 * @return {Number} The calculated left offset in pixels.
	 */
	calculateCoverflowItemLeftOffset: function(idx) {
		return idx * this.getGap() + this.centerOffset;
	},

	/**
	 * @private
	 * Resets the scroller container's transition duration.
	 * @param ms {Number} (optional) Sets the transition duration to the specified number
	 * of milliseconds.
	 */
	resetScrollerTransitionDuration: function(ms) {
		// Clear any pending reset operations
		if (this.resetScrollerTransitionTimeout) {
			clearTimeout(this.resetScrollerTransitionTimeout);
			this.resetScrollerTransitionTimeout = null;
		}

		// Set the transition duration on the scroller container
		var scrollerContainer = this.getScrollerContainer();
		if (scrollerContainer && scrollerContainer.dom) {
			scrollerContainer.dom.style.webkitTransitionDuration = (typeof(ms) == 'number' ? ms + 'ms' : '500ms');
		}
	},

	/**
	 * @private
	 * Starts the timer (delayed by the number of milliseconds defined by the dragReindexDelay configuration)
	 * to reindex coverflow items. This is used during drag operations to prevent the expensive reindex operation
	 * from occurring while the user is dragging.
	 * @param {Number} index The index off of which to base the reindex operation.
	 */
	startReindexTimeout: function(index) {
		this.clearReindexTimeout();
		this.reindexTimeout = setTimeout(function() {
			this.reindexTimeout = null;
			this.reindexCoverflowItems(index);
		}.bind(this), this.getDragReindexDelay());
	},

	/**
	 * @private
	 * Cancels the reindex timer set by the startReindexTimeout function.
	 */
	clearReindexTimeout: function() {
		if (this.reindexTimeout !== null) {
			clearTimeout(this.reindexTimeout);
			this.reindexTimeout = null;
		}
	},

	/**
	 * @private
	 * Starts the timer to reselect the currently-selected item if a new item is not
	 * selected before the timer triggers.
	 */
	startReselectTimeout: function() {
		this.clearReselectTimeout();
		this.reselectTimeout = setTimeout(function() {
			this.reselectTimeout = null;
			this.setSelectedIndex(this.getSelectedIndex());
		}.bind(this), 5000);
	},

	/**
	 * @private
	 * Cancels the reselect timer set by the startReselectTimeout function.
	 */
	clearReselectTimeout: function() {
		if (this.reselectTimeout !== null) {
			clearTimeout(this.reselectTimeout);
			this.reselectTimeout = null;
		}
	},

	/**
	 * @private
	 * Applies the selected class to the supplied coverflow item component.
	 * @param item {MediaPlayer.view.common.CoverflowItem} The coverflow item component to show
	 * 	as selected.
	 */
	selectCoverflowItem: function(item) {
		if (item && !item.element.hasCls(this.getSelectedCls())) {
			// Iterate through each coverflow item and check if it has the
			// selected class.
			// This is typically faster than using a selector, but its benefits
			// are diminished if you have maxDisplayedItems set very high.
			for (var i = 0; i < this.getItems().length; i++) {
				var otherItem = this.getAt(i);
				if (item != otherItem) {
					otherItem.element.removeCls(this.getSelectedCls());
				}

				if (otherItem.element.hasCls(this.getPreviewCls())) {
					otherItem.element.removeCls(this.getPreviewCls());
				}
			}

			// Add the selected class
			item.element.addCls(this.getSelectedCls());
		}
	},

	/**
	 * @private
	 * Applies the previewing class to the supplied coverflow item component.
	 * @param item {MediaPlayer.view.common.CoverflowItem} The coverflow item component to show
	 * 	as previewed.
	 */
	previewCoverflowItem: function(item) {
		if (item && !item.element.hasCls(this.getPreviewCls())) {
			for (var i = 0; i < this.getItems().length; i++) {
				var otherItem = this.getAt(i);
				if (otherItem.element.hasCls(this.getSelectedCls())) {
					otherItem.element.removeCls(this.getSelectedCls());
				}

				if (item != otherItem) {
					otherItem.element.removeCls(this.getPreviewCls());
				}
			}

			item.element.addCls(this.getPreviewCls());
		}
	},

	// ----------------------------------------
	// Getters, Setters, and Apply/Update hooks
	// ----------------------------------------

	/**
	 * store configuration property apply hook.
	 */
	applyStore: function(store) {
		var me = this,
			bindEvents = Ext.apply({}, me.storeEventHooks, {
				scope: me
			}),
			proxy, reader;

		if (store) {
			store = Ext.data.StoreManager.lookup(store);
			if (store && Ext.isObject(store) && store.isStore) {
				store.on(bindEvents);
				proxy = store.getProxy();
				if (proxy) {
					reader = proxy.getReader();
					if (reader) {
						reader.on('exception', 'handleException', this);
					}
				}
			}
			//<debug warn>
			else {
				Ext.Logger.warn("The specified Store cannot be found", this);
			}
			//</debug>
		}

		return store;
	},

	/**
	 * store configuration property update hook.
	 */
	updateStore: function(newStore, oldStore) {
		var me = this,
			bindEvents = Ext.apply({}, me.storeEventHooks, {
				scope: me
			}),
			proxy, reader;

		if (oldStore && Ext.isObject(oldStore) && oldStore.isStore) {
			if (oldStore.autoDestroy) {
				oldStore.destroy();
			} else {
				oldStore.un(bindEvents);
				proxy = oldStore.getProxy();
				if (proxy) {
					reader = proxy.getReader();
					if (reader) {
						reader.un('exception', 'handleException', this);
					}
				}
			}
		}

		if (newStore) {
			if (me.container) {
				me.refresh();
			}
		}
	},

	/**
	 * Store apply/update hook exception handler.
	 * @param ex {Exception} The exception.
	 */
	handleException: function(ex) {
		console.error('Exception', e);
	},

	/**
	 * @private
	 * selectedIndex configuration property apply hook.
	 * Reindexes coverflow items based on the new index and sets the offset
	 * of the scroller container to center the selected item.
	 * @param newIndex {Number} The new value for selectedIndex.
	 * @returns {Number} The new value for selectedIndex.
	 */
	applySelectedIndex: function(newIndex) {
		if (!this.dragging && typeof(newIndex) === 'number' && this.getItems().length > 0 && this.reselectTimeout === null) {
			// Reindex the coverflow items based on the new index
			this.reindexCoverflowItems(newIndex);

			// Set the offset of the scroller container to match up with the selected
			// coverflow item, if it exists.
			var newItem = this.findCoverflowItemByIndex(newIndex);

			if (newItem) {
				// Set scroller offset
				this.setOffset(-(newItem.getLeft() - this.centerOffset));

				// Show the item as selected
				this.selectCoverflowItem(newItem);
			}
		}

		// If a selectedIndex value has been supplied, then the currently previewed item
		// (if any) is cleared.
		this.setPreviewIndex(null);

		return newIndex;
	},

	/**
	 * previewIndex update hook. Applies the previewCls class to the newly previewed item, and,
	 * if the user is not actively dragging the control, the coverflow items will be reindexed,
	 * and the scroller will automatically snap to the previewed item. A selected item reselect
	 * timer will also be started to automatically snap back to the currently selected item if
	 * the user does not select a new item before the timer fires.
	 * @param newIndex {Number} The new previewIndex value.
	 * @param oldIndex {Number} The old previewIndex value.
	 */
	updatePreviewIndex: function(newIndex, oldIndex) {
		if (typeof(newIndex) === 'number' && this.getItems().length > 0) {
			// If the user is not actively dragging the control, then when the previewIndex
			// value is updated, we need to reindex the coverflow items since the new item may
			// be outside of the currently drawn items
			if (!this.dragging) {
				this.reindexCoverflowItems(newIndex);
			}

			// Get the newly-previewed item
			var newItem = this.findCoverflowItemByIndex(newIndex);

			// If the new item exists, then we snap to it (if not actively dragging), and
			// also apply the previewCls.
			if (newItem) {
				if (!this.dragging) {
					// Update the scroller offset to the item
					this.setOffset(-(newItem.getLeft() - this.centerOffset));
				}

				// Display the coverflow item as previewed
				this.previewCoverflowItem(newItem);
			}

			// Finally, start the timer to snap the coverflow back the currently selected
			// item if the user does not select a new item.
			this.startReselectTimeout();
		}
	},

	/**
	 * Sets offset to the provided value, translates the scroller container.
	 * @param offset {Number} The left offset in pixels.
	 */
	setOffset: function(offset) {
		// Update scroller offset
		this.offset = offset;

		// Translate scroller by the offset
		this.getScrollerContainer().dom.style.webkitTransform = "translate3d(" + offset + "px, 0, 0)";
	},

	/**
	 * Returns the scroller's left offset value.
	 * @return {Number} Offset in pixels.
	 */
	getOffset: function() {
		return this.offset;
	},

	/**
	 * Update hook handler for freeFlow configuration option. Ensures
	 * the proper component event handlers are attached.
	 * @param newValue {Boolean} The new value
	 * @param oldValue {Boolean} The old value
	 */
	updateFreeFlow: function(newValue, oldValue) {
		// Remove the existing handlers
		if (newValue === true && oldValue != undefined) {
			this.element.un('onSwipe', this.onSwipe, this);
		} else if (newValue == false && oldValue != undefined) {
			if (this.freeFlowHandlers['onTouchStart']) {
				this.element.dom.removeEventListener('touchstart', this.freeFlowHandlers['onTouchStart']);
			}

			this.element.un('dragstart', this.onDragStart, this);

			if (this.freeFlowHandlers['onTouchMove']) {
				this.element.dom.removeEventListener('touchmove', this.freeFlowHandlers['onTouchMove']);
			}

			if (this.freeFlowHandlers['onTouchEnd']) {
				this.element.dom.removeEventListener('touchend', this.freeFlowHandlers['onTouchEnd']);
			}

			// Clear the array of handlers since they're no longer used
			this.freeFlowHandlers = [];
		}

		// Unregister tap handler
		this.element.un('tap', this.onTap, this);

		// Since the interactivity handlers would have already been registered
		// in the component init, we only want to re-register if the freeFlow
		// configuration has been changed
		if (oldValue != undefined) {
			this.registerInteractivityHandlers();
		}
	},


	// ----------------------
	// Event handlers, firing
	// ----------------------

	/**
	 * @private
	 * Event hooks for stores assigned to this component.
	 */
	storeEventHooks: {
		refresh: 'refresh',
		addrecords: 'appendRecords',
		removerecords: 'refresh',
		clear: 'refresh'
	},

	/**
	 * Painted life cycle event handler. Sets the default transition duration
	 * for the scroller container, sets the center offset for coverflow
	 * items based on the control width and then forces a refresh of the
	 * coverflow item components.
	 */
	onPainted: function() {
		this.painted = true;

		// Set the center offset
		this.centerOffset = (this.element.getBox().width / 2);

		// Refresh to reflect the change to the centerOffset, and create the initial coverflow items.
		// This is important to occur first before performing any operations with the 'scroller container,'
		// since we need to be sure the element which contains the coverflow items exists.
		this.refresh();

		// Reselect the current selected index to update the UI
		this.setSelectedIndex(this.getSelectedIndex());
	},

	/**
	 * Fires the activeitemchange event with the new item index.
	 * @param index {Number} The index of the item.
	 */
	fireActiveItemChangeEvent: function(index) {
		this.fireEvent('activeitemchange', index);
	},

	/**
	 * Registers interactivity handlers based on the freeFlow
	 * configuration setting.
	 */
	registerInteractivityHandlers: function() {
		if (this.getFreeFlow()) {
			// We use the native javascript touchmove event since this has far less
			// overhead than the Sencha Touch 2 'onDrag' event. We still use the dragstart
			// event to determine when the drag has begin; this enables us to still use other
			// Sencha Touch reccognizers such as 'tap'.
			this.element.dom.addEventListener('touchstart', this.freeFlowHandlers['onTouchStart'] = this.onTouchStart.bind(this));
			this.element.on('dragstart', this.onDragStart, this);
			this.element.dom.addEventListener('touchmove', this.freeFlowHandlers['onTouchMove'] = this.onTouchMove.bind(this));
			this.element.dom.addEventListener('touchend', this.freeFlowHandlers['onTouchEndHandler'] = this.onTouchEnd.bind(this));
		} else {
			this.element.on('swipe', this.onSwipe, this);
		}

		// Register 'tap' handler, which is applicable to both freeflow and swipe interactivity models
		this.element.on('tap', this.onTap, this);
	},

	/**
	 * @private
	 * Swipe gesture handler. Changes the selected index depending on the direction
	 * of the swipe and fires the 'activeitemchange' event.
	 * @param e {Event} Swipe event.
	 */
	onSwipe: function(e) {
		var numItems = this.getStore().getCount(),
			selectedIndex = this.getSelectedIndex();

		if (e && e.direction) {
			if (e.direction == 'left' && selectedIndex < numItems - 1) {
				// Swipe to the left, or next track
				this.setSelectedIndex(selectedIndex + 1);
			} else if (e.direction == 'right' && selectedIndex > 0) {
				// Swipe to the right, or previous track
				this.setSelectedIndex(selectedIndex - 1);
			}
		}

		// Fire a change event if a change has actually occurred
		if (selectedIndex != this.getSelectedIndex()) {
			this.fireActiveItemChangeEvent(this.getSelectedIndex());
		}
	},

	/**
	 * @private
	 * touchstart event handler.
	 * @param e {Event} Native touchstart event.
	 */
	onTouchStart: function(e) {
		// Clear the reindex timeout so that it doesn't cause stutter while we're dragging
		this.clearReindexTimeout();

		this.lastDragX = e.changedTouches[0].pageX;
	},

	/**
	 * @private
	 * dragstart event handler. Uses the built-in Sencha Touch recognizer to determine if a drag gesture
	 * has begun.
	 * @param e {Event} Native touchstart event.
	 */
	onDragStart: function(e) {
		if (!this.empty) {
			// Modify the scroller transition so we can get smooth dragging
			this.resetScrollerTransitionDuration(0);

			// Set the dragging flag to true so that subsequent touchmove events can override default drag behaviour
			this.dragging = true;
		}
	},

	/**
	 * @private
	 * touchmove event handler. Translates the scroller container and shows
	 * the centered coverflow item as selected as the user drags through.
	 * @param e {Event} touchmove event.
	 */
	onTouchMove: function(e) {
		// Move the coverflow items if the user is dragging
		if (this.dragging) {
			var delta = e.touches[0].pageX - this.lastDragX;
			delta = delta > 0 ? Math.min(this.getMaxDragDelta(), delta) : Math.max(-this.getMaxDragDelta(), delta);

			var offset = delta + this.getOffset();

			// Track the deltas to calculate velocity
			this.lastDragDeltas.push({
				delta: delta,
				time: (new Date()).getTime()
			});
			if (this.lastDragDeltas.length > this.getMaxLastDragDeltas()) {
				this.lastDragDeltas.shift();
			}

			// Track the last drag x coordinate
			this.lastDragX = e.changedTouches[0].pageX;

			// Transition the scroller container
			this.setOffset(offset, true);

			// Based on the offset, we can derive which coverflow item should be previewed
			var itemIndex = this.getIdxFromOffset();

			this.setPreviewIndex(itemIndex);

			// Prevent default for touchmove event. Saves additional, unnecessary Sencha JS processing.
			e.preventDefault();
			e.stopPropagation();
		}
	},

	/**
	 * @private
	 * touchend event handler. Selects the coverflow item closest to where the user
	 * stopped dragging, and fires a change event if one has actually ocurred.
	 * @param e {Event} touchend event.
	 */
	onTouchEnd: function(e) {
		if (this.dragging) {
			// Calculate the drag velocity
			if (this.lastDragDeltas.length > 0) {
				var velocity = 0,
					weight = 0, // The weight given to this move event based on when it occurred
					releaseTime = (new Date()).getTime();

				// Apply delta weights based on time
				for (var i = this.lastDragDeltas.length - 1; i >= 0; i--) {
					weight = this.getDeltaWeightDividend() / (releaseTime - this.lastDragDeltas[i].time);
					velocity += (this.lastDragDeltas[i].delta * Math.min(weight, 1));
				}

				// Average the deltas after their weights has been applied
				velocity = velocity / this.lastDragDeltas.length;

				// Multiply velocity by the multiplier config
				velocity = ((velocity < 0 ? -1 : 1) * Math.pow(velocity * this.getVelocityMultiplier(), 2));

				// Cap the maximum velocity to the first or last coverflow items
				if (velocity < 0) {
					velocity = Math.max(-(this.getAt(this.getItems().length - 1).getLeft() - this.centerOffset), velocity);
				} else {
					velocity = Math.max(-(this.getAt(0).getLeft() - this.centerOffset), velocity);
				}

				// Calculate the transition time based on the velocity
				var transitionTime = Math.max(this.getMinTransitionTime(), Math.min(this.getMaxTransitionTime(), Math.abs(velocity * this.getTransitionTimeMultiplier())));

				// Set the transition time for the scroller container
				this.resetScrollerTransitionDuration(transitionTime);

				// Make sure to reset the smoothing transition style once the animation is complete
				this.resetScrollerTransitionTimeout = setTimeout(this.resetScrollerTransitionDuration.bind(this), transitionTime);

				// Get the target selected index based on the offset of the
				// scroller container.
				var itemIndex = this.getIdxFromOffset(this.getOffset() + velocity);

				// Snap to the previewed item
				var item = this.findCoverflowItemByIndex(itemIndex);
				if (item) {
					// Set scroller offset
					this.setOffset(-(item.getLeft() - this.centerOffset));
					this.setPreviewIndex(itemIndex);
				}

				// Only start the reindex timeout AFTER the transition has occurred, since the user
				// may want to wait for the items to decelerate before deciding to swipe again.
				// We'll store the timeout handle as a reindexTimeout since we already have measures
				// in place to cancel the reindex if the user starts another drag operation.
				this.reindexTimeout = setTimeout(function() {
					this.startReindexTimeout(itemIndex);
				}.bind(this), transitionTime);

				// Reset the velocity array
				this.lastRotateDeltas = [];
			}

			this.dragging = false;
		}
	},

	/**
	 * @private
	 * tap event handler. Selects the tapped coverflow item.
	 * @param e {Event} tap event.
	 * @param target {Ext.dom.Element} The tapped element.
	 */
	onTap: function(e, target) {
		if (target && Ext.get(target).hasCls(this.getCoverflowItemCls()) && !Ext.get(target).hasCls(this.getSelectedCls())) {
			// Get the item index
			var itemIndex = Ext.ComponentManager.get(Ext.get(target).getId()).getIdx();

			// If the item is already being previewed, then that means that we want to set the item as the selected item
			if (Ext.get(target).hasCls(this.getPreviewCls())) {
				// Clear the reselect timeout since we've selected a new item
				this.clearReselectTimeout();

				// Set the selected item
				this.setSelectedIndex(itemIndex);

				// Fire the active item change event
				this.fireActiveItemChangeEvent(itemIndex);
			} else {
				this.setPreviewIndex(itemIndex);
			}
		}
	},

	// -----------------------------------
	// Coverflow item creation, management
	// -----------------------------------

	/**
	 * @private
	 * General store event handler. Removes and creates coverflow items as necessary
	 * and shows an empty state if no items are in the store.
	 */
	refresh: function() {
		if (this.painted) {
			// Remove existing children
			this.removeAll(true, true);

			if (this.getStore().getCount() > 0) {
				this.setEmpty(false);

				// Create the coveflow items
				this.createCoverflowItems();

				// Reselect the selected index
				this.setSelectedIndex(this.getSelectedIndex());
			} else {
				this.setEmpty(true);
			}
		}
	},
	/**
	 * @private
	 * General store event handler. Creates and appends coverflow items as necessary
	 * @param data e {Event}
	 */
	appendRecords: function(store, records, eOpts) {
		var appendLength = records.length,
			preAppendLength = this.getStore().getCount() - appendLength,
			index = this.getPreviewIndex() || this.getSelectedIndex(),
			offsets = this.calculateViewableRange(index);

		if (preAppendLength >= offsets.firstIndex && preAppendLength <= offsets.lastIndex && !this.dragging) {
			this.refresh();
		}

	},
	/**
	 * @private
	 * Function used to calculate the "viewable" range of coverflow items
	 * @return {Object} left and right offset values
	 */
	calculateViewableRange: function(index) {

		var firstIndex,
			lastIndex;
		if (index > this.getStore().getCount() - (this.getMaxDisplayedItems() / 2)) {
			firstIndex = Math.max(0, this.getStore().getCount() - this.getMaxDisplayedItems());
		} else if (index < Math.min(this.getMaxDisplayedItems(), this.getStore().getCount())) {
			firstIndex = 0;
		} else {
			firstIndex = index - (this.getMaxDisplayedItems() / 2);
		}

		if (firstIndex + this.getMaxDisplayedItems() > this.getStore().getCount()) {
			lastIndex = this.getStore().getCount();
		} else {
			lastIndex = firstIndex + this.getMaxDisplayedItems();
		}
		return {
			firstIndex: firstIndex,
			lastIndex: lastIndex
		};
	},
	/**
	 * @private
	 * Creates coverflow item components and adds them as children to this control. The amount
	 * of coverflow items created is either the number of items in the store, or the maxDisplayedItems,
	 * whichever is less.
	 */
	createCoverflowItems: function() {
		for (var i = 0; i < Math.min(this.getMaxDisplayedItems(), this.getStore().getCount()); i++) {
			this.add({
				xtype: 'coverflowItem',
				cls: this.getCoverflowItemCls(),
				idx: i,
				record: this.getStore().getAt(i),
				left: this.calculateCoverflowItemLeftOffset(i),
				zIndex: 0,
			});
		}

		// Initialize the scroller transition style here since the scroller container doesn't exist
		// until at least one child has been added.
		this.resetScrollerTransitionDuration();
	},

	/**
	 * @private
	 * Moves either the first coverflow item child to last child, or vice versa.
	 * @param toFront {Boolean} If true, changes the last child to the first. If false, changes
	 * 	the first child to the last.
	 */
	moveCoverflowItem: function(toFront) {
		if (toFront) {
			// Moves the last item to the front
			var item = this.getAt(this.getItems().length - 1);
			item.setIdx(this.getAt(0).getIdx() - 1);
			item.setRecord(this.getStore().getAt(item.getIdx()));
			item.setLeft(this.calculateCoverflowItemLeftOffset(item.getIdx()));

			// Make the element the first child of the container
			this.getScrollerContainer().append(item.element);

			// Update the items array to reflect the change
			this.getItems().items.unshift(this.getItems().items.pop());
		} else {
			// Moves the first item to the end
			var item = this.getAt(0);
			item.setIdx(this.getAt(this.getItems().length - 1).getIdx() + 1);
			item.setRecord(this.getStore().getAt(item.getIdx()));
			item.setLeft(this.calculateCoverflowItemLeftOffset(item.getIdx()));

			// Make the element the last child of the container
			this.getScrollerContainer().insertFirst(item.element);

			// Update the items array to reflect the change
			this.getItems().items.push(this.getItems().items.shift());
		}
	},

	/**
	 * @private
	 * Shifts around coverflow items and reassigns idx and song values as necessary to represent
	 * the coverflow component appropriately for the supplied idx value.
	 * @param newIndex {Number} The index on which to base the reindexing of coverflow items.
	 */
	reindexCoverflowItems: function(newIndex) {
		if (this.getItems().length > 0 && (newIndex >= 0 && newIndex <= this.getStore().getCount() - 1)) {

			// Check if the new index is within the current range
			if (newIndex < this.getAt(0).getIdx() || newIndex > this.getAt(this.getItems().length - 1).getIdx()) {
				// Determine the index of what would be the first coverflow item
				var firstIndex = this.calculateViewableRange(newIndex).firstIndex;
				// Reindex the coverflow items
				for (var i = 0; i < this.getItems().length; i++) {
					var item = this.getAt(i);
					item.setIdx(firstIndex + i);
					item.setRecord(this.getStore().getAt(item.getIdx()));
					item.setLeft(this.calculateCoverflowItemLeftOffset(item.getIdx()));
				}
			} else {
				// New index is in the current range, so instead of reindexing we can instead
				// shift items from back to front, or vice versa
				while (this.getAt(0).getIdx() < newIndex - (this.getMaxDisplayedItems() / 2) && this.getAt(this.getItems().length - 1).getIdx() < this.getStore().getCount() - 1) {
					this.moveCoverflowItem(false);
				}

				while (this.getAt(this.getItems().length - 1).getIdx() > newIndex + (this.getMaxDisplayedItems() / 2) && this.getAt(0).getIdx() > 0) {
					this.moveCoverflowItem(true);
				}
			}
		}
	},
});