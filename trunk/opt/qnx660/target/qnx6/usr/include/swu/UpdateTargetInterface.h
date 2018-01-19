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
#ifndef _SWU_UPDATETARGETINTERFACE_H
#define _SWU_UPDATETARGETINTERFACE_H

#include <swu/Common.h>

/**
 * @defgroup UpdateTargetInterface UpdateTargetInterface
 * @brief The UpdateTargetInterface provides functions to communicate with registered UpdateTargets.
 * @details An UpdateTarget represents a single unit that can have software updates applied to it.  An UpdateTarget
 * implementation would implement all the functions defined in swu_target_interface_t that the UpdateTarget would
 * support.  The swu_target_interface_t is then used to registered with the swu library so that the library can
 * call these functions during the different phases of the software update process.  In order to reply to these
 * function calls, the UpdateTarget would call the various swu_target_* functions to indicate success, failure
 * and progress.
 */

/**
 * @addtogroup UpdateTargetInterface
 * @{
 */

/**
 * @brief Used by the UpdateClient to talk to a registered UpdateTarget (since there could be many)
 * @details An UpdateTarget needs to provide a structure with these function pointers to indicate to the UpdateClient
 * how it can notify an UpdateTarget when to handle various phases of the software update process.
 * Any function pointers that are not supported by the UpdateTarget should be set to NULL in this structure.
 *
 * Since these functions are called within the context of the core swu library, the UpdateTarget is expected to quickly return from
 * these functions.  It is advised that the UpdateTarget uses its own context to run any long-running operation that is needed.
 */
typedef struct {
    /**
     * @brief Function pointer for the UpdateClient to call to the UpdateTarget to request the software information for the UpdateTarget.
     * @details The get_info function is by the UpdateClient to query the information about the UpdateTarget.  This
     * is primarily used when the swu_target_get_info call is made.  However, the UpdateClient may call it at other
     * times during the software update proces.
     * @par Category
     * Immediate Execution
     * @param[in] id The ID for the UpdateTarget that was set by the UpdateClient during the call to swu_target_register
     * @param[out] info A pointer to a swu_target_sw_information_t where the software information for the target should be copied to by the UpdateTarget
     * @param[in] get_info_context The previously supplied context for this function
     * @retval swu_result_t indicating if everything was successful or of there was some sort of error.
     */
    swu_result_t (*get_info)(swu_target_id_t id, swu_target_sw_information_t *info, void *get_info_context);

    /**
     * @brief A context pointer that will be used as a parameter when the call to the get_info function pointer is made.
     */
    void *get_info_context;

    /**
     * @brief Function pointer for the UpdateClient to call to the UpdateTarget to inform the target that an Update is available and they should prepare for it.
     * @details This function is called after an Update has been accepted and is ready to start installing.  The prepare_to_install function is called
     * to give the UpdateTarget a chance to get ready for the Update and to determine if it is in a state to perform an installation.  If the UpdateTarget is ready
     * it should respond by calling swu_target_ready_to_install from its own context.  If there is some issue and the UpdateTarget is not ready, then the UpdateTarget
     * should call swu_target_not_ready_to_install.
     *
     * If this function is registered as NULL, then the core library will skip this step and call install once an Update has been accepted.
     * @par Category
     * Immediate Execution
     * @param[in] id The ID for the UpdateTarget that was set by the UpdateClient during the call to swu_target_register
     * @param[in] update A handle to the Update that is ready to be installed.
     * @param[in] prepare_to_install_context The previously supplied context for this function
     * @retval swu_result_t indicating if everything was successful or of there was some sort of error.
     */
    swu_result_t (*prepare_to_install)(swu_target_id_t id, swu_update_t update, void *prepare_to_install_context);

    /**
     * @brief A context pointer that will be used as a parameter when the call to the prepare_to_install function pointer is made.
     */
    void *prepare_to_install_context;

    /**
     * @brief Function pointer for the UpdateClient to call to the UpdateTarget to tell the target to start installing the Update.
     * @details This function is called to tell the UpdateTarget to start installing the update.  Once the UpdateTarget returns from
     * this function, it is free to begin installing the Update.
     *
     * As the install progresses, the UpdateTarget can call swu_target_install_progress to indicate how far along the installation is,
     * however this is optional.  It is up to the particular implementation to determine if keeping track of the progress is needed.
     *
     * Once the Update installation is completed, the UpdateTarget is expected to indicate that it was successfully installed by
     * calling swu_target_install_successful.  If there was any type of error that caused the installation to fail, the UpdateTarget
     * should call swu_target_install_failed to indicate that the Update failed.
     * @par Category
     * Immediate Execution
     * @param[in] id The ID for the UpdateTarget that was set by the UpdateClient during the call to swu_target_register
     * @param[in] update A handle to the Update that is ready to be installed.
     * @param[in] install_context The previously supplied context for this function
     * @retval swu_result_t indicating if everything was successful or of there was some sort of error.
     */
    swu_result_t (*install)(swu_target_id_t id, swu_update_t update, void *install_context);

    /**
     * @brief A context pointer that will be as a parameter used when the call to the install function pointer is made.
     */
    void *install_context;

    /**
     * @brief Function pointer for the UpdateClient to call to the UpdateTarget to tell the target to cancel the ongoing installation of an Update.
     * @details If an Update is canceled with a call to swu_update_cancel_install, this function would be called to tell the UpdateTarget to cancel
     * the installation of an Update that is in-progress.  Once the update is cancelled, the UpdateTarget should inform the core library by calling
     * swu_target_install_cancelled.
     *
     * If the UpdateTarget does not support canceling Updates, then this function pointer should be registered with a value of NULL.
     * @par Category
     * Immediate Execution
     * @param[in] id The ID for the UpdateTarget that was set by the UpdateClient during the call to swu_target_register
     * @param[in] update A handle to the Update that is currently being installed but should be cancelled.
     * @param[in] cancel_install_context The previously supplied context for this function
     * @retval result An swu_result_t indicating if everything was successful or of there was some sort of error.
     */
    swu_result_t (*cancel_install)(swu_target_id_t id, swu_update_t update, void *cancel_install_context);

    /**
     * @brief A context pointer that will be used as a parameter when the call to the cancel_install function pointer is made.
     */
    void *cancel_install_context;

    /**
     * @brief Function pointer for the UpdateClient to call to the UpdateTarget to tell the target to verify that an Update was installed correctly.
     * @details The core library will signal the UpdateTarget with this function after the Update has been installed successfully.  This gives the
     * UpdateTarget the chance to perform any post-install verification that is available.  As with the other function pointers that are defined in the swu_target_interface_t
     * structure, this pointer should be set to NULL if the UpdateTarget doesn't support verification or if it is not needed.
     *
     * Once the verification has been successfully completed, the UpdateTarget has to call swu_target_verification_successful to indicate that
     * the verification process was a success.  If there is any issue during the verification, the UpdateTarget should use swu_target_verification_failed
     * to indicate that the update failed and the reason it failed.
     *
     * As with the installation process, the UpdateTarget can indicate how far along the verification process is by calling swu_target_verification_progress.
     * @par Category
     * Immediate Execution
     * @param[in] id The ID for the UpdateTarget that was set by the UpdateClient during the call to swu_target_register
     * @param[in] update A handle to the Update that has been installed on the target and now needs to be verified that it installed correctly.
     * @param[in] verify_update_context The previously supplied context for this function
     * @retval result An swu_result_t indicating if everything was successful or of there was some sort of error.
     */
    swu_result_t (*verify_update)(swu_target_id_t id, swu_update_t update, void *verify_update_context);

    /**
     * @brief A context pointer that will be used as a parameter when the call to the verify_update function pointer is made.
     */
    void *verify_update_context;

    /**
     * @brief Function pointer for the UpdateClient to call to the UpdateTarget to tell the target to attempt to rollback a previously installed Update.
     * @details The core library will signal the UpdateTarget with this function after the Update when the function swu_update_rollback is called.
     * As with the other function pointers that are defined in the swu_target_interface_t structure, this pointer should be set to NULL if the
     * UpdateTarget doesn't support rolling-back previously installed Updates.
     *
     * Once the update has been uninstalled successfully, the UpdateTarget has to call swu_target_rollback_successful to indicate that
     * the rollback process was a success.  If there is any issue during the rollback, the UpdateTarget should use swu_target_rollback_failed
     * to indicate that the update failed and the reason it failed.
     *
     * As with the installation process, the UpdateTarget can indicate how far along the rollback process is by calling swu_target_rollback_progress.
     * @par Category
     * Immediate Execution
     * @param[in] id The ID for the UpdateTarget that was set by the UpdateClient during the call to swu_target_register
     * @param[in] update A handle to the Update that has been installed on the target and now needs to be rollbacked.
     * @param[in] rollback_update_context The previously supplied context for this function
     * @retval result An swu_result_t indicating if everything was successful or of there was some sort of error.
     */
    swu_result_t (*rollback_update)(swu_target_id_t id, swu_update_t update, void *rollback_update_context);

    /**
     * @brief A context pointer that will be used as a parameter when the call to the rollback_update function pointer is made.
     */
    void *rollback_update_context;

} swu_target_interface_t;

/**
 * @brief Informs the UpdateClient about a new UpdateTarget.
 * @details Used to tell the client about a new UpdateTarget.  The client in turn assigns an ID to the target that is used during client communication.
 * The function does not copy the interface structure and it is expected to be maintained by the caller.
 *
 * The ID assigned by the UpdateClient will be used to uniquely identify this UpdateTarget among all other UpdateTargets that have been registered.  This
 * ID will not be unique across power cycles.
 * @par Category
 * Immediate Execution
 * @param[in] vendor_id info A constant string used (in conjunction with hardware_id) to uniquely identify the UpdateTarget.  This function will copy the string.
 * @param[in] hardware_id info A constant string used (in conjunction with vendor_id) to uniquely identify the UpdateTarget.  This function will copy the string.
 * @param[in] interface A handle to the swu_target_interface_t that is used by the UpdateClient to communicate to a specific UpdateTarget.
 * @param[out] id The ID for the UpdateTarget that is assigned by the UpdateClient.
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if one of the arguments specified is invalid
 *  - SWU_RESULT_DUPLICATE_ENTRY if an UpdateTarget with this vendor_id and hardware_id pair has already been registered
 *  - SWU_RESULT_ERROR for all other errors
 */
swu_result_t swu_target_register(const char *vendor_id, const char *hardware_id, swu_target_interface_t *interface, swu_target_id_t *id);

/**
 * @brief Informs the UpdateClient that an UpdateTarget is no longer available
 * @details This function is used to remove the UpdateTarget from the core library.  The function pointers specified in the swu_target_interface_t
 * will no longer be called by the UpdateClient.  The ID that was assigned to this UpdateTarget will not be used again during this power cycle.  At
 * this point the interface registered during the call to swu_target_register is no longer needed.
 * @par Category
 * Immediate Execution
 * @param[in] id The ID for the UpdateTarget that was assigned with the call to swu_target_register
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_NOT_FOUND if the UpdateTarget specified by the ID could not be found
 *  - SWU_RESULT_INVALID_ARGUMENT if one of the arguments specified is invalid
 *  - SWU_RESULT_ERROR for all other errors
 */
swu_result_t swu_target_unregister(swu_target_id_t id);

/**
 * @brief Used by an UpdateTarget to inform the UpdateClient that the Target is ready to install the update.
 * @details The UpdateTarget will call swu_target_ready_to_install after the UpdateTarget has determined that
 * it is ready to install the Update specified.  This function is expected to be called after returning from the
 * function pointed to by prepare_to_install function pointer set in the swu_target_interface_t structure.
 * @par Category
 * Immediate Execution
 * @param[in] id The ID for the UpdateTarget that was assigned with the call to swu_target_register
 * @param[in] update The handle to the Update object that needs to be installed on the Target
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if one of the arguments specified is invalid
 *  - SWU_RESULT_ERROR for all other errors
 */
swu_result_t swu_target_ready_to_install(swu_target_id_t id, swu_update_t update);

/**
 * @brief Used by an UpdateTarget to inform the Client that the Target is not in a state where it can install an update.
 * @details The UpdateTarget will call swu_target_not_ready_to_install after the UpdateTarget has determined that
 * it is not ready to install the Update specified.  This function is expected to be called after returning from the
 * function pointed to by prepare_to_install function pointer set in the swu_target_interface_t structure.
 * @par Category
 * Immediate Execution
 * @param[in] id The ID for the UpdateTarget that was assigned with the call to swu_target_register
 * @param[in] update The handle to the Update object that the Client is attempting to install on the Target
 * @param[in] reason One of the predefined swu_failure_reason_t enum values that indicates what class of failure this was.
 * @param[in] code A user-defined error code that provides a more specific error code to help determine what the issue was.
 * this is only passed-through and is not used by the core library.
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if one of the arguments specified is invalid
 *  - SWU_RESULT_ERROR for all other errors
 */
swu_result_t swu_target_not_ready_to_install(swu_target_id_t id, swu_update_t update, swu_failure_reason_t reason,
        swu_failure_code_t code);

/**
 * @brief An UpdateTarget calls this function to indicate that an installation was sucessful.
 * @details The UpdateTarget will call swu_target_install_successful after the UpdateTarget has successfully completed
 * the installation of the specified Update. This function is expected to be called only after returning from the
 * function pointed to by install function pointer set in the swu_target_interface_t structure.
 * @par Category
 * Immediate Execution
 * @param[in] id The ID for the UpdateTarget that was assigned with the call to swu_target_register
 * @param[in] update The handle to the Update object that the Target was able to install successfully
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if one of the arguments specified is invalid
 *  - SWU_RESULT_ERROR for all other errors
 */
swu_result_t swu_target_install_successful(swu_target_id_t id, swu_update_t update);

/**
 * @brief An UpdateTarget calls this function to indicate the progress of an ongoing installation
 * @details The UpdateTarget would call this function in order to inform the library of the progress
 * of installing the Update.  It is not required to use this function during the installation process.
 * This should only be called after successfully returning from the function pointed to by the install
 * function pointer set in the swu_target_interface_t structure.
 * @par Category
 * Immediate Execution
 * @param[in] id The ID for the UpdateTarget that was assigned with the call to swu_target_register
 * @param[in] update The handle to the Update object that the Target is currently installing
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if one of the arguments specified is invalid
 *  - SWU_RESULT_ERROR for all other errors
 */
swu_result_t swu_target_install_progress(swu_target_id_t id, swu_update_t update, swu_progress_t progress);

/**
 * @brief An UpdateTarget calls this function to indicate that an installation failed
 * @details The UpdateTarget will call swu_target_install_failed after the UpdateTarget encountered an error
 * while installing the Update. This function is expected to be called only after returning from the
 * function pointed to by install function pointer set in the swu_target_interface_t structure.
 * @par Category
 * Immediate Execution
 * @param[in] id The ID for the UpdateTarget that was assigned with the call to swu_target_register
 * @param[in] update The handle to the Update object that the UpdateTarget failed to install
 * @param[in] reason One of the predefined swu_failure_reason_t enum values that indicates what class of failure this was.
 * @param[in] code A user-defined error code that provides a more specific error code to help determine what the issue was.
 * this is only passed-through and is not used by the core library.
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if one of the arguments specified is invalid
 *  - SWU_RESULT_ERROR for all other errors
 */
swu_result_t swu_target_install_failed(swu_target_id_t id, swu_update_t update, swu_failure_reason_t reason,
        swu_failure_code_t code);

/**
 * @brief An UpdateTarget calls this function to indicate that an installation was cancelled
 * @details The UpdateTarget will call swu_target_install_cancelled after the UpdateTarget was able to handle the
 * request to cancel the Update. This function is expected to be called only after returning from the
 * function pointed to by cancel_install function pointer set in the swu_target_interface_t structure.
 * @par Category
 * Immediate Execution
 * @param[in] id The ID for the UpdateTarget that was assigned with the call to swu_target_register
 * @param[in] update The handle to the Update object that the Target successfully cancelled.
 * @param[in] reason One of the predefined swu_failure_reason_t enum values that indicates what class of failure this was.
 * @param[in] code A user-defined error code that provides a more specific error code to help determine what the issue was.
 * this is only passed-through and is not used by the core library.
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_API_NOT_AVAILABLE since the API is not supported by the library yet.
 */
swu_result_t swu_target_install_cancelled(swu_target_id_t id, swu_update_t update, swu_failure_reason_t reason,
        swu_failure_code_t code);

/**
 * @brief An UpdateTarget calls this function to indicate that a verification was sucessful.
 * @details The UpdateTarget will call swu_target_verification_successful after the UpdateTarget has successfully completed
 * the verification of the specified Update. This function is expected to be called only after returning from the
 * function pointed to by verify_update function pointer set in the swu_target_interface_t structure.
 * @par Category
 * Immediate Execution
 * @param[in] id The ID for the UpdateTarget that was assigned with the call to swu_target_register
 * @param[in] update The handle to the Update object that the Target verified.
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if one of the arguments specified is invalid
 *  - SWU_RESULT_ERROR for all other errors
 */
swu_result_t swu_target_verification_successful(swu_target_id_t id, swu_update_t update);

/**
 * @brief An UpdateTarget calls this function to indicate the progress of an ongoing verification
 * @details The UpdateTarget would call this function in order to inform the library of the progress
 * of verifying the Update.  It is not required to use this function during the verification process.
 * This should only be called after successfully returning from the function pointed to by the verify_update
 * function pointer set in the swu_target_interface_t structure.
 * @par Category
 * Immediate Execution
 * @param[in] id The ID for the UpdateTarget that was assigned with the call to swu_target_register
 * @param[in] update The handle to the Update object that the Target is verifying
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if one of the arguments specified is invalid
 *  - SWU_RESULT_ERROR for all other errors
 */
swu_result_t swu_target_verification_progress(swu_target_id_t id, swu_update_t update, swu_progress_t progress);

/**
 * @brief An UpdateTarget calls this function to indicate that a verification failed
 * @details The UpdateTarget will call swu_target_verification_failed after the UpdateTarget encountered an error
 * while verifying the Update. This function is expected to be called only after returning from the
 * function pointed to by verify_update function pointer set in the swu_target_interface_t structure.
 * @par Category
 * Immediate Execution
 * @param[in] id The ID for the UpdateTarget that was assigned with the call to swu_target_register
 * @param[in] update The handle to the Update object that the Target failed to verify
 * @param[in] reason One of the predefined swu_failure_reason_t enum values that indicates what class of failure this was.
 * @param[in] code A user-defined error code that provides a more specific error code to help determine what the issue was.
 * this is only passed-through and is not used by the core library.
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_SUCCESS if the operation succeeded
 *  - SWU_RESULT_INVALID_ARGUMENT if one of the arguments specified is invalid
 *  - SWU_RESULT_ERROR for all other errors
 */
swu_result_t swu_target_verification_failed(swu_target_id_t id, swu_update_t update, swu_failure_reason_t reason,
        swu_failure_code_t code);

/**
 * @brief An UpdateTarget calls this function to indicate that a rollback was successful
 * @details The UpdateTarget will call swu_target_rollback_successful after the UpdateTarget has successfully completed
 * uninstalling the specified Update. This function is expected to be called only after returning from the
 * function pointed to by rollback_update function pointer set in the swu_target_interface_t structure.
 * @par Category
 * Immediate Execution
 * @param[in] id The ID for the UpdateTarget that was assigned with the call to swu_target_register
 * @param[in] update The handle to the Update object that the Target was able to rollback sucessfully
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_API_NOT_AVAILABLE since the API is not supported by the library yet.
 */
swu_result_t swu_target_rollback_successful(swu_target_id_t id, swu_update_t update);

/**
 * @brief An Update Target calls this function to indicate the progress of an ongoing rollback
 * @details The UpdateTarget would call this function in order to inform the library of the progress
 * of uninstalling the Update.  It is not required to use this function during the rollback process.
 * This should only be called after successfully returning from the function pointed to by the rollback_update
 * function pointer set in the swu_target_interface_t structure.
 * @par Category
 * Immediate Execution
 * @param[in] id The ID for the UpdateTarget that was assigned with the call to swu_target_register
 * @param[in] update The handle to the Update object that the Target is in the process of performing a rollback on
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_API_NOT_AVAILABLE since the API is not supported by the library yet.
 */
swu_result_t swu_target_rollback_progress(swu_target_id_t id, swu_update_t update, swu_progress_t progress);

/**
 * @brief An UpdateTarget calls this function to indicate that a rollback failed
 * @details The UpdateTarget will call swu_target_rollback_failed after the UpdateTarget encountered an error
 * while uninstalling the Update. This function is expected to be called only after returning from the
 * function pointed to by rollback_update function pointer set in the swu_target_interface_t structure.
 * @par Category
 * Immediate Execution
 * @param[in] id The ID for the UpdateTarget that was assigned with the call to swu_target_register
 * @param[in] update The handle to the Update object that the Target failed to rollback
 * @param[in] reason One of the predefined swu_failure_reason_t enum values that indicates what class of failure this was.
 * @param[in] code A user-defined error code that provides a more specific error code to help determine what the issue was.
 * this is only passed-through and is not used by the core library.
 * @retval swu_result_t indicating the result of the operation:
 *  - SWU_RESULT_API_NOT_AVAILABLE since the API is not supported by the library yet.
 */
swu_result_t swu_target_rollback_failed(swu_target_id_t id, swu_update_t update, swu_failure_reason_t reason,
        swu_failure_code_t code);

/** @} */

#endif /* _SWU_UPDATETARGETINTERFACE_H */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/services/swu/lib/core/public/swu/UpdateTargetInterface.h $ $Rev: 728101 $")
#endif
