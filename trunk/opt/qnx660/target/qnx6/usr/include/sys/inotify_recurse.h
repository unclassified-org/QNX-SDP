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

#ifndef _SYS_INOTIFY_RECURSE_H_
#define _SYS_INOTIFY_RECURSE_H_

#include <sys/cdefs.h>
#include <sys/types.h>
#include <stdint.h>

__BEGIN_DECLS


extern int inotify_recurse_init(void);
extern int inotify_recurse_read(int fd, void * buffer, size_t len);
extern int inotify_recurse_close(int fd);
extern int inotify_recurse_add_watch(int fd, const char * path, size_t pathlen, uint32_t mask);
extern int inotify_recurse_rm_watch(int fd, int32_t wd);


__END_DECLS

#endif /* #ifndef _SYS_INOTIFY_RECURSE_H_ */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/c/public/sys/inotify_recurse.h $ $Rev: 735298 $")
#endif
