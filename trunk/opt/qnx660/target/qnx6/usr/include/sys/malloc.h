/*
 * $QNXtpLicenseC:
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



/*	$NetBSD: malloc.h,v 1.96 2006/10/02 02:59:38 chs Exp $	*/

/*
 * Copyright (c) 1987, 1993
 *	The Regents of the University of California.  All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the University nor the names of its contributors
 *    may be used to endorse or promote products derived from this software
 *    without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE REGENTS AND CONTRIBUTORS ``AS IS'' AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED.  IN NO EVENT SHALL THE REGENTS OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
 * OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
 * SUCH DAMAGE.
 *
 *	@(#)malloc.h	8.5 (Berkeley) 5/3/95
 */

#ifndef __MALLOC_H_INCLUDED
#define	__MALLOC_H_INCLUDED

#if defined(__QNXNTO__) && defined(_KERNEL)
/*
 * If the standard <malloc.h> has already been brought in, 
 * so be it but it can't be brought in after this one.
 */
#define _MALLOC_H_INCLUDED
#endif

#ifndef __TYPES_H_INCLUDED
#include <sys/types.h>
#endif

#if defined(_KERNEL_OPT)
#include "opt_kmemstats.h"
#include "opt_malloclog.h"
#include "opt_malloc_debug.h"
#include "opt_lockdebug.h"
#endif


/*
 * flags to malloc
 */
#define	M_WAITOK	0x0000	/* can wait for resources */
#define	M_NOWAIT	0x0001	/* do not wait for resources */
#define	M_ZERO		0x0002	/* zero the allocation */
#define	M_CANFAIL	0x0004	/* can fail if requested memory can't ever
				 * be allocated */
#ifdef _KERNEL

#ifndef __QNXNTO__
#include <sys/lock.h>
#endif
#include <sys/mallocvar.h>
/*
 * The following are standard, built-in malloc types that are
 * not specific to any one subsystem.
 */
MALLOC_DECLARE(M_DEVBUF);
MALLOC_DECLARE(M_DMAMAP);
MALLOC_DECLARE(M_FREE);
MALLOC_DECLARE(M_PCB);
MALLOC_DECLARE(M_SOFTINTR);
MALLOC_DECLARE(M_TEMP);

/* XXX These should all be declared elsewhere. */
MALLOC_DECLARE(M_RTABLE);
MALLOC_DECLARE(M_FTABLE);
MALLOC_DECLARE(M_UFSMNT);
MALLOC_DECLARE(M_NETADDR);
MALLOC_DECLARE(M_IPMOPTS);
MALLOC_DECLARE(M_IPMADDR);
MALLOC_DECLARE(M_MRTABLE);
MALLOC_DECLARE(M_BWMETER);
MALLOC_DECLARE(M_1394DATA);
#endif /* _KERNEL */

/*
 * Set of buckets for each size of memory block that is retained
 */
struct kmembuckets {
	caddr_t kb_next;	/* list of free blocks */
	caddr_t kb_last;	/* last free block */
	long	kb_calls;	/* total calls to allocate this size */
	long	kb_total;	/* total number of blocks allocated */
	long	kb_totalfree;	/* # of free elements in this bucket */
	long	kb_elmpercl;	/* # of elements in this sized allocation */
	long	kb_highwat;	/* high water mark */
	long	kb_couldfree;	/* over high water mark and could free */
};

#ifdef _KERNEL
#define	MALLOC(space, cast, size, type, flags) \
	(space) = (cast)malloc((u_long)(size), (type), (flags))
#define	FREE(addr, type) free((caddr_t)(addr), (type))

#ifdef MALLOCLOG
void	*_malloc(unsigned long, struct malloc_type *, int, const char *, long);
void	_free(void *, struct malloc_type *, const char *, long);
#define	malloc(size, type, flags) \
	    _malloc((size), (type), (flags), __FILE__, __LINE__)
#define	free(addr, type) \
	    _free((addr), (type), __FILE__, __LINE__)
#else
#if !defined(__QNXNTO__)
void	*malloc(unsigned long, struct malloc_type *, int);
void	free(void *, struct malloc_type *);
#else
void	*malloc_bsd(unsigned long, struct malloc_type *, int);
void	free_bsd(void *addr, struct malloc_type *);
#define	malloc(size, type, flags) \
	    malloc_bsd((size), (type), (flags))
#define	free(addr, type) \
	    free_bsd((addr), (type))
#endif /* __QNXNTO__ */
#endif /* MALLOCLOG */

#ifdef MALLOC_DEBUG
int	debug_malloc(unsigned long, struct malloc_type *, int, void **);
int	debug_free(void *, struct malloc_type *);
void	debug_malloc_init(void);

void	debug_malloc_print(void);
void	debug_malloc_printit(void (*)(const char *, ...), vaddr_t);
#endif /* MALLOC_DEBUG */

#ifndef __QNXNTO__
void	*realloc(void *, unsigned long, struct malloc_type *, int);
#else
void	*realloc_bsd(void *, unsigned long, struct malloc_type *, int);
#define realloc(old, size, type, flags) \
	    realloc_bsd((old), (size), (type), (flags))
#endif
unsigned long
	malloc_roundup(unsigned long);
#endif /* _KERNEL */
#endif /* !__MALLOC_H_INCLUDED */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/socket/public/sys/malloc.h $ $Rev: 680336 $")
#endif
