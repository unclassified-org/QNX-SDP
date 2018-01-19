var transitionDelay = 250;

(function(jQuery)
{
    jQuery.extend({
        infoShow: function () {
            
            var infoContainer;
            
            infoContainer = (!jQuery('.info-container').length) ? jQuery('<div></div>').addClass('info-container').prependTo('body') : jQuery('.info-container');
            infoContainer.addClass('show').delay(transitionDelay).queue(function() {
                infoContainer.addClass('pulsate');
                $(this).dequeue();
            });
        },
        
        infoHide: function () {
            var obj = $('.info-container');
            
            obj.removeClass('pulsate').delay(transitionDelay).queue(function() {
                obj.removeClass('show');
                $(this).dequeue();
            });
        }
    });
})(jQuery);