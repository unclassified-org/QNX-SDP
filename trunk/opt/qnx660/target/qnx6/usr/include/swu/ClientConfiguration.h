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

#ifndef _SWU_CLIENTCONFIGURATION_H
#define _SWU_CLIENTCONFIGURATION_H

#include <stdbool.h>
#include <swu/Common.h>

/**
 * @defgroup ClientConfiguration ClientConfiguration
 * @brief The interface for the update client configuration
 * @details The ClientConfiguration interface provides a set of functions that provide access
 * to the various configuration options of the update client. The UpdateClient contains only one
 * configuration.
 */

/**
 * @addtogroup ClientConfiguration
 * @{
 */

/**
 * @brief Returns the unique ID for the UpdateClient
 * @details The UpdateClient is identified by an ID that is set when the swu library was initialized.
 * This ID is meant to uniquely identify this UpdateClient from any other UpdateClient.
 * One use for this ID could be for a unique identifier to use when reporting installation
 * details to a reporting server.
 * @par Category
 * Immediate Execution
 * @param[out] id The returned client ID
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_NOT_INITIALIZED if the library was not initialized
 *  - SWU_RESULT_INVALID_ARGUMENT if the argument was invalid
 *  - SWU_RESULT_ERROR for all other errors
 */
swu_result_t swu_client_configuration_get_id(swu_client_id_t *id);

/**
 * @brief Determines if local updates are enabled or not.
 * @details Gets whether or not local (e.g. USB or flash) software updates are enabled on the UpdateClient.
 * @par Category
 * Immediate Execution
 * @param[out] enabled True if enabled, false if disabled
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_NOT_INITIALIZED if the library was not initialized
 *  - SWU_RESULT_INVALID_ARGUMENT if the argument was invalid
 *  - SWU_RESULT_ERROR for all other errors
 */
swu_result_t swu_client_configuration_get_local_updates_enabled(bool *enabled);

/**
 * @brief Enables local (e.g. USB or flash) software updates on the UpdateClient
 * @details Used to enable local (e.g. USB or flash) software updates on the UpdateClient.
 * Note that this flag does not affect how the swu library operates.  Instead this is intended
 * to be used by implementers to signal to other code modules the state of local updates.
 * @par Category
 * Immediate Execution
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_NOT_INITIALIZED if the library was not initialized
 *  - SWU_RESULT_ERROR for all other errors
 */
swu_result_t swu_client_configuration_enable_local_updates(void);

/**
 * @brief Disables local (e.g. USB or flash) software updates on the update client
 * @details Used to disable local (e.g. USB or flash) software updates on the UpdateClient.
 * Note that this flag does not affect how the swu library operates.  Instead this is intended
 * to be used by implementers to signal to other code modules the state of local updates.
 * @par Category
 * Immediate Execution
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_NOT_INITIALIZED if the library was not initialized
 *  - SWU_RESULT_ERROR for all other errors
 */
swu_result_t swu_client_configuration_disable_local_updates(void);

/**
 * @brief Returns the grace period for accepting software updates
 * @details This call returns the current value of the grace period for accepting software updates.
 * The grace period for each Update is available via the swu_update_get_grace_period API.  If the
 * Update did not set a grace period, then this grace period time set in the client configuration time
 * will be used.
 * @par Category
 * Immediate Execution
 * @param[out] period The grace period in seconds
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_NOT_INITIALIZED if the library was not initialized
 *  - SWU_RESULT_INVALID_ARGUMENT if the argument was invalid
 *  - SWU_RESULT_ERROR for all other errors
 */
swu_result_t swu_client_configuration_get_update_grace_period(swu_timestamp_t *period);

/**
 * @brief Sets the grace period for accepting software updates
 * @details This function sets the default grace period for accepting software updates.
 * The grace period for each Update is available via the swu_update_get_grace_period API.  If the
 * Update did not set a grace period, then the value set by swu_client_configuration_set_update_grace_period
 * will be used as the grace period for that Update.
 * @par Category
 * Immediate Execution
 * @param[in] period The grace period
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_NOT_INITIALIZED if the library was not initialized
 *  - SWU_RESULT_ERROR for all other errors
 */
swu_result_t swu_client_configuration_set_update_grace_period(swu_timestamp_t period);

/**
 * @brief Gets the maximum number of retries allowed per software update
 * @details This function is used to return the max number of retries that are allowed after
 * an Update fails to be installed.
 * Note that currently the swu library doesn't use this value as part of the installation process.
 * @par Category
 * Immediate Execution
 * @param[out] max_retries Returns the maximum number of retries allowed
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_NOT_INITIALIZED if the library was not initialized
 *  - SWU_RESULT_INVALID_ARGUMENT if the argument was invalid
 *  - SWU_RESULT_ERROR for all other errors
 */
swu_result_t swu_client_configuration_get_max_update_retries(uint8_t *max_retries);

/**
 * @brief Sets the maximum number of retries allowed per software update
 * @details This function is used to set the max number of retries that are allowed after
 * an Update fails to be installed.
 * Note that currently the swu library doesn't use this value as part of the installation process.
 * @par Category
 * Immediate Execution
 * @param[in] max_retries The maximum number of retries
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_NOT_INITIALIZED if the library was not initialized
 *  - SWU_RESULT_ERROR for all other errors
 */
swu_result_t swu_client_configuration_set_max_update_retries(uint8_t max_retries);

/** @} */

#endif /* _SWU_CLIENTCONFIGURATION_H */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/services/swu/lib/core/public/swu/ClientConfiguration.h $ $Rev: 728101 $")
#endif
