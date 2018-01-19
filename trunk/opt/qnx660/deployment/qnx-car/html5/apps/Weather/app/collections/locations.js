var LocationList = Backbone.Collection.extend({
	model: Location,

	add_new: function(location){
		this.add(new Location(location));
	},

});