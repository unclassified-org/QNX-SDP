/*
 * a2dp_iface.h
 *
 *  Created on: Mar 26, 2013
 *      Author: malsharnouby
 */

#ifndef A2DP_IFACE_H_
#define A2DP_IFACE_H_
#include <stdio.h>

#include <sys/iomsg.h>
#include <sys/neutrino.h>

#define IO_MSG_SUBTYPE_COMMMAND 1
#define MAX_MESSAGE_SIZE 4096

// Plug-in ----> io-bluetooth
#define A2DP_INIT_MSG_HEAD(PA2DP_MSG, COMMAND_SUBTYPE)\
	(PA2DP_MSG)->hdr.type = _IO_MSG;\
	(PA2DP_MSG)->hdr.combine_len = sizeof((PA2DP_MSG)->hdr);\
	(PA2DP_MSG)->hdr.mgrid = _IOMGR_PRIVATE_BASE;\
	(PA2DP_MSG)->hdr.subtype = COMMAND_SUBTYPE;\

// Plug-in ----> io-bluetooth
typedef enum _a2dp_cmd_t {
	MEDIA_PLAY = _PULSE_CODE_MINAVAIL, //This is (0) max is _PULSE_CODE_MAXAVAIL (127)
	MEDIA_STOP,
	MEDIA_PAUSE,
	MEDIA_NEXT,
	MEDIA_PREVIOUS,

	MEDIA_POS_UPDATE,
	MEDIA_RESPONSE,
	MEDIA_UPDATE,
	MEDIA_REG_MSG_SERVER,
	MEDIA_DATA,

	MEDIA_METADATA, //---> Used
	MEDIA_PLAYERS_ADV, //-->Used
	MEDIA_PLAYER_SETTINGS, //--> used
	MEDIA_VERSION,
	MEDIA_EVENT_SUPP,
	MEDIA_PLAYBACK_POS,
	MEDIA_PLAY_STATUS,
	MEDIA_PLAYERS,
	MEDIA_PLAYERS_A2DP_CONNECTED,
	MEDIA_PLAYERS_A2DP_DISCONNECTED,
	MEDIA_PLAYERS_AVRCP_CONNECTED,
	MEDIA_PLAYERS_AVRCP_DISCONNECTED,

	MEDIA_PLAYER_STATUS, //GET THE CAPABILITIES AND EVERYTHING YOU KNOW ABOUT THE PLAYER

	MEDIA_GET_PLAYERS, //SEND THE CAPABILITIES
	MEDIA_GET_SUPP_EVENTS,
	MEDIA_GET_PLAYERS_RESP,
	MEDIA_GET_STATE,
	MEDIA_PLAYING,
	MEDIA_STOPPED,

	MEDIA_ERROR,
	MEDIA_CMD_SIZE
} a2dp_cmd_e;

typedef enum _plugin_cmd_t {
	PLUGIN_PLAY = _PULSE_CODE_MINAVAIL, //This is (0) max is _PULSE_CODE_MAXAVAIL (127)
	PLUGIN_STOP,
	PLUGIN_REG_MSG_SERVER,
	PLUGIN_PLAYER_STATUS, //GET THE CAPABILITIES AND EVERYTHING YOU KNOW ABOUT THE PLAYER
	PLUGIN_GET_PLAYERS, //SEND THE CAPABILITIES
	PLUGIN_GET_STATE,
	PLUGIN_CMD_SIZE
} plugin_cmd_e;

typedef enum _media_resp_t {
	MEDIA_RESP_RESPONSE = PLUGIN_CMD_SIZE + 1,
	MEDIA_RESP_UPDATE,
	MEDIA_RESP_REG_MSG_SERVER,
	MEDIA_RESP_DATA,
	MEDIA_RESP_PLAYER_STATUS, //GET THE CAPABILITIES AND EVERYTHING YOU KNOW ABOUT THE PLAYER
	MEDIA_RESP_GET_PLAYERS, //SEND THE CAPABILITIES
	MEDIA_RESP_GET_STATE,
	MEDIA_RESP_PLAYING,
	MEDIA_RESP_STOPPED,
	MEDIA_RESP_CMD_SIZE
} media_resp_t;

typedef enum _media_evnt_t {
	MEDIA_EVNT_PLAY = MEDIA_RESP_CMD_SIZE + 1, //This is (0) max is _PULSE_CODE_MAXAVAIL (127)
	MEDIA_EVNT_STOP,
	MEDIA_EVNT_POS_UPDATE,
	MEDIA_EVNT_RESPONSE,
	MEDIA_EVNT_UPDATE,
	MEDIA_EVNT_REG_MSG_SERVER,
	MEDIA_EVNT_DATA,
	MEDIA_EVNT_PLAYER_STATUS, //GET THE CAPABILITIES AND EVERYTHING YOU KNOW ABOUT THE PLAYER
	MEDIA_EVNT_GET_PLAYERS, //SEND THE CAPABILITIES
	MEDIA_EVNT_GET_STATE,
	MEDIA_EVNT_PLAYING,
	MEDIA_EVNT_STOPPED,
	MEDIA_EVNT_CMD_SIZE
} media_evnt_t;

typedef union {
	media_evnt_t media_evnt_msg;
	media_resp_t media_resp_msg;
	plugin_cmd_e plugin_cmd_msg;
} media_msg;

typedef enum _cmd_params_e {
	BLOCKING = 0, NONBLOCKING
} cmd_params_e;

// Plug-in ----> io-bluetooth (RESROUCE MANAGER IO_MSG)
typedef struct _a2dp_msg_t {
	struct _io_msg hdr;
	a2dp_cmd_e cmd;
	cmd_params_e cmd_params;
	unsigned int size;
	char msg[0];
} a2dp_msg_t, *pa2dp_msg_t;

// io-bluetooth ----> Plugin
typedef enum _media_msg_type {
	MEDIA_RET_ERROR = -1, MEDIA_RET_SUCCESS, MEDIA_RET_FAIL, MEDIA_RET_NODATA, MEDIA_RET_NOTCONNECTED, RESP_SIZE
} media_msg_type;

// io-bluetooth ----> Plugin
typedef enum _a2dp_error_e {
	ERR_OK = 0, ERR_BUSY, ERR_FAIL, ERR_SIZE
} a2dp_error_e;

// io-bluetooth ----> Plugin
typedef enum _a2dp_evnt_e {
	EVNT_1 = 0, EVNT_SIZE
} a2dp_evnt_e;

typedef enum _evnt_state_et {
	COMPLETE = 0, CHUNKED
} evnt_state_et;

// io-bluetooth ----> Plugin (RESOURCE MANAGER)
typedef struct _a2dp_msg_header_t {
	unsigned int msg_len;
	a2dp_evnt_e ea2dp_evnt_t;
	evnt_state_et evnt_state;
} a2dp_msg_header_t;

// io-bluetooth <----> Plugin (MESSAGE/PULSE SERVER)
typedef struct {
	a2dp_cmd_e cmd;
	int type;
	cmd_params_e cmd_params;
	unsigned int size;
	char msg[0];
} a2dp_plugin_msg_t, *pa2dp_plugin_msg_t;

typedef union {
	a2dp_plugin_msg_t msg;
	struct _pulse pulse;
} a2dp_msg_pulse_t;

/*					 *************************************************************
 *
 * 									BLUEGO SPECIFIC STRUCTURES SECTION
 *
 * 					*************************************************************
 */

typedef enum _IOBT_MediaValue_e {
	IOBT_MEDIA_VALUE_NONE = 0x00, ///< Shall be used if no parameter below is used

	IOBT_MEDIA_VALUE_A2DP_CONNECTED, ///< A2DP connected
	IOBT_MEDIA_VALUE_A2DP_DISCONNECTED, ///< A2DP disconnected

	IOBT_MEDIA_VALUE_CONTROL_CONNECTED_VER_NONE, ///< Remote control not supported
	IOBT_MEDIA_VALUE_CONTROL_CONNECTED_VER_1_0, ///< Remote control connected version 1.0
	IOBT_MEDIA_VALUE_CONTROL_CONNECTED_VER_1_3, ///< Remote control connected version 1.3
	IOBT_MEDIA_VALUE_CONTROL_CONNECTED_VER_1_4, ///< Remote control connected version 1.4
	IOBT_MEDIA_VALUE_CONTROL_DISCONNECTED, ///< Remote control disconnected
	IOBT_MEDIA_VALUE_STREAM_CONNECTED, ///< Stream active
	IOBT_MEDIA_VALUE_STREAM_DISCONNECTED, ///< Stream not active

	IOBT_MEDIA_VALUE_PLAY_STATUS_STOPPED = 0x10, ///< Remote mediaplayer stopped
	IOBT_MEDIA_VALUE_PLAY_STATUS_PLAYING, ///< Remote mediaplayer playing
	IOBT_MEDIA_VALUE_PLAY_STATUS_PAUSED, ///< Remote mediaplayer paused
	IOBT_MEDIA_VALUE_PLAY_STATUS_FWD_SEEK, ///< Remote mediaplayer FWD
	IOBT_MEDIA_VALUE_PLAY_STATUS_REW_SEEK, ///< Remote mediaplayer REW

	IOBT_MEDIA_VALUE_EQUALIZER_OFF = 0x32, ///< Remote mediaplayer eq off, enum value set to match IOBT_MEDIA_CONTROL_VALUE_EQUALIZER_OFF
	IOBT_MEDIA_VALUE_EQUALIZER_ON, ///< Remote mediaplayer eq on
	IOBT_MEDIA_VALUE_REPEAT_OFF, ///< Remote mediaplayer repeat off
	IOBT_MEDIA_VALUE_REPEAT_SINGLE, ///< Remote mediaplayer repeat single
	IOBT_MEDIA_VALUE_REPEAT_ALL, ///< Remote mediaplayer repeat all
	IOBT_MEDIA_VALUE_REPEAT_GROUP, ///< Remote mediaplayer repeat group
	IOBT_MEDIA_VALUE_SHUFFLE_OFF, ///< Remote mediaplayer shuffle off
	IOBT_MEDIA_VALUE_SHUFFLE_ALL, ///< Remote mediaplayer shuffle all
	IOBT_MEDIA_VALUE_SHUFFLE_GROUP, ///< Remote mediaplayer shuffle group
	IOBT_MEDIA_VALUE_SCAN_OFF, ///< Remote mediaplayer scan off
	IOBT_MEDIA_VALUE_SCAN_ALL, ///< Remote mediaplayer scan all
	IOBT_MEDIA_VALUE_SCAN_GROUP, ///< Remote mediaplayer scan group

	IOBT_MEDIA_VALUE_BATTERY_NORMAL, ///< Remote mediaplayer battery normal
	IOBT_MEDIA_VALUE_BATTERY_WARNING, ///< Remote mediaplayer battery warning
	IOBT_MEDIA_VALUE_BATTERY_CRITICAL, ///< Remote mediaplayer battery critical
	IOBT_MEDIA_VALUE_BATTERY_EXTERNAL, ///< Remote mediaplayer battery attached to power
	IOBT_MEDIA_VALUE_BATTERY_FULL_CHARGE, ///< Remote mediaplayer battery full
	IOBT_MEDIA_VALUE_SYSTEM_POWER_ON, ///< Remote system power on
	IOBT_MEDIA_VALUE_SYSTEM_POWER_OFF, ///< Remote system power off
	IOBT_MEDIA_VALUE_SYSTEM_UNPLUGGED, ///< Remote system power unplugged
	IOBT_MEDIA_VALUE_TRACK_END, ///< Remote mediaplayer track end
	IOBT_MEDIA_VALUE_TRACK_START, ///< Remote mediaplayer track start

	IOBT_MEDIA_VALUE_CONTROL_BROWSE_CONNECTED, ///< Remote control connected
	IOBT_MEDIA_VALUE_CONTROL_BROWSE_DISCONNECTED, ///< Remote control disconnected

	IOBT_MEDIA_VALUE_ERROR = 0xFF

} IOBT_MediaValue_e;

/**
 * @brief	Type for Media specific updates
 */
typedef enum _IOBT_UpdateMedia_e {
	IOBT_UPDATE_MEDIA_A2DP = 0x00, ///< A2DP state, IOBT_UpdateMas_t value is set to IOBT_MEDIA_VALUE_A2DP_X
	IOBT_UPDATE_MEDIA_CONTROL, ///< Remote control state, IOBT_UpdateMas_t value is set to IOBT_MEDIA_VALUE_CONTROIOBT
	IOBT_UPDATE_MEDIA_STREAM, ///< Stream state, IOBT_UpdateMas_t value is set to IOBT_MEDIA_VALUE_STREAM_X
	IOBT_UPDATE_MEDIA_VOLUME, ///< Volume, IOBT_UpdateMas_t n.number is set to 0 - 100 (which is % of max volume).

	IOBT_UPDATE_MEDIA_PLAY_STATUS, ///< Play status, IOBT_UpdateMas_t value is set to IOBT_MEDIA_VALUE_PLAY_STATUS_X
	IOBT_UPDATE_MEDIA_EQUALIZER, ///< Equalizer state, IOBT_UpdateMas_t value is set to IOBT_MEDIA_VALUE_EQUALIZER_X
	IOBT_UPDATE_MEDIA_REPEAT, ///< Repeat state, IOBT_UpdateMas_t value is set to IOBT_MEDIA_VALUE_REPEAT_X
	IOBT_UPDATE_MEDIA_SHUFFLE, ///< Shuffle state, IOBT_UpdateMas_t value is set to IOBT_MEDIA_VALUE_SHUFFLE_X
	IOBT_UPDATE_MEDIA_SCAN, ///< Scan state, IOBT_UpdateMas_t value is set to IOBT_MEDIA_VALUE_SCAN_X
	IOBT_UPDATE_MEDIA_BATTERY, ///< Battery status, IOBT_UpdateMas_t value is set to IOBT_MEDIA_VALUE_BATTERY_X
	IOBT_UPDATE_MEDIA_SYSTEM, ///< System status, IOBT_UpdateMas_t value is set to IOBT_MEDIA_VALUE_SYSTEM_X
	IOBT_UPDATE_MEDIA_TRACK, ///< Track status, IOBT_UpdateMas_t value is set to IOBT_MEDIA_VALUE_TRACK_X
	IOBT_UPDATE_MEDIA_TRACK_CHANGED, ///< Track changed, IOBT_UpdateMas_t n.uid is set to current track UID.
									 ///< If set to 0xFFFFFFFF FFFFFFFF no track is currently selected.
									 ///< If set to 0, no individual track UIDs are available.
	IOBT_UPDATE_MEDIA_PLAYBACK_POS, ///< Playback position updated, IOBT_UpdateMas_t n.number is set to current milliseconds.

	IOBT_UPDATE_MEDIA_BROWSE, ///< Browse status, IOBT_UpdateMas_t value is set to IOBT_MEDIA_VALUE_CONTROL_BROWSE_X
	IOBT_UPDATE_MEDIA_BROWSE_PLAY_LIST, ///< Playing content list has changed, value not used.
	IOBT_UPDATE_MEDIA_BROWSE_AVAIL_MP, ///< Available media players changed, value not used.
	IOBT_UPDATE_MEDIA_BROWSE_ADDRESSED_MP_CHANGED, ///< Current addressed media player changed, IOBT_UpdateMas_t n.player is set to current media player ID and current UID counter.
	IOBT_UPDATE_MEDIA_BROWSE_UIDS, ///< UIDs changed, the number of addressed media player items/UIDs have changed. n.number is set to current UID counter. UID counter == 0 means that the player is not aware of its database.
	IOBT_UPDATE_MEDIA_BROWSE_FOLDER_ITEMS, ///< When folder is changed, value is unused, this indicates the current number of items (see IOBT_UpdateMas_t n.number)

	IOBT_UPDATE_MEDIA_ENUM_SIZE
} IOBT_UpdateMedia_e;

typedef struct _players_basic_msg_t {
	int16_t id;
	float avrcp_version;
} players_basic_msg_t;

typedef struct _IOBT_DataMediaUid_t {
	/// LSB part of the UID
	uint32_t uid1;
	/// MSB part of the UID
	uint32_t uid2;

} IOBT_DataMediaUid_t;

typedef struct _IOBT_UpdateMas_t {
	/// What media part that is is updated.
	IOBT_UpdateMedia_e updated;
	/// Corresponding value, see IOBT_UpdateMedia_e to check is this parameter is valid.
	IOBT_MediaValue_e value;

	/// Numbers that way be valid for certain updates, see IOBT_UpdateMedia_e.
	union {
		/// Corresponding number , see IOBT_UpdateMedia_e to check is this parameter is valid.
		uint32_t number;

		/// Addressed media player info
		struct {
			uint16_t id; ///< ID of addressed player.
			uint16_t uidCounter; ///< Current UID counter of addressed player.
		} player;

		/// UID for track change
		IOBT_DataMediaUid_t uid;

	} n;

} IOBT_UpdateMas_t;

/**
 * Struct sent to plugin for information about current playing media
 */
typedef struct _data_media_info_t {
	/// uid, set to 0 if not available
	IOBT_DataMediaUid_t uid;
	/// media type, 0 is audio, 1 is video
	uint8_t type;
	/// Media track number
	uint32_t trackNo;
	/// Media total tracks, set to 0 if not available
	uint32_t totalNo;
	/// Media total length in milliseconds, set to 0 if not available
	uint32_t lengthMs;
	/// Media title in UTF8, -1 if not available
	int title;
	/// Track artist in UTF8, -1 if not available
	int artist;
	/// Track album in UTF8, -1 if not available
	int album;
	/// Track genre in UTF8, -1 if not available
	int genre;
	/// Buffer that holds above strings to avoid fragmented memory - do not edit
	uint8_t buffer[1];
} data_media_info_t;

/**
 Struct sent to plugin for information about player
 */
typedef struct _data_media_player_t {
	/// uid, set to 0 if not available
	IOBT_DataMediaUid_t uid;
	/// Player name, in UTF8
	unsigned int name;
	/// Major type, see AVRCP spec
	uint8_t majorType;
	/// Sub type, see AVRCP spec
	uint32_t subType;
	/// Media status
	IOBT_MediaValue_e mediaStatus;
	/// Media features bits, see AVRCP spec
	uint8_t features[16];
	/// Current folder depth, not always returned when listing player(s)
	uint16_t folderDepth;
	/// Current items in folder, not always returned when listing player(s)
	uint32_t folderItems;
	/// Folders in current folder, not always returned when listing player(s)
	uint8_t folders;
	/// Current folder names, this is a pointer to UTF-8 list of strings. Each name with \0 separation.
	/// An extra \0 ends the list. Example "Newly added\0Genres\0Artists\0\0"
	/// Not always returned when listing player(s)
	unsigned int folderNames;

	/// Buffer that holds above string to avoid fragmented memory - do not edit
	uint8_t buffer[1];

} data_media_player_t;

/**
 * @brief	Type for media control value
 */
typedef enum _IOBT_MediaControlValue_t {
	IOBT_MEDIA_CONTROL_VALUE_NONE = 0x0000, ///< No value

	// Controls offered by AVRCP 1.0 specification
	IOBT_MEDIA_CONTROL_VALUE_BASIC_PLAY = 0x0020, ///< Play, enum value set to match BLUEGO_FID_MediaControlPlay
	IOBT_MEDIA_CONTROL_VALUE_BASIC_STOP, ///< Stop
	IOBT_MEDIA_CONTROL_VALUE_BASIC_PAUSE, ///< Pause
	IOBT_MEDIA_CONTROL_VALUE_BASIC_BACK, ///< Back
	IOBT_MEDIA_CONTROL_VALUE_BASIC_FORWARD, ///< Forward
	IOBT_MEDIA_CONTROL_VALUE_FAST_REWIND, ///< Fast rewind, To cancel this command use _DONE
	IOBT_MEDIA_CONTROL_VALUE_FAST_REWIND_DONE, ///< Best way to cancel above command
	IOBT_MEDIA_CONTROL_VALUE_FAST_FORWARD, ///< Fast forward, To cancel this command use _DONE
	IOBT_MEDIA_CONTROL_VALUE_FAST_FORWARD_DONE, ///< Best way to cancel above command
	IOBT_MEDIA_CONTROL_VALUE_VOLUME_UP, ///< Volume up
	IOBT_MEDIA_CONTROL_VALUE_VOLUME_DOWN, ///< Volume down

	// Controls offered by AVRCP 1.3 specification
	IOBT_MEDIA_CONTROL_VALUE_GROUP_PREVIOUS = 0x0030, ///< Previous group, enum value set to match BLUEGO_FID_MediaControlGroupPrev
	IOBT_MEDIA_CONTROL_VALUE_GROUP_NEXT, ///< Next group

	IOBT_MEDIA_CONTROL_VALUE_EQUALIZER_OFF, ///< Equalizer off
	IOBT_MEDIA_CONTROL_VALUE_EQUALIZER_ON, ///< Equalizer on
	IOBT_MEDIA_CONTROL_VALUE_REPEAT_OFF, ///< Repeat off
	IOBT_MEDIA_CONTROL_VALUE_REPEAT_SINGLE, ///< Repeat single
	IOBT_MEDIA_CONTROL_VALUE_REPEAT_ALL, ///< Repeat all
	IOBT_MEDIA_CONTROL_VALUE_REPEAT_GROUP, ///< Repeat group
	IOBT_MEDIA_CONTROL_VALUE_SHUFFLE_OFF, ///< Shuffle off
	IOBT_MEDIA_CONTROL_VALUE_SHUFFLE_ALL, ///< Shuffle all
	IOBT_MEDIA_CONTROL_VALUE_SHUFFLE_GROUP, ///< Shuffle group
	IOBT_MEDIA_CONTROL_VALUE_SCAN_OFF, ///< Scan off
	IOBT_MEDIA_CONTROL_VALUE_SCAN_ALL, ///< Scan all
	IOBT_MEDIA_CONTROL_VALUE_SCAN_GROUP, ///< Scan group

	// Controls offered by AVRCP 1.4 specification
	IOBT_MEDIA_CONTROL_BROWSE_CONN_CONNECT = 0x0040, ///< Connect,  Browse channel connect and disconnect should be use for test purpuses only, stack will always open browse channel when available.
	IOBT_MEDIA_CONTROL_BROWSE_CONN_DISCONNECT, ///< Disconnect,  Browse channel connect and disconnect should be use for test purpuses only, stack will always open browse channel when available.
	IOBT_MEDIA_CONTROL_BROWSE_CD_UP, ///< Change dir up
	IOBT_MEDIA_CONTROL_BROWSE_CD_DOWN, ///< Change dir down, specify lsbUid (uid1) and msbUid (uid2) to "cd <uid>"
	IOBT_MEDIA_CONTROL_BROWSE_FOLDER_ITEMS_MP_LIST, ///< Media player list, specify specify startUid (uid1) and endUid (uid2)
	IOBT_MEDIA_CONTROL_BROWSE_FOLDER_ITEMS_VIRT_FILESYS, ///< Virtual file system folder, specify startUid and endUid
	IOBT_MEDIA_CONTROL_BROWSE_FOLDER_ITEMS_NOW_PLAYING, ///< Now playing folder, specify startUid and endUid
	IOBT_MEDIA_CONTROL_BROWSE_FOLDER_ITEMS_SEARCH, ///< Search folder, specify startUid and endUid
	IOBT_MEDIA_CONTROL_BROWSE_ITEM_ATTR_VIRT_FILESYS, ///< Virtual file system item, specify lsbUid and msbUid
	IOBT_MEDIA_CONTROL_BROWSE_ITEM_ATTR_NOW_PLAYING, ///< Now playing item, specify lsbUid and msbUid
	IOBT_MEDIA_CONTROL_BROWSE_ITEM_ATTR_SEARCH, ///< Search item, specify lsbUid and msbUid
	IOBT_MEDIA_CONTROL_BROWSE_PLAY_ITEM_VIRT_FILESYS, ///< Virtual file system play item, specify lsbUid and msbUid
	IOBT_MEDIA_CONTROL_BROWSE_PLAY_ITEM_NOW_PLAYING, ///< Now playing play item, specify lsbUid and msbUid
	IOBT_MEDIA_CONTROL_BROWSE_PLAY_ITEM_SEARCH, ///< Search play item, specify lsbUid and msbUid
	IOBT_MEDIA_CONTROL_BROWSE_ADD_TO_NOW_PLAYING_VIRT_FILESYS, ///< Virtual file system add to now playing, specify lsbUid and msbUid
	IOBT_MEDIA_CONTROL_BROWSE_ADD_TO_NOW_PLAYING_NOW_PLAYING, ///< Now playing add to now playing, specify lsbUid and msbUid
	IOBT_MEDIA_CONTROL_BROWSE_ADD_TO_NOW_PLAYING_SEARCH, ///< Search add to now playing, specify lsbUid and msbUid
	IOBT_MEDIA_CONTROL_SET_PLAYER_ADDRESSED, ///< Set addressed player, specify  lsbUid and msbUid
	IOBT_MEDIA_CONTROL_SET_PLAYER_BROWSED, ///< Set browsed player, specify  lsbUid and msbUid

	// blueGO extentions
	IOBT_MEDIA_CONTROL_BROWSE_CD_TO_ROOT ///< Change dir to root dir

} IOBT_MediaControlValue_t;

#endif

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/services/io-bluetooth-cybercom/profiles/media/public/a2dp_iface.h $ $Rev: 728418 $")
#endif
