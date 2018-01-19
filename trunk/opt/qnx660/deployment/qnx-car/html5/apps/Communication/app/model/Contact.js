/**
 * Represents a single contact
 * @author mlapierre
 *
 * $Id: Contact.js 7991 2014-01-06 19:50:12Z mlapierre@qnx.com $
 */
Ext.define('Communication.model.Contact', {
   extend: 'Ext.data.Model',

   config: {
	  fields: [
	  		 {name: "contact_id",				type: "int"},
	  		 {name: "title",					type: "string"},
	  		 {name: "lastName",					type: "string"},
	  		 {name: "firstName",				type: "string"},
	  		 {name: "formattedName",			type: "string"},
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
	  		 {name: "user4",					type: "string"},
             {name: 'displayLabel',             type: "string",     convert: function(v, record) {
                 /*
                 * This inline function generates displayLabel
                 * */

                 // Array maintains priority of the fields to be used as displayLabel, if you want to have different priority please edit the array.
                 // ...this array can be extended to cover all fields in the current model,
                 var fieldsEnum = ["lastName","firstName", "formattedName", "company", "homePhone", "mobilePhone", "homePhone2", "workPhone", "workPhone2", "pagerPhone", "email1", "email2", "email3", "webPage"];
                 var displayField = "";
                 try {
                     // looping through the array of field to find one which can be used for grouping
                     for (var i = 0; i < fieldsEnum.length; i++) {
                         var fieldName = fieldsEnum[i];
                         var fieldValue = record.get(fieldName);
                         // in case all is empty it will be grouped on empty string
                         if (typeof(fieldValue) === 'string' && fieldValue.length > 0) {
                             // special case to join first name and last name if lastName and firstName are available
                             var firstName = record.get(fieldsEnum[1]);
                             if(fieldName == fieldsEnum[0] && typeof(firstName) === 'string' && firstName.length > 0) {
                                 // join first name and last name
                                 fieldValue = firstName + " " + record.get(fieldName);
                             }
                             displayField = fieldValue;
                             break;
                         }
                     }
                 } catch (ex) {
                     console.warn('Error getting properties from record:', record);
                 }

                 // watch if displayField is empty
                 // and make it 'Unnamed'
                 if(displayField.length == 0) {
                     displayField = 'Unnamed';
                 }
                 return  displayField;
             }
          }
	  ]
   }
});
