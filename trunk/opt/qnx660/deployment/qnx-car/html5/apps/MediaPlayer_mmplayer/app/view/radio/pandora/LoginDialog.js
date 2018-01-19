/**
 * The Pandora service login dialog.
 * @author lgreenway@lixar.com
 *
 * $Id: LoginDialog.js 6639 2013-06-20 19:23:47Z mlytvynyuk@qnx.com $
 */
Ext.define('MediaPlayer.view.radio.pandora.LoginDialog', {
	extend: 'Ext.form.Panel',
	xtype: 'pandoraLoginDialog',

	config: {
		cls: 'pandora-loginDialog',
		zIndex: 999,
		centered: true,
		modal: true,
		scrollable: false,
		items: [
			{
				html: "PANDORA",
				cls: "pandora-title"
			},
			{
				xtype: 'textfield',
				name: 'username',
				placeHolder: 'Username'
			},
			{
				xtype: 'passwordfield',
				name: 'password',
				placeHolder: 'Password'
			},
			{
				xtype: 'container',
				layout: {
					type: 'hbox',
					pack: 'center',
					align: 'end'
				},
				flex: 1,
				items: [
					{
						xtype: 'button',
						cls: 'button-large',
						action: 'submit',
						text: 'Sign In'
					},
					{
						xtype: 'button',
						cls: 'button-large',
						action: 'cancel',
						text: 'Cancel'
					}
				]
			}
		]
	},
	
	/**
	 * Initialization lifecycle function. Attaches handlers to the sign in
	 * and cancel buttons.
	 */
	initialize: function() {
		this.callParent(arguments);
		
		// Attach submit and cancel handlers
		this.down('button[action="submit"]').on('tap', this.signIn.bind(this));
		this.down('button[action="cancel"]').on('tap', this.cancel.bind(this));
	},
	
	/**
	 * Sign in button tap event handler. Validates data and fires a pandora_login
	 * application event with the supplied username and password.
	 */
	signIn: function() {
		// Get the username and password
		var username = this.child('textfield[name="username"]').getValue();
		var password = this.child('textfield[name="password"]').getValue();
	
		if(username.trim() != '' && password.trim() != '')
		{
			// Fire the Pandora login event
			MediaPlayer.app.fireEvent('pandora_login', { username: username, password: password });
			
			// Hide the dialog as the login process takes place
			this.hide();
		}
	},
	
	/**
	 * Cancel button tap handler. Hides the login dialog.
	 */
	cancel: function() {
		this.hide();
	}
});