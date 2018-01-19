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





#ifndef _MACHINE_ANSI_H_
#define _MACHINE_ANSI_H_

#include <sys/platform.h>
#if 0 /* Can be flipped after __NTO_va_list has soaked for a while */

typedef __NTO_va_list _BSD_VA_LIST_;
#else
#include <stdarg.h>
#ifndef _BSD_VA_LIST_
typedef va_list _BSD_VA_LIST_;
#define _BSD_VA_LIST_ va_list
#endif
#endif

#endif

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/io-pkt/sys/machine/ansi.h $ $Rev: 680336 $")
#endif
