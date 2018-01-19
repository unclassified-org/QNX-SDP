/*	$NetBSD: udp6_var.h,v 1.24 2011/09/24 17:22:14 christos Exp $	*/
/*	$KAME: udp6_var.h,v 1.11 2000/06/05 00:14:31 itojun Exp $	*/

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
 * Copyright (c) 1982, 1986, 1989, 1993
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
 *	@(#)udp_var.h	8.1 (Berkeley) 6/10/93
 */

#ifndef _NETINET6_UDP6_VAR_H_INCLUDED
#define _NETINET6_UDP6_VAR_H_INCLUDED

#ifndef _INTTYPES_H_INCLUDED
#include <inttypes.h>
#endif

/*
 * UDP Kernel structures and variables.
 */
struct	udp6stat {
				/* input statistics: */
	uint64_t udp6s_ipackets;	/* total input packets */
	uint64_t udp6s_hdrops;		/* packet shorter than header */
	uint64_t udp6s_badsum;		/* checksum error */
	uint64_t udp6s_nosum;		/* no checksum */
	uint64_t udp6s_badlen;		/* data length larger than packet */
	uint64_t udp6s_noport;		/* no socket on port */
	uint64_t udp6s_noportmcast;	/* of above, arrived as broadcast */
	uint64_t udp6s_fullsock;	/* not delivered, input socket full */
	uint64_t udp6ps_pcbcachemiss;	/* input packets missing pcb cache */
				/* output statistics: */
	uint64_t udp6s_opackets;	/* total output packets */
};

/*
 * Names for UDP6 sysctl objects
 */
#define	UDP6CTL_SENDSPACE	1	/* default send buffer */
#define	UDP6CTL_RECVSPACE	2	/* default recv buffer */
#define	UDP6CTL_LOOPBACKCKSUM	3	/* do UDP checksum on loopback? */
#define	UDP6CTL_STATS		4	/* udp6 statistics */
#define	UDP6CTL_RFC6056		5	/* RFC 6056 algorithm selection */
#define	UDP6CTL_MAXID		6

#define UDP6CTL_NAMES { \
	{ 0, 0 }, \
	{ "sendspace", CTLTYPE_INT }, \
	{ "recvspace", CTLTYPE_INT }, \
	{ "do_loopback_cksum", CTLTYPE_INT }, \
	{ "stats", CTLTYPE_STRUCT }, \
}

#ifdef _KERNEL
extern	struct	udp6stat udp6stat;

void	udp6_ctlinput(int, struct sockaddr *, void *);
int	udp6_ctloutput(int, struct socket *, int , int , struct mbuf **);
void	udp6_init(void);
int	udp6_input(struct mbuf **, int *, int);
int	udp6_output(struct in6pcb *, struct mbuf *, struct mbuf *,
    struct mbuf *, struct lwp *);
int	udp6_sysctl(int *, u_int, void *, size_t *, void *, size_t);
int	udp6_usrreq(struct socket *, int, struct mbuf *, struct mbuf *,
    struct mbuf *, struct lwp *);
#endif /* _KERNEL */

#endif /* !_NETINET6_UDP6_VAR_H_INCLUDED */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/socket/public/netinet6/udp6_var.h $ $Rev: 691213 $")
#endif
