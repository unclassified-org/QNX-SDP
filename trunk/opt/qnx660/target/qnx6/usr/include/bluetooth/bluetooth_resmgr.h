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

#ifndef BLUETOOTH_PRIV_H_INCLUDED
#define BLUETOOTH_PRIV_H_INCLUDED

#include <sys/types.h>

/* This also defined in iobt.h these must be consistent */
#define PREFIX_IO_BLUETOOTH "/dev/io-bluetooth"

#define IOBT_READ_EVENTS                            1
#define IOBT_SET_EVENTQ                             2

#define IOBT_BTMGR_BASE                             0x100
#define IOBT_HFP_BASE                               0x200
#define IOBT_AVRCP_BASE                             0x300
#define IOBT_A2DP_BASE                              0x400
#define IOBT_BNEP_BASE                              0x500
#define IOBT_SPP_BASE                               0x600
#define IOBT_PBAP_BASE                              0x700
#define IOBT_HFPG_BASE                              0x800
#define IOBT_HID_BASE                               0x900

extern int _iobt_sendv(int btd, int cmd, iov_t *siov, int nsiov, iov_t *riov, int nriov);
extern int _iobt_send(int btd, int cmd, void *smsg, int slen, void *reply, int rlen);

#endif


#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/bluetooth/public/bluetooth/bluetooth_resmgr.h $ $Rev: 725212 $")
#endif
