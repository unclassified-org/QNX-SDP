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
#if !defined(BLUETOOTH_HFPG_H_INCLUDED)
#define BLUETOOTH_HFPG_H_INCLUDED

#if !defined(__TYPES_H_INCLUDED)
#include <sys/types.h>
#endif

#ifndef BLUETOOTH_BTUTILS_H_INCLUDED
#include <bluetooth/btutils.h>
#endif

__BEGIN_DECLS

/** @file bluetooth/hfp.h
 * io-bluetooth Hands Free Profile external API.
 * @ingroup extHFPG_API HFPG External API
 */

/** @defgroup extHFPG_API HFPG External API
 */
/*@{*/

/** Holds the event thrown by the hfp */
typedef uint16_t iobt_hfpg_event_t;

/** @name HFPG events
 *  Events that can be thrwon by the hands free profile
 * @{*/
#define IOBT_HFGE_AUDIO_CONNECTED            3
#define IOBT_HFGE_AUDIO_DISCONNECTED         4
/**@}*/

/** The possible reasons for establishing or
 * tearing down an (e)SCO audio link.
 */
typedef uint8_t iobt_hfpg_audio_reason_t;

/** @name HFPG Audio Reason
 * Reasons for esablishing audio connections
 * @{*/
#define IOBT_HFG_AR_CONNECTING_ONGOING_CALL 0
#define IOBT_HFG_AR_AUDIO_HANDOVER          1
#define IOBT_HFG_AR_REMOTE_VOICE_REC        2
#define IOBT_HFG_AR_LOCAL_VOICE_REC         3
#define IOBT_HFG_AR_LOCAL_USER_ACTION       4
#define IOBT_HFG_AR_CALL_STATE_CHANGE       5
/**@}*/

/**
 * Create an audio link if one does not exist.
 *
 * @param fd The file descriptor of our profile.
 * @return 0 on success, -1 on error with errno set
 */
int iobt_hfpg_create_audio_link(int fd, iobt_hfpg_audio_reason_t reason);

/**
 * Disconnect an audio link.
 * @param fd The file descriptor of our profile.
 * @return 0 on success, -1 on error with errno set
 */
int iobt_hfpg_disconnect_audio_link(int fd, iobt_hfpg_audio_reason_t reason);

/**
 * Send a ringing notification to the headset.
 * @param fd The file descriptor of our profile.
 * @return 0 on success, -1 on error with errno set
 */
int iobt_hfpg_send_ring(int fd);

/*@}*/

__END_DECLS

#endif


#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/bluetooth/public/bluetooth/hfpg.h $ $Rev: 725212 $")
#endif
