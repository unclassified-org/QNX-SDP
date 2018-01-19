/**
 * Displays the add to favourites button
 * @author mlapierre
 *
 * $Id: AddFavourite.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('Navigation.view.map.AddFavourite', {
	extend: 'Ext.Button',
	xtype: 'mapAddFavourite',
	
	config: {
		cls: 'map-addfavourite',
		text: 'ADD TO FAVOURITES',

		/**
		 * The CSS class to add to the ToggleButton when it's toggled on.
		 */
		toggledCls: Ext.baseCSSPrefix + 'button-pressed',

		/**
		 * Defines whether the button is toggled on or off. This value is updated
		 * through user interaction with the button, or can also be set programmatically.
		 */
		toggled: false,
		
		listeners: {
		    tap: function(button, event, opts) {
				button.setToggled(!button.getToggled());
			},
			scope: this,
		}
		
	},
	
	/**
	 * @private
	 * {@link Navigation.view.map.AddFavourite#toggle toggle} property update hook function.
	 * Responsible for applying/removing the {@link Navigation.view.map.AddFavourite#toggledCls toggledCls} class
	 */
	updateToggled: function(newValue, oldValue) {
		if (newValue && !oldValue) {
			this.addCls(this.getToggledCls());
		} else if(!newValue && oldValue) {
			this.removeCls(this.getToggledCls());
		}
	},
});