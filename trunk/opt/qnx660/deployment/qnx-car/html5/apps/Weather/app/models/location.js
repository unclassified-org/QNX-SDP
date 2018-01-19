var Location = Backbone.Model.extend({
  defaults: {
    //QNX Location
    latitude: 45.343665,
    longitude: -75.909638
  },

  initialize: function() {
    var self = this;

    console.log('Backbone : LocationModel : Initialized');
  },

  geolocate: function() {
    var self = this;

    navigator.geolocation.getCurrentPosition(geoSuccess, geoFail, {
      timeout: 10000
    });

    function geoSuccess(position) {
      var latitude = position.coords.latitude,
          longitude = position.coords.longitude;

      console.log('Backbone : GeolocationModel : lat:' + latitude + ' long:' + longitude);
      self.set({'latitude':latitude, 'longitude':longitude});
    } 

    function geoFail() {
      self.trigger('error', function(e){
        console.error('geolocation failed ', e);
      });
    }

  },

  
});