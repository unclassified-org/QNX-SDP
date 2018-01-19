/* $QNXLicenseC$ */

#ifndef __FS_HOOKS_H_INCLUDED
#define __FS_HOOKS_H_INCLUDED

/*  Version information for the hooks module.  This should be changed if the
	vfs_hooks_t structure is extended.  Checks in the file system will not load
	a version that is higher than what it is compiled against.
*/
#define FS_VFS_HOOKS_VERSION      3

/*  The reserved field is for file system implementation use, it should not be
	referenced by the hook module, only set to the following on creation.
*/
#define FS_VFS_HOOKS_RESERVED     0

typedef enum vfs_hook_op_e {
	FS_VFS_HOOK_OP_ENABLE = 0,
	FS_VFS_HOOK_OP_DISABLE,
    FS_VFS_HOOK_OP_MODIFY,
    FS_VFS_HOOK_OP_USER_DEFINED,
	FS_VFS_HOOK_OP_COUNT,
} vfs_hook_op_t;

/*  The following list is used for convenience in counting the number of hooks
	and as a named reference internally to the file system.  It should not be
	changed - only extended.
*/
enum vfs_hooks_e {
	FS_VFS_HOOK_INIT_PERMS,
	FS_VFS_HOOK_OPEN_PERMS,
	FS_VFS_HOOK_UNLINK_PERMS,
	FS_VFS_HOOK_RENAME_PERMS,
	FS_VFS_HOOK_LINK_PERMS,
	FS_VFS_HOOK_MKNOD_PERMS,
	FS_VFS_HOOK_READLINK_PERMS,
	FS_VFS_HOOK_READDIR_PERMS,
	FS_VFS_HOOK_CHOWN_PERMS,
	FS_VFS_HOOK_CHMOD_PERMS,
	FS_VFS_HOOK_CONTROL,
	FS_VFS_HOOKS_COUNT                      /* Total number of hooks */
};

/*  Bit mask of all hooks.
*/
#define FS_VFS_HOOK_MASK_ALL    ((1u << FS_VFS_HOOKS_COUNT)-1)

/*  Creates a bit mask from the FS_VFS_HOOK_* enumeration values.
*/
#define FS_VFS_HOOK_MASK(h)     ((1u << (h)) & FS_VFS_HOOK_MASK_ALL)

/*  Forward declaration.
*/
struct fs_hookctl_s;

/*  A hook module defines this structure for to describe the hooks that are
	implemented.  See the hooks module source for more details of each
	function.
*/
typedef struct vfs_hooks_s {
 	uint32_t version;                       /* Compatiblity version           */
	uint32_t reserved;                      /* Reserved for the file system   */
	uint32_t count;                         /* Number of function pointers    */
	void     *dll_private;                  /* For use by the hook module     */
	unsigned dll_version;                   /* DLL version information        */

	int (*pfn_vfs_hooks_initialize)(void);

	int (*pfn_vfs_hook_open_perms)(
		const char * mount,
		const resmgr_context_t *ctp,
		const io_open_t *msg,
		struct _client_info **creds);

	int (*pfn_vfs_hook_unlink_perms)(
		const char * mount,
		const resmgr_context_t *ctp,
		const io_unlink_t *msg,
		struct _client_info **creds);

	int (*pfn_vfs_hook_rename_perms)(
		const char * mount,
		const resmgr_context_t *ctp,
		const io_rename_t *msg,
		struct _client_info **creds);

	int (*pfn_vfs_hook_link_perms)(
		const char * mount,
		const resmgr_context_t *ctp,
		const io_link_t *msg,
		struct _client_info **creds);

	int (*pfn_vfs_hook_mknod_perms)(
		const char * mount,
		const resmgr_context_t *ctp,
		const io_mknod_t *msg,
		struct _client_info **creds);

	int (*pfn_vfs_hook_readlink_perms)(
		const char * mount,
		const resmgr_context_t *ctp,
		const io_readlink_t *msg,
		struct _client_info **creds);

	int (*pfn_vfs_hook_readdir_perms)(
		const char * mount,
		const resmgr_context_t *ctp,
		const io_read_t *msg,
		struct _client_info **creds);

	int (*pfn_vfs_hook_chown_perms)(
		const char * mount,
		const resmgr_context_t *ctp,
		const io_chown_t *msg,
		struct _client_info **creds,
		const char * name);

	int (*pfn_vfs_hook_chmod_perms)(
		const char * mount,
		const resmgr_context_t *ctp,
		const io_chmod_t *msg,
		struct _client_info **creds,
		const char * name);

	int (*pfn_vfs_hook_control)(
		const char * mount,
		const resmgr_context_t *ctp,
		struct fs_hookctl_s *pctl);

} vfs_hooks_t;

#endif /* __FS_HOOKS_H_INCLUDED */






#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/services/blk/io-blk/public/sys/fs_hooks.h $ $Rev: 724903 $")
#endif
