/**
 * A store used to show the contacts from the ASR search result
 * @author dkerr
 *
 * $Id: $
 */
Ext.define('Communication.store.SearchContacts', {
	extend  : 'Ext.data.Store',
	requires: ['Communication.model.Contact', 'Communication.proxy.AddressBook'],



	config: {
		model: 'Communication.model.Contact',
		proxy: Ext.create('Communication.proxy.AddressBook', {
			filterExpression: new qnx.bluetooth.pbap.FilterExpression('asr_match_score', '>', 0)
		}),

		remoteSort: true,
		sorters: [
			{
				property: 'asr_match_score',
				direction: 'DESC',
			}
		],
	},

});