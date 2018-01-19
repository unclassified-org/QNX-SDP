/*	$NetBSD: ipip_var.h,v 1.3 2005/12/10 23:44:08 elad Exp $	*/
/*	$FreeBSD: src/sys/netipsec/ipip_var.h,v 1.1.4.1 2003/01/24 05:11:35 sam Exp $	*/
/*	$OpenBSD: ip_ipip.h,v 1.5 2002/06/09 16:26:10 itojun Exp $ */
/*
 * The authors of this code are John Ioannidis (ji@tla.org),
 * Angelos D. Keromytis (kermit@csd.uch.gr) and
 * Niels Provos (provos@physnet.uni-hamburg.de).
 *
 * The original version of this code was written by John Ioannidis
 * for BSD/OS in Athens, Greece, in November 1995.
 *
 * Ported to OpenBSD and NetBSD, with additional transforms, in December 1996,
 * by Angelos D. Keromytis.
 *
 * Additional transforms and features in 1997 and 1998 by Angelos D. Keromytis
 * and Niels Provos.
 *
 * Additional features in 1999 by Angelos D. Keromytis.
 *
 * Copyright (C) 1995, 1996, 1997, 1998, 1999 by John Ioannidis,
 * Angelos D. Keromytis and Niels Provos.
 * Copyright (c) 2001, Angelos D. Keromytis.
 *
 * Permission to use, copy, and modify this software with or without fee
 * is hereby granted, provided that this entire notice is included in
 * all copies of any software which is or includes a copy or
 * modification of this software.
 * You may use this code under the GNU public license if you so wish. Please
 * contribute changes back to the authors under this freer than GPL license
 * so that we may further the use of strong encryption without limitations to
 * all.
 *
 * THIS SOFTWARE IS BEING PROVIDED "AS IS", WITHOUT ANY EXPRESS OR
 * IMPLIED WARRANTY. IN PARTICULAR, NONE OF THE AUTHORS MAKES ANY
 * REPRESENTATION OR WARRANTY OF ANY KIND CONCERNING THE
 * MERCHANTABILITY OF THIS SOFTWARE OR ITS FITNESS FOR ANY PARTICULAR
 * PURPOSE.
 */

#ifndef _NETINET_IPIP_H_INCLUDED
#define _NETINET_IPIP_H_INCLUDED

#ifndef _INTTYPES_H_INCLUDED
#include <inttypes.h>
#endif

/*
 * IP-inside-IP processing.
 * Not quite all the functionality of RFC-1853, but the main idea is there.
 */

struct ipipstat
{
    uint64_t	ipips_ipackets;		/* total input packets */
    uint64_t	ipips_opackets;		/* total output packets */
    uint64_t	ipips_hdrops;		/* packet shorter than header shows */
    uint64_t	ipips_qfull;
    uint64_t   ipips_ibytes;
    uint64_t   ipips_obytes;
    uint64_t	ipips_pdrops;		/* packet dropped due to policy */
    uint64_t	ipips_spoof;		/* IP spoofing attempts */
    uint64_t   ipips_family;		/* Protocol family mismatch */
    uint64_t   ipips_unspec;            /* Missing tunnel endpoint address */
};

#ifdef _KERNEL
extern	int ipip_allow;
extern	struct ipipstat ipipstat;
#endif /* _KERNEL */
#endif /* !_NETINET_IPIP_H_INCLUDED */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/socket/public/netipsec/ipip_var.h $ $Rev: 680336 $")
#endif
