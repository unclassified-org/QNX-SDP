/*
 * $QNXLicenseC:
 * Copyright 2012 QNX Software Systems. All Rights Reserved.
 *
 * This software is QNX Confidential Information subject to
 * confidentiality restrictions. DISCLOSURE OF THIS SOFTWARE IS
 * PROHIBITED UNLESS AUTHORIZED BY QNX SOFTWARE SYSTEMS IN WRITING.
 *
 * You must obtain a written license from and pay applicable license
 * fees to QNX Software Systems before you may reproduce, modify or
 * distribute this software, or any work that includes all or part
 * of this software. For more information visit
 * http://licensing.qnx.com or email licensing@qnx.com.
 *
 * This file may contain contributions from others.  Please review
 * this entire file for other proprietary rights or license notices,
 * as well as the QNX Development Suite License Guide at
 * http://licensing.qnx.com/license-guide/ for other information. $
 */
/*
 * fs_ability.h
 */

#ifndef FS_ABILITY_H_
#define FS_ABILITY_H_

#define BLK_ABILITY_MOUNTVFS    "vfs/mount-blk"
#define BLK_ABILITY_PREGROW     "vfs/pregrow"
#define BLK_ABILITY_RELEARN     "vfs/relearn"
#define BLK_ABILITY_STATSCLEAR  "vfs/stats-clear"


#endif /* FS_ABILITY_H_ */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/services/blk/io-blk/public/sys/fs_ability.h $ $Rev: 680830 $")
#endif
