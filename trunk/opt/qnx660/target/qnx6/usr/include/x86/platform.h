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
 *  x86/platform.h
 *

 */

#ifndef _X86_PLATFORM_H_INCLUDED
#define _X86_PLATFORM_H_INCLUDED

#ifndef __PLATFORM_H_INCLUDED
#error x86/platform.h should not be included directly.
#endif

#if defined(__QNXNTO__)

#define __JMPBUFSIZE	13
typedef	unsigned		__jmpbufalign;

#elif defined(__QNX__)
#if defined(__HUGE__) || defined(__SW_ZU)
typedef char __far *__NTO_va_list[1];

#define __NTO_va_start_stdarg(ap,pn) ((ap)[0]=(char __far *)&pn+\
    ((sizeof(pn)+sizeof(int)-1)&~(sizeof(int)-1)),(void)0)
#define __NTO_va_arg(ap,type)     ((ap)[0]+=\
    ((sizeof(type)+sizeof(int)-1)&~(sizeof(int)-1)),\
    (*(type __far *)((ap)[0]-((sizeof(type)+sizeof(int)-1)&~(sizeof(int)-1)))))
#define __NTO_va_end(ap)          ((ap)[0]=0,(void)0)
#else
typedef char *__NTO_va_list[1];

#define __NTO_va_start_stdarg(ap,pn) ((ap)[0]=(char *)&pn+\
    ((sizeof(pn)+sizeof(int)-1)&~(sizeof(int)-1)),(void)0)
#define __NTO_va_arg(ap,type)     ((ap)[0]+=\
    ((sizeof(type)+sizeof(int)-1)&~(sizeof(int)-1)),\
    (*(type *)((ap)[0]-((sizeof(type)+sizeof(int)-1)&~(sizeof(int)-1)))))
#define __NTO_va_end(ap)          ((ap)[0]=0,(void)0)
#endif

#else
#error Not configured for target
#endif

#endif

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/c/public/x86/platform.h $ $Rev: 680336 $")
#endif
