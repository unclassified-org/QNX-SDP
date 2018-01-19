var WeatherView = Backbone.View.extend({

	el:  $("#weather_holder"),

	initialize: function(options) {
		var self = this;

		self.model.on('change:code', this.weather_updated, this);
	},

	weather_updated: function (weather) {
		var data = weather.attributes.observation,
			text = Images.GetImgText('obs_' + data.icon),
			path = Images.GetImgPath('obs_' + data.icon).large,
			content = ['<h4 style="color:#09d;">' + text + '</h4>',
			'<img src="' + path + '" >',
			'<span id="temp">' + data.temperature_c,
				'<sup id="unit" style="top:0; vertical-align: super; font-size: 52%;">&deg;C</sup>',
			'</span>'].join("");

		if (!this.$el.is(':visible')) {
			this.$el.fadeIn('500');
		}
		this.$el.children('.well').html(content);
	}
});
