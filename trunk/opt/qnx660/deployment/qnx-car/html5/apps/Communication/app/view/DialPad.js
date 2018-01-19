/**
 * Dial Pad view.
 * @author lgreenway
 *
 * $Id: DialPad.js 6905 2013-07-25 16:49:41Z nschultz@qnx.com $
 */
Ext.define('Communication.view.DialPad', {
	extend:'Ext.Panel',
	xtype:'dialPadView',

	requires: [
	           'Communication.view.menu.DialingSheet',
	           ],

	           initialize: function() {
	        	   var zeroTapHold = false;
	        	   
	        	   // Add event handlers for the dial pad buttons
	        	   var dialpadButtons = this.query('button[type=dialpad]');
	        	   for(var i = 0; i < dialpadButtons.length; i++) {
	        		   dialpadButtons[i].on('tap', function(button) {
	        			   // Ensure we're not appending an extra 0 after a taphold
	        			   // on that button
	        			   if(!button.element.hasCls('zero') ||
	        					(button.element.hasCls('zero') && !zeroTapHold)) {
			        		   this.setPhoneNumber(this.getPhoneNumber() + button.config.value);
	        			   }
	        			   
	        			   // Reset the zero tap hold flag
		        		   zeroTapHold = false;
		        	   }.bind(this));
	        	   }

	        	   // Add long-press handler for zero button
	        	   this.down('button[type=dialpad][cls=zero]').element.on('taphold', function(e, node) {
	        		   this.setPhoneNumber(this.getPhoneNumber() + '+');

	        		   // We need to prevent the 0 from being added to the phone number after releasing
	        		   // the taphold, since there's no way to prevent the tap event from firing in the
	        		   // first place. So, we'll use a simple boolean flag to identify that a zero button
	        		   // taphold just occurred.
	        		   zeroTapHold = true;
	        	   }, this);
	        	   
	        	   // Add event handler for the delete last digit button
	        	   this.down('#deleteNumber').on('release', function(e) {
	        		   this.setPhoneNumber(this.getPhoneNumber().slice(0, -1));
	        	   }.bind(this));
	        	   this.down('#deleteNumber').element.on('longpress', function(e) {
	        	   		this.setPhoneNumber('');	
	        	   }.bind(this));
	           },

	           config:{
	        	   cls: 'comm-panel',
	        	   items:[
	        	          {
	        	        	  xtype: 'menuShowButton',
	        	          },
	        	          {
	        	        	  xtype: 'panel',
	        	        	  layout: {
	        	        		  type: 'hbox',
	        	        		  pack: 'center',
	        	        		  align: 'center',
	        	        	  },
	        	        	  items: [
	        	        	          {
	        	        	        	  xtype:'container',
	        	        	        	  cls: 'dialButtonsContainer',
	        	        	        	  layout:{
	        	        	        		  type:'vbox'
	        	        	        	  },
	        	        	        	  items:[
	        	        	        	         {
	        	        	        	        	 xtype:'container',
	        	        	        	        	 layout:{
	        	        	        	        		 type:'hbox'
	        	        	        	        	 },
	        	        	        	        	 items:[
	        	        	        	        	        {
	        	        	        	        	        	xtype:'button',
	        	        	        	        	        	cls:'one',
	        	        	        	        	        	type:"dialpad",
	        	        	        	        	        	value: '1'
	        	        	        	        	        },
	        	        	        	        	        {
	        	        	        	        	        	xtype:'button',
	        	        	        	        	        	cls:'two',
	        	        	        	        	        	type:"dialpad",
	        	        	        	        	        	value: '2'
	        	        	        	        	        },
	        	        	        	        	        {
	        	        	        	        	        	xtype:'button',
	        	        	        	        	        	cls:'three',
	        	        	        	        	        	type:"dialpad",
	        	        	        	        	        	value: '3'
	        	        	        	        	        }
	        	        	        	        	        ]
	        	        	        	         },
	        	        	        	         {
	        	        	        	        	 xtype:'container',
	        	        	        	        	 layout:{
	        	        	        	        		 type:'hbox'
	        	        	        	        	 },
	        	        	        	        	 items:[
	        	        	        	        	        {
	        	        	        	        	        	xtype:'button',
	        	        	        	        	        	cls:'four',
	        	        	        	        	        	type:"dialpad",
	        	        	        	        	        	value: '4'
	        	        	        	        	        },
	        	        	        	        	        {
	        	        	        	        	        	xtype:'button',
	        	        	        	        	        	cls:'five',
	        	        	        	        	        	type:"dialpad",
	        	        	        	        	        	value: '5'
	        	        	        	        	        },
	        	        	        	        	        {
	        	        	        	        	        	xtype:'button',
	        	        	        	        	        	cls:'six',
	        	        	        	        	        	type:"dialpad",
	        	        	        	        	        	value: '6'
	        	        	        	        	        }
	        	        	        	        	        ]
	        	        	        	         },
	        	        	        	         {
	        	        	        	        	 xtype:'container',
	        	        	        	        	 layout:{
	        	        	        	        		 type:'hbox'
	        	        	        	        	 },
	        	        	        	        	 items:[
	        	        	        	        	        {
	        	        	        	        	        	xtype:'button',
	        	        	        	        	        	cls:'seven',
	        	        	        	        	        	type:"dialpad",
	        	        	        	        	        	value: '7'
	        	        	        	        	        },
	        	        	        	        	        {
	        	        	        	        	        	xtype:'button',
	        	        	        	        	        	cls:'eight',
	        	        	        	        	        	type:"dialpad",
	        	        	        	        	        	value: '8'
	        	        	        	        	        },
	        	        	        	        	        {
	        	        	        	        	        	xtype:'button',
	        	        	        	        	        	cls:'nine',
	        	        	        	        	        	type:"dialpad",
	        	        	        	        	        	value: '9'
	        	        	        	        	        }
	        	        	        	        	        ]
	        	        	        	         },
	        	        	        	         {
	        	        	        	        	 xtype:'container',
	        	        	        	        	 layout:{
	        	        	        	        		 type:'hbox'
	        	        	        	        	 },
	        	        	        	        	 items:[
	        	        	        	        	        {
	        	        	        	        	        	xtype:'button',
	        	        	        	        	        	cls:'star',
	        	        	        	        	        	type:"dialpad",
	        	        	        	        	        	value: '*'
	        	        	        	        	        },
	        	        	        	        	        {
	        	        	        	        	        	xtype:'button',
	        	        	        	        	        	cls:'zero',
	        	        	        	        	        	type:"dialpad",
	        	        	        	        	        	value: '0'
	        	        	        	        	        },
	        	        	        	        	        {
	        	        	        	        	        	xtype:'button',
	        	        	        	        	        	cls:'hash',
	        	        	        	        	        	type:"dialpad",
	        	        	        	        	        	value: '#'
	        	        	        	        	        }
	        	        	        	        	        ]
	        	        	        	         }
	        	        	        	         ]
	        	        	          },
	        	        	          {
	        	        	        	  xtype: 'panel',
	        	        	        	  cls: 'dialControlsContainer',
	        	        	        	  layout: {
	        	        	        		  type: 'vbox',
	        	        	        		  align: 'center',
	        	        	        		  pack: 'start',
	        	        	        	  },
	        	        	        	  flex: 1,
	        	        	        	  items: [
	        	        	        	          {
	        	        	        	        	  id:'phoneNumber',
	        	        	        	        	  html: '',
	        	        	        	        	  items: [
	        	        	        	        	          {
	        	        	        	        	        	  xtype:'button',
	        	        	        	        	        	  id:'deleteNumber'
	        	        	        	        	          }
	        	        	        	        	          ]
	        	        	        	          },
	        	        	        	          {
	        	        	        	        	  xtype:'button',
	        	        	        	        	  id:'callBtn'
	        	        	        	          },
	        	        	        	          ]
	        	        	          }
	        	        	          ]
	        	          }
	        	          ]
	           },

	           getPhoneNumber: function() {
	        	   return this.down('#phoneNumber').getHtml();
	           },

	           setPhoneNumber: function(number) {
	        	   this.down('#phoneNumber').setHtml(number);
	           }
});