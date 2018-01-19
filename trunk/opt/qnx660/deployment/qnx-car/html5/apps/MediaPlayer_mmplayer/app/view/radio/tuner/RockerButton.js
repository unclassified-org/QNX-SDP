/**
 * Rocker button control for Radio seek and scan
 * @author lgreenway@lixar.com
 *
 * $Id: RockerButton.js 5983 2013-04-02 15:37:49Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.view.radio.tuner.RockerButton', {
	extend: 'Ext.Button',
	xtype: 'rockerbutton',

	statics: {
		PRESS_NONE: 'pressNone',
		PRESS_LEFT: 'pressLeft',
		PRESS_RIGHT: 'pressRight',
	},

	config: {
		cls: 'radiorockerbutton',
		
		/**
		 * @property
		 * Stores the press direction of the rocker button.
		 */
		pressDirection: 'pressNone',
		
		/**
		 * @property
		 * If toggleable is set to true, the button can be pressed left or
		 * right and stay down, versus just tapping in the direction pressed.
		 */
		toggleable: false,
	},
	
    initialize: function() {
        this.callParent(arguments);

        this.element.on('touchstart', this.onTouchStart, this);
        this.element.on('touchend', this.onTouchEnd, this);
    },
    
    /**
     * @private
     * Fires either a 'tapleft' or 'tapright' event depending on which side
     * of the button was pressed.
     * @param {Event} e Touch event.
     * @param {HTMLElement} node Target element.
     */
    onTouchStart: function(e, node) {
    	if(e.pageX - this.element.getXY()[0] <= this.element.getWidth() / 2)
    	{
    		if(this.getPressDirection() == this.self.PRESS_LEFT)
    		{
	    		this.setPressDirection(this.self.PRESS_NONE);
    		}
    		else
    		{
				this.setPressDirection(this.self.PRESS_NONE);
	    		this.setPressDirection(this.self.PRESS_LEFT);
    		}
    		this.fireEvent('tapleft');
    	}
    	else
    	{
    		if(this.getPressDirection() == this.self.PRESS_RIGHT)
    		{
	    		this.setPressDirection(this.self.PRESS_NONE);
    		}
    		else
    		{
				this.setPressDirection(this.self.PRESS_NONE);
	    		this.setPressDirection(this.self.PRESS_RIGHT);
    		}
    		this.fireEvent('tapright');
    	}
    },
    
    /**
     * @private
     * Removes the press-left and press-right classes to reset the control's
     * display state.
     */
    onTouchEnd: function() {
    	if(!this.getToggleable())
    	{
    		this.setPressDirection(this.self.PRESS_NONE);
    	}
    },
    
    /**
     * @private
     * pressDirection property update hook. Sets the appropriate style on the control to
     * indicate press direction, or removes classes to revert the button to a non-pressed
     * state.
     */
    updatePressDirection: function(value, oldValue) {
    	if(value == this.self.PRESS_LEFT)
    	{
    		this.element.addCls('press-left');
    	}
    	else if(value == this.self.PRESS_RIGHT)
    	{
    		this.element.addCls('press-right');
    	}
    	else
    	{
	    	this.element.removeCls(['press-left', 'press-right']);
    	}
    },
});