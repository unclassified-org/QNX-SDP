/*	$NetBSD: md5.h,v 1.9 2005/12/26 18:41:36 perry Exp $	*/

/*
 * This file is derived from the RSA Data Security, Inc. MD5 Message-Digest
 * Algorithm and has been modified by Jason R. Thorpe <thorpej@NetBSD.org>
 * for portability and formatting.
 */

/*
 * Copyright (C) 1991-2, RSA Data Security, Inc. Created 1991. All
 * rights reserved.
 *
 * License to copy and use this software is granted provided that it
 * is identified as the "RSA Data Security, Inc. MD5 Message-Digest
 * Algorithm" in all material mentioning or referencing this software
 * or this function.
 *
 * License is also granted to make and use derivative works provided
 * that such works are identified as "derived from the RSA Data
 * Security, Inc. MD5 Message-Digest Algorithm" in all material
 * mentioning or referencing the derived work.
 *
 * RSA Data Security, Inc. makes no representations concerning either
 * the merchantability of this software or the suitability of this
 * software for any particular purpose. It is provided "as is"
 * without express or implied warranty of any kind.
 *
 * These notices must be retained in any copies of any part of this
 * documentation and/or software.
 */

#ifndef __MD5_H_INCLUDED
#define __MD5_H_INCLUDED

#include <sys/cdefs.h>
#include <sys/types.h>
#include <inttypes.h>

#define MD5_DIGEST_LENGTH		16
#define	MD5_DIGEST_STRING_LENGTH	33

/* MD5 context. */
typedef struct MD5Context {
	uint32_t state[4];	/* state (ABCD) */
	uint32_t count[2];	/* number of bits, modulo 2^64 (lsb first) */
	unsigned char buffer[64]; /* input buffer */
} MD5_CTX;

__BEGIN_DECLS
void	MD5Init(MD5_CTX *);
void	MD5Update(MD5_CTX *, const unsigned char *, unsigned int);
void	MD5Final(unsigned char[MD5_DIGEST_LENGTH], MD5_CTX *);
#ifndef _KERNEL
char	*MD5End(MD5_CTX *, char *);
char	*MD5File(const char *, char *);
char	*MD5Data(const unsigned char *, unsigned int, char *);
#endif /* _KERNEL */
__END_DECLS

#endif /* __MD5_H_INCLUDED */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/io-pkt/sys/sys/md5.h $ $Rev: 680336 $")
#endif
