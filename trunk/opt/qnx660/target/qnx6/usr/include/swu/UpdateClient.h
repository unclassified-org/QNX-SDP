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
#ifndef _SWU_UPDATECLIENT_H
#define _SWU_UPDATECLIENT_H

#include <stdbool.h>
#include <stdarg.h>
#include <swu/Common.h>

/**
 * @defgroup UpdateClient UpdateClient
 * @brief Functions for interacting with the core APIs of the SWU library
 * @details The UpdateClient group of APIs are APIs that are used for working with the core set
 * of APIs for interacting with the library.
 */

/**
 * @addtogroup UpdateClient
 * @{
 */

/**
 * @brief Callback to iterate the contents of an UpdateList
 * @details This iterator callback function that is used to iterate the contents of an UpdateList.  When
 * swu_update_list_iterate is called, this callback function will be called once for each item in the UpdateList.
 * Finally it will be called one last time with a target argument value of NULL to indicate the end of the list.
 * @par Category
 * Immediate Execution
 * @param[in] update The handle to the current Update object in the list.   Will be NULL to indicate the end of the list.
 * @param[in] context A pointer that was set with the call to swu_update_list_iterate
 * @retval bool The function should return
 *  - true to continue itereating the list
 *  - false to stop iterating
 */
typedef bool (*swu_update_list_iterator_t)(swu_update_t update, void *context);

/**
 * @brief This structure defines the notification callback for changes to an UpdateList
 */
typedef struct {
    /**
     * @brief Callback function to indicate change in an UpdateList
     * @details This callback function is called whenever a change is made to an UpdateList. The
     * first time this structure is registered, it will be called to indicate the current contents of the list.
     * @par Category
     * Immediate Execution
     * @param[in] context A pointer that was set in this structure before registering the callback.
     * @retval None
     */
    void (*change_notifier)(swu_update_list_t list, void *context);

    /**
     * @brief A context pointer that will be used when the call to the change_notifer function pointer is made.
     */
    void *context;
} swu_update_list_notification_t;

/**
 * @brief Callback function to report out log messages from the core library
 * @details This callback function is registered with swu_client_set_logging_callback in order to receive
 * the log messages from the core library.  These messages could be errors, warnings or debug information.  The
 * callback function can use the level parameter in order to filter the message in some way.
 * @par Category
 * Immediate Execution
 * @param[in] level The severity level of the message
 * @param[in] message The null-terminated string containing the message to be logged.
 * @param[in] args Variable argument list to use as formatting values with message.
 * @retval None
 */
typedef void (*swu_logging_callback_t)(swu_log_level_t level, const char *message, va_list msg_args);

/**
 * @brief Callback to iterate the contents of the UpdateTarget list
 * @details This iterator callback function is used to iterate the contents of the UpdateTarget list.  When
 * swu_client_iterate_targets is called, this callback function will be called once for each item in the UpdateTarget
 * list.  Finally it will be called one last time with a target argument value of NULL to indicate the end of the list.
 * @par Category
 * Immediate Execution
 * @param[in] target The handle to an UpdateTarget object.  Will be NULL to indicate the end of the list.
 * @param[in] context A pointer that was set with the call to swu_client_iterate_targets
 * @retval bool The function should return
 *  - true to continue itereating the list
 *  - false to stop iterating
 */
typedef bool (*swu_client_target_iterator_t)(swu_target_t target, void *context);

/**
 * @brief This structure defines the notification callback for changes to the UpdateTarget list.
 */
typedef struct {
    /**
     * @brief Callback function to indicate change in the UpdateTarget list
     * @details This callback function is called whenever a change is made to the UpdateTarget list. The
     * the first time this structure is registered, it will be called to indicate the current contents of the list.
     * @par Category
     * Immediate Execution
     * @param[in] context A pointer that was set in this structure before registering the callback.
     * @retval None
     */
    void (*change_notifier)(void *context);

    /**
     * @brief A context pointer that will be used when the call to the change_notifer function pointer is made.
     */
    void *context;
} swu_client_target_notification_t;

/**
 * @brief Initializes the swu library
 * @details This function must be called before any other swu API calls are made in order to
 * setup the swu library.  This API also sets the ID that is to be used by the UpateClient.
 * This ID is meant to uniquely identify this UpdateClient from any other UpdateClient.
 * One use for this ID could be for a unique identifier to use when reporting installation
 * details to a reporting server.  The swu library currently doesn't use this ID for any internal
 * functionality.
 * @par Category
 * Immediate Execution
 * @param[in] client_id This is a unique ID used to identify the client.
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the library was initialized
 *  - SWU_RESULT_ERROR if the library could not be initialized
 */
swu_result_t swu_client_initialize(const char *client_id);

/**
 * @brief Releases the memory held by the swu library
 * @details This function must be called when there is no longer a need for swu in order to free the environment.
 *
 * This function will return an error if the call is made from within one of the callbacks that are made by the swu library.
 * @par Category
 * Immediate Execution
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_ERROR for all other errors
 */
swu_result_t swu_client_uninitialize();

/**
 * @brief Used to enable logging from the library.
 * @details This function enables logging of various messages from the library.  If log_func is NULL, or if no
 * logging function is specified, all messages that are less than or equal to SWU_LOG_WARNING will be logged to
 * stderr.
 * @par Category
 * Immediate Execution
 * @param[in] log_func The logging function to use.  A value of NULL will log severe information to stderr
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 */
swu_result_t swu_client_set_logging_callback(swu_logging_callback_t log_func);

/**
 * @brief Commands the UpdateClient to create an Update(s) from the given path to an update package.
 * @details This function is used to create Updates based off a manifest file. The format of the manifest
 * file is documented elsewhere.
 *
 * If any Updates fail to be parsed from the manifest file, then the entire parsing of the manifest file
 * will result in a return value of SWU_RESULT_ERROR.
 * @par Category
 * Immediate Execution
 * @param[in] path The path to an Update package
 * @param[out] id The unique ID to identify the manifest file.
 * This ID can be used to later release the created Updates with swu_client_release_updates
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if one of the arguments specified is invalid
 *  - SWU_RESULT_NOT_INITIALIZED if the swu library has not be initialized yet
 *  - SWU_RESULT_ERROR for all other errors
 */
swu_result_t swu_client_create_updates(const char *path, swu_manifest_id_t *id);

/**
 * @brief Commands the UpdateClient to release any updates associated with the manifest ID
 * @details This function releases all the Updates that were created by the manifest file identified by the
 * ID.
 * @par Category
 * Immediate Execution
 * @param[in] id The manifest ID set by the call to swu_client_create_updates
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_NOT_INITIALIZED if the swu library has not be initialized yet
 *  - SWU_RESULT_ERROR for all other errors
 */
swu_result_t swu_client_release_updates(swu_manifest_id_t id);

/**
 * @brief Informs the UpdateClient that the current system conditions are conducive for installing Updates
 * @details This function is used to signal to the library that the system is in a position to accept the
 * installation of updates.  For example, a process could call this function in order to enable Updates
 * when the device is no longer running on battery power.
 *
 * By default, the swu library sets this flag to true to indicate that conditions are valid for installs
 * @par Category
 * Immediate Execution
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_NOT_INITIALIZED if the swu library has not be initialized yet
 *  - SWU_RESULT_ERROR for all other errors
 */
swu_result_t swu_client_conditions_valid_for_installs(void);

/**
 * @brief Informs the UpdateClient that the current system conditions are invalid for installing Updates
 * @details This function is used to signal to the library that the system is not in a position to accept the
 * installation of updates.  For example, a process could call this function in order to disable Updates
 * when the device is running on battery power.
 *
 * By default, the swu library sets this flag to true to indicate that conditions are valid for installs
 * @par Category
 * Immediate Execution
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_NOT_INITIALIZED if the swu library has not be initialized yet
 *  - SWU_RESULT_ERROR for all other errors
 */
swu_result_t swu_client_conditions_invalid_for_installs(void);

/**
 * @brief Iterates over the contents of UpdateTarget list
 * @details This function is used to iterates over the contents of the list of registered UpdateTargets.
 * After this function returns SWU_RESULT_SUCCESS, the iterator function will be called once for each
 * UpdateTarget that has been registered.  Finally, it will call the iterator function with a NULL swu_target_t
 * to indicate the end of the list.
 * @par Category
 * Immediate Execution
 * @param[in] iterator The callback function that would be used to iterate the target list.
 * @param[in] context A pointer that will be passed along to the iterator
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if one of the arguments specified is invalid
 *  - SWU_RESULT_ERROR for all other errors
 */
swu_result_t swu_client_iterate_targets(swu_client_target_iterator_t iterator, void *context);

/**
 * @brief Returns the number of items available in the UpdateTarget list
 * @details This function returns the length of the specified UpdateList.
 * @par Category
 * Immediate Execution
 * @param[out] length The length of the list is placed in this paraemter.
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if one of the arguments specified is invalid
 *  - SWU_RESULT_ERROR for all other errors
 */
swu_result_t swu_client_get_target_list_length(size_t *length);

/**
 * @brief Informs the UpdateClient about a new listener for TargetList changes
 * @details This function is used to register a new notifier for TargetList changes.  The function is called when
 * a new UpdateTarget is registered with the library or when an existing one unregisters. The function does not
 * copy the notification structure and it is expected to be maintained by the caller.  If the notification
 * is successfully registered, the caller will get a notification at the newly registered function
 * @par Category
 * Immediate Execution
 * @param[in] notification A pointer to the swu_client_target_notification_t that sets up how to notify someone when the target changes.
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if one of the arguments specified is invalid
 *  - SWU_RESULT_ERROR for all other errors
 */
swu_result_t swu_client_register_target_list_notification(const swu_client_target_notification_t *notification);

/**
 * @brief Informs the client that a target list notification is no longer needed
 * @details This function is used when the notification of every UpdateList change is no longer needed.  The caller
 * needs to pass in the same pointer to the swu_client_target_notification_t that was used to register for notifications.
 * At this point the interface registered during the call to swu_client_register_target_list_notification is no longer needed.
 * @par Category
 * Immediate Execution
 * @param[in] notification A pointer to the swu_client_target_notification_t that was used with the call to swu_client_register_target_list_notification
 * @retval result An swu_result_t indicating if everything was successful or of there was some sort of error.
 * @details At this point the interface registered during the call to swu_client_register_target_list_notification is no longer needed.
  * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if one of the arguments specified is invalid
 *  - SWU_RESULT_NOT_FOUND if the swu_client_target_notification_t pointed at by the notification argument could not be found
 *  - SWU_RESULT_ERROR for all other errors
 */
swu_result_t swu_client_unregister_target_list_notification(const swu_client_target_notification_t *notification);

/**
 * @brief Returns a handle to a the list of updates that are available to install or are being installed
 * @details This function returns a handle to the UpdateList that contains the Updates that are available to
 * be installed.
 * @par Category
 * Immediate Execution
 * @param[out] list A pointer to the handle to the Install UpdateList
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_NOT_INITIALIZED if the swu library has not be initialized yet
 *  - SWU_RESULT_INVALID_ARGUMENT if one of the arguments specified is invalid
 *  - SWU_RESULT_ERROR for all other errors
 */
swu_result_t swu_client_get_install_update_list(swu_update_list_t *list);

/**
 * @brief Returns the number of Updates in the specified UpdateList
 * @details This function returns the length of the specified UpdateList.
 * @par Category
 * Immediate Execution
 * @param[in] list The handle to the UpdateList that the caller wants to get the length of.
 * @param[out] length The length of the list is placed in this paraemter.
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if one of the arguments specified is invalid
 *  - SWU_RESULT_ERROR for all other errors
 */
swu_result_t swu_update_list_get_length(swu_update_list_t list, size_t *length);

/**
 * @brief Iterates over the contents of the specified UpdateList
 * @details This function is used to iterates over the contents of the specified UpdateList.
 * After this function returns SWU_RESULT_SUCCESS, the iterator function will be called once for each
 * Update in the UpdateList.  Finally, it will call the iterator function with a NULL swu_update_t
 * to indicate the end of the list.
 * @par Category
 * Delayed Execution
 * @param[in] list The handle to the UpdateList that the caller wants to iterate
 * @param[in] iterator The callback function that would be used to iterate this list.
 * @param[in] context A pointer that will be passed along to the iterator
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if one of the arguments specified is invalid
 *  - SWU_RESULT_ERROR for all other errors
 */
swu_result_t swu_update_list_iterate(swu_update_list_t list, swu_update_list_iterator_t iterator, void *context);

/**
 * @brief Informs the UpdateClient about a new listener for changes to an UpdateList.
 * @details This function is used to register a new notifier for UpdateList changes. The function does not
 * copy the notification structure and it is expected to be maintained by the caller.  If the notification
 * is successfully registered, the caller will get a notification at the newly registered function
 * @par Category
 * Immediate Execution
 * @param[in] list The handle to the UpdateList that the caller wants notifications for.
 * @param[in] notification A pointer to the swu_update_list_notification_t that will be used for change notifications
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if one of the arguments specified is invalid
 *  - SWU_RESULT_ERROR for all other errors
 */
swu_result_t swu_update_list_register_notification(swu_update_list_t list,
        const swu_update_list_notification_t *notification);

/**
 * @brief Informs the UpdateClient that a UpdateList change notification is no longer needed
 * @details This function is used when the notification of every UpdateList change is no longer needed.  The caller
 * needs to pass in the same pointer to the swu_update_list_notification_t that was used to register for notifications.
 * At this point the interface registered during the call to swu_update_list_register_notification is no longer needed.
 * @par Category
 * Immediate Execution
 * @param[in] list The handle to the UpdateList that the caller no longer need notifications for
 * @param[in] notification A pointer to the swu_update_list_notification_t that was used with the call to swu_update_list_register_notification
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if one of the arguments specified is invalid
 *  - SWU_RESULT_NOT_FOUND if the swu_update_list_notification_t pointed at by the notification argument could not be found
 *  - SWU_RESULT_ERROR for all other errors
 */
swu_result_t swu_update_list_unregister_notification(swu_update_list_t list,
        const swu_update_list_notification_t *notification);

/** @} */

#endif /* _SWU_UPDATECLIENT_H */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/services/swu/lib/core/public/swu/UpdateClient.h $ $Rev: 728101 $")
#endif
