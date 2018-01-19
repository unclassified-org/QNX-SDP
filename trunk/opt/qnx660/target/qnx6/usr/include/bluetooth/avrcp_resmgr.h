/*
 * $QNXLicenseC:
 * Copyright 2007, QNX Software Systems. All Rights Reserved.
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

#if !defined(AVRCP_PRIV_H_INCLUDED)
#define AVRCP_PRIV_H_INCLUDED

#include "bluetooth_resmgr.h"
#include "bluetooth/avrcp.h"

#define IOBT_AVRCP_SETPANELKEY                          (IOBT_AVRCP_BASE + 1)
struct avrcp_panel_key {
	iobt_avrcp_panel_op_t op;
	uint8_t press;
};

#define IOBT_AVRCP_GETVERSION                           (IOBT_AVRCP_BASE + 2)
#define IOBT_AVRCP_GETREMOTEROLE                        (IOBT_AVRCP_BASE + 3)

#define IOBT_AVRCP_GETREMOTEDEVICE                      (IOBT_AVRCP_BASE + 16)
#define IOBT_AVRCP_GETBATTERYSTATUS                     (IOBT_AVRCP_BASE + 17)
#define IOBT_AVRCP_GETDURATION                          (IOBT_AVRCP_BASE + 18)
#define IOBT_AVRCP_GETMEDIAINFO                         (IOBT_AVRCP_BASE + 19)
#define IOBT_AVRCP_GETMEDIASTATUS                       (IOBT_AVRCP_BASE + 20)
#define IOBT_AVRCP_GETPOSITION                          (IOBT_AVRCP_BASE + 21)
#define IOBT_AVRCP_GETTOTALTRACKS                       (IOBT_AVRCP_BASE + 22)
#define IOBT_AVRCP_GETTRACKNUMBER                       (IOBT_AVRCP_BASE + 23)

#define IOBT_AVRCP_GETPLAYERATTR                        (IOBT_AVRCP_BASE + 25)
#define IOBT_AVRCP_SETPLAYERATTR                        (IOBT_AVRCP_BASE + 26)

#define IOBT_AVRCP_REGISTER_PLAYER						(IOBT_AVRCP_BASE + 27)
#define IOBT_AVRCP_DEREGISTER_PLAYER					(IOBT_AVRCP_BASE + 28)
#define IOBT_AVRCP_SETLOCALVOLUME						(IOBT_AVRCP_BASE + 29)
#define IOBT_AVRCP_SETREMOTEVOLUME						(IOBT_AVRCP_BASE + 30)
#define IOBT_AVRCP_SETBATTERYSTATUS						(IOBT_AVRCP_BASE + 31)
#define IOBT_AVRCP_SETPLAYSTATUS						(IOBT_AVRCP_BASE + 32)
#define IOBT_AVRCP_SETPOSITION							(IOBT_AVRCP_BASE + 33)
#define IOBT_AVRCP_SETTRACKINFO                         (IOBT_AVRCP_BASE + 34)
#define IOBT_AVRCP_SETMETADATA							(IOBT_AVRCP_BASE + 35)
#define IOBT_AVRCP_REQUESTMETADATA						(IOBT_AVRCP_BASE + 36)
#define IOBT_AVRCP_SETPANELKEYMAP                       (IOBT_AVRCP_BASE + 37)

struct avrcp_set_player_attr {
	iobt_avrcp_player_attr_id_t id;
	uint8_t value;
};

#endif


#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/bluetooth/public/bluetooth/avrcp_resmgr.h $ $Rev: 725212 $")
#endif
