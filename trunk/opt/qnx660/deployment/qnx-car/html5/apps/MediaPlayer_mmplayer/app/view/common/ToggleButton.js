/**
 * The toggle button extends the regular {@link Ext.Button Button} component
 * by adding the ability for the button to have a 'pressed' state.
 * @author lgreenway@lixar.com
 *
 * $Id: ToggleButton.js 5983 2013-04-02 15:37:49Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.view.common.ToggleButton', {
	extend: 'Ext.Button',

	xtype: 'togglebutton',

	config: {
		/**
		 * The CSS class to add to the ToggleButton when it's toggled on.
		 */
		toggledCls: Ext.baseCSSPrefix + 'button-pressed',

		/**
		 * Defines whether the button is toggled on or off. This value is updated
		 * through user interaction with the button, or can also be set programmatically.
		 */
		toggled: false,
	
		/**
		 * Setting preventUntoggle to true will prevent the toggle button from untoggling
		 * once it has already been pressed. This is useful when creating 'button bars'
		 * which require at least one button to be pressed at all times.
		 */
		preventUntoggle: false,
	},
	
	/**
	 * Initialization life cycle function handler.
	 */
    initialize: function() {
        this.callParent(arguments);
	},
	
	/**
	 * @protected
	 * onTap handler. Toggles the {@link MediaPlayer.view.common.ToggleButton#toggle toggle} value
	 * on each tap.
	 */
	onTap: function() {
		this.callParent(arguments);
		
		this.setToggled(!this.getToggled());
	},
	
	/**
	 * @private
	 * {@link MediaPlayer.view.common.ToggleButton#toggle toggle} property apply hook function.
	 * Checks if the {@link MediaPlayer.view.common.ToggleButton#preventUntoggle preventUntoggle}
	 * property is set to true, and if so, overrides the un-toggling of the button.
	 */
	applyToggled: function(newValue, oldValue) {
		if(!newValue && this.getPreventUntoggle())
		{
			return oldValue;
		}
		else
		{
			return newValue;
		}
	},
	
	/**
	 * @private
	 * {@link MediaPlayer.view.common.ToggleButton#toggle toggle} property update hook function.
	 * Responsible for applying/removing the {@link MediaPlayer.view.common.ToggleButton#toggledCls toggledCls}
	 * CSs class on the ToggleButton control.
	 */
	updateToggled: function(newValue, oldValue) {
		if(newValue && !oldValue)
		{
			this.addCls(this.getToggledCls());
		}
		else if(!newValue && oldValue)
		{
			this.removeCls(this.getToggledCls());
		}
	},
});