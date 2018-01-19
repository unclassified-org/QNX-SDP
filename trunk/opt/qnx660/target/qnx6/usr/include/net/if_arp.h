/*	$NetBSD: if_arp.h,v 1.25 2005/12/10 23:21:38 elad Exp $	*/

/*
 * Copyright (c) 1986, 1993
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
 *	@(#)if_arp.h	8.1 (Berkeley) 6/10/93
 */

#ifndef _NET_IF_ARP_H_INCLUDED
#define _NET_IF_ARP_H_INCLUDED

#ifndef __SOCKET_H_INCLUDED
#include <sys/socket.h>
#endif

#ifndef _STDINT_H_INCLUDED
#include <stdint.h>
#endif

/*
 * Address Resolution Protocol.
 *
 * See RFC 826 for protocol description.  ARP packets are variable
 * in size; the arphdr structure defines the fixed-length portion.
 * Protocol type values are the same as those for 10 Mb/s Ethernet.
 * It is followed by the variable-sized fields ar_sha, arp_spa,
 * arp_tha and arp_tpa in that order, according to the lengths
 * specified.  Field names used correspond to RFC 826.
 */
struct	arphdr {
	uint16_t ar_hrd;	/* format of hardware address */
#define ARPHRD_ETHER 	1	/* ethernet hardware format */
#define ARPHRD_IEEE802 	6	/* IEEE 802 hardware format */
#define ARPHRD_ARCNET 	7	/* ethernet hardware format */
#define ARPHRD_FRELAY 	15	/* frame relay hardware format */
#define ARPHRD_STRIP 	23	/* Ricochet Starmode Radio hardware format */
#define	ARPHRD_IEEE1394	24	/* IEEE 1394 (FireWire) hardware format */
	uint16_t ar_pro;	/* format of protocol address */
	uint8_t  ar_hln;	/* length of hardware address */
	uint8_t  ar_pln;	/* length of protocol address */
	uint16_t ar_op;	/* one of: */
#define	ARPOP_REQUEST	1	/* request to resolve address */
#define	ARPOP_REPLY	2	/* response to previous request */
#define	ARPOP_REVREQUEST 3	/* request protocol address given hardware */
#define	ARPOP_REVREPLY	4	/* response giving protocol address */
#define	ARPOP_INVREQUEST 8 	/* request to identify peer */
#define	ARPOP_INVREPLY	9	/* response identifying peer */
/*
 * The remaining fields are variable in size,
 * according to the sizes above.
 */
#ifdef COMMENT_ONLY
	uint8_t  ar_sha[];	/* sender hardware address */
	uint8_t  ar_spa[];	/* sender protocol address */
	uint8_t  ar_tha[];	/* target hardware address */
	uint8_t  ar_tpa[];	/* target protocol address */
#endif
#define ar_sha(ap) (((caddr_t)((ap)+1))+0)
#define ar_spa(ap) (((caddr_t)((ap)+1))+(ap)->ar_hln)
#define ar_tha(ap) \
	((ap)->ar_hrd == htons(ARPHRD_IEEE1394) \
		? NULL : (((caddr_t)((ap)+1))+(ap)->ar_hln+(ap)->ar_pln))
#define ar_tpa(ap) \
	((ap)->ar_hrd == htons(ARPHRD_IEEE1394) \
		? (((caddr_t)((ap)+1))+(ap)->ar_hln+(ap)->ar_pln) \
		: (((caddr_t)((ap)+1))+(ap)->ar_hln+(ap)->ar_pln+(ap)->ar_hln))
} __attribute__((__packed__));


/*
 * ARP ioctl request
 */
struct arpreq {
	struct	sockaddr arp_pa;		/* protocol address */
	struct	sockaddr arp_ha;		/* hardware address */
	int	arp_flags;			/* flags */
};
/*  arp_flags and at_flags field values */
#define	ATF_INUSE	0x01	/* entry in use */
#define ATF_COM		0x02	/* completed entry (enaddr valid) */
#define	ATF_PERM	0x04	/* permanent entry */
#define	ATF_PUBL	0x08	/* publish entry (respond for other host) */
#define	ATF_USETRAILERS	0x10	/* has requested trailers */

/*
 * Kernel statistics about arp
 */
struct arpstat {
	uint64_t	as_sndtotal;	/* total packets sent */
	uint64_t	as_sndreply;	/* replies sent */
	uint64_t	as_sndrequest;	/* requests sent */

	uint64_t	as_rcvtotal;	/* total packets received */
	uint64_t	as_rcvrequest;	/* valid requests received */
	uint64_t	as_rcvreply;	/* replies received */
	uint64_t	as_rcvmcast;    /* multicast/broadcast received */
	uint64_t	as_rcvbadproto;	/* unknown protocol type received */
	uint64_t	as_rcvbadlen;	/* bad (short) length received */
	uint64_t	as_rcvzerotpa;	/* received w/ null target ip */
	uint64_t	as_rcvzerospa;	/* received w/ null src ip */
	uint64_t	as_rcvnoint;	/* couldn't map to interface */
	uint64_t	as_rcvlocalsha;	/* received from local hw address */
	uint64_t	as_rcvbcastsha;	/* received w/ broadcast src */
	uint64_t	as_rcvlocalspa;	/* received for a local ip [dup!] */
	uint64_t	as_rcvoverperm;	/* attempts to overwrite static info */
	uint64_t	as_rcvoverint;	/* attempts to overwrite wrong if */
	uint64_t	as_rcvover;	/* entries overwritten! */
	uint64_t	as_rcvlenchg;	/* changes in hw add len */

	uint64_t	as_dfrtotal;	/* deferred pending ARP resolution. */
	uint64_t	as_dfrsent;	/* deferred, then sent */
	uint64_t	as_dfrdropped;	/* deferred, then dropped */

	uint64_t	as_allocfail;	/* Failures to allocate llinfo */
};

#endif /* !_NET_IF_ARP_H_INCLUDED */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/socket/public/net/if_arp.h $ $Rev: 680336 $")
#endif
