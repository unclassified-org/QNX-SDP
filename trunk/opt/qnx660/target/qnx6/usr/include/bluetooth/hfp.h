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
#if !defined(BLUETOOTH_HFP_H_INCLUDED)
#define BLUETOOTH_HFP_H_INCLUDED

#if !defined(__TYPES_H_INCLUDED)
#include <sys/types.h>
#endif

#ifndef BLUETOOTH_BTUTILS_H_INCLUDED
#include <bluetooth/btutils.h>
#endif

__BEGIN_DECLS

/** @file bluetooth/hfp.h
 * io-bluetooth Hands Free Profile external API.
 * @ingroup extHFP_API HFP External API
 */

/** @defgroup extHFP_API HFP External API
 */
/*@{*/

/** A bit mask containing the phonebook types on the gateway */
typedef uint16_t iobt_hfp_phonebook_type_t;

#define IOBT_DIALED_CALLS         0x0001 /**< Gateway dialed calls list. */
#define IOBT_FIXED_DIAL           0x0002 /**< SIM fixed-dialing-phonebook list. */
#define IOBT_LAST_DIAL            0x0004 /**< SIM last-dialing-phonebook list. */
#define IOBT_MISSED_CALLS         0x0008 /**< Gateway missed calls list. */
#define IOBT_ME_PHONEBOOK         0x0010 /**< Gateway phonebook list. */
#define IOBT_ME_SIM_COMBINED      0x0020 /**< Combined Gateway and SIM phonebook list. */
#define IOBT_RECEIVED_CALLS       0x0040 /**< Gateway received calls list. */
#define IOBT_SIM_PHONEBOOK        0x0080 /**< SIM phonebook list. */

/** A bit mask containing phone features and capabilities */
typedef uint16_t iobt_hfp_phone_features_t;

/** @name Phone features
 *  A bitmask containing the features available on the gateway.
 * @{*/
#define IOBT_PHONE_FEATURE_3_WAY              0x00000001 /** 3-way calling */
#define IOBT_PHONE_FEATURE_ECHO_NOISE         0x00000002 /** Echo canceling and/or noise reduction function */
#define IOBT_PHONE_FEATURE_VOICE_RECOGNITION  0x00000004 /** Voice recognition function */
#define IOBT_PHONE_FEATURE_IN_BAND_RING       0x00000008 /** In-band ring tone */
#define IOBT_PHONE_FEATURE_VOICE_TAG          0x00000010 /** Voice tag */
#define IOBT_PHONE_FEATURE_CALL_REJECT        0x00000020 /** Reject a call */
#define IOBT_PHONE_FEATURE_ENH_CALL_STATUS    0x00000040 /** Enhanced Call Status */
#define IOBT_PHONE_FEATURE_ENH_CALL_CTRL      0x00000080 /** Enhanced Call Control */
/**@}*/

/** A bit mask containing the gateway's Hold feature set */
typedef uint8_t iobt_hfp_phone_hold_features_t;

/** @name Phone Multiparty or Hold features
 *  A bitmask containing the hold features available on the gateway.
 * @{*/
#define IOBT_HOLD_FEATURE_RELEASE_HELD_CALLS      0x01 /**< Releases all held calls or sets User Determined User Busy (UDUB) for a waiting call. */
#define IOBT_HOLD_FEATURE_RELEASE_ACTIVE_CALLS    0x02 /**< Releases all active calls (if any exist) and accepts the other (held or waiting) call. */
#define IOBT_HOLD_FEATURE_RELEASE_SPECIFIC_CALL   0x04 /**< Releases a specific call. */
#define IOBT_HOLD_FEATURE_HOLD_ACTIVE_CALLS       0x08 /**< Places all active calls (if any exist) on hold and accepts the other (held or waiting) call. */
#define IOBT_HOLD_FEATURE_HOLD_SPECIFIC_CALL      0x10 /**< Places a specific call on hold. */
#define IOBT_HOLD_FEATURE_ADD_HELD_CALL           0x20 /**< Adds a held call to the conversation. */
#define IOBT_HOLD_FEATURE_CALL_TRANSFER           0x40 /**< Connects the two calls and disconnects the AG from both calls (Explicit Call Transfer). */
/**@}*/

/** Holds the event thrown by the hfp */
typedef uint16_t iobt_hfp_event_t;

/** @name HFP events
 *  Events that can be thrwon by the hands free profile
 * @{*/
#define IOBT_HFE_SERVICE_CONNECT_REQ      0
#define IOBT_HFE_AUDIO_CONNECTED          3
#define IOBT_HFE_AUDIO_DISCONNECTED       4
#define IOBT_HFE_CALL_STATE               9
#define IOBT_HFE_CALLER_ID                10
#define IOBT_HFE_RING_IND                 15
#define IOBT_HFE_WAIT_NOTIFY              16
#define IOBT_HFE_SERVICE_IND              20
#define IOBT_HFE_BATTERY_IND              21
#define IOBT_HFE_SIGNAL_IND               22
#define IOBT_HFE_ROAM_IND                 23
#define IOBT_HFE_SMS_IND                  24
#define IOBT_HFE_NO_CARRIER               32
#define IOBT_HFE_BUSY                     33
#define IOBT_HFE_NO_ANSWER                34
#define IOBT_HFE_PHONEBOOK_STORAGE        38
#define IOBT_HFE_PHONEBOOK_INFO           39
#define IOBT_HFE_PHONEBOOK_SIZE           40
#define IOBT_HFE_PHONEBOOK_ENTRY          41
#define IOBT_HFE_COMMAND_COMPLETE         43
/**@}*/

/** Holds the event thrown by the hfp */
typedef uint16_t iobt_hfp_callstate_t;
/** @name Phone call states
 *  Phone call states
 * @{*/
#define IOBT_CALLSTATE_IDLE      0U
#define IOBT_CALLSTATE_RINGING   1U
#define IOBT_CALLSTATE_DIALING   2U
#define IOBT_CALLSTATE_ALERTING  3U
#define IOBT_CALLSTATE_ACTIVE    4U
#define IOBT_CALLSTATE_ON_HOLD   5U
#define IOBT_CALLSTATE_WAITING   6U
/**@}*/

typedef uint16_t iobt_hfp_hold_call_action_t;
/** @name Hold action
 *  A hold action to perform on a multiparty call */
#define IOBT_HOLD_RELEASE_HELD_CALLS   0 /**< Releases all held calls or sets User Determined User Busy (UDUB) for a waiting call.  */
#define IOBT_HOLD_RELEASE_ACTIVE_CALLS 1 /**< Releases all active calls (if any exist) and accepts the other (held or waiting) call. If a call index is specified, will release the specific call.*/
#define IOBT_HOLD_HOLD_ACTIVE_CALLS    2 /**< Places all active calls (if any exist) on hold and accepts the other or specified (held or waiting) call. */
#define IOBT_HOLD_ADD_HELD_CALL        3 /**< Adds a held call to the conversation. */
#define IOBT_HOLD_CALL_TRANSFER        4 /**< Connects the two calls and disconnects the AG from both calls (Explicit Call Transfer).*/
/**@}*/

/** Information about the phone */
typedef struct iobt_hfp_phone_info {
	uint8_t signal; /**< A number between 0 and 5 */
	uint8_t battery; /**< A number between 0 and 5 */
	uint8_t roaming; /**< true or false */
	uint8_t service; /**< true or false */
	uint32_t micGain; /**< microphone gain */
	uint32_t spkGain; /**< speaker gain */
} iobt_hfp_phone_info_t;

/** Call information */
typedef struct iobt_hfp_callinfo {
	uint16_t id; /**< Id of the call. */
	iobt_hfp_callstate_t state; /**< Call state. */
	uint16_t number_len; /**< The length of the number. */
/**number string with NULL */
} iobt_hfp_callinfo_t;

/** Phonebook information */
typedef struct iobt_hfp_phonebook_info {
	iobt_hfp_phonebook_type_t type; /**< The type of phone book. */
	uint16_t used; /**< Number of entries used. */
	uint16_t total; /**< Total number of entries. */
} iobt_hfp_phonebook_info_t;

/** Phonebook size */
typedef struct iobt_hfp_phonebook_size {
	uint16_t index1; /* First Entry           */
	uint16_t index2; /* Last Entry            */
	uint16_t numberLen; /* Maximum number length */
	uint16_t textLen; /* Maximum text length   */
} iobt_hfp_phonebook_size_t;

/** A phonebook entry */
typedef struct iobt_hfp_phonebook_entry {
	uint16_t type; /**< reserved. */
	uint16_t index; /**< Location in the phone book. */
	uint16_t number_len; /**< Length of number string, with NULL */
	uint16_t name_len; /**< Length of name string, with NULL */
/** NULL terminated 'number' */
/** NULL terminated 'name' */
} iobt_hfp_phonebook_entry_t;

/**
 * Get phone features of the remote device
 *
 * @param fd The file descriptor of our profile.
 * @param features A bitmask containing the feature set.
 * @return 0 on success, -1 on error with errno set
 */
int iobt_hfp_phone_features(int fd, iobt_hfp_phone_features_t *features);

/**
 * Get hold features of the remote device
 *
 * @param fd The file descriptor of our profile.
 * @param features A bitmask containing the feature set.
 * @return 0 on success, -1 on error with errno set
 */
int iobt_hfp_phone_hold_features(int fd, iobt_hfp_phone_hold_features_t *features);

/**
 * Initiate an outgoing call using a phone number.
 *
 * @param fd The file descriptor of our profile.
 * @param number An ASCII string containing the number to be dialed.
 * @param length The length in bytes of the number
 * @return 0 on success, -1 on error with errno set
 */
int iobt_hfp_dial(int fd, uint8_t const * number, size_t length);

/**
 * Terminate the active call or cancel an outgoing call.
 *
 * @param fd The file descriptor of our profile.
 * @return 0 on success, -1 on error with errno set
 */
int iobt_hfp_hangup(int fd);

/**
 * Answer an incoming call.
 * @param fd The file descriptor of our profile.
 * @return 0 on success, -1 on error with errno set
 */
int iobt_hfp_answer(int fd);

/**
 * Reject an incoming call.
 *
 * @param fd The file descriptor of our profile.
 * @return 0 on success, -1 on error with errno set
 */
int iobt_hfp_reject(int fd);

/**
 * Initiates an outgoing call based on the last number dialed in the audio gateway.
 *
 * @param fd The file descriptor of our profile.
 * @return 0 on success, -1 on error with errno set
 */
int iobt_hfp_redial(int fd);

/**
 * Create an audio link if one does not exist.
 *
 * @param fd The file descriptor of our profile.
 * @return 0 on success, -1 on error with errno set
 */
int iobt_hfp_create_audio_link(int fd);

/**
 * Disconnect an audio link.
 * @param fd The file descriptor of our profile.
 * @return 0 on success, -1 on error with errno set
 */
int iobt_hfp_disconnect_audio_link(int fd);

/**
 * Request the list of current calls. This information will
 * provided via IOBT_HFE_CALL_INFO events.
 *
 * @param fd The file descriptor of our profile.
 * @return 0 on success, -1 on error with errno set
 */
ssize_t iobt_hfp_list_current_calls(int fd);

/**
 * Get the state of the current call on the specified line.
 *
 * @param fd The file descriptor of our profile.
 * @param line The line to get the call state of.
 * @return 0 on success, -1 on error with errno set
 */
int iobt_hfp_get_call_state(int fd, uint8_t line);

/**
 * Get phone information about the bound device.
 *
 * @param fd The file descriptor of our profile.
 * @param info A pointer to store the returned info
 * @return 0 on success, -1 on error with errno set
 */
int iobt_hfp_get_phone_info(int fd, iobt_hfp_phone_info_t* info);

/**
 * Get the subscriber number.
 *
 * @param fd The file descriptor of our profile.
 * @param number A pointer to store the returned number string
 * @param len the size of the number buffer
 * @return number of bytes on success, -1 on error with errno set
 */
int iobt_hfp_get_subscriber_number(int fd, uint8_t* number, int len);

/**
 * Get the network operator.
 *
 * @param fd The file descriptor of our profile.
 * @param operator A pointer to store the returned operator name string
 * @param len the size of the operator name buffer
 * @return number of bytes on success, -1 on error with errno set
 */
int iobt_hfp_get_network_operator(int fd, uint8_t* op, int len);

/**
 * Perform a multiparty call action.
 *
 * @param fd The file descriptor of our profile.
 * @param action The multiparty call action to perform
 * @param id The id of the call if action is IOBT_HOLD_RELEASE_ACTIVE_CALLS or IOBT_HOLD_HOLD_ACTIVE_CALLS
 * @return number of bytes on success, -1 on error with errno set
 */
int iobt_hfp_hold_call_action(int fd, iobt_hfp_hold_call_action_t action, int id);

/**
 * Send a DTMF code to the network
 *
 * @param dtmf A single ASCII character in the set 0-9, #, *, A-D.
 * @param fd The file descriptor of our profile.

 * @return 0 on success, -1 on error with errno set
 */
int iobt_hfp_generate_dtmf(int fd, uint8_t dtmf);

/**
 * Enable or Disable Voice Rec on the AG
 *
 * @param fd The file descriptor of our profile.
 * @param enable 0 for true, for false
 * @return 0 on success, -1 on error with errno set
 */
int iobt_hfp_enable_voice_rec(int fd, uint8_t enable);

/**
 * Requests a bitmask of the phonebooks available from the device.
 * This information is sent in a HF_EVENT_PHONEBOOK_STORAGE event.
 *
 * @param fd The file descriptor of our profile.
 * @return 0 on success, -1 on error with errno set
 */
int iobt_hfp_query_phonebooks(int fd);

/**
 * Select a phonebook.
 *
 * @param fd The file descriptor of our profile.
 * @param id The id of the phonebook to select.
 * @return 0 on success, -1 on error with errno set
 */
int iobt_hfp_select_phonebook(int fd, uint16_t id);

/**
 * Get info related to the selected phonebook. The info is
 * passed back in an event.
 *
 * @param fd The file descriptor of our profile.
 * @return 0 on success, -1 on error with errno set
 */
int iobt_hfp_get_phonebook_info(int fd);

/**
 * Get the size of a selected phonebook.
 *
 * @param fd The file descriptor of our profile. The size is passed back in
 * an event.
 * @return 0 on success, -1 on error with errno set
 */
int iobt_hfp_get_phonebook_size(int fd);

/**
 * Get a list of entries from the selected phonebook. The entries are passed
 * back as events.
 *
 * @param fd The file descriptor of our profile.
 * @param from The index of the entry to read from.
 * @param to   The index of the entry to read to.
 * @return 0 on success, -1 on error with errno set
 */
ssize_t iobt_hfp_get_phonebook_entries(int fd, int from, int to);

/**
 * Find a list of entries from the selected phonebook based on a query string.
 * The entries are passed back as events.
 *
 * @param fd The file descriptor of our profile.
 * @param search The null terminated string on which to base the query.
 * @return 0 on success, -1 on error with errno set
 */
ssize_t iobt_hfp_find_phonebook_entries(int fd, uint8_t* search);
/**
 * Write an entry to the selected phonebook.
 *
 * @param fd The file descriptor of our profile.
 * @param index The index at which to write the entry.
 * @param entry The entry to write into the phonebook.
 * @return 0 on success, -1 on error with errno set
 */
int iobt_hfp_write_phonebook_entry(int fd, uint16_t index, const iobt_hfp_phonebook_entry_t* entry);

/*@}*/

__END_DECLS

#endif


#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/bluetooth/public/bluetooth/hfp.h $ $Rev: 725212 $")
#endif
