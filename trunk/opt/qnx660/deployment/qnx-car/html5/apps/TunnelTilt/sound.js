/**
 *  Plays audio files in WebWorks and browsers supporting HTML5 Audio.
 */
var html5SoundChannels = [];

function playSound(file, loops, volume, pan) {
    var browser = navigator.userAgent;

	if (typeof Audio != 'undefined') {
        playSoundHTML5(file, loops, volume);
    }
}

function playSoundHTML5(file, loops, volume) {
    if  (!html5SoundChannels[file]) {
        var audio = new Audio(file);
        if (loops)
            audio.loop = "true";
        audio.volume = volume;
        audio.preload = "auto";
        html5SoundChannels[file] = audio;
        html5SoundChannels[file].play();
    } else {
        html5SoundChannels[file].play();
    }
}
