/**
 * Abstract implementation for children of the QnxCar.view.menu.StackedMenu
 * container.
 * @author lgreenway
 *
 * $Id: AbstractMenu.js 6804 2013-07-10 14:59:55Z lgreenway@qnx.com $
 */
Ext.define('QnxCar.view.menu.AbstractMenu', {
	extend: 'Ext.Panel',
	xtype: 'menuAbstract',

	requires: [
		'QnxCar.view.menu.Mask',
	],

	inheritableStatics: {
		/**
		 * The number of milliseconds used for the mask tap handler buffer configuration. Delays invocation of the
		 * reveal event fire by this many milliseconds, debouncing additional tap events.
		 */
		MASK_TAP_HANDLER_BUFFER_MS: 150
	},
	
	config: {
		layout: 'hbox',
		centered: false,
		cls: 'menu',
		hidden: false,
		hiddenCls: 'hidden',
		modal: false,
		masked: { xtype: 'menuMask' },
		
		/**
		 * @cfg {Number} level
		 * The 'depth' of this menu, if it's a sub-menu. A value of 0 distinguishes this menu as the
		 * root-level menu.
		 */
		level: 0,
	},
	
	/**
	 * Initialization lifecycle method. Hides the mask and then attaches a handler to the mask
	 * so that this menu can request to be revealed in its parent QnxCar.view.menu.StackedMenu.
	 */
	initialize: function() {
		// Hide the mask. Note that this does not remove the mask from the component, but rather
		// just hides it due to the overridden unmask method.
		this.unmask();
		
		// We apply the hiddenCls immediately since we want our menu to slide in from offscreen once it's painted.
		// This is not the same as calling the hide() method, since we still want the component to be drawn,
		// just off screen so that it can be transitioned in when show() is called.
		this.addCls(this.getHiddenCls());
		
		// Attach a handler to the mask so the menu can request to be revealed
		this.getMasked().on('tap', function() {
			this.fireEvent('reveal', this);
		}, this, { buffer: this.self.MASK_TAP_HANDLER_BUFFER_MS });
	},
	
	/**
	 * level configuration value update hook. Manages the sub menu classes so the menu
	 * appears indented.
	 * @param {Number} newLevel The new menu level.
	 * @param {Number} oldLevel The old menu level.
	 */
	updateLevel: function(newLevel, oldLevel) {
		if(newLevel > 0) {
			this.addCls(['sub', 'level' + newLevel]);
		} else {
			this.removeCls('sub');
		}
		
		// Remove the old level
		this.removeCls('level' + oldLevel);
	},
	
	/**
	 * level configuration apply hook. Ensures the value is an integer. If the value is not
	 * a valid integer, then the level configuration value does not change.
	 * @param {Number} level The level being set.
	 * @returns {Number} The new level value.
	 */
	applyLevel: function(level) {
		newLevel = this.getLevel();
		if(Ext.isNumber(level)) {
			newLevel = Math.round(level);
		}
		
		return newLevel;
	},
	
	/**
	 * @override
	 * Shows the mask for this container.
	 */
	mask: function() {
		this.getMasked().removeCls(this.getMasked().getHiddenCls());
	},
	
	/**
	 * @override
	 * Hides the mask for this container.
	 */
	unmask: function() {
		this.getMasked().addCls(this.getMasked().getHiddenCls());
	},
	
	/**
	 * @override
	 * Removes the hiddenCls from this container, and then fires a show event.
	 * @return {Ext.Component}
	 */
	show: function() {
		this.removeCls(this.getHiddenCls());
		this.fireEvent('show', this);
		return this;
	},
	
	/**
	 * @override
	 * Adds the hiddenCls from this container, and then fires a hide event once the transition is complete.
	 * @return {Ext.Component}
	 */
	hide: function() {
		this.element.dom.addEventListener('webkitTransitionEnd', function() {
			this.fireEvent('hide', this);
		}.bind(this));
		this.addCls(this.getHiddenCls());
		return this;
	},

	/**
	 * @override
	 * Returns `true` if this Component is currently hidden.
	 * @return {Boolean} `true` if currently hidden.
	 */
	isHidden: function() {
		return (this.element.hasCls(this.getHiddenCls()));
	}
});