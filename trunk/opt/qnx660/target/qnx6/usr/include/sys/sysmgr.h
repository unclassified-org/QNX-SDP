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



/*
 *  sys/sysmgr.h
 *

 */
#ifndef __SYSMGR_H_INCLUDED
#define __SYSMGR_H_INCLUDED

#if defined(__WATCOMC__) && !defined(_ENABLE_AUTODEPEND)
#pragma read_only_file;
#endif

#ifndef __PLATFORM_H_INCLUDED
#include <sys/platform.h>
#endif

#ifndef _UNISTD_H_INCLUDED
#include _NTO_HDR_(unistd.h)
#endif

__BEGIN_DECLS

extern int sysmgr_reboot(void);
extern int sysmgr_cpumode(int __cpumode);
extern int sysmgr_confstr_set(int __cmd, int __name, const char *__str);
extern int sysmgr_sysconf_set(int __cmd, int __name, long __value);
extern int sysmgr_runstate(unsigned __cpu, int __enable);
extern int sysmgr_runstate_dynamic(unsigned __cpu, int __enable);
extern int sysmgr_runstate_burst(unsigned __ms_length);

__END_DECLS

#endif

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/services/system/public/sys/sysmgr.h $ $Rev: 680334 $")
#endif
