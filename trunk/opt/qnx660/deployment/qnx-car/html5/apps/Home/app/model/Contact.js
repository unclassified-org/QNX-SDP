/**
 * Represents a single contact.
 * @author lgreenway
 *
 * $Id: Contact.js 4467 2012-09-30 00:43:20Z lgreenway@qnx.com $
 */
Ext.define('Home.model.Contact', {
   extend: 'Ext.data.Model',

   config: {
	  fields: [
	  		 {name: "contact_id",				type: "int"},
	  		 {name: "title",					type: "string"},
	  		 {name: "lastName",					type: "string"},
	  		 {name: "firstName",				type: "string"},
	  		 {name: "birthday",					type: "date"},
	  		 {name: "anniversary",				type: "date"},
	  		 {name: "company",					type: "string"},
	  		 {name: "jobTitle",					type: "string"},
	  		 {name: "homePhone",				type: "string"},
	  		 {name: "homePhone2",				type: "string"},
	  		 {name: "workPhone",				type: "string"},
	  		 {name: "workPhone2",				type: "string"},
	  		 {name: "mobilePhone",				type: "string"},
	  		 {name: "pagerPhone",				type: "string"},
	  		 {name: "faxPhone",					type: "string"},
	  		 {name: "otherPhone",				type: "string"},
	  		 {name: "email1",					type: "string"},
	  		 {name: "email2",					type: "string"},
	  		 {name: "email3",					type: "string"},
	  		 {name: "homeAddress1",				type: "string"},
	  		 {name: "homeAddress2",				type: "string"},
	  		 {name: "homeAddressCity",			type: "string"},
	  		 {name: "homeAddressCountry",		type: "string"},
	  		 {name: "homeAddressStateProvince",	type: "string"},
	  		 {name: "homeAddressZipPostal",		type: "string"},
	  		 {name: "workAddress1",				type: "string"},
	  		 {name: "workAddress2",				type: "string"},
	  		 {name: "workAddressCity",			type: "string"},
	  		 {name: "workAddressCountry",		type: "string"},
	  		 {name: "workAddressStateProvince",	type: "string"},
	  		 {name: "workAddressZipPostal",		type: "string"},
	  		 {name: "picture",					type: "string"},
	  		 {name: "pin",						type: "string"},
	  		 {name: "uid",						type: "string"},
	  		 {name: "webPage",					type: "string"},
	  		 {name: "categories",				type: "string"},
	  		 {name: "note",						type: "string"},
	  		 {name: "user1",					type: "string"},
	  		 {name: "user2",					type: "string"},
	  		 {name: "user3",					type: "string"},
	  		 {name: "user4",					type: "string"}
	  ],
   },


});
