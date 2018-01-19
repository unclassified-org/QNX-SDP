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
#if !defined(BLUETOOTH_A2DP_H_INCLUDED)
#define BLUETOOTH_A2DP_H_INCLUDED

#if !defined(__TYPES_H_INCLUDED)
#include <sys/types.h>
#endif

#ifndef BLUETOOTH_BTUTILS_H_INCLUDED
#include <bluetooth/btutils.h>
#endif

__BEGIN_DECLS

/** @file bluetooth/a2dp.h
 * io-bluetooth Advanced Audio Distribution Profile external API.
 * @ingroup extA2DP_API A2DP External API
 */

/** @defgroup extA2DP_API A2DP External API
 */
/*@{*/

/** An a2dp event*/
typedef uint16_t iobt_a2dp_event_t;

/** @name A2DP Events
 *  Events that can be thrown by A2DP
 * @{*/
#define IOBT_A2DP_EVENT_STREAM_OPEN_IND         1
#define IOBT_A2DP_EVENT_STREAM_OPEN             2
#define IOBT_A2DP_EVENT_CODEC_INFO              3
#define IOBT_A2DP_EVENT_CP_INFO                 4
#define IOBT_A2DP_EVENT_GET_CONFIG_IND          5
#define IOBT_A2DP_EVENT_GET_CAP_CNF             6
#define IOBT_A2DP_EVENT_STREAM_CLOSED           7
#define IOBT_A2DP_EVENT_STREAM_IDLE             8
#define IOBT_A2DP_EVENT_STREAM_START_IND        9
#define IOBT_A2DP_EVENT_STREAM_STARTED         10
#define IOBT_A2DP_EVENT_STREAM_SUSPENDED       11
#define IOBT_A2DP_EVENT_STREAM_RECONFIG_IND    12
#define IOBT_A2DP_EVENT_STREAM_RECONFIG_CNF    13
#define IOBT_A2DP_EVENT_STREAM_SECURITY_IND    14
#define IOBT_A2DP_EVENT_STREAM_SECURITY_CNF    15
#define IOBT_A2DP_EVENT_STREAM_ABORTED         16
#define IOBT_A2DP_EVENT_STREAM_DATA_IND        17
#define IOBT_A2DP_EVENT_STREAM_PACKET_SENT     18
#define IOBT_A2DP_EVENT_STREAM_SBC_PACKET_SENT 19
#define IOBT_A2DP_EVENT_STREAM_SUSPEND_IND     20
/**@}*/

/*
 * iobt_a2dp_role_t type
 */
typedef uint8_t iobt_a2dp_role_t;

/** @name Role types
 *  Role types
 * @{*/
#define IOBT_A2DP_SOURCE      0 /** Source */
#define IOBT_A2DP_SINK        1 /** Sink */
/**@}*/

/** Describes the encoding and decoding method being used by an SBC */
typedef uint8_t iobt_a2dp_enc_method_t;

/** @name Encoding method
 *  Encoding method
 * @{*/
#define IOBT_A2DP_JOINT_STEREO 0
#define IOBT_A2DP_STEREO       1
#define IOBT_A2DP_DUAL_CHANNEL 2
#define IOBT_A2DP_MONO         3

/** Describes the sample rate frequency being used by a stream. */
typedef uint16_t iobt_a2dp_freq_samp_t;

/** @name Sample rate
 *  Sample rate
 * @{*/
#define IOBT_A2DP_FREQ_SAMP_48000 48000 /** This is the most widely used format */
#define IOBT_A2DP_FREQ_SAMP_44100 44100
#define IOBT_A2DP_FREQ_SAMP_32000 32000
#define IOBT_A2DP_FREQ_SAMP_16000 16000
/**@}*/

/** Codec */
typedef uint16_t iobt_a2dp_codec_t;
/** @name Codec
 *  Role types
 * @{*/
#define IOBT_A2DP_MPEG 0
#define IOBT_A2DP_SBC  1
#define IOBT_A2DP_PCM  2
/**@}*/

/** a2dp Stream state */
typedef uint16_t iobt_a2dp_stream_state_t;
/** @name Stream state
 *  Role types
 * @{*/
#define IOBT_A2DP_STREAM_STATE_CLOSED     1 /** The stream is closed */
#define IOBT_A2DP_STREAM_STATE_IDLE       2 /** The stream is idle */
#define IOBT_A2DP_STREAM_STATE_OPEN       3 /** The stream is open */
#define IOBT_A2DP_STREAM_STATE_STREAMING  4 /** The stream is streaming */
#define IOBT_A2DP_STREAM_STATE_UNKNOWN    5 /** Unknown state */
/**@}*/

/* Our stream information */
typedef struct iobt_a2dp_stream {
	iobt_a2dp_freq_samp_t samplerate;
	iobt_a2dp_enc_method_t encmethod;
	iobt_a2dp_role_t role;
	iobt_a2dp_codec_t codec;
} iobt_a2dp_stream_t;

/**
 * Defines if the local end is an initiator or an acceptor for the connection request
 * TODO: in the future we might want to query for this property,
 * this is why it's defined here instead of the a3dp module
 */
typedef uint8_t iobt_a2dp_connect_role;
#define IOBT_A2DP_CONNECT_ROLE_UNKNOWN  0
#define IOBT_A2DP_CONNECT_ROLE_INT      1
#define IOBT_A2DP_CONNECT_ROLE_ACP      2

/**
 * Get the current configured codec.
 *
 * @param fd The file descriptor of our profile.
 * @return 0 on success, -1 on error with errno set
 */
int iobt_a2dp_get_stream_info(int fd, iobt_a2dp_stream_t* stream);

/**
 * Get the current stream state.
 *
 * @param fd The file descriptor of our profile.
 * @param state The state of the device.
 * @return 0 on success, -1 on error with errno set
 */
int iobt_a2dp_get_stream_state(int fd, iobt_a2dp_stream_state_t* state);

/**
 * Starts the stream
 *
 * @param fd The file descriptor of our profile.
 * @param is_op_started TRUE if start operation is started,
 *                      FALSE otherwise
 *        Value must not be evaluated if function has return failure
 * @return 0 on success, -1 on error with errno set
 */
int iobt_a2dp_start_stream(int fd, uint8_t *is_op_started);

/**
 * Suspends the stream
 *
 * @param fd The file descriptor of our profile.
 * @param is_op_started TRUE if suspend operation is started,
 *                      FALSE otherwise
 *        Value must not be evaluated if function has return failure
 * @return 0 on success, -1 on error with errno set
 */
int iobt_a2dp_suspend_stream(int fd, uint8_t *is_op_started);
/*@}*/

__END_DECLS

#endif


#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/bluetooth/public/bluetooth/a2dp.h $ $Rev: 725212 $")
#endif
