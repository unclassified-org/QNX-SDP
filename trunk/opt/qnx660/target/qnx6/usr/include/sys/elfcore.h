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

#ifndef __SYS_ELFCORE_H_INCLUDED
#define __SYS_ELFCORE_H_INCLUDED

#include <stdio.h>
#include <zlib.h>

/**
 * Flags for elfcore
 */
#define ELFCORE_VERBOSE             0x00000001u /**< send debug prints to stdout */
#define ELFCORE_DUMP_CURTHREAD_ONLY 0x00000002u /**< only dump stack for faulting thread */
#define ELFCORE_DUMP_MEMORY         0x00000004u /**< dump contents of memory */
#define ELFCORE_DUMP_SHARED_MAP     0x00000008u /**< dump shared memory mappings */
#define ELFCORE_DUMP_PHYS_MAP       0x00000010u /**< dump physical memory mappings */

/**
 * Define the output file for elfcore; can be either a stdio or zlib stream.
 */
typedef struct _elfcore_file_t {
	int is_gzip;
	union {
		FILE *fp;
		gzFile gz;
	} u;
} elfcore_file_t;

/** 
 * Generate an ELF core dump for a given process
 * 
 * @param fd		file descriptor opened on process's proc/.../as file
 * @param fp        an open file to receive the core data
 * @param coresize	the maximum amount of data to be written
 * @param flags		controls the amount and kind of output
 * @return EOK on success, or an error code indicating the nature of the failure
 */
int elfcore(int fd, elfcore_file_t *fp, long coresize, unsigned flags);


#endif

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/elfcore/public/sys/elfcore.h $ $Rev: 680336 $")
#endif
