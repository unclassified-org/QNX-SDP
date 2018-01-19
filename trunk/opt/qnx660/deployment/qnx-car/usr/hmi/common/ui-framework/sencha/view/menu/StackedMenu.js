/**
 * The StackedMenu component is comprised of a series of QnxCar.view.menu.AbstractMenu
 * components, which stack on top of each other as the user progresses through
 * the menus.
 * 
 * This component will manage how the menus are stacked, as well as the ability to navigate
 * back down through the stack to previous menus.
 * 
 * Note that menus should only be added to the stack by using the push method, and menus should only
 * be removed by either using the pop, or hideAllSubMenus method.
 * @author lgreenway
 *
 * $Id: StackedMenu.js 6132 2013-04-30 18:21:06Z lgreenway@qnx.com $
 */
Ext.define('QnxCar.view.menu.StackedMenu', {
	extend: 'Ext.Panel',
	xtype: 'stackedMenu',

	config: {
		cls: 'stacked-menu',
		layout: 'default'
	},

	/**
	 * Stores the visible menus, with the last element in the array being
	 * the top-most menu.
	 * @private
	 */
	menuStack: null,

	/**
	 * The depth, or number of sub-menus on the stack.
	 * This value should not be set directly, but rather set through the setDepth function
	 * to ensure the component's depth class is updated properly. 
	 * @private
	*/
	depth: 0,

	/**
	 * Initialization lifecycle handler.
	 * @protected
	 */
	initialize: function() {
		// If this array is initialized as part of the class definition, it becomes static
		// and is then shared across instances. So, we initialize here to make it an instance
		// variable.
		this.menuStack = [];
		
		// Push existing menus onto the stack - this would typically be limited to the default, level 0 menu
		for(var i = 0; i < this.getItems().length; i++) {
			var item = this.getAt(i);
			if(item.isXType('menuAbstract')) {
				this.registerMenuEvents(item);
				this.menuStack.push(item);
				
				// Show the item immediately
				item.show();
			}
		}
	},

	/**
	 * Hides all sub-menus on the stack, leaving the first menu on the stack unmasked and visible.
	 * @param {Boolean} [animate] True to animate the menu items out of the container before removing. False to
	 * remove the menu items immediately. Removing the menus without animating is recommended if planning
	 * to manipulate the stack immediately afterwards, otherwise menu instances may not be fully destroyed.
	 * Defaults to True.
	 */
	hideAllSubMenus: function(animate) {
		// Reveal the menu immediately
		this.revealMenu(this.menuStack[0], animate);
	},
	
	/**
	 * Pushes a menu, or menus onto the menu stack. The menu, or last menu in the array being pushed onto the stack
	 * will become the top-most, and new active item. Any menus which already exist within the stack will be ignored.
	 * @param {QnxCar.view.menu.AbstractMenu/QnxCar.view.menu.AbstractMenu[]} menus The menu, or array of menus to
	 * push onto the menu stack.
	 */
	push: function(menus) {
		var newMenus = Ext.Array.from(menus),
			newActiveItem = null;
		
		for(var i = 0; i < newMenus.length; i++) {
			var menu = newMenus[i];
			
			if(menu.isXType('menuAbstract') && this.menuStack.indexOf(menu) === -1) {
				var occludedMenu = this.menuStack[this.menuStack.length - 1],
					level = 0;
					
				// Register events
				this.registerMenuEvents(menu);
					
				// Mask occluded menu, if one exists, and get the level for the new menu
				if(occludedMenu) {
					occludedMenu.mask();
					level = occludedMenu.getLevel() + 1;
				}

				// Add the menu to the stack. This is important since we need to be aware that there's
				// a new menu here, at this level, immediately, even though it may not have already been shown.
				this.menuStack.push(menu);

				// Assign the added menu's level
				menu.setLevel(level);

				// Add the menu to the stack
				this.add(menu);
				
				newActiveItem = menu;
			}
		}
		
		if(newActiveItem) {
			this.setActiveItem(newActiveItem);
		}
	},
	
	/**
	 * Pops the top-most menu off of the stack if no argument is supplied, or pops the specified menu and all menus
	 * above it. This method will not pop any menus off of the stack if there's only one item left.
	 * @param {QnxCar.view.menu.AbstractMenu} [menu] Pops the specified menu, and all menus above it off of the stack. 
	 */
	pop: function(menu) {
		if(menu && menu.isXType('menuAbstract') && this.menuStack.indexOf(menu) > 0) {
			this.revealMenu(this.menuStack[this.menuStack.indexOf(menu) - 1]);
		} else if(this.menuStack.length > 1) {
			this.revealMenu(this.menuStack[this.menuStack.length - 2]);
		}
	},
	
	/**
	 * Updates the stacked menu's depth value, and sets the appropriate depth class on the
	 * element so its display can be updated accordingly.
	 * @param {Number} depth The new depth of the stacked menu.
	 * @private
	 */
	setDepth: function(depth) {
		if(depth !== this.depth) {
			this.replaceCls('depth' + this.depth, 'depth' + depth);
			this.depth = depth;
		}
	},

	/**
	 * Registers the required event handlers to manage the menu's display in this StackedMenu.
	 * @param {QnxCar.view.menu.AbstractMenu} menu The AbstractMenu component instance.
	 * @private
	 */
	registerMenuEvents: function(menu) {
		menu.on('painted', this.onMenuPainted, this, { single: true });
		menu.on('hide', this.onMenuHide, this);
		menu.on('reveal', this.onMenuReveal, this);
	},
	
	/**
	 * Removes the event handlers used to manage the menu's display in this StackedMenu.
	 * @param {QnxCar.view.menu.AbstractMenu} menu The AbstractMenu component instance.
	 * @private
	 */
	unregisterMenuEvents: function(menu) {
		menu.un('painted', this.onMenuPainted, this, { single: true });
		menu.un('hide', this.onMenuHide, this);
		menu.un('reveal', this.onMenuReveal, this);
	},
	
	/**
	 * Removes all menus above the menu specified to be revealed.
	 * @param {QnxCar.view.menu.AbstractMenu} menu The menu to be revealed.
	 * @param {Boolean} [animate] If omitted or True, the menu(s) will be transitioned out before being
	 * removed from the container. If False, the menu(s) are removed from the container immediately.
	 * Removing the menus without animating is recommended if planning to manipulate the stack
	 * synchronously, otherwise menu instances may not be fully destroyed. Defaults to True.
	 * @private
	 */
	revealMenu: function(menu, animate) {
		if(this.menuStack.indexOf(menu) !== -1) {
			while(this.menuStack.indexOf(menu) !== this.menuStack.length - 1) {
				// Pop the top-most menu off the stack
				var m = this.menuStack.pop();
				
				// Remove event handlers
				this.unregisterMenuEvents(m);
				
				// Either hide and remove, or remove the menu immediately
				if(!m.isHidden() && (animate === undefined || animate === true)) {
					m.on('hide', this.remove, this);
					m.hide();
				} else {
					this.remove(m);
				}
			}

			// Set the depth of this stacked menu to that of the menu being revealed
			this.setDepth(menu.getLevel());
			
			// Unmask the menu being revealed
			menu.unmask();
			
			// Set the new active item as the one being revealed
			this.setActiveItem(menu);
		}
	},

	/**
	 * AbstractMenu reveal handler. Pops off menus above it, and sets the menu as the active item.
	 * @param {QnxCar.view.menu.AbstractMenu} menu The menu which fired the reveal event.
	 * @private
	 */
	onMenuReveal: function(menu) {
		this.revealMenu(menu);
	},
	
	/**
	 * AbstractMenu painted handler. Slides the painted menu into view.
	 * @param {QnxCar.view.menu.AbstractMenu} menu The menu being shown.
	 * @private
	 */
	onMenuPainted: function(menuElement) {
		// Set the depth of the stacked menu to the new level
		this.setDepth(this.menuStack[this.menuStack.length - 1].getLevel());
		
		// Show the menu so it slides into view
		// FIXME: ST 2.1 workaround for painted event containing the component element vs the component itself 
		this.down('#' + menuElement.getId()).show();
	},
	
	/**
	 * AbstractMenu hide handler. Reveals the menu underneath the menu being hidden. This is typically only triggered
	 * if a menu in the stack has been hidden manually (not recommended).
	 * @param {QnxCar.view.menu.AbstractMenu} menu The menu being hidden.
	 * @private
	 */
	onMenuHide: function(menu) {
		// Get the index of the item in the stack
		var stackIndex = this.menuStack.indexOf(menu);
		
		if(stackIndex > 0) {
			this.revealMenu(this.menuStack[stackIndex - 1]);
		}
	},
});