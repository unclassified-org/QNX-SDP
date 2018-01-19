/*
 * @class AppSection.view.ModalWindow
 * @extends Ext.Sheet
 *
 * Displays the modal window for the application
 * @author dkerr
 *
 * $Id: ModalWindow.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('AppSection.view.ModalWindow', {
	extend:'Ext.Sheet',
	xtype:'modalwindow',

	config:{
		modal:false,
		centered:true,
		hideOnMaskTap:false,
		hidden:true,
		cls:'loadingOverlay',

		width:800,
		height:395,
		left:0,
		top:0,
		bottom:0,

		layout:{
			type:'vbox',
			align:'stretch'
		},

		items:[
			{
				cls:"loading"
			}
		]
	},

	animationDuration:300,

	show:function (animation) {
		this.callParent();

		Ext.Animator.run([
			{
				element:this.element,
				xclass:'Ext.fx.animation.SlideIn',
				direction:"down",
				duration:this.animationDuration
			}
		]);
	},

	hide:function (animation) {
		var me = this;

		//we fire this event so the controller can deselect all items immediately.
		this.fireEvent('hideanimationstart', this);

		Ext.Animator.run([
			{
				element:me.element,
				xclass:'Ext.fx.animation.SlideOut',
				duration:this.animationDuration,
				preserveEndState:false,
				direction:"up",
				onEnd:function () {
					me.setHidden(true);
				}
			}
		]);
	}
});