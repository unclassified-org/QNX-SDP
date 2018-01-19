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

/*	$NetBSD: ipsec_var.h,v 1.4 2005/12/10 23:44:08 elad Exp $ */
/*	$FreeBSD: src/sys/netipsec/ipsec.h,v 1.2.4.2 2004/02/14 22:23:23 bms Exp $	*/

/*-
 * Copyright (c) 2002, 2003 Sam Leffler, Errno Consulting
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
 *
 * THIS SOFTWARE IS PROVIDED BY THE AUTHOR AND CONTRIBUTORS ``AS IS'' AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
 * OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
 * SUCH DAMAGE.
 *
 * $FreeBSD: src/tools/tools/crypto/ipsecstats.c,v 1.1.4.1 2003/06/03 00:13:13 sam Exp $
 */

#ifndef _NETIPSEC_IPSEC_VAR_H_INCLUDED
#define _NETIPSEC_IPSEC_VAR_H_INCLUDED

#ifndef _INTTYPES_H_INCLUDED
#include <inttypes.h>
#endif

/* statistics for ipsec processing */
struct newipsecstat {
	uint64_t ips_in_polvio;	/* input: sec policy violation */
	uint64_t ips_out_polvio;	/* output: sec policy violation */
	uint64_t ips_out_nosa;		/* output: SA unavailable  */
	uint64_t ips_out_nomem;	/* output: no memory available */
	uint64_t ips_out_noroute;	/* output: no route available */
	uint64_t ips_out_inval;	/* output: generic error */
	uint64_t ips_out_bundlesa;	/* output: bundled SA processed */
	uint64_t ips_mbcoalesced;	/* mbufs coalesced during clone */
	uint64_t ips_clcoalesced;	/* clusters coalesced during clone */
	uint64_t ips_clcopied;		/* clusters copied during clone */
	uint64_t ips_mbinserted;	/* mbufs inserted during makespace */
#if defined(__NetBSD__) || defined(__QNXNTO__)
	uint64_t ips_spdcache_lookup;
	uint64_t ips_spdcache_miss;
#endif /* __NetBSD__  || __QNXNTO__ */

	/*
	 * Temporary statistics for performance analysis.
	 */
	/* See where ESP/AH/IPCOMP header land in mbuf on input */
	uint64_t ips_input_front;
	uint64_t ips_input_middle;
	uint64_t ips_input_end;

};

#ifdef _KERNEL
/*
 * XXX JRS FIXME: later replace NetBSD sourcecode with an IPSECSTAT_POLVIO() macro.
 * for now, map the old fields to the new fields.  */
#define ipsecstat newipsecstat

#define in_polvio ips_in_polvio
#define out_polvio ips_out_polvio
#define out_inval ips_out_inval
#endif /*_KERNEL*/

/*
 * Definitions for IPsec & Key sysctl operations.
 */
/*
 * Names for IPsec & Key sysctl objects
 */
#define IPSECCTL_STATS			1	/* KAME compat stats */
#define IPSECCTL_DEF_POLICY		2
#define IPSECCTL_DEF_ESP_TRANSLEV	3	/* int; ESP transport mode */
#define IPSECCTL_DEF_ESP_NETLEV		4	/* int; ESP tunnel mode */
#define IPSECCTL_DEF_AH_TRANSLEV	5	/* int; AH transport mode */
#define IPSECCTL_DEF_AH_NETLEV		6	/* int; AH tunnel mode */
#if 0	/* obsolete, do not reuse */
#define IPSECCTL_INBOUND_CALL_IKE	7
#endif
#define	IPSECCTL_AH_CLEARTOS		8
#define	IPSECCTL_AH_OFFSETMASK		9
#define	IPSECCTL_DFBIT			10
#define	IPSECCTL_ECN			11
#define	IPSECCTL_DEBUG			12
#define	IPSECCTL_ESP_RANDPAD		13
#ifndef __QNXNTO__
#define IPSECCTL_MAXID			14
#else
#define IPSECCTL_GLOBALPRIVATEINTERFACE 14
#define IPSECCTL_BYPASS			15
#define IPSECCTL_MAXID			16
#endif

#ifndef __QNXNTO__
#define IPSECCTL_NAMES { \
	{ 0, 0 }, \
	{ 0, 0 }, \
	{ "def_policy", CTLTYPE_INT }, \
	{ "esp_trans_deflev", CTLTYPE_INT }, \
	{ "esp_net_deflev", CTLTYPE_INT }, \
	{ "ah_trans_deflev", CTLTYPE_INT }, \
	{ "ah_net_deflev", CTLTYPE_INT }, \
	{ 0, 0 }, \
	{ "ah_cleartos", CTLTYPE_INT }, \
	{ "ah_offsetmask", CTLTYPE_INT }, \
	{ "dfbit", CTLTYPE_INT }, \
	{ "ecn", CTLTYPE_INT }, \
	{ "debug", CTLTYPE_INT }, \
	{ "esp_randpad", CTLTYPE_INT }, \
}
#else
#define IPSECCTL_NAMES { \
	{ 0, 0 }, \
	{ 0, 0 }, \
	{ "def_policy", CTLTYPE_INT }, \
	{ "esp_trans_deflev", CTLTYPE_INT }, \
	{ "esp_net_deflev", CTLTYPE_INT }, \
	{ "ah_trans_deflev", CTLTYPE_INT }, \
	{ "ah_net_deflev", CTLTYPE_INT }, \
	{ 0, 0 }, \
	{ "ah_cleartos", CTLTYPE_INT }, \
	{ "ah_offsetmask", CTLTYPE_INT }, \
	{ "dfbit", CTLTYPE_INT }, \
	{ "ecn", CTLTYPE_INT }, \
	{ "debug", CTLTYPE_INT }, \
	{ "esp_randpad", CTLTYPE_INT }, \
	{ "globalprivateinterface", CTLTYPE_STRING }, \
	{ "allow_bypass", CTLTYPE_INT }, \
}
#endif

#define IPSEC6CTL_NAMES { \
	{ 0, 0 }, \
	{ 0, 0 }, \
	{ "def_policy", CTLTYPE_INT }, \
	{ "esp_trans_deflev", CTLTYPE_INT }, \
	{ "esp_net_deflev", CTLTYPE_INT }, \
	{ "ah_trans_deflev", CTLTYPE_INT }, \
	{ "ah_net_deflev", CTLTYPE_INT }, \
	{ 0, 0 }, \
	{ 0, 0 }, \
	{ 0, 0 }, \
	{ 0, 0 }, \
	{ "ecn", CTLTYPE_INT }, \
	{ "debug", CTLTYPE_INT }, \
	{ "esp_randpad", CTLTYPE_INT }, \
}

#endif /* !_NETIPSEC_IPSEC_VAR_H_INCLUDED */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/socket/public/netipsec/ipsec_var.h $ $Rev: 709466 $")
#endif
