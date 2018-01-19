/**
 * Controller responsible handling AppPortal main UI
 * @author mlytvynyuk@qnx.com
 * $Id:$
 */
Ext.define('AppBox.controller.Main', {

	extend:'Ext.app.Controller',

	config:{

		refs:{
			main:'mainView',
			browseView:'browseView',
			installedView:'installedView',
			navlist:'#navlist',
			backBtn:'#backBtn',
			backToBrowse:'#backToBrowse',
			installBtn:'button[action=install]',
			uninstallBtn:'button[action=uninstall]',
			appView : { selector: 'appView',xtype: 'appView',autoCreate: true},
			licenseView : { selector: 'licenseView',xtype: 'licenseView',autoCreate: true},
			acceptBtn: 'button[action=accept]',
			declineBtn: 'button[action=decline]',
			catlist:'#catlist'
		},

		control:{
			'#navlist': {
				itemtap:'onListItemTap'
			},
			'#catlist': {
				itemtap:'onCategoryTap'
			},
			installBtn: {
				release: 'onInstallTap'
			},
			uninstallBtn: {
				release: 'onUnInstallTap'
			},
			acceptBtn: {
				release: 'onAcceptLicense'
			},
			declineBtn: {
				release: 'onDeclineLicense'
			}
		}
	},

	/** Default root directory */
	DEFAULT_START_DIRECTORY: '0', // Root directory
	/** Customer specific Applicaiton client id  */
	CLIENT_ID:'99hdumxgsyg9lexgfatezq1e84mgt5uc',
	/** Customer specific Applicaiton client secret */
	CLIENT_SECRET:'C5KPvfdSaDH9NEo2uAXYg0l9rGYvIOUy',

	/**
	 * Will be executed right after Application launch executed,
	 * creates references to stores,
	 * initialises event handlers
	 * obtain list of all installed applications
	 * */
	launch:function () {
		// save local instance of the store

		// will contain current level of categories (folders)
		this.categoriesStore = Ext.getStore('Categories');

		// will contains all apps in current category (3 files per app) aggregated and processed view
		this.appsStore = Ext.getStore('Apps');

		// will contain ALL files in current directory
		this.viewStore = Ext.getStore('View');

		// will contains list of all installed apps
		this.allAppsStore = Ext.getStore('AllApps');

		// we need to refresh access_token
		qnx.box.authorise(this.CLIENT_ID,this.CLIENT_SECRET,this.onAccessTokenReady.bind(this),this.onAccessTokenFailed.bind(this));

		this.populateListOfInstalledApps();

		// setup event handlers for install and uninstall progress
		qnx.box.onInstallProgress = this.onInstallStatus.bind(this);
		qnx.box.onUnInstallProgress = this.onUnInstallStatus.bind(this);
	},

	/**
	 * Obtains list of applications and put them in local store
	 * */
	populateListOfInstalledApps:function() {
		//get list of all applications
		var obj = qnx.application.getList(),
			list = [];
		for (var item in obj) {
			list.push(obj[item])
		}
		// set data to the stores
		this.allAppsStore.removeAll();
		this.allAppsStore.add(list);
	},

	/**
	 * Handlers error during obtaining auth token
	 * Display message to user
	 * @param {Object} event contains access and refresh tokens
	 * */
	onAccessTokenReady:function(event) {
		this.getRootFolder();
	},

	/**
	 * Handlers error during obtaining auth token
	 * Display message to user
	 * @param {String} msg an error message
	 * */
	onAccessTokenFailed:function(msg) {
		Ext.Msg.show({ title:'Error', msg: msg });
		// forces authentication
		localStorage.clear();
	},

	/**
	 * Displays an error message when application failed to obtain folder or file metadata
	 * @param {String} msg - An error message
	 * */
	onMetadataError: function(msg) {
		Ext.Msg.show({ title:'Error', msg: msg });
	},

	/**
	 * Event handler, will be triggered when installation event occurs
	 * @param {Object} e contains event specific information
	 * @example: {
	 *     state: {String},
	 *     message: {String},
	 *     progress: {String}
	 * }
	 * */
	onInstallStatus:function(e) {
		if(e && e.progress == 0 && ( e.state == 'install' || e.state == 'download') ) {
			this.getMain().setMasked({xtype: 'loadmask',indicator:true, message: 'Installing...'});
		}

		if(e && e.progress == 100) {
			this.getMain().setMasked(false);
			this.getAppView().setAppInstalled(true);
			this.populateListOfInstalledApps();
		}
	},

	/**
	 * Event handler, will be triggered when un-installation event occurs
	 * @param {Object} e - contains event specific information
	 * @example: {
	 *     state: {String},
	 *     message: {String}
	 * }
	 * */
	onUnInstallStatus:function(e) {
		if(e && e.progress == 0) {
			this.getMain().setMasked({xtype: 'loadmask',indicator:true, message: 'UnInstalling...'});
		}

		if(e && e.progress == 100) {
			this.getMain().setMasked(false);
			this.getAppView().setAppInstalled(false);
			this.populateListOfInstalledApps();
		}
	},

	/**
	 * Function invokes extension to obtain root category,
	 * DEFAULT_START_DIRECTORY = 0 - is the ID of root category in box.com API
	 * */
	getRootFolder:function() {
		qnx.box.getFolder(this.DEFAULT_START_DIRECTORY, this.populateCategories.bind(this),this.onMetadataError.bind(this)) // get root folder
	},



	/**
	 * Function handles the metadata of the root folder
	 * @param {Object} obj content of the root folder ( contains references to folder children folders )
	 * */
	parseRoot_candidate_to_remove:function(obj) {
		// clean stores
		this.categoriesStore.removeAll();

		// process metadata
		var processed = [];

		for (var i = 0; i < obj.item_collection.entries.length; i++) {

			var entry = obj.item_collection.entries[i];

			var newEntry = Ext.create('AppBox.model.Entry', {
				id:entry.id,
				name:entry.name,
				is_dir:entry.type
			});

			if(entry.type == 'folder' && entry.name == 'appworld') {
				qnx.box.getFolder(entry.id, this.populateCategories.bind(this),this.onMetadataError.bind(this)) // get appworld folder
			}
		}
		this.current = obj.path;
	},

	/**
	 * Function is handles the metadata of the root folder
 	 * Then in loop fires up request to get all children folders
	 * @param {Object} obj content of the root folder ( contains references to folder children folders )
	 * */
	populateCategories:function(obj) {
		// clean stores
		this.categoriesStore.removeAll();

		// process metadata
		var processed = [];

		for (var i = 0; i < obj.item_collection.entries.length; i++) {

			var entry = obj.item_collection.entries[i];

			var newEntry = Ext.create('AppBox.model.Entry', {
				id:entry.id,
				name:entry.name,
				is_dir:entry.type
			});

			if(entry.type == 'folder') {
				this.categoriesStore.add(newEntry);
			}
		}
		this.current = obj.path;

		// set first one selected
		this.getCatlist().selectRange(0, 0);
		var res = this.getCatlist().getSelection()[0];

		// when all categories parsed pick first category to display its content
		qnx.box.getFolder(res.get('id'), this.parseFolder.bind(this),this.onMetadataError.bind(this)) // get appworld folder
	},

	/**
	 * Function is handles the metadata of any given folder
	 * Then in loop fires up request to get all children files
	 * Populates stores
	 * @param {Object} obj content of the folder ( contains references to files )
	 * */
	parseFolder: function(obj){
		// clean the store
		this.appsStore.removeAll();
		this.viewStore.removeAll();

		// process metadata
		var processed = [];

		for (var i = 0; i < obj.item_collection.entries.length; i++) {

			var entry = obj.item_collection.entries[i];
			var newEntry = {};

			// treat JSON file like an app only
			newEntry = Ext.create('AppBox.model.Entry', {
				id:entry.id,
				name:entry.name,
				title:entry.name.replace('.json',''),
				icon:entry.icon,
				size:entry.bytes
			});

			// special treatment of JSON files
			if(entry.name.indexOf('.json') != -1) {

				// mark entry as special
				newEntry.set('is_dir','json');

				//get the content of JSON file
				qnx.box.getFileContent(entry.id,this.setContent.bind(newEntry));

				this.appsStore.add(newEntry);
			}

			// we need to have all filenames entries
			this.viewStore.add(newEntry);
		}
	},

	/**
	 * Function works  on content of sidecart files and assembles model object from it
	 * @param content {String} content of sidecard model in JSON format
	 * */
	setContent:function(responseText) {

		var sideCart = {};

		try{
			sideCart = JSON.parse(responseText);
		} catch(e) {
			throw e; // TODO or handle this separately
		}

		this.set('description',sideCart.description);
		this.set('name',sideCart.name);
		this.set('appid',sideCart.id);
		this.set('icon',sideCart.icon);
		this.set('bar',sideCart.bar);
		this.set('license',sideCart.license);
		var rootPath = this.get('rootPath');

		var store = Ext.getStore('View'); // I don't really like this
		var res = store.findRecord('name',sideCart.icon);
		this.set('iconURL',res.get('id')); // this is actually id of the file with image
		this.set('barURL',qnx.box.getFileURL(rootPath + '/' + sideCart.bar));

		qnx.box.getImage(this.get('iconURL'),this.setBASE64.bind(this));
	},

	/**
	 * Will be triggered when user selected one of the apps
	 *
	 * @param list : {Object} Ext.dataview.DataView
	 * @param index : {Object} Number The index of the item tapped
	 * @param target : {Object} Ext.Element/Ext.dataview.component.DataItem The element or DataItem tapped
	 * @param record : {Object} Ext.data.Model The record associated to the item
	 * @param e : {Object} Ext.EventObject The event object
	 * @param eOpts : {Object} Options
	 * */
	onListItemTap:function (list, index, target, record, e, eOpts) {
		// display details page
		if(record.get('is_dir') == 'json') {

			// check if app installed
			var res = this.allAppsStore.findRecord('name',record.get('name'),0,false,true,true);

			if(res){
				this.getAppView().setAppInstalled(true);
			} else {
				this.getAppView().setAppInstalled(false);
			}

			this.getAppView().setAppDetails(record);
			this.getMain().push(this.getAppView());
		}
	},

	/**
	 * Will be triggered when user selected one of the categories

	 * @param list : {Object} Ext.dataview.DataView
	 * @param index : {Object} Number The index of the item tapped
	 * @param target : {Object} Ext.Element/Ext.dataview.component.DataItem The element or DataItem tapped
	 * @param record : {Object} Ext.data.Model The record associated to the item
	 * @param e : {Object} Ext.EventObject The event object
	 * @param eOpts : {Object} Options
	 * */
	onCategoryTap: function(list, index, target, record, e, eOpts) {
		if(record.get('is_dir') == 'folder') {
			qnx.box.getFolder(record.get('id'), this.parseFolder.bind(this),this.onMetadataError.bind(this));
		}
	},

	/**
	 * Event handler will be invoked when user tapped on Install button
	 * */
	onInstallTap: function() {
		var selected = this.getNavlist().getSelection()[0]; // we are selecting only one item

		var self = this;

		if(selected && selected.get('license').length > 0){
			// display License dialog popup
			this.getAppView().showLicense(true);
		}
	},

	/**
	 * Event handler will be invoked when user tapped on Uninstall button
	 * */
	onUnInstallTap: function() {
		var selected = this.getNavlist().getSelection()[0]; // we are selecting only one item
		//issue uninstall command
		qnx.box.uninstall(selected.get('appid'));
	},

	/**
	 * Event handler will be invoked when user tapped on Accept button
	 * */
	onAcceptLicense:function() {
		var selected = this.getNavlist().getSelection()[0]; // we are selecting only one item

		// proceed with install
		if(selected) {
			var res = this.viewStore.findRecord('name',selected.get('bar')); // to get barfile id, because selected is actually JSON files.
			qnx.box.install(res.get('id'));
		}
		this.getAppView().showLicense(false);
	},

	/**
	 * Event handler will be invoked when user tapped on Decline license button
	 * just hides the view
	 * */
	onDeclineLicense:function() {
		this.getAppView().showLicense(false);
	}
});