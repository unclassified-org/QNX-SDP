/*
 * $QNXLicenseC:
 * Copyright 2013, QNX Software Systems. All Rights Reserved.
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


#ifndef __AOI_CORE_H__
#include <aoi/aoi_core.h>
#endif


#ifndef __AOI_CRED_H__
#define __AOI_CRED_H__


__BEGIN_DECLS

#if !defined(AO_CRED_HANDLE_STRUCT_TAG)
	#define AO_CRED_HANDLE_STRUCT_TAG AOCredHandle
#endif

typedef struct AO_CRED_HANDLE_STRUCT_TAG AOCredHandle_t;

AOCredHandle_t *AoCredGet( void );
AOError_t *AoCredSet( AOCredHandle_t *handle, unsigned flags, AOError_t *errbuf );
AOError_t *AoCredUnset( AOCredHandle_t *handle, unsigned flags, AOError_t *errbuf );


typedef struct AOCredHandler {
	AOCredHandle_t *(*get)( void );
	AOError_t *(*set)( AOCredHandle_t *handle, unsigned flags, AOError_t *errbuf );
	AOError_t *(*unset)( AOCredHandle_t *handle, unsigned flags, AOError_t *errbuf );
} AOCredHandler_t;

void AoCredSetHandler( AOCredHandler_t const *handler );

__END_DECLS

#endif



#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/aoi/public/aoi/aoi_cred.h $ $Rev: 714431 $")
#endif
