/*
 * $QNXLicenseC:
 * Copyright 2011, QNX Software Systems. All Rights Reserved.
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

#ifndef IOBT_UTILS_H_
#define IOBT_UTILS_H_

#include <sys/iofunc.h>

/**
 * Utility function that sets the effective user and group id
 * Initially will set the euid, if fails will abort
 * If successful will set the egid
 *
 * @param uid - the new euid to set the process to
 * @param gid - the new egid to set the process to
 * @return int - returns EOK if successful otherwise the error code returned by seteuid or setegid
 */
int iobt_set_euser_egroup_id(int uid, int gid);

/**
 * Utility function that verifies that the remote calling function
 * has permissions to access the specific method.  Checks that the ioflag
 * passed in has read and write permissions
 * If an error occurs will log the error within slog info with the function name passed in
 *
 * @param ocb - pointer to the ocbt struct to access the ioflag
 * @param func - the function name of the caller
 * @return int - returns EOK if successful otherwise an error message of EPERM
 */
int _iobt_verify_permissions(iofunc_ocb_t *ocb, const char *func);
#define iobt_verify_permissions(a) _iobt_verify_permissions( a, __FUNCTION__)

#endif /* UTILS_H_ */


#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/iobt/public/bluetooth/iobt_utils.h $ $Rev: 725214 $")
#endif
