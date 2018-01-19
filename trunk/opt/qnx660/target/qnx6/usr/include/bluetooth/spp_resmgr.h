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

#if !defined(SPP_PRIV_H_INCLUDED)
#define SPP_PRIV_H_INCLUDED

#include "bluetooth_resmgr.h"

#define IOBT_SPP_IOCTL                                (IOBT_SPP_BASE + 1)
struct spp_ioctl {
	iobt_spp_ioctl_func_t func;
	void *arg;
};

#endif


#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/bluetooth/public/bluetooth/spp_resmgr.h $ $Rev: 725212 $")
#endif
