/**
 * Details of a contact
 * @author mlapierre
 *
 * $Id: ContactDetails.js 7657 2013-11-25 14:53:00Z mlapierre@qnx.com $
 */
Ext.define('Communication.view.menu.ContactDetails', {
	extend: 'QnxCar.view.menu.AbstractMenu',
	xtype: 'menuContactDetailsView',

	/**
	 * Initialize life cycle handler.
	 */
	initialize: function() {
		this.callParent();
		
		this.element.on('tap', this.onTap, this);
	},
	
	/**
	 * Tap handler for the contact details container. This handler attempts to identify if the tap event
	 * originated from an action button, and if so, fires the appropriate event for that action, attaching
	 * the action button's label as the data.
	 * @param {Ext.event.Event} event The Ext.event.Event event encapsulating the DOM event.
	 * @param {HTMLElement} node The target of the event.
	 */
	onTap: function(event, node) {
		// Find the button element to get its action, and the button's label to get the data 
		var button = Ext.get(node).findParent('.menu-contactdetails-button', null, true),
			action = button ? button.getAttribute('data-action') : null,
			label = button ? button.down('.menu-contactdetails-lbl') : null,
			data = label ? label.getHtml().trim() : null;
		
		if(action && data) {
			switch(action) {
				case 'dial':
					this.fireEvent('dial', data);
					break;
				default:
					console.log('Unsupported contact details action: ' + action);
			}
		}
	},
	
	config: {
		items: [
			{
				action: 'details',
				cls: 'menu-contactdetails',
				scrollable: 'vertical',
		 		tpl: Ext.create('Ext.XTemplate', 
							'<div class="menu-contactdetails-image" style="{[this.getContactPictureStyle(values.picture)]}"></div>',
							'<div class="menu-contactdetails-summary">',
								'<div class="menu-contactdetails-name">{[values.title ? " " + values.title : ""]}{firstName} {lastName}</div>',
								'<div class="menu-contactdetails-company">{[values.company ? values.company : ""]}</div>',
								'<div class="menu-contactdetails-position">{[values.jobTitle ? values.jobTitle : ""]}</div>',
							'</div>',
							'{[this.getPhoneNumberTemplate(values.homePhone, "home")]}',
							'{[this.getPhoneNumberTemplate(values.homePhone2, "home")]}',
							'{[this.getPhoneNumberTemplate(values.workPhone, "work")]}',
							'{[this.getPhoneNumberTemplate(values.workPhone2, "work")]}',
							'{[this.getPhoneNumberTemplate(values.mobilePhone, "mobile")]}',
							'{[this.getPhoneNumberTemplate(values.otherPhone, "other")]}',
							'{[this.getEmailTemplate(values.email1)]}',
							'{[this.getEmailTemplate(values.email2)]}',
							'{[this.getEmailTemplate(values.email3)]}',
							'<tpl if="mobilePhone">',
								'<div class="menu-contactdetails-row">',
									'<div class="menu-contactdetails-detailimg menu-contactdetails-detailimg-text"></div>',
									'<div class="menu-contactdetails-button" data-action="text">',
										'<div class="menu-contactdetails-lbltype">{[this.getType("mobile")]}</div>',
										'<div class="menu-contactdetails-lbl">{mobilePhone}</div>',
									'</div>',
								'</div>',
							'</tpl>',
							'{[this.getAddressTemplate(values.homeAddress1, values.homeAddress2, values.homeAddressCity, values.homeAddressCountry, values.homeAddressStateProvince)]}',
							'{[this.getAddressTemplate(values.workAddress1, values.workAddress2, values.workAddressCity, values.workAddressCountry, values.workAddressStateProvince)]}',
							{
								compiled: true,
								
								/**
								 * Returns a displayable string for the type
								 * This will be useful when localization is implemented
								 * @returns a localized displayable string for the type
								 */
								getType: function(type) {
									switch(type) {
										case 'mobile':
											return 'Mobile';
											break;

										case 'work': 
											return 'Work';
											break;

										case 'home':
											return 'Home';
											break;

										case 'other':
											return 'Other';
											break;

										default: 
											return 'Unknown';
									}
								},
								
								// FIXME: This is a duplicate template function definition, also defined in AddressBook.js menu.
								/**
								* Returns a style attribute with a background-image style
								* pointing to the contact's photo.
								* @returns {String} The 
								*/
								getContactPictureStyle: function(picture) {
									var style = '';
									if(picture) {
										style = 'background-image: url(file://' + picture + ');';
									}
									return style;
								},
								
								/**
								 * Builds the "city, state, country" string
								 * @param city The city of the address
								 * @param state The state of the address
								 * @param country The country of the address
								 * @returns the "city, state, country" string
								 */
								getCityStateCountry: function(city, state, country) {
									var out = "";
									
									if (city && city.length > 0) {
										out += city;
									}
									
									if (state && state.length >= 0) {
										if (out.length > 0) {
											out += ', ';
										}
										out += state;
									}

									if (country && country.length >= 0) {
										if (out.length > 0) {
											out += ', ';
										}
										out += country;
									}
									
									return out;
								},
								
								/**
								 * Gets template markup for phone number elements.
								 * @param number {String} The phone number.
								 * @param type {String} Thhe phone number type.
								 * @returns {String} The template markup.
								 */
								getPhoneNumberTemplate: function(number, type) {
									var tpl = '';
									if(number) {
										tpl = '<div class="menu-contactdetails-row">' +
												'<div class="menu-contactdetails-detailimg menu-contactdetails-detailimg-phone"></div>' +
												'<div class="menu-contactdetails-button" data-action="dial">' +
													'<div class="menu-contactdetails-lbltype">' + this.getType(type) + '</div>' +
													'<div class="menu-contactdetails-lbl">' + number + '</div>' +
													'</div>' +
												'</div>';
									}
									return tpl;
								},

								/**
								 * Gets template markup for email address elements.
								 * @param email {String} The email address.
								 * @returns {String} The template markup.
								 */
								getEmailTemplate: function(email) {
									var tpl = '';
									if(email) {
										tpl = '<div class="menu-contactdetails-row">' +
													'<div class="menu-contactdetails-detailimg menu-contactdetails-detailimg-email"></div>' +
													'<div class="menu-contactdetails-button" data-action="email">' +
														'<div class="menu-contactdetails-lbl">' + email + '</div>' +
													'</div>' +
												'</div>';
									}
									return tpl;
								},
								
								/**
								 * Gets template markup for address elements.
								 * @param address1 {String} The address1 value.
								 * @param address2 {String} The address2 value.
								 * @param city {String} The city value.
								 * @param country {String} The country value.
								 * @param stateProvince {String} The state/province value.
								 * @returns {String} The template markup.
								 */
								getAddressTemplate: function(address1, address2, city, country, stateProvince) {
									var tpl = '';
									if(address1 || address2 || city || country || stateProvince) {
										tpl = '<div class="menu-contactdetails-row address">' +
													'<div class="menu-contactdetails-detailimg menu-contactdetails-detailimg-address"></div>' +
													'<div class="menu-contactdetails-large-button" data-action="navigate">' +
														(address1 ? '<div class="menu-contactdetails-lbl">' + address1 + '</div>' : '') +
														(address2 ? '<div class="menu-contactdetails-lbl">' + address2 + '</div>' : '') +
														(city || stateProvince || country ? '<div class="menu-contactdetails-lbl">' + this.getCityStateCountry(city, stateProvince, country) + '</div>' : '') +
													'</div>' +
												'</div>';
									}
									return tpl;
								}
							}
						)
			}
		]
	}
});