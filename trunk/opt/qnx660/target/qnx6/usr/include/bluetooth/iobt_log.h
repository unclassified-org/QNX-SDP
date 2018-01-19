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
#ifndef _IOBT_LOG_H_INCLUDED
#define _IOBT_LOG_H_INCLUDED

#include <stdarg.h>
#include <sys/slog.h>
#include <sys/slogcodes.h>

__BEGIN_DECLS

#ifndef _SLOGC_IOBT
#define _SLOGC_IOBT _SLOG_SETCODE(28, 0)
#endif

extern int iobt_log_init(int fd, int level);
extern int iobt_logv(int level, char const *format, va_list arg);
extern int iobt_log(int level, char const *format, ...);

extern int iobt_err(char const *format, ...);
#define    iobt_err(format, args...) do { iobt_log( _SLOG_ERROR,format, ##args ); } while(0)

extern int iobt_warn(char const *format, ...);
#define    iobt_warn(format, args...) do { iobt_log( _SLOG_WARNING,format, ##args ); } while(0)

extern int iobt_info(char const *format, ...);
#define    iobt_info(format, args...) do { iobt_log( _SLOG_INFO,format, ##args ); } while(0)

extern int iobt_debug(char const *format, ...);
#define    iobt_debug(format, args...) do { iobt_log( _SLOG_DEBUG1,format, ##args ); } while(0)

extern int iobt_logv_long(int fd, int optcode, int level, char const *format, va_list arg);
extern int iobt_log_long(int fd, int optcode, int level, char const *format, ...);

extern int iobt_err_long(int fd, int optcode, char const *format, ...);
#define    iobt_err_long(fd, optcode, format, args...) do { iobt_log_long(fd, optcode, _SLOG_ERROR,format, ##args ); } while(0)

extern int iobt_warn_long(int fd, int optcode, char const *format, ...);
#define    iobt_warn_long(fd, optcode, format, args...) do { iobt_log_long(fd, optcode, _SLOG_WARNING,format, ##args ); } while(0)

extern int iobt_info_long(int fd, int optcode, char const *format, ...);
#define    iobt_info_long(fd, optcode, format, args...) do { iobt_log_long(fd, optcode, _SLOG_INFO,format, ##args ); } while(0)

extern int iobt_debug_long(int fd, int optcode, char const *format, ...);
#define    iobt_debug_long(fd, optcode, format, args...) do { iobt_log_long(fd, optcode, _SLOG_DEBUG1,format, ##args ); } while(0)

__END_DECLS

#endif


#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/iobt/public/bluetooth/iobt_log.h $ $Rev: 725214 $")
#endif
