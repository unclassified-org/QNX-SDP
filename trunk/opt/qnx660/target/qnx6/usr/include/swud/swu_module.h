/*
 * $QNXLicenseC:
 * Copyright 2013, QNX Software Systems. All Rights Reserved.
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
 * http://licensing.qnx.com/license-guide/ for other information.
 * $
 */

#ifndef _SWU_MODULE_H
#define _SWU_MODULE_H

#include <swu/Common.h>

/**
 * @defgroup SWU_Module SWU_Module
 * @brief Functions for loading/unloading modules into swud.
 * @details This defines the interfaces that swud modules need to implement in order to
 * be loaded or unloaded by swud.
 */

/**
 * @addtogroup SWU_Module
 * @{
 */

#define _QUOTE(name) #name
#define _STR(macro) _QUOTE(macro)

#define SWU_MODULE_INITIALIZE swu_module_initialize
#define SWU_MODULE_INITIALIZE_NAME _STR(SWU_MODULE_INITIALIZE)

#define SWU_MODULE_SHUTDOWN swu_module_uninitialize
#define SWU_MODULE_SHUTDOWN_NAME _STR(SWU_MODULE_SHUTDOWN)

/**
 * @brief This function is called after the module is dynamically loaded by SWU.
 * @details This function is called by swud when the module is loaded.  The implementation should
 * only get the module initialized and any needed resources allocated then return as quickly
 * as possible so that it does not block swud.
 * @par Category
 * Immediate Execution
 * @param[in] argc The count of the argv
 * @param[in] argv Any extra arguments that were passed in during the load command.
 * @retval result An swu_result_t indicating if everything was successful or of there was some sort of error.
 */
swu_result_t SWU_MODULE_INITIALIZE(int argc, char *argv[]);

/**
 * @brief This function is called before the SWU process is done with the module.
 * @details When the SWU process is terminated, each module's shutdown function is called.
 * If there is nothing meaningful to be done on shutdown, implementing this function is optional.
 * Implementations of this function must be signal handler-safe.
 * @par Category
 * Immediate Execution
 * @retval result An swu_result_t indicating if everything was successful or of there was some sort of error.
 */
swu_result_t SWU_MODULE_SHUTDOWN(void);

/** @} */

#endif /* _SWU_MODULE_H */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/services/swu/services/swud/public/swud/swu_module.h $ $Rev: 728826 $")
#endif
