/**
 * Displays the vehicle card
 * @author dkerr
 *
 * $Id: VehicleCard.js 5166 2012-11-22 19:27:47Z mlytvynyuk@qnx.com $
 */
Ext.define('AppSection.view.VehicleCard', {
	extend: 'AppSection.view.BaseCard',
	xtype: 'vehicle_card',

	config: {
		title: 'VEHICLE',
		cls: 'card card3',
		id: 'vehicleCard',
		store: 'Vehicle'
	}
});

