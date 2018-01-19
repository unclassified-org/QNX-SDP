/*
 * $QNXLicenseC:
 * Copyright 2012, QNX Software Systems. All Rights Reserved.
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

#ifndef _SYS_INOTIFY_EXT_H_
#define _SYS_INOTIFY_EXT_H_

#include <sys/cdefs.h>
#include <sys/types.h>
#include <stdint.h>

__BEGIN_DECLS


#define INOTIFY_ABILITY_QNX_EXT		"fsevmgr/qnxext"
#define INOTIFY_ABILITY_RECURSE		"fsevmgr/recurse"


extern int inotify_qnx_ext(int fd, uint32_t extensions);


/*  QNX extensions to the inotify interface.  These flags are passed to the
	handle returned from inotify_init() using devctl(DCMD_FSEVMGR_QNX_EXT,
	INOTIFY_QNX_EXT_xxx) to enable one or more QNX extensions.
*/
#define INOTIFY_QNX_EXT_FREESPACE		0x00000001	/* Free space notification */
#define INOTIFY_QNX_EXT_MOUNT			0x00000002	/* Mount notification */
#define INOTIFY_QNX_EXT_UNMOUNT			0x00000004	/* Unmount notification */
#define INOTIFY_QNX_EXT_RECURSE			0x00000008	/* Allow recursive inotify */
#define INOTIFY_QNX_EXT_BIND_ADD		0x80000000	/* Private - Notification for add binding */
#define INOTIFY_QNX_EXT_BIND_UPDATE		0x40000000	/* Private - Notification for update binding */
#define INOTIFY_QNX_EXT_MASK			0x0000000f  /* Extensions the caller can enable */


/*  Header used for all QNX extensions to the inotify interface
*/
typedef struct _inotify_qnx_ext_hdr {
	uint32_t	type;					/* One from the INOTIFY_QNX_EXT_xxx set */
	uint32_t	reserved;				/* Reserved - Set to zero */
} inotify_qnx_ext_hdr;


/*  Event format for INOTIFY_QNX_EXT_FREESPACE
*/
typedef struct {
	inotify_qnx_ext_hdr		hdr;		/* Header for the inotify QNX extensions */
	uint64_t				freespace;	/* Estimate of free space in bytes */
	uint32_t				namelen;	/* Length of the name */
	char 					name[0];	/* Zero terminated mount point */
} inotify_qnx_ext_freespace;


/*  Event format for INOTIFY_QNX_EXT_MOUNT and INOTIFY_QNX_EXT_UNMOUNT
*/
typedef struct {
	inotify_qnx_ext_hdr		hdr;		/* Header for the inotify QNX extensions */
	uint32_t				namelen;	/* Length of the name */
	char 					name[0];	/* Zero terminated mount point */
} inotify_qnx_ext_mount;


/*  Event format for INOTIFY_QNX_EXT_BIND_ADD and INOTIFY_QNX_EXT_BIND_UPDATE
*/
typedef struct {
	inotify_qnx_ext_hdr hdr;			/* Header for the inotify QNX extensions */
	int32_t parent_wd;					/* Watch descriptor for the parent */
	int32_t child_wd;					/* Watch descriptor for the child */
	char name[0];						/* Name associated with the child */
} inotify_qnx_ext_bind;


__END_DECLS

#endif /* #ifndef _SYS_INOTIFY_EXT_H_ */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/c/public/sys/inotify_ext.h $ $Rev: 735298 $")
#endif
