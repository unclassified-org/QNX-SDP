/*
 * $QNXLicenseC:
 * Copyright 2009, QNX Software Systems. All Rights Reserved.
 *
 * You must obtain a written license from and pay applicable license fees to QNX
 * Software Systems before you may reproduce, modify or distribute this software,
 * or any work that includes all or part of this software.   Free development
 * licenses are available for evaluation and non-commercial purposes.  For more
 * information visit http://licensing.qnx.com or email licensing@qnx.com.
 *
 * This file may contain contributions from others.  Please review this entire
 * file for other proprietary rights or license notices, as well as the QNX
 * Development Suite License Guide at http://licensing.qnx.com/license-guide/
 * for other information.
 * $
 */
#if !defined(BLUETOOTH_IOBT_AVRCP_H_INCLUDED)
#define BLUETOOTH_IOBT_AVRCP_H_INCLUDED

#if !defined(__TYPES_H_INCLUDED)
#include <sys/types.h>
#endif

#ifndef BLUETOOTH_BTUTILS_H_INCLUDED
#include <bluetooth/btutils.h>
#endif

#include <limits.h>

__BEGIN_DECLS

/** @file bluetooth/avrcp.h
 * io-bluetooth Advanced Audio Distribution Profile external API.
 * @ingroup extAVRCP_API AVRCP External API
 */

/** @defgroup extAVRCP_API AVRCP External API
 */
/*@{*/

/*---------------------------------------------------------------------------
 * iobt_avrcp_panel_op_t type
 *
 *     Panel subunit operations that may be sent (by a controller) or
 *     received (by a target). These codes are defined by the 1394
 *     AV/C Panel Subunit Specification (version 1.1).
 */
typedef uint16_t iobt_avrcp_panel_op_t;

#define IOBT_AVRCP_POP_SELECT            0x0000
#define IOBT_AVRCP_POP_UP                0x0001
#define IOBT_AVRCP_POP_DOWN              0x0002
#define IOBT_AVRCP_POP_LEFT              0x0003
#define IOBT_AVRCP_POP_RIGHT             0x0004
#define IOBT_AVRCP_POP_RIGHT_UP          0x0005
#define IOBT_AVRCP_POP_RIGHT_DOWN        0x0006
#define IOBT_AVRCP_POP_LEFT_UP           0x0007
#define IOBT_AVRCP_POP_LEFT_DOWN         0x0008
#define IOBT_AVRCP_POP_ROOT_MENU         0x0009
#define IOBT_AVRCP_POP_SETUP_MENU        0x000A
#define IOBT_AVRCP_POP_CONTENTS_MENU     0x000B
#define IOBT_AVRCP_POP_FAVORITE_MENU     0x000C
#define IOBT_AVRCP_POP_EXIT              0x000D

#define IOBT_AVRCP_POP_0                 0x0020
#define IOBT_AVRCP_POP_1                 0x0021
#define IOBT_AVRCP_POP_2                 0x0022
#define IOBT_AVRCP_POP_3                 0x0023
#define IOBT_AVRCP_POP_4                 0x0024
#define IOBT_AVRCP_POP_5                 0x0025
#define IOBT_AVRCP_POP_6                 0x0026
#define IOBT_AVRCP_POP_7                 0x0027
#define IOBT_AVRCP_POP_8                 0x0028
#define IOBT_AVRCP_POP_9                 0x0029
#define IOBT_AVRCP_POP_DOT               0x002A
#define IOBT_AVRCP_POP_ENTER             0x002B
#define IOBT_AVRCP_POP_CLEAR             0x002C

#define IOBT_AVRCP_POP_CHANNEL_UP        0x0030
#define IOBT_AVRCP_POP_CHANNEL_DOWN      0x0031
#define IOBT_AVRCP_POP_PREVIOUS_CHANNEL  0x0032
#define IOBT_AVRCP_POP_SOUND_SELECT      0x0033
#define IOBT_AVRCP_POP_INPUT_SELECT      0x0034
#define IOBT_AVRCP_POP_DISPLAY_INFO      0x0035
#define IOBT_AVRCP_POP_HELP              0x0036
#define IOBT_AVRCP_POP_PAGE_UP           0x0037
#define IOBT_AVRCP_POP_PAGE_DOWN         0x0038

#define IOBT_AVRCP_POP_POWER             0x0040
#define IOBT_AVRCP_POP_VOLUME_UP         0x0041
#define IOBT_AVRCP_POP_VOLUME_DOWN       0x0042
#define IOBT_AVRCP_POP_MUTE              0x0043
#define IOBT_AVRCP_POP_PLAY              0x0044
#define IOBT_AVRCP_POP_STOP              0x0045
#define IOBT_AVRCP_POP_PAUSE             0x0046
#define IOBT_AVRCP_POP_RECORD            0x0047
#define IOBT_AVRCP_POP_REWIND            0x0048
#define IOBT_AVRCP_POP_FAST_FORWARD      0x0049
#define IOBT_AVRCP_POP_EJECT             0x004A
#define IOBT_AVRCP_POP_FORWARD           0x004B
#define IOBT_AVRCP_POP_BACKWARD          0x004C

#define IOBT_AVRCP_POP_ANGLE             0x0050
#define IOBT_AVRCP_POP_SUBPICTURE        0x0051

#define IOBT_AVRCP_POP_F1                0x0071
#define IOBT_AVRCP_POP_F2                0x0072
#define IOBT_AVRCP_POP_F3                0x0073
#define IOBT_AVRCP_POP_F4                0x0074
#define IOBT_AVRCP_POP_F5                0x0075

#define IOBT_AVRCP_POP_VENDOR_UNIQUE     0x007E

#define IOBT_AVRCP_POP_NEXT_GROUP        0x017E
#define IOBT_AVRCP_POP_PREV_GROUP        0x027E

#define IOBT_AVRCP_POP_RESERVED          0x007F

/**
 * iobt_avrcp_response type
 */
typedef uint16_t iobt_avrcp_response_t;

#define IOBT_AVRCP_RESPONSE_NOT_IMPLEMENTED		0x08
#define IOBT_AVRCP_RESPONSE_ACCEPTED			0x09
#define IOBT_AVRCP_RESPONSE_REJECTED			0x0A
#define IOBT_AVRCP_RESPONSE_IN_TRANSITION		0x0B
#define IOBT_AVRCP_RESPONSE_IMPLEMENTED_STABLE	0x0C
#define IOBT_AVRCP_RESPONSE_CHANGED				0x0D
#define IOBT_AVRCP_RESPONSE_INTERIM				0x0F
#define IOBT_AVRCP_RESPONSE_BROWSING			0x40
#define IOBT_AVRCP_RESPONSE_SKIPPED				0xF0
#define IOBT_AVRCP_RESPONSE_TIMEOUT				0xF1

/*---------------------------------------------------------------------------
 * iobt_avrcp_version_t type
 *
 * Defines the version of the remotely connected avrcp device
 */
typedef uint16_t iobt_avrcp_version_t;

/* Unable to determine the Hands Free Profile version that is supported */
#define IOBT_AVRCP_VERSION_UNKNOWN 0x0000
/* Supports Version 1.0 of the AVRCP Profile */
#define IOBT_AVRCP_VERSION_1_0     0x0100
/* Supports Version 1.3 of the AVRCP Profile */
#define IOBT_AVRCP_VERSION_1_3     0x0103

/*---------------------------------------------------------------------------
 * iobt_avrcp_role_t type
 * <U16-Ctrl Category><U16-Target Category>
 * msb holds the controller categories
 * lsb holds the target categories
 */
typedef uint32_t iobt_avrcp_role_t;

/* Player/recorder features supported ("play" and "stop") */
#define AVRCP_FEATURES_CATEGORY_1       0x0001
/* Monitor/amplifier features supported ("volume up" and "volume down") */
#define AVRCP_FEATURES_CATEGORY_2       0x0002
/* Tuner features supported ("channel up" and "channel down") */
#define AVRCP_FEATURES_CATEGORY_3       0x0004
/* Menu features supported ("root menu", "up", "down", "left", "right", and "select") */
#define AVRCP_FEATURES_CATEGORY_4       0x0008
/* Player settings supported */
#define AVRCP_FEATURES_PLAYER_SETTINGS  0x0010
/* Group navigation supported */
#define AVRCP_FEATURES_GROUP_NAV        0x0020
/* Media browsing is supported */
#define AVRCP_FEATURES_BROWSING         0x0040
/* Multiple media players */
#define AVRCP_FEATURES_MULTIPLE_PLAYERS 0x0080

/*---------------------------------------------------------------------------
 * iobt_avrcp_media_status type
 *
 * Defines play status of the currently playing media.
 */
typedef uint8_t iobt_avrcp_media_status_t;

#define IOBT_AVRCP_MEDIA_STOPPED       0x00
#define IOBT_AVRCP_MEDIA_PLAYING       0x01
#define IOBT_AVRCP_MEDIA_PAUSED        0x02
#define IOBT_AVRCP_MEDIA_FWD_SEEK      0x03
#define IOBT_AVRCP_MEDIA_REV_SEEK      0x04
#define IOBT_AVRCP_MEDIA_ERROR         0xFF

/*---------------------------------------------------------------------------
 * iobt_avrcp_media_attr_id_t type
 *
 * Defines supported values for the media attributes.
 */
typedef uint8_t iobt_avrcp_media_attr_id_t;

#define IOBT_AVRCP_TITLE       0x00000001
#define IOBT_AVRCP_ARTIST      0x00000002
#define IOBT_AVRCP_ALBUM       0x00000003
#define IOBT_AVRCP_TRACK       0x00000004
#define IOBT_AVRCP_NUM_TRACKS  0x00000005
#define IOBT_AVRCP_GENRE       0x00000006
#define IOBT_AVRCP_DURATION    0x00000007

/*---------------------------------------------------------------------------
 * iobt_avrcp_player_attr_id_t type
 *
 * Defines the attibute IDs used for specific player application settings.
 */
typedef uint8_t iobt_avrcp_player_attr_id_t;

#define IOBT_AVRCP_PLAYER_EQ_STATUS        1  /* Player equalizer status */
#define IOBT_AVRCP_PLAYER_REPEAT_STATUS    2  /* Player repeat status */
#define IOBT_AVRCP_PLAYER_SHUFFLE_STATUS   3  /* Player Shuffle status */
#define IOBT_AVRCP_PLAYER_SCAN_STATUS      4  /* Repeat on/off */

/*---------------------------------------------------------------------------
 * iobt_avrcp_eq_value_t type
 *
 * Defines values for the player equalizer status.
 */
typedef uint8_t iobt_avrcp_eq_value_t;

#define IOBT_AVRCP_EQ_OFF  1
#define IOBT_AVRCP_EQ_ON   2

/*---------------------------------------------------------------------------
 * iobt_avrcp_repeat_value_t type
 *
 * Defines values for the player repeat mode status.
 */
typedef uint8_t iobt_avrcp_repeat_value_t;

#define IOBT_AVRCP_REPEAT_OFF     1
#define IOBT_AVRCP_REPEAT_SINGLE  2
#define IOBT_AVRCP_REPEAT_ALL     3
#define IOBT_AVRCP_REPEAT_GROUP   4

/*---------------------------------------------------------------------------
 * AvrcpShuffleValue type
 *
 * Defines values for the player shuffle mode status.
 */
typedef uint8_t iobt_avrcp_shuffle_value_t;

#define IOBT_AVRCP_SHUFFLE_OFF    1
#define IOBT_AVRCP_SHUFFLE_ALL    2
#define IOBT_AVRCP_SHUFFLE_GROUP  3

/*---------------------------------------------------------------------------
 * iobt_avrcp_scan_value_t type
 *
 * Defines values for the player scan mode status.
 */
typedef uint8_t iobt_avrcp_scan_value_t;

#define IOBT_AVRCP_SCAN_OFF    1
#define IOBT_AVRCP_SCAN_ALL    2
#define IOBT_AVRCP_SCAN_GROUP  3

/*---------------------------------------------------------------------------
 * iobt_avrcp_battery_status_t type
 *
 * Defines values for battery status.
 */
typedef uint8_t iobt_avrcp_battery_status_t;

#define IOBT_AVRCP_BATT_NORMAL      0
#define IOBT_AVRCP_BATT_WARNING     1
#define IOBT_AVRCP_BATT_CRITICAL    2
#define IOBT_AVRCP_BATT_EXTERNAL    3
#define IOBT_AVRCP_BATT_FULL_CHARGE 4

typedef uint16_t iobt_avrcp_event_t;

#define IOBT_AVRCP_SERVICE_CONNECTED      1
#define IOBT_AVRCP_SERVICE_DISCONNECTED   2
#define IOBT_AVRCP_VERSION_CHANGED        3
#define IOBT_AVRCP_MEDIA_STATUS_CHANGED   4
#define IOBT_AVRCP_TRACK_CHANGED          5
#define IOBT_AVRCP_TRACK_END              6
#define IOBT_AVRCP_TRACK_START            7
#define IOBT_AVRCP_PLAY_POS_CHANGED       8
#define IOBT_AVRCP_BATT_STATUS_CHANGED    9
#define IOBT_AVRCP_SYS_STATUS_CHANGED     10
#define IOBT_AVRCP_APP_SETTING_CHANGED    11
#define IOBT_AVRCP_PANEL_OP               12
#define IOBT_AVRCP_PANEL_OP_RESPONSE      13
#define IOBT_AVRCP_ABSOLUTE_VOLUME        14
#define IOBT_AVRCP_METADATA_CHANGE        15

#define IOBT_AVRCP_MD_TITLE       0x00000001
#define IOBT_AVRCP_MD_ARTIST      0x00000002
#define IOBT_AVRCP_MD_ALBUM       0x00000003
#define IOBT_AVRCP_MD_TRACK       0x00000004
#define IOBT_AVRCP_MD_NUM_TRACKS  0x00000005
#define IOBT_AVRCP_MD_GENRE       0x00000006
#define IOBT_AVRCP_MD_DURATION    0x00000007

// Defines a structure to hold the op entry and if it's enabled
typedef struct _iobt_avrcp_panel_op_entry {
	iobt_avrcp_panel_op_t op;
	int enabled;
} iobt_avrcp_panel_op_entry;

// Defines a map of panel op entries to indicate support
typedef struct _iobt_avrcp_panel_op_map {
	uint32_t op_len;
	iobt_avrcp_panel_op_entry entry[];
} iobt_avrcp_panel_op_map;

/**
 * structure to hold the panel operation response from the remote device
 */
typedef struct _iobt_avrcp_panel_op_resp {
	iobt_avrcp_panel_op_t op;
	int pressed;
	iobt_avrcp_response_t resp;
} iobt_avrcp_panel_op_resp;

/**
 * structure to hold metadata information for updating player metdata to the bt avrcp profile
 */
typedef struct _iobt_avrcp_metadata {
	uint32_t md_id;
	char data[NAME_MAX];
} iobt_avrcp_metadata;

typedef struct _iobt_avrcp_track {
	/* The most significant 32 bits of the track index information.  */
	uint32_t msU32;

	/* The least significant 32 bits of the track index information.  */
	uint32_t lsU32;
} iobt_avrcp_track;

/**
 * structure to hold position information when updating the play position to the bt avrcp profile
 */
typedef struct _iobt_avrcp_player_position {
	uint32_t position;
	uint32_t duration;
} iobt_avrcp_player_position;

// structure is a skeleton of AvrcpMediaPlayerItem within the ianywhere src
typedef struct _iobt_avrcp_player_item {

	uint8_t majorType;
	uint32_t subType;
	uint8_t mediaStatus;
	uint8_t features[16];

	uint16_t charSet;
	char name[NAME_MAX];
	uint32_t numItems;

// TODO: add folderDepth, folder defines and number of items in folder
// this is for AVRCP 1.4 support

} iobt_avrcp_player_item;

//-------------  Controller AVRCP Methods

/**
 * Get the bluetooth address of the connected remote device.
 *
 * @param fd The file descriptor of our profile.
 * @param addr The address of the device.
 * @return 0 on success, -1 on error with errno set
 */
int iobt_avrcp_get_remote_device(int fd, iobt_addr_t * addr);

/**
 * Get the media status on the remote target device.
 *
 * @param fd The file descriptor of our profile.
 * @param status The media status of the device
 * @return 0 on success, -1 on error with errno set
 */
int iobt_avrcp_get_media_status(int fd, iobt_avrcp_media_status_t* status);

/**
 * Inform of the battery status on the target device.
 *
 * @param fd The file descriptor of our profile.
 * @param batt The battery status fo the device
 * @return 0 on success, -1 on error with errno set
 */
int iobt_avrcp_get_battery_status(int fd, iobt_avrcp_battery_status_t *batt);

/**
 * Get the media attributes for the current track
 *
 * @param fd The file descriptor of our profile.
 * @param buffer A pointer to store the media atttribute string
 * @param len the size of the number buffer
 * @return number of bytes on success, -1 on error with errno set
 */
int iobt_avrcp_get_media_info(int fd, iobt_avrcp_media_attr_id_t id, uint8_t* buffer, int len);

/**
 * Get the current position of the playing media
 *
 * @param fd The file descriptor of our profile.
 * @param position
 * @return 0 on success, -1 on error with errno setfd
 */
int iobt_avrcp_get_position(int fd, uint32_t *position);

/**
 * Get the current position of the playing media\
 *
 * @param fd The file descriptor of our profile.
 * @param duration
 * @return 0 on success, -1 on error with errno set
 */
int iobt_avrcp_get_duration(int fd, uint32_t *duration);

/**
 * Get the current track number of the playing media
 *
 * @param fd The file descriptor of our profile.
 * @param track
 * @return 0 on success, -1 on error with errno set
 */
int iobt_avrcp_get_track_number(int fd, uint16_t *track);

/**
 * Get the total number of tracks.
 *
 * @param fd The file descriptor of our profile.
 * @param total
 * @return 0 on success, -1 on error with errno set
 */
int iobt_avrcp_get_total_tracks(int fd, uint16_t *total);

/**
 * Set a player attribute
 *
 * @param fd The file descriptor of our profile.
 * @param id The player attr to set
 * @param id The value to set the player attr to.
 * @return 0 on success, -1 on error with errno set
 */
int iobt_avrcp_set_player_attr(int fd, iobt_avrcp_player_attr_id_t id, uint8_t value);

/**
 * Get a player attribute
 *
 * @param fd The file descriptor of our profile.
 * @param id the The player attr to set
 * @param value  The value of the retrieved player attr.
 * @return 0 on success, -1 on error with errno set
 */
int iobt_avrcp_get_player_attr(int fd, iobt_avrcp_player_attr_id_t id, uint8_t * value);

//-------------  General AVRCP Methods
/**
 * Get the AVRCP version discovered during the SDP query
 *
 * @param fd The file descriptor of our profile.
 * @param version the version of the avrcp device
 * @return 0 on success
 */
int iobt_avrcp_get_version(int fd, iobt_avrcp_version_t* version);

/**
 * Get the AVRCP remote role discovered during the SDP query
 * This is split into the msb U16 as the control categories and lsb U16 as target categores
 * @see iobt_avrcp_role_t for more details
 *
 * @param fd - The file descriptor of our profile.
 * @param role - the role that the remote device supports
 * @return 0 on success
 */
int iobt_avrcp_get_remote_role(int fd, iobt_avrcp_role_t* role);

//-------------  Controller AVRCP Methods

/**
 * Button Press - pass through command
 *
 * As a controller the application may want to set the target button commands
 * The method is to notify the AVRCP Bluetooth interface the button press to send to the target
 *
 * @param fd - the file descriptor into AVRCP Bluetooth interface /dev/io-bluetooth/avrcp/<mac_add>
 * @param iobt_avrcp_panel_op_t - panel code
 * @param uint8_t - press 0 for release 1 for press
 */
int iobt_avrcp_set_panel_key(int fd, iobt_avrcp_panel_op_t op, uint8_t press);

/**
 * Set Remote Volume
 *
 * As a target the application may want to set the remote controller's volume
 * The method is to notify the AVRCP Bluetooth interface of a desire to change the volume for the Rendering Device
 *
 * @param fd - the file descriptor into AVRCP Bluetooth interface /dev/io-bluetooth/avrcp/<mac_add>
 * @param uint8_t - volume between values of 0 - 100
 */
int iobt_avrcp_set_remotevolume(int fd, uint8_t value);

/**
 * Request that all the metadata of the currently playing track on the address player
 * be returned via a callback notification
 *
 * As a controller the application wants metadata
 * The method is to notify the AVRCP Bluetooth interface that metadata should be returned when appropriate
 *
 * @param fd - the file descriptor into AVRCP Bluetooth interface /dev/io-bluetooth/avrcp/<mac_add>
 */
int iobt_avrcp_request_metadata(int fd);

//-------------  Target AVRCP Methods

/**
 * Set the Key Map
 *
 * As a target the upper layers application accept specific key presses which are mapped
 * to functionality within the UI.  This method sets that key map of supported key presses
 * down to the iobluetooth layer.  If a key press is unsupported by iobluetooth and the remote
 * avrcp device issues the press, iobluetooth should reject the command
 *
 * @param fd - the file descriptor into AVRCP Bluetooth interface /dev/io-bluetooth/avrcp/<mac_add>
 * @param map - the map of enabled/disabled keys and their identifier
 */
int iobt_avrcp_set_panel_key_map(int fd, iobt_avrcp_panel_op_map* map);

/**
 * Register Player
 *
 * As a target the application can register players from the application layer into
 * the Bluetooth AVRCP profile.  These players will then be registered to the remote
 * device for data and control.  @see iobt_avrcp_player_item for more information
 * on data members for player information.
 *
 * @param fd - the file descriptor into AVRCP Bluetooth interface /dev/io-bluetooth/avrcp/<mac_add>
 * @param player_item - pointer to a player item structure to hold data of the player
 * 						The data will be passed to the AVRCP interface
 */
int iobt_avrcp_register_player(int fd, iobt_avrcp_player_item *player);

/**
 * De-Register Player
 *
 * As a target the application can register players from the application layer to the Bluetooth
 * AVRCP profile.  As such should also have the capabilities of de-registering a player if
 * the player from the application layer has closed. This will notify the remote device
 * that data and control of the player will not be available anymore
 * @see iobt_avrcp_player_item for more details, the player name will be matched between the two layers
 *
 * @param fd - the file descriptor into AVRCP Bluetooth interface /dev/io-bluetooth/avrcp/<mac_add>
 * @param player_item - pointer to a player item structure to identify the existing player to be deregistered
 *
 */
int iobt_avrcp_deregister_player(int fd, iobt_avrcp_player_item *player);

/**
 * Set Local Volume
 *
 * As a target the system has an absolute volume which is set by the application layer
 * The method is to notify the AVRCP Bluetooth interface of the system volume
 *
 * @param fd - the file descriptor into AVRCP Bluetooth interface /dev/io-bluetooth/avrcp/<mac_add>
 * @param uint8_t - volume between values of 0 - 100
 */
int iobt_avrcp_set_localvolume(int fd, uint8_t value);

/**
 * Set Battery Status
 *
 * As a target the system can have a battery level that it wants to remote to the remote device
 * The method is to notify the AVRCP Bluetooth interface of the system battery level
 *
 * @param fd - the file descriptor into AVRCP Bluetooth interface /dev/io-bluetooth/avrcp/<mac_add>
 * @param uint8_t - battery level as a percentage between 0 - 100
 */
int iobt_avrcp_set_battery(int fd, uint8_t value);

/**
 * Set Play Status of Player
 *
 * As a target the system has players that have registered with the AVRCP Bluetooth interface
 * The method is to update the player on the play status of the current playing track
 * @see iobt_avrcp_media_status_t for more details on the different play states
 *
 * @param fd - the file descriptor into AVRCP Bluetooth interface /dev/io-bluetooth/avrcp/<mac_add>
 * @param iobt_avrcp_media_status_t - the play status of the player to update
 */
int iobt_avrcp_set_playstatus(int fd, iobt_avrcp_media_status_t value);

/**
 * Sets the track info consisting of 2 uint32 values
 * As a media player sets the internal structure of iobluetooth avrcp
 * which in turn will notify the remote client
 *
 * @param fd - the file descriptor into AVRCP Bluetooth interface /dev/io-bluetooth/avrcp/<mac_addr>
 * @param info - the track info data to pass down
 */
int iobt_avrcp_set_trackinfo(int fd, iobt_avrcp_track* info);

/**
 * Set Player Position of the Currently Playing track
 *
 * As a target the system has players that have registered with the AVRCP Bluetooth interface
 * The method is to update the player's position of the currently playing track
 *
 * @param fd - the file descriptor into AVRCP Bluetooth interface /dev/io-bluetooth/avrcp/<mac_add>
 * @param uint32_t pos - the position of the currently playing track
 * @param uint32_t dur - the total duration of the currently playing track
 */
int iobt_avrcp_set_position(int fd, uint32_t position, uint32_t duration);

/**
 * Set Track Metadata for Player
 *
 * As a target the system has players that have registered with the AVRCP Bluetooth interface
 * The method is to update the currently playing track's metadta
 * @see iobt_avrcp_metadata for more details on type of data that is passed down to the lower layers
 */
int iobt_avrcp_set_metadata(int fd, iobt_avrcp_metadata *data);
/*@}*/

__END_DECLS

#endif


#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/bluetooth/public/bluetooth/avrcp.h $ $Rev: 725212 $")
#endif
