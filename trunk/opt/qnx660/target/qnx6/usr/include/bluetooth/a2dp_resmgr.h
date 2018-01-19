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

#if !defined(A2DP_PRIV_H_INCLUDED)
#define A2DP_PRIV_H_INCLUDED

#include "bluetooth_resmgr.h"

#define IOBT_A2DP_GETSTREAMINFO                        (IOBT_A2DP_BASE + 3)
#define IOBT_A2DP_GETSTREAMSTATE                       (IOBT_A2DP_BASE + 4)

#if 1 /* Marin */
#define IOBT_A2DP_STARTSTREAM                          (IOBT_A2DP_BASE + 5)
#define IOBT_A2DP_SUSPENDSTREAM                        (IOBT_A2DP_BASE + 6)
#endif /* Marin */

#if 1
/*
 * Marin - HACK ALLERT - IF to send first SBC packet must not be released
 * in final SW
 */
#define IOBT_A2DP_SENDSBC                              (IOBT_A2DP_BASE + 7)
#endif

#endif


#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/bluetooth/public/bluetooth/a2dp_resmgr.h $ $Rev: 725212 $")
#endif
