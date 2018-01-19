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

#ifndef BLUETOOTH_BTMGR_PRIV_H_INCLUDED
#define BLUETOOTH_BTMGR_PRIV_H_INCLUDED

#include "bluetooth_resmgr.h"

#define IOBT_BTMGR_GETSTACKSTATE                   (IOBT_BTMGR_BASE + 0)
#define IOBT_BTMGR_RADIOINIT                       (IOBT_BTMGR_BASE + 1)
#define IOBT_BTMGR_RADIOSHUTDOWN                   (IOBT_BTMGR_BASE + 2)
#define IOBT_BTMGR_DEVICESEARCH                    (IOBT_BTMGR_BASE + 3)
#define IOBT_BTMGR_CANCELDEVICESEARCH              (IOBT_BTMGR_BASE + 4)
#define IOBT_BTMGR_GETDEVICELIST                   (IOBT_BTMGR_BASE + 5)
#define IOBT_BTMGR_GETDEVICEINFO                   (IOBT_BTMGR_BASE + 6)
#define IOBT_BTMGR_SETLOCALNAME                    (IOBT_BTMGR_BASE + 7)
#define IOBT_BTMGR_GETLOCALNAME                    (IOBT_BTMGR_BASE + 8)
#define IOBT_BTMGR_GETBTADDR                       (IOBT_BTMGR_BASE + 9)
#define IOBT_BTMGR_SETDEVICECLASS                  (IOBT_BTMGR_BASE + 10)
#define IOBT_BTMGR_GETSERVICELIST                  (IOBT_BTMGR_BASE + 12)
#define IOBT_BTMGR_SETPASSKEY                      (IOBT_BTMGR_BASE + 13)
#define IOBT_BTMGR_STARTSNIFF                      (IOBT_BTMGR_BASE + 14)
#define IOBT_BTMGR_HALTSNIFF                       (IOBT_BTMGR_BASE + 15)
#define IOBT_BTMGR_HOLD                            (IOBT_BTMGR_BASE + 16)
#define IOBT_BTMGR_STARTPARK                       (IOBT_BTMGR_BASE + 17)
#define IOBT_BTMGR_HALTPARK                        (IOBT_BTMGR_BASE + 18)
#define IOBT_BTMGR_SETACCESSABLILITY               (IOBT_BTMGR_BASE + 20)
#define IOBT_BTMGR_GETACCESSABLILITY               (IOBT_BTMGR_BASE + 21)
#define IOBT_BTMGR_SETSECURITYMODE                 (IOBT_BTMGR_BASE + 22)
#define IOBT_BTMGR_SETCONNECTIONROLE               (IOBT_BTMGR_BASE + 23)
#define IOBT_BTMGR_CREATESERVICECONNECTION         (IOBT_BTMGR_BASE + 24)
#define IOBT_BTMGR_CANCELSERVICECONNECTION         (IOBT_BTMGR_BASE + 25)
#define IOBT_BTMGR_DISCONNECTSERVICECONNECTION     (IOBT_BTMGR_BASE + 26)
#define IOBT_BTMGR_REMOVEDEVICE                    (IOBT_BTMGR_BASE + 27)
#define IOBT_BTMGR_AUTHORIZE					   (IOBT_BTMGR_BASE + 28)
#define IOBT_BTMGR_USERCONFIRM					   (IOBT_BTMGR_BASE + 29)
#define IOBT_BTMGR_INITIATEPAIRING				   (IOBT_BTMGR_BASE + 30)
#define IOBT_BTMGR_CANCEL_PAIRING				   (IOBT_BTMGR_BASE + 31)
#define IOBT_BTMGR_SETLEGACYPIN				   	   (IOBT_BTMGR_BASE + 32)

struct btmgr_accessability {
	iobt_accessibility_mode_t mode;
	int connected;
};

struct btmgr_devicesearch {
	iobt_search_mode_t mode;
	int devices;
	int timeout;
};

struct btmgr_serviceconnection {
	iobt_addr_t addr;
	iobt_service_t service;
};

struct btmgr_setpasskey {
	iobt_addr_t addr;
	iobt_pair_type_t type;
	int keylen;
/* uint8_t passkey[0] */
};

struct btmgr_authorize {
	iobt_addr_t addr;
	uint8_t auth;
	uint8_t future;
};

struct btmgr_userconfirm {
	iobt_addr_t addr;
	uint8_t confirm;
	iobt_pair_type_t type;
};

#endif


#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/bluetooth/public/bluetooth/btmgr_resmgr.h $ $Rev: 725212 $")
#endif
