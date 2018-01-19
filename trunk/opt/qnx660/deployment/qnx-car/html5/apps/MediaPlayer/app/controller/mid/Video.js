/**
 * The mid-profile video controller.
 * @author lgreenway
 *
 * $Id: Video.js 6632 2013-06-20 15:18:00Z lgreenway@qnx.com $
 */
Ext.define('MediaPlayer.controller.mid.Video', {
	extend: 'MediaPlayer.controller.Video',
	
	/**
	 * @override
	 * Prevents the default behaviour of showing the video view.
	 * @protected
	 */
	onVideoIndex: function() {
		// Nothing
	},
	
	/**
	 * @override
	 * Prevents the default behaviour and shows a warning stating that video is not supported.
	 * @param event {Object} The event details
	 * @protected
	 */
	onVideoPlay: function(video) {
		Ext.Msg.alert('Warning', 'Video is not supported.', Ext.emptyFn);
	}
});
