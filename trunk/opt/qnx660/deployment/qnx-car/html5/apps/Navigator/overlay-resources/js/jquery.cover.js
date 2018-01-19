/* $Id $ */

var transitionDelay = 300;


(function(jQuery)
{
    jQuery.extend({
        coverShow: function() {   
            $('.wrapper').toggleClass('hidden', false).toggleClass('visible', true);
        },
        
        coverHide: function() {
            $('.wrapper').toggleClass('visible', false).toggleClass('hidden', true);
        }
    });
})(jQuery);
