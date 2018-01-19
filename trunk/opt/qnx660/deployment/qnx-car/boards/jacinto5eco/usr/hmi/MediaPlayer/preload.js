/**
 * This file pre-loads :active state and large images to prevent images from 'popping in'.
 * @author lgreenway
 *
 * $Id: preload.js 2475 2012-05-14 20:43:55Z mlapierre@qnx.com $
 */

QnxCar.Util.ImagePreloader.preloadImages(
	[
		//playlist controls
		'resources/img/shuffle_ovr.png',
		'resources/img/repeat_all_ovr.png',
		'resources/img/repeat_one_ovr.png',
		
		//media controls
		'resources/img/play.png',
		'resources/img/play_ovr.png',
		'resources/img/pause.png',
		'resources/img/pause_ovr.png',
		'resources/img/back.png',
		'resources/img/back_ovr.png',
		'resources/img/skip.png',
		'resources/img/skip_ovr.png',
		
		//radio
		'resources/img/radio/btn_def.png',
		'resources/img/radio/btn_seekscan.png',
		'resources/img/radio/dial.png',
		'resources/img/radio/dial_metre.png',
		'resources/img/radio/tuner_bar.png',
		'resources/img/radio/tuner_btn_mid.png',
		'resources/img/radio/tuner_btn_high.png',

		//menu
		'../common/img/menu_exp_ovr.png',
		'../common/img/menu_collapse_ovr.png',
		
		'resources/img/menu_icons/playlist_ovr.png',
		'resources/img/menu_icons/artist_ovr.png',
		'resources/img/menu_icons/album_ovr.png',
		'resources/img/menu_icons/genre_ovr.png',
		'resources/img/menu_icons/song_ovr.png',
		'resources/img/menu_icons/video_ovr.png',
		
		'resources/img/menu_icons/ipod_ovr.png',
		'resources/img/menu_icons/radio_ovr.png',
		'resources/img/menu_icons/USB_ovr.png',
		'resources/img/menu_icons/SDCard_ovr.png',
		'resources/img/menu_icons/CD_ovr.png',
		'resources/img/menu_icons/HDDef_ovr.png',
		
		//search
		'resources/img/search_bkgrd.png',
		'resources/img/search_del.png',
		'resources/img/search_del_ovr.png',
		'resources/img/btn_lrg.png',
		'resources/img/btn_lrg_ovr.png',
		
		//other
		'resources/img/btn_def_ovr.png',
		'resources/img/btn_lrg_ovr.png',
	]
);
