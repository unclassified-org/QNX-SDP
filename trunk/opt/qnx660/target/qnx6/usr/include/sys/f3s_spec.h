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
** File: f3s_spec.h
**
** Description:
**
** This file contains the structure specification definitions for the f3s
** resource manager for Neutrino
**
** Ident: $Id: f3s_spec.h 680336 2012-11-27 03:17:04Z builder@qnx.com $
*/

/*
** Include Loop Prevention
*/

#ifndef __F3S_SPEC_H_INCLUDED
#define __F3S_SPEC_H_INCLUDED

#ifdef __F3S_SPEC_H_V3_INCLUDED
#error Cannot include old and new flash file system headers
#endif

#ifndef __PLATFORM_H_INCLUDED
#include <sys/platform.h>
#endif

/*
** Constant Definitions
*/

/* General Purpose Constants */

#define F3S_HEAD_POW2       4   /* power of two shift for head size */
#define F3S_OFFSET_HI_POW2  16  /* power of two shift for offset hi */
#define F3S_SYS_POW2        2   /* power of two shift for system extents */
#define F3S_SYS_ALIGN       4   /* alignment for system extents */

/* Signature Constants */

#define F3S_SIG_STRING  "QSSL_F3S"              /* signature string */
#define F3S_SIG_SIZE    strlen(F3S_SIG_STRING)

/* Revision Constants */

#define F3S_REV_MAJOR  2  /* major revision number */
#define F3S_REV_MINOR  1  /* minor revision number */

/* Default Root Constants */

#define F3S_ROOT_STRING  ""                           /* root string */
#define F3S_ROOT_SIZE    (strlen(F3S_ROOT_STRING)+1)

/* Name Definitions */

#define F3S_NAME_MAX     0xff   /* max name size for dirents */
#define F3S_PATH_MAX     0x400   /* max path length*/

#define F3S_NAME_ALIGN(LENGTH)\
\
  (((LENGTH)+(sizeof(_Uint32t)-1))&~(sizeof(_Uint32t)-1))

/* Unit Index Constants */

#define F3S_UNIT_INDEX   0  /* header index of unit info */
#define F3S_BOOT_INDEX   1  /* header index of boot info */
#define F3S_ROOT_INDEX   2  /* header index of root directory entry */
#define F3S_FIRST_INDEX  3  /* header index of first directory entry */

/* Unit Logical Constants */

#define F3S_FIRST_LOGI  1  /* first logical unit */

/* Boot Status Constants */

#define F3S_BOOT_NO_INDEX  0x0001  /* physical unit index not set for boot */

/* Unit Status Constants */

#define F3S_UNIT_MASK     0x003f  /* mask for unit status */
#define F3S_UNIT_ERASE    0x003f  /* unit was freshly erased */
#define F3S_UNIT_COUNT    0x001f  /* erase count was updated */
#define F3S_UNIT_SPARE    0x000f  /* unit is a spare */
#define F3S_UNIT_RECLAIM  0x0007  /* unit is in reclaim process */
#define F3S_UNIT_READY    0x0003  /* unit is ready for use */
#define F3S_UNIT_QUEUE    0x0001  /* unit is queued for erase */
#define F3S_UNIT_RETIRE   0x0000  /* unit is retired */
#define F3S_UNIT_NO_LOGI  0x0040  /* unit has no logical */
#define F3S_UNIT_NO_ZERO  0x0080  /* unit is not pre-programmed */

/* Extent Header Status Constants */

#define F3S_EXT_NO_WRITE  0x0001  /* extent text not written yet */
#define F3S_EXT_NO_NEXT   0x0002  /* no next extent exists */
#define F3S_EXT_NO_SUPER  0x0004  /* no supersede extent exists */
#define F3S_EXT_NO_SPLIT  0x0008  /* extent is complete */
#define F3S_EXT_MASK      0x0070  /* mask for condition access */
#define F3S_EXT_FREE      0x0070  /* extent header is free */
#define F3S_EXT_ALLOC     0x0030  /* extent header is allocated */
#define F3S_EXT_DELETE    0x0010  /* extent header and text is deleted */
#define F3S_EXT_BAD       0x0000  /* extent is bad */
#define F3S_EXT_LAST      0x0080  /* extent header is last in unit */
#define F3S_EXT_TYPE      0x0300  /* mask for type access */
#define F3S_EXT_FILE      0x0300  /* extent is part of a file */
#define F3S_EXT_DIR       0x0200  /* extent is part of a directory */
#define F3S_EXT_SYS       0x0100  /* extent is for file system */
#define F3S_EXT_XIP       0x0000  /* extent is xip aligned */
#define F3S_EXT_BASIC     0x0400  /* extent is basic in supersede chain */

/* Dirent Status Constants */

#define F3S_DIRENT_NO_STAT  0x0001  /* dirent has no stat */

/* Stat Status Constants */

#define F3S_STAT_NO_COMP  0x0001  /* file not compressed */

/*
** Structure Definitions
*/

/* Extent Pointer Definition */

typedef struct f3s_extptr_s
{
  _Uint16t logi_unit;  /* logical unit number */
  _Uint16t index;      /* header index in unit */
}
f3s_extptr_t;

/* File Stat Info Definition */

typedef struct f3s_stat_s
{
  _Uint16t status;       /* status of node */
  _Uint16t struct_size;  /* size of this structure */
  _Uint32t uid;          /* user id of file */
  _Uint32t gid;          /* group id of file */
  _Uint32t mtime;        /* time of last modification */
  _Uint32t ctime;        /* time of last status change */
  _Uint32t mode;         /* mode of file */
}
f3s_stat_t;

/* Directory Entry Info */

typedef struct f3s_dirent_s
{
  _Uint16t     status;       /* status of dirent */
  _Uint16t     struct_size;  /* size of this structure */
  f3s_extptr_t first;        /* first extent */
  _Uint8t      moves;        /* number of times file was moved */
  _Uint8t      namelen;      /* directory entry name length */
  _Uint16t     reserve;      /* this is reserved and should be 0xffff */
/*_Uint8t      name[];          directory entry name (aligned, max=255) */
/*f3s_stat_t   stat;            directory entry stat info (dword aligned) */
}
f3s_dirent_t;

/* Extent Header Info */

typedef struct f3s_head_s
{
  _Uint16t status;          /* status of header and text */
  _Uint8t reserve;          /* this is reserved and should be 0xff */
  _Uint8t text_offset_hi;   /* high byte of text offset (shift dep. on align) */
  _Uint16t text_offset_lo;  /* low word of text offset (shift dep. on align) */
  _Uint16t text_size;       /* text size max=65535 */
  f3s_extptr_t next;        /* next header in file or dir */
  f3s_extptr_t super;       /* superseding header for this header */
}
f3s_head_t;

/* Unit Header Info */

typedef struct f3s_unit_s
{
  _Uint16t     status;       /* status of unit */
  _Uint16t     struct_size;  /* size of this structure */
  _Uint8t      endian;       /* endianness of file system: 'L' or 'B' */
  _Uint8t      age;          /* age of logical unit */
  _Uint16t     logi;         /* logical unit number */
  _Uint16t     unit_pow2;    /* pow2 size of unit */
  _Uint16t     reserve;      /* this is reserved and should be 0xffff */
  _Uint32t     erase_count;  /* erase counter of physical unit */
  f3s_extptr_t boot;         /* boot information pointer */
}
f3s_unit_t;

/* Partition Boot Info */

typedef struct f3s_boot_s
{
  _Uint16t     status;       /* status of boot info */
  _Uint16t     struct_size;  /* size of this structure */
  _Uint8t      sig[8];       /* QSSL_F3S signature */
  _Uint8t      rev_major;    /* major revision number */
  _Uint8t      rev_minor;    /* minor revision number */
  _Uint16t     unit_index;   /* physical unit index */
  _Uint16t     unit_total;   /* total number of units */
  _Uint16t     unit_spare;   /* number of spare units */
  _Uint16t     align_pow2;   /* alignment of text for regular power of two */
  _Uint16t     xip_pow2;     /* alignment of text for xip power of two */
  f3s_extptr_t root;         /* root directory entry extent pointer */
}
f3s_boot_t;

#endif /* __F3S_SPEC_H_INCLUDED */

/*
** End
*/

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/fs-flash/public/sys/f3s_spec.h $ $Rev: 680336 $")
#endif
