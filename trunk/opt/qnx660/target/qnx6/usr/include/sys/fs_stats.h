/*
 * $QNXLicenseC:
 * Copyright 2009, QNX Software Systems. All Rights Reserved.
 *
 * You must obtain a written license from and pay applicable
 * license fees to QNX Software Systems before you may reproduce,
 * modify or distribute this software, or any work that includes
 * all or part of this software.   Free development licenses are
 * available for evaluation and non-commercial purposes.  For more
 * information visit http://licensing.qnx.com or email
 * licensing@qnx.com.
 *
 * This file may contain contributions from others.  Please review
 * this entire file for other proprietary rights or license notices,
 * as well as the QNX Development Suite License Guide at
 * http://licensing.qnx.com/license-guide/ for other information. $
 */
#ifndef __FS_STATS_H_INCLUDED
#define __FS_STATS_H_INCLUDED

#include <sys/types.h>
#include <stdint.h>

__BEGIN_DECLS

struct fs_stats {
	/* Version and Time statistics */
	uint32_t	s_version;				/* Lib version (BLKIO_VERSION)   */
	uint32_t	s_fsys_flags;			/* Fsys mount flags (_MOUNT_*)   */
	time_t		s_time_mount;			/* Time that file system mounted */
	time_t		s_time_clr;				/* Time that statistics cleared  */

	/* Buffer/DiskIO statistics    */
	uint64_t	s_buf_rphys;			/* Physical reads from disk    */
	uint64_t	s_buf_wphys;			/* Physical writes to disk     */
	uint64_t	s_buf_readahead;		/* Physical predictive reads   */
	uint64_t	s_buf_direct;			/* Physical direct-io accesses */
	uint64_t	s_buf_badblks;			/* Physical IO errors          */
	uint64_t	s_buf_rcache;			/* Cache reads (read hits)     */
	uint64_t	s_buf_wcache;			/* Cache writes (write-behind) */
	uint64_t	s_buf_mru;				/* MRU cache kB (GLOBAL)       */
	uint64_t	s_buf_mfu;				/* MFU cache kB (GLOBAL)       */

	/* Name cache statistics       */
	uint64_t	s_name_poshits;			/* Positive hits (usable hit)        */
	uint64_t	s_name_neghits;			/* Negative hits (usable hit)        */
	uint64_t	s_name_misses;			/* Misses (not in cache)             */
	uint64_t	s_name_uncacheable;		/* Names not considered (long/ambig) */
	uint64_t	s_name_stale;			/* Stale hits (GLOBAL)               */

	/* System call API statistics  */
	uint64_t	s_syscall_open;			/* Number of open()s        */
	uint64_t	s_syscall_stat;			/* Number of stat()s        */
	uint64_t	s_syscall_namei;		/* Number of name lookups   */
	uint64_t	s_syscall_read;			/* Number of read() calls   */
	uint64_t	s_syscall_write;		/* Number of write() calls  */
	uint64_t	s_syscall_devctl;		/* Number of devctl() calls */
	uint64_t	s_syscall_create;		/* Number of file creations */
	uint64_t	s_syscall_unlink;		/* Number of file deletions */

	/* Mapping cache statistics    */
	uint64_t	s_map_hits;				/* Usable hits           */
	uint64_t	s_map_misses;			/* Misses (not in cache) */

	/* Vnode statistics            */
	uint64_t	s_vnode_create;			/* Created vnode (unique file) */
	uint64_t	s_vnode_hits;			/* Usable vnode hit            */
	uint64_t	s_vnode_lock;			/* Vnodes locked               */
	uint64_t	s_vnode_recycle;		/* Reused vnode (GLOBAL)       */

	/* Slab/memory statistics      */
	uint64_t	s_slab_pg_map;			/* Memory pages mapped (GLOBAL)   */
	uint64_t	s_slab_pg_unmap;		/* Memory pages unmapped (GLOBAL) */

	/* Thread pool statistics      */
	uint64_t	s_tid_pool_create;		/* Threads created (GLOBAL)   */
	uint64_t	s_tid_pool_destroy;		/* Threads destroyed (GLOBAL) */

	/* New statistics added June, 2011 */
	uint64_t	s_buf_rcache_bytes;		/* Bytes read from the cache        */
	uint64_t	s_buf_wcache_bytes;		/* Bytes written into the cache     */
	uint64_t	s_buf_rphys_bytes;		/* Physical bytes read from disk    */
	uint64_t	s_buf_wphys_bytes;		/* Physical bytes written to disk   */
	uint64_t	s_buf_readahead_bytes;	/* Physical bytes from read ahead   */
	uint64_t	s_buf_direct_bytes;		/* Physical bytes R/W direct-io     */
	uint64_t    s_buf_io_count;         /* Count of IO requests created     */
	uint64_t    s_buf_io_bytes;         /* Total bytes of io requests       */

	uint64_t	s_syscall_read_bytes;	/* Number of bytes read via read()  */
	uint64_t	s_syscall_write_bytes;	/* Number of bytes wrote via write()*/

	uint64_t	s_syscall_trunc;		/* Number of truncate() calls       */
	uint64_t	s_syscall_rename;		/* Number of rename() calls         */
	uint64_t	s_syscall_owner;		/* chown/chgrp calls                */
	uint64_t	s_syscall_modes;		/* chmod calls                      */
	uint64_t	s_syscall_sync;			/* Number of sync() calls           */

	uint64_t	s_vfs_relearn;			/* Count of relearn events          */
	uint64_t	s_vfs_periodic;			/* Periodic call count into the fs  */

	uint64_t    s_msg_resume;           /* Number of message resume ops     */

	/* Spares (new statistics)     */
	uint64_t	s_spare[13];
};

/*  Note these must remain synchronized with the definitions in fs_stats.h */
#define DCMD_FSYS_STATISTICS_V1		__DIOF(_DCMD_FSYS,  11, struct fs_stats_v1)
#define DCMD_FSYS_STATISTICS_CLR_V1	__DIOF(_DCMD_FSYS,  12, struct fs_stats_v1)
struct fs_stats_v1 {
	/* Version and Time statistics */
	ulong_t		s_version;				/* Lib version (BLKIO_VERSION)   */
	time_t		s_time_mount;			/* Time that file system mounted */
	time_t		s_time_clr;				/* Time that statistics cleared  */

	/* Buffer cache statistics     */
	ulong_t		s_buf_rphys;			/* Physical reads from disk    */
	ulong_t		s_buf_wphys;			/* Physical writes to disk     */
	ulong_t		s_buf_readahead;		/* Physical predictive reads   */
	ulong_t		s_buf_direct;			/* Physical direct-io accesses */
	ulong_t		s_buf_badblks;			/* Physical IO errors          */
	ulong_t		s_buf_rcache;			/* Cache reads (read hits)     */
	ulong_t		s_buf_wcache;			/* Cache writes (write-behind) */
	ulong_t		s_buf_wipe;				/* Cache wipes prevented       */
	ulong_t		s_buf_protect;			/* Cache protection recycling  */

	/* Name cache statistics       */
	ulong_t		s_name_poshits;			/* Positive hits (usable hit)        */
	ulong_t		s_name_neghits;			/* Negative hits (usable hit)        */
	ulong_t		s_name_misses;			/* Misses (not in cache)             */
	ulong_t		s_name_stale;			/* Stale hits (GLOBAL)               */
	ulong_t		s_name_uncacheable;		/* Names not considered (long/ambig) */

	/* System call API statistics  */
	ulong_t		s_syscall_open;			/* Number of open() calls          */
	ulong_t		s_syscall_stat;			/* Number of stat() calls          */
	ulong_t		s_syscall_namei;		/* Number of namei() calls         */
	ulong_t		s_syscall_read;			/* Number of read() calls          */
	ulong_t		s_syscall_write;		/* Number of write() calls         */
	ulong_t		s_syscall_devctl;		/* Number of devctl() calls        */
	ulong_t		s_syscall_dir;			/* Number of mkdir()/rmdir() calls */

	/* Mapping cache statistics    */
	ulong_t		s_map_hits;				/* Usable hit          */
	ulong_t		s_map_misses;			/* Miss (not in cache) */

	/* Vnode statistics            */
	ulong_t		s_vnode_create;			/* Created vnode (unique file)     */
	ulong_t		s_vnode_hits;			/* Usable vnode hit                */
	ulong_t		s_vnode_recycle;		/* Reused vnode (GLOBAL)           */
	ulong_t		s_vnode_lock_uc;		/* Vnodes locked (uncontested)     */
	ulong_t		s_vnode_lock_c;			/* Vnodes locked (contested)       */

	/* Slab/memory statistics      */
	ulong_t		s_slab_pg_map;			/* Memory pages mapped (GLOBAL)   */
	ulong_t		s_slab_pg_unmap;		/* Memory pages unmapped (GLOBAL) */

	/* Spares (new statistics)     */
	ulong_t		s_spare[31];
};

__END_DECLS


#endif

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/services/blk/io-blk/public/sys/fs_stats.h $ $Rev: 680830 $")
#endif
