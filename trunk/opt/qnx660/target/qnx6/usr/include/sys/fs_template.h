/*
 * $QNXLicenseC: $
 */
#ifndef __FS_TEMPLATE_H_INCLUDED
#define __FS_TEMPLATE_H_INCLUDED

#include <sys/platform.h>
#include <sys/types.h>

/* TODO: Place all on-disk structure definitions here */
#warning You must define your own values for file names
#define TEMPLATEFS_NAME_MAX 255
#define TEMPLATEFS_DIR_LINK_MAX USHRT_MAX
#define TEMPLATEFS_SYMLINK_MAX 255
#define TEMPLATEFS_PATH_MAX PATH_MAX
#define TEMPLATEFS_MAX_FSIZE UINT_MAX


#endif

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/services/blk/fs/template/public/sys/fs_template.h $ $Rev: 680830 $")
#endif
