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





/*
 *      ado_debug.c
 *	    - Manifests to assist in the debugging of the ado drivers.
 */

#ifndef _ADO_DEBUG_H_INCLUDED_
#define _ADO_DEBUG_H_INCLUDED_

#define DB_LVL_DRIVER		(1<<0)
#define DB_LVL_CONTROL		(1<<1)
#define DB_LVL_PCM			(1<<2)
#define DB_LVL_MIXER		(1<<3)
#define DB_LVL_IO_ADO		(1<<4)
#define DB_LVL_RESMGR		(1<<5)
#define DB_LVL_POWER		(1<<6)
#define DB_LVL_MISC			(1<<7)
#define DB_LVL_CODEC		(1<<8)
#define DB_LVL_INTERRUPT	(1<<30)
#define DB_LVL_MEMORY		(1<<31)

#define ado_debug(lvl, ...)	  if (global_options.db_lvl & lvl)	ado_error(__VA_ARGS__)


#define SND_PCM_LOGGING_ENABLE_PCM_LOGGING		0
#define SND_PCM_LOGGING_DISABLE_PCM_LOGGING		1
#define SND_PCM_LOGGING_DUMP_STATE				2
#define SND_PCM_LOGGING_SET_VERBOSITY			3
#define SND_PCM_LOGGING_CLEANUP					4

typedef enum {
    LOGGING_UNKNOWN = 1,
    LOGGING_PREMIX,
    LOGGING_POSTMIX,
    LOGGING_PREPROCESSING
} logging_t;

/*** function prototypes ****/

/* debug.c */
void ado_error ( const char *format , ...);
void ado_breakpoint ( int where );
void ado_trace ( int code , const char *format , ...);

#endif /* _ADO_DEBUG_H_INCLUDED_ */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/services/audio/public/include/ado_debug.h $ $Rev: 680334 $")
#endif
