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



#ifndef __AOI_ERRLOG_H__
#define __AOI_ERRLOG_H__

#include <stdarg.h>
#ifndef __CYGWIN__
#include <sys/slog.h>
#include <sys/slogcodes.h>
#else
#include <sys/cdefs.h>
#define _SLOG_SHUTDOWN 0
#define _SLOG_CRITICAL 1
#define _SLOG_ERROR    2
#define _SLOG_WARNING  3
#define _SLOG_NOTICE   4
#define _SLOG_INFO     5
#define _SLOG_DEBUG1   6
#define _SLOG_DEBUG2   7
#endif

__BEGIN_DECLS

typedef enum AOErrorLevel {
	AO_LOG_SHUTDOWN = _SLOG_SHUTDOWN,  /* 0 Shut down the system NOW. eg: for OEM use */
	AO_LOG_CRITICAL = _SLOG_CRITICAL,  /* 1 Unexpected unrecoverable error. eg: hard disk error */
	AO_LOG_ERROR    = _SLOG_ERROR,     /* 2 Unexpected recoverable error. eg: needed to reset a hw controller */
	AO_LOG_WARNING  = _SLOG_WARNING,   /* 3 Expected error. eg: parity error on a serial port */
	AO_LOG_NOTICE   = _SLOG_NOTICE,    /* 4 Warnings. eg: Out of paper */
	AO_LOG_INFO     = _SLOG_INFO,      /* 5 Information. eg: Printing page 3 */
	AO_LOG_DEBUG1   = _SLOG_DEBUG1,    /* 6 Debug messages eg: Normal detail */
	AO_LOG_DEBUG2   = _SLOG_DEBUG2,    /* 7 Debug messages eg: Fine detail */
} AOErrorLevel_t;

#if ! defined(AO_LOGLVL)
 #if defined(NDEBUG)
  #define AO_LOGLVL AO_LOG_INFO
 #else
  #define AO_LOGLVL AO_LOG_DEBUG2
 #endif
#endif

#define AO_LOGLVL_ENABLED( level ) ( (level) <= AO_LOGLVL )

#if defined(__GNUC__)
  #define AO_IS_PRINTFLIKE( fmt, var ) __attribute__((format(__printf__,fmt,var)))
#else
  #define AO_IS_PRINTFLIKE( fmt, var )
#endif

void AO_IS_PRINTFLIKE(2,3) AoLog( AOErrorLevel_t level, const char *fmt, ... );
void AoLogv( AOErrorLevel_t level, const char *fmt, va_list ap );

#define AO_LOGV( level, fmt, ap ) ( AO_LOGLVL_ENABLED(level)  ? AoLogv( level, fmt, ap ) : (void)0 )
#if defined(__cplusplus)
 static inline void AO_LOG( AOErrorLevel_t level, const char *fmt, ... ) {
	if ( AO_LOGLVL_ENABLED(level) ) {
		va_list ap;
		va_start( ap, fmt );
		AoLogv( level, fmt, ap );
		va_end( ap );
    }
 }
#else
 #define AO_LOG( level, ... )     ( AO_LOGLVL_ENABLED(level) ? AoLog( level, __VA_ARGS__ ) : (void)0 )

 #define AO_STRINGIZE( arg ) #arg
 #define AO_EXPAND( arg ) AO_STRINGIZE( arg )

 #define AO_DEBUG1( ... )   AO_LOG( AO_LOG_DEBUG1, __FILE__ ":" AO_EXPAND(__LINE__) ": " __VA_ARGS__ )
 #define AO_DEBUG2( ... )   AO_LOG( AO_LOG_DEBUG2, __FILE__ ":" AO_EXPAND(__LINE__) ": " __VA_ARGS__ )
 #define AO_DEBUG           AO_DEBUG1
#endif

typedef void AoLogger_t( AOErrorLevel_t level, const char *fmt, va_list ap );

AoLogger_t *AoSetLogger( AoLogger_t *newlogger );

__END_DECLS

#endif

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/aoi/public/aoi/aoi_errlog.h $ $Rev: 715118 $")
#endif
