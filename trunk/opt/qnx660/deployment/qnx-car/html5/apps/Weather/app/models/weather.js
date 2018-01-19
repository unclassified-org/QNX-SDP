var Weather = Backbone.Model.extend({
	defaults: {
		code: 'XYZ'
	},

	initialize: function() { },

  	clear: function() {
    	this.destroy();
  	}
});