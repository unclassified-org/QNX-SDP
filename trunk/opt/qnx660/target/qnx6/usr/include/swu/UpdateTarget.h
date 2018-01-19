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
#ifndef _SWU_UPDATETARGET_H
#define _SWU_UPDATETARGET_H

#include <swu/Common.h>

/**
 * @defgroup UpdateTarget UpdateTarget
 * @brief The UpdateTarget is an abstraction used to get information about UpdateTargets
 * @details This group of UpdateTarget APIs are used by non-UpdateTarget code in order to access some
 * basic information about an UpdateTarget.  They are used to maintain the abstraction from the
 * UpdateTarget implementations and the rest of the code that is using the swu library.
 */

/**
 * \addtogroup UpdateTarget
 * @{
 */

/**
 * @brief Used to request the software version information from an UpdateTarget
 * @details This function can be used to query the information of an UpdateTarget.
 * This function call would cause the core library to call the UpdateTarget's registered get_info function.
 * @par Category
 * Immediate Execution
 * @param[in] id The ID for the UpdateTarget that was set by the UpdateClient during the call to swu_target_register
 * @param[out] info A pointer to a swu_target_sw_information_t where the software information will be copied to
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_INVALID_ARGUMENT if the specified target is invalid
 *  - Otherwise returns the value from the get_info function registered by the specified UpdateTarget
 */
swu_result_t swu_target_get_info(swu_target_t target, swu_target_sw_information_t *info);

/**
 * @brief Gets the assigned ID from the UpdateTarget object
 * @details This function is used to retrieve the ID that swu assigned to the UpdateTarget when the target
 * called swu_target_register.  The swu_target_id_t given to each UpdateTarget is unique, but is not unique
 * across power cycles.
 * @param[in] target The handle to the UpdateTarget object to get the ID of
 * @param[out] id A valid target_id on success
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if the specified target is invalid
 */
swu_result_t swu_target_get_id(swu_target_t target, swu_target_id_t *id);

/** @} */

#endif /* _SWU_UPDATETARGET_H */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/services/swu/lib/core/public/swu/UpdateTarget.h $ $Rev: 728101 $")
#endif
