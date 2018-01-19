/**
 * A store used to show address results
 * @author dkerr
 *
 * $Id:$
 */
Ext.define('Navigation.store.AddressResults', {
	extend: 'Ext.data.Store',

	requires: [
		'Navigation.model.Location',
	],

	config: {
		model: 'Navigation.model.Location'
	}
});