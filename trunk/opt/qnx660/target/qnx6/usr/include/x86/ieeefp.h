/*	$NetBSD: ieeefp.h,v 1.2 1998/01/05 07:02:56 perry Exp $	*/

/* 
 * Written by J.T. Conklin, Apr 6, 1995
 * Public domain.
 */

#ifndef _I386_IEEEFP_H_
#define _I386_IEEEFP_H_

typedef int fp_except;
#define FP_X_INV	0x01	/* invalid operation exception */
#define FP_X_DNML	0x02	/* denormalization exception */
#define FP_X_DZ		0x04	/* divide-by-zero exception */
#define FP_X_OFL	0x08	/* overflow exception */
#define FP_X_UFL	0x10	/* underflow exception */
#define FP_X_IMP	0x20	/* imprecise (loss of precision) */

typedef enum {
    FP_RN=0,			/* round to nearest representable number */
    FP_RM=1,			/* round toward negative infinity */
    FP_RP=2,			/* round toward positive infinity */
    FP_RZ=3			/* round to zero (truncate) */
} fp_rnd;

#endif /* _I386_IEEEFP_H_ */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/m/public/x86/ieeefp.h $ $Rev: 680336 $")
#endif
