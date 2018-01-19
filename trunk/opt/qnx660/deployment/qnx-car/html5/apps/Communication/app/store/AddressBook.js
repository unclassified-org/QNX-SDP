/**
 * A store used to show the address book
 * @author mlapierre
 *
 * $Id: AddressBook.js 6848 2013-07-16 21:53:46Z mlytvynyuk@qnx.com $
 */
Ext.define('Communication.store.AddressBook', {
	extend  : 'Ext.data.Store',
	requires: ['Communication.model.Contact', 'Communication.proxy.AddressBook'],

	config: {
		model: 'Communication.model.Contact',
		proxy: { type: 'qnx.addressBook' },

		remoteSort: false,

        sorters: [
			{
				property: 'displayLabel',
				direction: 'ASC'
			}
		],

		grouper: {
		   groupFn: function(record) {
				var groupByString = '';
				try {
					var displayLabel = record.get('displayLabel');
					groupByString = (typeof(displayLabel) === 'string' && displayLabel.length > 0 ? displayLabel.substr(0, 1).toUpperCase():'Unnamed'); // guard condition just in case some how displayLabel got empty.
				} catch (ex) {
					console.warn('Error getting displayLabel property from record:', record);
				}
				return groupByString;
		   }
		}
 	}
});