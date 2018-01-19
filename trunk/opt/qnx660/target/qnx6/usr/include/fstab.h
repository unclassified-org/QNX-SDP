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

#ifndef _FSTAB_H_INCLUDED
#define _FSTAB_H_INCLUDED

#include <sys/cdefs.h>





#define FSTAB_RW        "rw"    /* read-write device */
#define FSTAB_RO        "ro"    /* read-only device */
#define FSTAB_OCB       "allservers"	/* send request to all servers */
#define FSTAB_IMPLIED   "implied"	/* The root entry was implied, not specified */
#define FSTAB_XX        "xx"    /* ignore totally */

#define NULL_ENTRY		"-"

#define _PATH_FSTAB		"/etc/fstab"

struct fstab {
        char    *fs_spec;       /* block special device name */
        char    *fs_file;       /* filesystem path prefix */
        char    *fs_vfstype;    /* type of filesystem */
        char    *fs_mntops;     /* comma separated mount options */
        char    *fs_type;       /* rw, ro, xx */
	int	init_flags;	/* Flags to OR in */
	int	init_mask;	/* Flags to AND out */
};

__BEGIN_DECLS
struct fstab *getfsent(void);
struct fstab *getfsspec(const char *);
struct fstab *getfsfile(const char *);
int setfsent(void);
void endfsent(void);
__END_DECLS

#endif /* !_FSTAB_H_INCLUDED */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/c/public/fstab.h $ $Rev: 680336 $")
#endif
