var LocationListView = Backbone.View.extend({

    el:  $("#locations_holder"),

    initialize: function(options) {
        var self = this;

		self.map = options.map;
		self.model.on('add', this.added_location, this);
		self.geocoder = new google.maps.Geocoder();

		//initialize position
		self.$el.css({display: 'none', right:'20px', top: '120px'}, 2000);
		self.$el.fadeIn('500');

		self.locations_list = $('#locations_list');

    },

    //----------------------------------
    // Events and event handlers
    //----------------------------------
    events: {
      'click #search': 'determineSearchType',
    },
    determineSearchType: function() {
        if($('#radioWeather').is(':checked')) {
            this.add_new_location();
        }else {
            //return the user to the "Current location" for POI searches
            //Note this only triggers the location switch in context of the location list box
            //map switch is handled when we parse the results from Google 
            $("#locations_list li")[1].firstChild.click()
            this.add_search_results();
        }
    },
    reverseGeocode: function (latlng) {
    var address = '';
    this.geocoder.geocode({'latnLg': latlng}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[2]) {
          address = results[2];
        } else {
          console.log('No results found');
        }
      } else {
        console.log('Geocoder failed due to: ' + status);
      }
    });
    return address;
    },

    add_new_location: function(e) {
        var self = this,
            address = $('#search_string').val();

        self.geocoder.geocode({'address': address}, function(results, status){
            if (status == google.maps.GeocoderStatus.OK) {
                var location = results[0].geometry.location,
                    location_id = (new Date).getTime();

                console.log('add: ', location);

                self.map.setCenter(location);
                self.model.add_new({'address': address, 'latitude': location.lat(), 'longitude': location.lng(), 'id': location_id});
                self.trigger("geocode_complete", self.model.get(location_id));
            } else {
                console.log('Geocode was not successful for the following reason: ' + status);
            }
        });
        console.log('new location: ' + $('#search_string').val());
    },

    select_location: function(location) {
        var selected = new google.maps.LatLng(location.attributes.latitude, location.attributes.longitude);
        this.map.setCenter(selected);

        if (location.attributes.code) {
            this.trigger("code_obtained", location);
            console.log('code: ' + location.attributes.code);
        }
    },

    added_location: function(location) {
        var item_view = new LocationListItemView({ model: location});

        $(this.locations_list).children('li').removeClass('active');
        $(this.locations_list).append(item_view.render().$el.addClass('active'));

        _.extend(item_view, Backbone.Events);
        item_view.bind("location_selected", this.select_location, this);

    },

    //Search for points of interest based on the term in the text box
    add_search_results: function (e) {
        var self = this;
        self.trigger("search_results", $('#search_string').val());
    },
});