/*
 * $QNXLicenseC:
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



#ifndef __AOIMIME_H__
#define __AOIMIME_H__

#include <inttypes.h>
#include <sys/cdefs.h>

__BEGIN_DECLS

/* mime info structure */
#define AOMIMEINFO_VERSION 100
typedef struct
{
	char *mimetype;
	char *extensions;
	char *description;
} AOMimeInfo_t;

__END_DECLS

#endif

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/aoi/public/aoi/aoi_mime.h $ $Rev: 680336 $")
#endif
