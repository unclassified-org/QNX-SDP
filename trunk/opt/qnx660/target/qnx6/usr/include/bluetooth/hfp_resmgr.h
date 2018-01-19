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

#if !defined(HFP_PRIV_H_INCLUDED)
#define HFP_PRIV_H_INCLUDED

#include "bluetooth_resmgr.h"

#define IOBT_HFP_DIAL                        		(IOBT_HFP_BASE + 1)
#define IOBT_HFP_HANGUP                         	(IOBT_HFP_BASE + 2)
#define IOBT_HFP_ANSWER                         	(IOBT_HFP_BASE + 3)
#define IOBT_HFP_REJECT                      		(IOBT_HFP_BASE + 4)
#define IOBT_HFP_REDIAL                         	(IOBT_HFP_BASE + 5)
#define IOBT_HFP_LISTCURRENTCALLS               	(IOBT_HFP_BASE + 9)
#define IOBT_HFP_CALLSTATE                       	(IOBT_HFP_BASE + 10)

#define IOBT_HFP_GETPHONEINFO						(IOBT_HFP_BASE + 12)
#define IOBT_HFP_GETSUBSCRIBER                      (IOBT_HFP_BASE + 13)
#define IOBT_HFP_GETNETWORKOPER                     (IOBT_HFP_BASE + 14)
#define IOBT_HFP_CREATEAUDIOLINK					(IOBT_HFP_BASE + 15)
#define IOBT_HFP_DISCONNECTAUDIOLINK				(IOBT_HFP_BASE + 16)
#define IOBT_HFP_GENERATEDTMF						(IOBT_HFP_BASE + 17)
#define IOBT_HFP_PHONEFEATURES						(IOBT_HFP_BASE + 18)
#define IOBT_HFP_PHONEHOLDFEATURES					(IOBT_HFP_BASE + 19)
#define IOBT_HFP_HOLDCALLACTION						(IOBT_HFP_BASE + 20)
struct hfp_hold_call_action {
	iobt_hfp_hold_call_action_t action;
	int id;
};
#define IOBT_HFP_QUERY_PHONEBOOKS					(IOBT_HFP_BASE + 21)
#define IOBT_HFP_SELECT_PHONEBOOK               	(IOBT_HFP_BASE + 22)
#define IOBT_HFP_GET_PHONEBOOK_INFO			        (IOBT_HFP_BASE + 23)
#define IOBT_HFP_READ_PHONEBOOK_ENTRIES				(IOBT_HFP_BASE + 24)
struct hfp_read_phonebook_entries {
	int from;
	int to;
};
#define IOBT_HFP_FIND_PHONEBOOK_ENTRIES            (IOBT_HFP_BASE + 25)
#define IOBT_HFP_WRITE_PHONEBOOK_ENTRY             (IOBT_HFP_BASE + 26)
#define IOBT_HFP_GET_PHONEBOOK_SIZE                (IOBT_HFP_BASE + 27)
#define IOBT_HFP_ENABLEVREC                        (IOBT_HFP_BASE + 28)

#endif


#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/bluetooth/public/bluetooth/hfp_resmgr.h $ $Rev: 725212 $")
#endif
