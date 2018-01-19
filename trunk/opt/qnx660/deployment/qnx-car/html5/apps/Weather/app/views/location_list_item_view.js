var LocationListItemView = Backbone.View.extend({
  tagName: 'li',

  initialize: function(options) {
    _.bindAll(this,'select_location');
    this.model.on('remove', this.remove, this); //subscribe to remove events on model
    this.render();
  },

  //----------------------------------
  // Events and event handlers
  //----------------------------------
  events: {
    'click a': 'select_location',
    'click button': 'ask_delete_company',
    'click a.delete': 'delete_company'
  },

  render: function() {
    this.$el.html('<a href="#" id="' + this.model.get('id') + '">' + this.model.get('address') + '</a>');
    return this;
  },

  select_location: function (e) {
    this.$el.siblings().each( function( index ) { 
      $(this).removeClass('active');
    });
    this.$el.addClass('active');
    //TODO: clean this up when we add a POI type to the location model so it can handle hide and show
    //Fade the weather box in if we slected the location via click
    $("#weather_holder").fadeIn('500');
    this.trigger("location_selected", this.model);
  },

  remove: function() {
    this.$el.html('');
  }

});