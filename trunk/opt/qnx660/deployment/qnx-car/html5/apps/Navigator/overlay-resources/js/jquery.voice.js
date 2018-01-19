var transitionDelay = 250;

(function(jQuery)
{
    jQuery.extend({
        voiceShow: function()
        {   
            $('#voiceBg').addClass('show').removeClass('hide');
            $('#voiceTab').addClass('show').delay(transitionDelay).queue(function() {
                $('#voiceImg').addClass('show');
                $('#voiceAsrData').addClass('show');
                $(this).dequeue();
                $('#voiceUtterance span').text('');
                $('#voiceConfidence span').text('');
            });
        },
        
        voiceHide: function() {
            $('#voiceAsrData').removeClass('show');
            $('#voiceImg').removeClass('show').delay(transitionDelay).queue(function() {
                $('#voiceTab').removeClass('show');
                $('#voiceBg').removeClass('show').addClass('hide');
                $(this).dequeue();
            });
        },
        
        voiceUpdate: function(args) {
            if (args.result) {
                var utterance = '\"' + args.result.utterance + '\"',
                    confidence = args.result.confidence;

                if (args.result.confidence == 0) {
                    confidence = "";
                    utterance = "Input not recognized.";
                }
                
                $('#voiceUtterance span').animate({left:'+=580px'}, 1).delay(1).queue(function() {
                    $('#voiceUtterance span').css('left', '-580px').html( utterance ).animate({left:'0px'},500);
                    $('#voiceConfidence span').text( confidence );
                    $(this).dequeue();
                });
            }
            if (args.state) {
                if (args.state == 'idle') {
                    $('#voiceState span').text('');
                } else {
                    $('#voiceState span').text(args.state);
                }
            }
        }
    });
})(jQuery);