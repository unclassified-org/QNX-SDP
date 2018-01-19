var Locations = new LocationList();

//---------------------------------------
// The Application
// ---------------
// Our overall **AppView** is the top-level piece of UI.
//---------------------------------------
var AppView = Backbone.View.extend({

  //--------------------------------------
  // Initialize map and marker Array
  //--------------------------------------
  _map_markers: [],
  _initialize_map: function(lat, lng) {
    var center = new google.maps.LatLng(lat, lng);
    var styles = [{
      elementType: "geometry",
      stylers: [{
        lightness: 33
      }, {
        saturation: -90
      }]
    }];

    var mapOptions = {
      disableDefaultUI: true,
      zoom: 9,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      center: center,
      styles: styles
    };
    this.map = new google.maps.Map(document.getElementById('map_canvas'),
      mapOptions);
    this.infowindow = new google.maps.InfoWindow();
  },


  //--------------------------------------
  // App Initialization
  //--------------------------------------
  initialize: function() {
    var self = this;

    self.currentLocation = new Location();
    self.weather = new Weather();

    self.listenTo(self.currentLocation, 'change', this.render);
    self.currentLocation.geolocate();
  },
  onAppData: function(data) {
    var self = this;
    switch (data.type) {
      case "Weather":
        $('#search_string').val(data.term);
        $('#radioWeather').click();
        $('#search').click();
        break;
      case "Search":
        $('#search_string').val(data.term);
        $('#radioPoi').click();
        $('#search').click();
        break;
      default:
        break;
    }
  },
  search_results: function(poi) {
    var self = this,
      loc = self.currentLocation,
      request = {
        location: new google.maps.LatLng(loc.attributes.latitude, loc.attributes.longitude),
        radius: '50000',
        keyword: poi
      };
    service = new google.maps.places.PlacesService(self.map);
    service.nearbySearch(request, self.handle_poi_result);
    //TODO: clean this up when we add a POI type to the location model so it can handle hide and show
    //Hide the weather box since we don't want it when we show POI
    $("#weather_holder").fadeOut('500');
  },
  handle_poi_result: function(results, status) {
    var self = this,
      create_marker = function(place) {
        var self = this;
        var placeLoc = place.geometry.location;
        var marker = new google.maps.Marker({
          map: self.App.map,
          position: place.geometry.location
        });
        self.App._map_markers.push(marker);

        google.maps.event.addListener(marker, 'click', function() {
          self.App.infowindow.setContent("<h3>" + place.name + "</h3><p>" + place.vicinity + "</p>");
          self.App.infowindow.open(self.App.map, this);
        });
      },
      location;
    location = new google.maps.LatLng(self.App.currentLocation.attributes.latitude, self.App.currentLocation.attributes.longitude);

    if (status == google.maps.places.PlacesServiceStatus.OK) {
      //manually clear the old markers since Google doens't have a clear method
      //https://developers.google.com/maps/documentation/javascript/overlays?csw=1#RemovingOverlays
      for (var i = 0; i < self.App._map_markers.length; i++) {
        self.App._map_markers[i].setMap(null);
      }
      self.App._map_markers.length = 0;
      self.App.map.setCenter(location);
      for (i = 0; i < results.length; i++) {
        var place = results[i];
        create_marker(results[i]);
      }
    }
  },
  geocode_complete: function(location) {
    var self = this,
      url = (['http://weyesearch.pelmorex.com/api/search?&',
        'lat=' + location.attributes.latitude + '&',
        'long=' + location.attributes.longitude + '&',
        'l=0&',
        'p=city,gridindex&',
        'top=1&',
        'orderby=distance&',
        'format=json&',
        'id=' + location.id + '&',
        'cityName=ext1'
      ]).join("");

    location.on('change', self.getWeather, location);

    $.ajax({
      url: url,
      dataType: 'json',
      crossDomain: true,
      context: location,
      success: function(data, status, jqXHR) {
        if (data.locationType.length > 0) {
          this.set({
            code: data.locationType[0].location[0].code
          });
        } else {
          console.log("No results for this location");
        }
      },
      error: self.weatherCodeError
    });
    console.log('geocode complete ' + url);
  },

  getWeather: function(location) {
    var url = 'http://weyeplaybook.pelmorex.com/PlaybookData/' + location.attributes.code,
      current_time = (new Date).getTime();

    $.ajax({
      url: url,
      dataType: 'json',
      context: location,
      crossDomain: true,
      success: function(data, status, jqXHR) {

        App.weather.set({
          observation: data.PACKAGE.Observation,
          code: this.attributes.code
        });
        console.log(data);

      },
      error: self.weatherCodeError
    });
  },

  onWeatherChange: function(weather) {
    console.log(weather);
  },

  weatherCodeError: function() {
    console.log('error');
  },

  render: function() {
    var self = this,
      geoCurrent = self.currentLocation.toJSON(),
      weather_view = new WeatherView({
        model: this.weather
      });

    console.log('_initialize_map');
    self._initialize_map(geoCurrent.latitude, geoCurrent.longitude);

    setTimeout(function() { //delay markers popp
      //create views
      var list_view = new LocationListView({
        model: Locations,
        map: self.map
      });

      _.extend(list_view, Backbone.Events);
      list_view.bind("geocode_complete", self.geocode_complete, self);
      list_view.bind("code_obtained", self.getWeather, self);
      list_view.bind("search_results", self.search_results, self);

      list_view.model.add_new({
        'address': 'Current Location',
        'latitude': geoCurrent.latitude,
        'longitude': geoCurrent.longitude,
        'id': (new Date).getTime()
      });

      if ($('#search_string').val()) {
        list_view.add_new_location();
      }

      // After map and ui has been drawn setup the event listeners
      // otherwise we can get into issues with the app  showing POI searches
      //  as weather when launched with app data from ASR
      if (typeof qnx != 'undefined') {
        blackberry.event.addEventListener("appdata", self.onAppData);
        qnx.application.event.register('LocalSearch');
        var appdata = qnx.application.event.getData();

        if (appdata) {
          self.onAppData(appdata);
        }
      }
    }, 1000);

  }

});

// Load the application once the DOM is ready, using `jQuery.ready`:
var App = null;

$(function() {
  App = new AppView();
  // Remove the loading messages
  $("#loadingMessage").remove();
});