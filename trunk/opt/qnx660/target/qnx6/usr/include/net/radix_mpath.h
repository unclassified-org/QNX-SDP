/*	$KAME: radix_mpath.h,v 1.11 2007/06/14 12:09:42 itojun Exp $	*/

/*
 * Copyright (C) 2001 WIDE Project.
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
 * THE AUTHORS DO NOT GUARANTEE THAT THIS SOFTWARE DOES NOT INFRINGE
 * ANY OTHERS' INTELLECTUAL PROPERTIES. IN NO EVENT SHALL THE AUTHORS
 * BE LIABLE FOR ANY INFRINGEMENT OF ANY OTHERS' INTELLECTUAL
 * PROPERTIES.
 */

#ifndef _NET_RADIX_MPATH_H_
#define	_NET_RADIX_MPATH_H_

#ifdef _KERNEL
/*
 * Radix tree API with multipath support
 */
struct route;
struct rtentry;
struct sockaddr;
int	rn_mpath_capable(struct radix_node_head *);
struct radix_node *rn_mpath_next(struct radix_node *);
#ifndef __QNXNTO__
int rn_mpath_count(struct radix_node *);
#else
int rn_mpath_count(struct radix_node *, void *hint, u_long);
#endif
struct rtentry *rt_mpath_matchgate(struct rtentry *, const struct sockaddr *);
#ifdef __OpenBSD__
int rt_mpath_conflict(struct radix_node_head *, struct rtentry *,
	struct sockaddr *, int);
#else
int rt_mpath_conflict(struct radix_node_head *, struct rtentry *,
	const struct sockaddr *);
#endif
#ifndef __QNXNTO__
void rtalloc_mpath(struct route *, int);
#else
#ifndef QNX_MFIB
void rtalloc_mpath(struct route *, u_int32_t, void*);
#else
void rtalloc_mpath(struct route *, u_int32_t, void*, int);
#endif
#endif
struct radix_node *rn_mpath_lookup(void *, void *, struct radix_node_head *);
#ifdef __FreeBSD__
int	rn4_mpath_inithead(void **, int);
int	rn6_mpath_inithead(void **, int);
#else
int	rn_mpath_inithead(void **, int);
#endif

#ifdef __FreeBSD__
/* for compatibility with NetBSD */
#define rn_p rn_parent
#define rn_b rn_bit
#endif

#endif

#endif /* _NET_RADIX_MPATH_H_ */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/socket/public/net/radix_mpath.h $ $Rev: 680336 $")
#endif
