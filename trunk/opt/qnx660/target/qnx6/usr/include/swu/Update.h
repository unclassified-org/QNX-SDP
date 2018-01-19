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

#ifndef _SWU_UPDATE_H
#define _SWU_UPDATE_H

#include <stdbool.h>
#include <stdint.h>
#include <swu/Common.h>

/**
 * @defgroup Update Update
 * @brief The interface for Update objects
 * @details The Update interface provides functions for the attributes and methods associated
 * with an Update object. An Update object contains all of the information about an Update from
 * when it is discovered to the point when it is installed by an UpdateTarget.
 */

/**
 * @addtogroup Update
 * @{
 */

/**
 * @brief A mask used to select certain update states for notification
 */
typedef swu_update_state_t swu_update_state_mask_t;

/**
 * @brief Structure containing notification callbacks for an Update
 * @details This structure is used to define all of the notifications that can be received
 * from an Update. Setting a notification callback to NULL will prevent that notifcation
 * from being sent.
 */
typedef struct {

    /**
     * @brief Callback function for notification of the progress of the software update installation or verification
     * @details This callback notifies its listener of a change in the progress of the software update installation.
     * @par Category
     * Immediate Execution
     * @param[in] update The handle to the update object
     * @param[in] percent The current completed percentage of the task
     * @param[in] progress_context The previously supplied context for this notification
     * @retval None
     */
    void (*progress)(swu_update_t update, swu_progress_t percent, void *progress_context);

    /**
     * @brief A pointer to user-supplied data that will be returned to the user when the installation or verification progress changes
     */
    void *progress_context;

    /**
     * @brief Callback function for notification of any change to the state of the Update object.
     * @details This callback is called whenever the state has changed for an Update object.
     * The state_changed callback will be called the first time a callback is registered with
     * swu_update_register_notifications.
     * @par Category
     * Immediate Execution
     * @param[in] update The handle to the update object
     * @param[in] new_state The new state of the update
     * @param[in] state_changed_context The previously supplied context for this notification
     * @retval None
     */
    void (*state_changed)(swu_update_t update, swu_update_state_t state, void *state_changed_context);

    /**
     * @brief Mask for setting which states to be notified of when the update transitions to those states
     */
    swu_update_state_mask_t state_mask;

    /**
     * @brief A pointer to user-supplied data that will be returned to the user when the update state changes
     */
    void *state_changed_context;

} swu_update_notifications_t;

/**
 * @brief Gets The unique identifier for the software update
 * @details This function is used to access the unique ID that was set when the Update
 * object was created.  There is no way to change the ID of the Update
 * after it has been created.
 *
 * The function calls swu_object_retain on the id string before successfully returning.
 * The caller is expected to call swu_object_release when it is done with the string.
 * @par Category
 * Immediate Execution
 * @param[in] update The handle to the update object
 * @param[out] id The unique identifier for the update
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if the specified arguments are invalid
 */
swu_result_t swu_update_get_id(swu_update_t update, swu_update_id_t *id);

/**
 * @brief Gets the name of the software update
 * @details This function is used to access the name of the software update that was set
 * when the Update object was created.  There is no way to change the name of the Update
 * after it has been created.
 *
 * The function calls swu_object_retain on the name before successfully returning.
 * The caller is expected to call swu_object_release when it is done with the string.
 * @par Category
 * Immediate Execution
 * @param[in] update The handle to the update object
 * @param[out] name A pointer the string
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if the specified arguments are invalid
 */
swu_result_t swu_update_get_name(swu_update_t update, swu_string_t *name);

/**
 * @brief Gets the short description of the software update
 * @details This function is used to access the short description of the software update
 * that was set when the Update object was created.  There is no way to change the
 * short description of the Update after it has been created.
 *
 * The function calls swu_object_retain on the description before successfully returning.
 * The caller is expected to call swu_object_release when it is done with the string.
 * @par Category
 * Immediate Execution
 * @param[in] update The handle to the update object
 * @param[out] description A pointer the string
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if the specified arguments are invalid
 */
swu_result_t swu_update_get_short_description(swu_update_t update, swu_string_t *description);

/**
 * @brief Gets the full description of the software update
 * @details This function is used to access the long description of the software update
 * that was set when the Update object was created.  There is no way to change the
 * long description of the Update after it has been created.
 *
 * The function calls swu_object_retain on the description before successfully returning.
 * The caller is expected to call swu_object_release when it is done with the string.
 * @par Category
 * Immediate Execution
 * @param[in] update The handle to the update object
 * @param[out] description A pointer the string
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if the specified arguments are invalid
 */
swu_result_t swu_update_get_description(swu_update_t update, swu_string_t *description);

/**
 * @brief Gets the version of the software update
 * @details This function is used to access the version of the software update
 * that was set when the Update object was created.  There is no way to change the
 * version of the Update after it has been created.
 *
 * The function calls swu_object_retain on the version before successfully returning.
 * The caller is expected to call swu_object_release when it is done with the string.
 * @par Category
 * Immediate Execution
 * @param[in] update The handle to the update object
 * @param[out] version A pointer the string
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if the specified arguments are invalid
 */
swu_result_t swu_update_get_version(swu_update_t update, swu_string_t *version);

/**
 * @brief Gets the base version of the software update.
 * @details This function is used to access the base version of the software update
 * that was set when the Update object was created.  There is no way to change the
 * version of the Update after it has been created.  This is inteded to be used by the
 * UpdateTarget implementation to validate if the UpdateTarget can install this update.
 *
 * The function calls swu_object_retain on the version before successfully returning.
 * The caller is expected to call swu_object_release when it is done with the string.
 * @par Category
 * Immediate Execution
 * @param[in] update The handle to the update object
 * @param[out] version A pointer the string
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if the specified arguments are invalid
 */
swu_result_t swu_update_get_base_version(swu_update_t update, swu_string_t *version);

/**
 * @brief Gets whether or not the user should be prompted to install the software update
 * @details This function is used to access the flag indicating if the HMI implementation
 * should prompt the user to accept the installation of this Update.  This flag is set when
 * the Update object was created.  There is no way to change the flag after the Update
 * has been created.
 * @par Category
 * Immediate Execution
 * @param[in] update The handle to the update object
 * @param[out] prompt Whether or not the user should be prompted
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if the specified arguments are invalid
 */
swu_result_t swu_update_get_prompt_to_install(swu_update_t update, bool *prompt);

/**
 * @brief Gets whether or not the software update can be deferred
 * @details This function is used to access the flag indicating if the HMI implementation
 * allows the user to defer the acceptance of this Update.  This flag is set when
 * the Update object was created.  There is no way to change the flag after the Update
 * has been created.
 * @par Category
 * Immediate Execution
 * @param[in] update The handle to the update object
 * @param[out] can_be_deferred Whether or not the update can be deferred
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if the specified arguments are invalid
 */
swu_result_t swu_update_get_can_be_deferred(swu_update_t update, bool *can_be_deferred);

/**
 * @brief Gets whether or not the software update can be declined
 * @details This function is used to access the flag indicating if the HMI implementation
 * allows the user to decline the installation of this Update.  This flag is set when
 * the Update object was created.  There is no way to change the flag after the Update
 * has been created.
 * @par Category
 * Immediate Execution
 * @param[in] update The handle to the update object
 * @param[out] can_be_declined Whether or not the update can be declined
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if the specified arguments are invalid
 */
swu_result_t swu_update_get_can_be_declined(swu_update_t update, bool *can_be_declined);

/**
 * @brief Gets the grace period for accepting the software update
 * @details This function is used to retrieve the grace period for the Update.  This period
 * can be set when the Update object was created.  The configuration grace period that
 * is set via the swu_client_configuration_set_update_grace_period API will be used if there
 * was no grace period set for this Update.
 * @par Category
 * Immediate Execution
 * @param[in] update The handle to the update object
 * @param[out] period The grace period
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if the specified arguments are invalid
 */
swu_result_t swu_update_get_grace_period(swu_update_t update, swu_timestamp_t *period);

/**
 * @brief Gets the maximum deferral period for accepting the software update
 * @details This function is used to retrieve the deferral period for the Update.  This period
 * is set when the Update object was created and there is no way to change it after the object
 * has been created.
 * @par Category
 * Immediate Execution
 * @param[in] update The handle to the update object
 * @param[out] period The deferral period
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if the specified arguments are invalid
 */
swu_result_t swu_update_get_defer_period(swu_update_t update, swu_timestamp_t *period);

/**
 * @brief Gets the location from where the software update will be installed
 * @details This function is used to access the location of the software update
 * path was set when the Update object was created.  There is no way to change the
 * path of the Update after it has been created.
 *
 * The function calls swu_object_retain on the location before successfully returning.
 * The caller is expected to call swu_object_release when it is done with the string.
 * @par Category
 * Immediate Execution
 * @param[in] update The handle to the update object
 * @param[out] location A pointer to the URI string
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if the specified arguments are invalid
 */
swu_result_t swu_update_get_install_source_location(swu_update_t update, swu_uri_t *location);

/**
 * @brief Gets the priority of the software update
 * @details This function is used to access the priority of the Update. The priority is set
 * when the Update object was created.  There is no way to change the priority after the Update
 * has been created.
 * @par Category
 * Immediate Execution
 * @param[in] update The handle to the update object
 * @param[out] priority The priority of the update
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if the specified arguments are invalid
 */
swu_result_t swu_update_get_priority(swu_update_t update, swu_update_priority_t *priority);

/**
 * @brief Gets the current state of the software update
 * @details This function returns the current state of the Update object.
 * @par Category
 * Immediate Execution
 * @param[in] update The handle to the update object
 * @param[out] state The current state of the update
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if the specified arguments are invalid
 *  - SWU_RESULT_ERROR for all other errors
 */
swu_result_t swu_update_get_state(swu_update_t update, swu_update_state_t *state);

/**
 * @brief Gets the date and time that the software update was released
 * @details This function is used to access the release timestamp of the Update. The
 * release timestamp is set when the Update object was created.  There is no way to
 * change the timestamp after the Update has been created.
 * @par Category
 * Immediate Execution
 * @param[in] update The handle to the update object
 * @param[out] timestamp The date and time of release
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if the specified arguments are invalid
 */
swu_result_t swu_update_get_release_timestamp(swu_update_t update, swu_timestamp_t *timestamp);

/**
 * @brief Gets the total size, in bytes, of the software update
 * @details This function is used to access the size of the Update. The size is set
 * when the Update object was created.  There is no way to change the size after the Update
 * has been created.
 * @par Category
 * Immediate Execution
 * @param[in] update The handle to the update object
 * @param[out] size The size of the update
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if the specified arguments are invalid
 */
swu_result_t swu_update_get_size(swu_update_t update, size_t *size);

/**
 * @brief Accesses the UpdateTarget that will install the software update
 * @details This function is used to get a handle to the UpdateTarget that will handle
 * the installation of the Update.  The UpdateTarget is determined by looking for registered
 * UpdateTargets that match the hardawre_id and vendor_id that was set when the Update was
 * created.
 *
 * Note that this function does not call swu_object_retain on the swu_target_t.
 * @par Category
 * Immediate Execution
 * @param[in] update The handle to the update object
 * @param[out] target The handle to the target object
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if the specified arguments are invalid
 *  - SWU_RESULT_NOT_FOUND if the associated UpdateTarget can not be found
 *  - SWU_RESULT_ERROR for all other errors
 */
swu_result_t swu_update_get_target(swu_update_t update, swu_target_t *target);

/**
 * @brief Retrieves the percent complete of the install phase
 * @details This function gets the percentage of the Update currently being installed
 * on the UpdateTarget.  When the Update is not in the SWU_UPDATE_STATE_INSTALLING state,
 * the value of this API is undetermined.
 * @brief Gets the percentage of the software update currently installed on the update target
 * @par Category
 * Immediate Execution
 * @param[in] update The handle to the update object
 * @param[out] percent_completed The percentage currently installed
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if the specified arguments are invalid
 *  - SWU_RESULT_ERROR for all other errors
 */
swu_result_t swu_update_get_install_percent_completed(swu_update_t update, swu_progress_t *percent_completed);

/**
 * @brief Retrieves the percent complete of the verification phase
 * @details This function gets the percentage of the Update currently being verified
 * on the UpdateTarget.  When the Update is not in the SWU_UPDATE_STATE_VERIFYING state,
 * the value of this API is undetermined.
 * @par Category
 * Immediate Execution
 * @param[in] update The handle to the update object
 * @param[out] percent_completed The percentage currently verified
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if the specified arguments are invalid
 *  - SWU_RESULT_ERROR for all other errors
 */
swu_result_t swu_update_get_verification_percent_completed(swu_update_t update, swu_progress_t *percent_completed);

/**
 * @brief Retrieves failure information for the Update object.
 * @details This function returns the most recent failure information for an Update object.  The
 * failure values will not be set until the Update object is in the SWU_UPDATE_STATE_INSTALL_FAILED
 * state.
 * @par Category
 * Immediate Execution
 * @param[in] update The handle to the update object
 * @param[out] info The latest failure information for the update.
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if the specified arguments are invalid
 *  - SWU_RESULTE_ERROR for any other errors
 */
swu_result_t swu_update_get_failure_info(swu_update_t update, swu_failure_info_t *info);

/**
 * @brief Gets the handle to the software update object that this software update is dependent on, if there is one
 * @details A software update can have a dependency on another software update, meaning it cannot
 * be installed until the update that it is dependent on is installed first. A software update can
 * only have one dependency, so if a software update is actually dependent on multiple other updates,
 * a single chain of updates is created.
 *
 * This API has not been implemented yet.
 * @par Example 1
 * There are 3 software updates A, B, and C. Update A depends on update B, and update B depends on update C. The dependency chain would be A -> B -> C.
 * @par Example 2
 * There are 3 software updates A, B, and C. Update A depends on both updates B and C, but updates B and C do not depend on each other. Two possible dependency chains are: A -> B -> C or A -> C -> B.
 * @par Category
 * Immediate Execution
 * @param[in] update The handle to the update object
 * @param[out] dependency The handle to the update object that this update is dependent on
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_API_NOT_AVAILABLE indicating that the API is not yet supported by the library
 */
swu_result_t swu_update_get_update_dependency(swu_update_t update, swu_update_t *dependency);

/**
 * @brief Retrieves the manifest ID
 * @details This function retrieves the manifest ID of the manifest that was used to generate
 * this Update object.  This is useful to determine which manifest was used to create an
 * Update object.
 * Immediate Execution
 * @param[in] update The handle to the update object
 * @param[out] manifest_id The ID of the manifest that was parsed for this object.
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if the specified arguments are invalid
 */
swu_result_t swu_update_get_manifest_id(swu_update_t update, swu_manifest_id_t *manifest_id);

/**
 * @brief Retrieves the pre-install command.
 * @details This function is used to return the re-install command for an Update object
 * The pre-install command is a command that the UpdateTarget should run run as part of the
 * prepare for install phase.  If no command was specified, the function will result in
 * SWU_RESULT_SUCCESS but the string returned will be empty.
 *
 * The function calls swu_object_retain on the command string before successfully returning.
 * The caller is expected to call swu_object_release when it is done with the string.
 * @par Category
 * Immediate Execution
 * @param[in] update The handle to the update object
 * @param[out] command Aswu_string_t that is the command a UpdateTarget should run during the prepare for update phase
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if the specified arguments are invalid
 */
swu_result_t swu_update_get_pre_install_command(swu_update_t update, swu_string_t *command);

/**
 * @brief Retrieves the post-install command.
 * @details This function is used to return the post-install command for an Update object
 * The post-install command is a command that the UpdateTarget should run after the update is installed.
 * If no command was specified, the function will result in SWU_RESULT_SUCCESS but the string pointed
 * at by command will be empty.
 *
 * The function calls swu_object_retain on the command string before successfully returning.  The caller
 * is expected to call swu_object_release when it is done with the string.
 * @par Category
 * Immediate Execution
 * @param[in] update The handle to the update object
 * @param[out] command Aswu_string_t that is the command a UpdateTarget should run after the update is installed
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if the specified arguments are invalid
 */
swu_result_t swu_update_get_post_install_command(swu_update_t update, swu_string_t *command);

/**
 * @brief Registers a set of notifications for an Update object
 * @details This function is used to register for notification from a particular Update object.
 * The notification data is not copied, meaning that the owner of the notifications can change
 * them at runtime, which is intended.  If this function is called multiple times with different
 * pointers to notification structs, then multiple sets of notifications are registered.
 * If the pointers are the same, then only the last set of notifications registered will end up being registered.
 *
 * The first time a notification structure is registered, the state_changed callback function
 * will be called in order to indicate the current state of the Update object.
 * @par Category
 * Immediate Execution
 * @param[in] update The handle to the update object
 * @param[in] notifications A pointer to the notification structure to register
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if the specified arguments are invalid
 *  - SWU_RESULTE_ERROR for any other errors
 */
swu_result_t swu_update_register_notifications(swu_update_t update, const swu_update_notifications_t *notifications);

/**
 * @brief Unregisters a set of notifications for an Update object
 * @details This function is used to unregister a notification from an Update object.  Once the function
 * returns a SWU_RESULT_SUCCESS, it is safe for the caller to get rid of the memory pointed at by
 * notifications if need be.
 * @par Category
 * Immediate Execution
 * @param[in] update The handle to the update object
 * @param[in] notifications A pointer to the notification structure to unregister
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_NOT_FOUND if the specified notifications structure was not found.
 *  - SWU_RESULT_INVALID_ARGUMENT if the specified arguments are invalid
 *  - SWU_RESULTE_ERROR for any other errors
 */
swu_result_t swu_update_unregister_notifications(swu_update_t update, const swu_update_notifications_t *notifications);

/**
 * @brief Accepts the software update for installing
 * @details This function is used to accept the installation of an Update.  If the swu library
 * is able to processes this request, the Update should transition to the SWU_UPDATE_STATE_INSTALLING
 * state.
 * @par Category
 * Immediate Execution
 * @param[in] update The handle to the update object
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if the specified arguments are invalid
 *  - SWU_RESULTE_ERROR for any other errors
 */
swu_result_t swu_update_accept_install(swu_update_t update);

/**
 * @brief Defers the software update installation for a specified amount of time, if allowed
 * @details This function is used to defer the installation of an Update.
 * @par Category
 * Immediate Execution
 * @param[in] update The handle to the update object
 * @param[in] defer_period The time period, in seconds, that the update should be deferred
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if the specified arguments are invalid
 *  - SWU_RESULTE_ERROR for any other errors
 */
swu_result_t swu_update_defer_install(swu_update_t update, swu_timestamp_t defer_period);

/**
 * @brief Declines the software update installation, if allowed
 * @details This function is used to decline the installation of an Update.  If the swu library
 * is able to processes this request, the Update should transition to the SWU_UPDATE_STATE_DECLINED
 * state.
 * @par Category
 * Immediate Execution
 * @param[in] update The handle to the update object
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if the specified arguments are invalid
 *  - SWU_RESULTE_ERROR for any other errors
 */
swu_result_t swu_update_decline_install(swu_update_t update);

/**
 * @brief Cancels the software update installation, if allowed
 * @details This function is used to cancel the installation of a particular Update on a UpdateTarget.
 * This API has not been implemented yet.
 * @par Category
 * Immediate Execution
 * @param[in] update The handle to the update object
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_API_NOT_AVAILABLE indicating that the API is not yet supported by the library
 */
swu_result_t swu_update_cancel_install(swu_update_t update);

/**
 * @brief Rolls back the software update to the previous version, if allowed
 * @details This function is used to rollback or uninstall a particular Update from the UpdateTarget.
 * This API has not been implemented yet.
 * @par Category
 * Immediate Execution
 * @param[in] update The handle to the update object
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_API_NOT_AVAILABLE indicating that the API is not yet supported by the library
 */
swu_result_t swu_update_rollback(swu_update_t update);

/**
 * @brief Compares an ID to the ID of the Update object
 * @details This function is used to compare an Update ID to an existing Update object.  This
 * function is useful when searching the UpdateList for a specific Update or any other case where
 * simply comparing the swu_update_t handle values is inadequate.
 * @par Category
 * Immediate Execution
 * @param[in] update The handle to the update object
 * @retval value indicating how the IDs compared:
 *  - A zero value indicates that the ID equals the ID of the update.
 *  - A value greater than zero indicates that the ID is greater than the ID of the update.
 *  - A value less than zero indicates the opposite.
 */
int32_t swu_update_compare_to_id(swu_update_t update, swu_update_id_t id);

/**
 * @brief Prints the Update object to a null-terminated string
 * @details Prints out as much of the Update object as possible as a null-terminated string
 * to the character buffer pointed to by output. Only up to len bytes will be placed into the
 * output buffer.  The data is outputted as a series of fields each on new lines like so:
 *      ID: UPDATE_ID
 *      Name: This Software Update
 *      Version: 00.00.01
 *      ...
 * @par Category
 * Immediate Execution
 * @param[in] update The handle to the update object
 * @param[in] output The buffer to output the string to
 * @param[in] len The length of the buffer
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if the specified arguments are invalid
 *  - SWU_RESULTE_ERROR for any other errors
 */
swu_result_t swu_update_to_string(swu_update_t update, char *output, size_t len);

/** @} */

#endif /* _SWU_UPDATE_H */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/services/swu/lib/core/public/swu/Update.h $ $Rev: 734054 $")
#endif
