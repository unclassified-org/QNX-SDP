/*	$NetBSD: ah.h,v 1.22 2005/12/10 23:39:56 elad Exp $	*/
/*	$KAME: ah.h,v 1.16 2001/09/04 08:43:19 itojun Exp $	*/

/*
 * Copyright (C) 1995, 1996, 1997, and 1998 WIDE Project.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the project nor the names of its contributors
 *    may be used to endorse or promote products derived from this software
 *    without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE PROJECT AND CONTRIBUTORS ``AS IS'' AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED.  IN NO EVENT SHALL THE PROJECT OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
 * OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
 * SUCH DAMAGE.
 */

/*
 * RFC1826/2402 authentication header.
 */

#ifndef _NETINET6_AH_H_INCLUDED
#define _NETINET6_AH_H_INCLUDED

#if defined(_KERNEL_OPT)
#include "opt_inet.h"
#endif

#ifndef _INTTYPES_H_INCLUDED
#include <inttypes.h>
#endif

struct ah {
	uint8_t	ah_nxt;		/* Next Header */
	uint8_t	ah_len;		/* Length of data, in 32bit */
	uint16_t	ah_reserve;	/* Reserved for future use */
	uint32_t	ah_spi;		/* Security parameter index */
	/* variable size, 32bit bound*/	/* Authentication data */
};

struct newah {
	uint8_t	ah_nxt;		/* Next Header */
	uint8_t	ah_len;		/* Length of data + 1, in 32bit */
	uint16_t	ah_reserve;	/* Reserved for future use */
	uint32_t	ah_spi;		/* Security parameter index */
	uint32_t	ah_seq;		/* Sequence number field */
	/* variable size, 32bit bound*/	/* Authentication data */
};

#ifdef _KERNEL
struct secasvar;

struct ah_algorithm_state {
	struct secasvar *sav;
	void* foo;	/* per algorithm data - maybe */
};

struct ah_algorithm {
	int (*sumsiz) __P((struct secasvar *));
	int (*mature) __P((struct secasvar *));
	int keymin;	/* in bits */
	int keymax;	/* in bits */
	const char *name;
	int (*init) __P((struct ah_algorithm_state *, struct secasvar *));
	void (*update) __P((struct ah_algorithm_state *, uint8_t *, size_t));
	void (*result) __P((struct ah_algorithm_state *, uint8_t *, size_t));
};

#define	AH_MAXSUMSIZE	(512 / 8)

extern const struct ah_algorithm *ah_algorithm_lookup __P((int));

/* cksum routines */
extern int ah_hdrlen __P((struct secasvar *));

extern size_t ah_hdrsiz __P((struct ipsecrequest *));
extern void ah4_input __P((struct mbuf *, ...));
extern int ah4_output __P((struct mbuf *, struct ipsecrequest *));
extern int ah4_calccksum __P((struct mbuf *, uint8_t *, size_t,
	const struct ah_algorithm *, struct secasvar *));

extern void *ah4_ctlinput __P((int, struct sockaddr *, void *));

#ifdef INET6
extern int ah6_input __P((struct mbuf **, int *, int));
extern int ah6_output __P((struct mbuf *, u_char *, struct mbuf *,
	struct ipsecrequest *));
extern int ah6_calccksum __P((struct mbuf *, uint8_t *, size_t,
	const struct ah_algorithm *, struct secasvar *));

extern void ah6_ctlinput __P((int, struct sockaddr *, void *));
#endif /* INET6 */

#endif /* _KERNEL */

#endif /* !_NETINET6_AH_H_INCLUDED */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/socket/public/netinet6/ah.h $ $Rev: 680336 $")
#endif
