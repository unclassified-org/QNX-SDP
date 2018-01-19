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

#if !defined(HID_PRIV_H_INCLUDED)
#define HID_PRIV_H_INCLUDED

#include "bluetooth_resmgr.h"
#include "bluetooth/hid.h"

#define IOBT_HID_GET_REPORT         (IOBT_HID_BASE+1)
#define IOBT_HID_SET_REPORT         (IOBT_HID_BASE+2)
#define IOBT_HID_GET_IDLE           (IOBT_HID_BASE+3)
#define IOBT_HID_SET_IDLE           (IOBT_HID_BASE+4)
#define IOBT_HID_GET_PROTOCOL       (IOBT_HID_BASE+5)
#define IOBT_HID_SET_PROTOCOL       (IOBT_HID_BASE+6)
#define IOBT_HID_RESET              (IOBT_HID_BASE+7)
#define IOBT_HID_STR_MANU           (IOBT_HID_BASE+8)
#define IOBT_HID_STR_PROD           (IOBT_HID_BASE+9)
#define IOBT_HID_STR_SER            (IOBT_HID_BASE+10)
#define IOBT_HID_QUERY              (IOBT_HID_BASE+11)
#define IOBT_HID_SEND_CONTROL       (IOBT_HID_BASE+12)
#define IOBT_HID_SEND_INTERRUPT     (IOBT_HID_BASE+13)

#endif


#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/bluetooth/public/bluetooth/hid_resmgr.h $ $Rev: 725212 $")
#endif
