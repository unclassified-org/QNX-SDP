/**
 * Entry corresponds to 3 files on box.com (json, bar, png)
 * this model populated with information collected from mentioned 3 files
 * @author mlytvynyuk
 *
 * $Id:$
 */
Ext.define('AppBox.model.Entry', {
	extend:'Ext.data.Model',

	config:{
		fields:[
			{name:"id", type:"string"},
			{name:"appid", type:"string"},
			{name:"name", type:"string"},
			{name:"title", type:"string"},
			{name:"path", type:"string"},
			{name:"rootPath", type:"string"},
			{name:"is_dir", type:"string"},
			{name:"icon", type:"string"},
			{name:"iconBASE64", type:"string"},
			{name:"bar", type:"string"},
			{name:"modified", type:"string"},
			{name:"parent", type:"string"},
			{name:"size", type:"string"},
			{name:"description", type:"string"},
			{name:"iconURL", type:"string"},
			{name:"barURL", type:"string"},
			{name:"license", type:"string"}
		]
	},

	setBASE64:function(content) {

		var buffer = content;
		var bytes = new Uint8Array(buffer)
		var bytesLen = bytes.byteLength;
		var binary = String.fromCharCode.apply(null, bytes);

		var b64 = "data:image/png;base64," + window.btoa(binary);

		this.set('iconBASE64',b64);
	},

	setURL:function(content) {

		var media = {};

		try{
			media = JSON.parse(content);
		} catch(e) {
			throw e; // TODO or handle this separately
		}

		this.set('iconBASE64',media.url);
	}


});
