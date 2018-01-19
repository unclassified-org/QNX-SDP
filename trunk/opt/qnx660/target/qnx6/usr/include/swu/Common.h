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
#ifndef _SWU_COMMON_H
#define _SWU_COMMON_H

#include <stddef.h>
#include <stdint.h>

/**
 * @defgroup Common Common
 * @brief Common defines, types and functions used by all parts of the SWU library
 */

/**
 * @addtogroup Common
 * @{
 */

/**
 * @brief The length of the vendor ID on an UpdateTarget.  Does not include null-terminator.
 */
#define SWU_UPDATE_TARGET_VENDOR_ID_LEN    100

/**
 * @brief The length of the hardware ID on an UpdateTarget.  Does not include null-terminator.
 */
#define SWU_UPDATE_TARGET_HARDWARE_ID_LEN    100

/**
 * @brief The length of a serial number on an UpdateTarget.  Does not include null-terminator.
 */
#define SWU_UPDATE_TARGET_SERIAL_NUM_LEN    100

/**
 * @brief The length of the software version of an UpdateTarget.  Does not include null-terminator.
 */
#define SWU_UPDATE_TARGET_BOM_VERSION_LEN   100
/**
 * @brief A unique ID representing an UpdateTarget.  This ID is unique within the client.
 * @details This unique ID is unique amongst all UpdateTargets registered with the UpdateClient.
 * This ID is not unique across power cycles.
 */
typedef uint32_t swu_target_id_t;

/**
 * @brief A constant representing an invalid value for a swu_target_id_t.
 */
#define SWU_INVALID_TARGET_ID ((swu_target_id_t)0)

/**
 * @brief Represents a 0-100% progress indicator
 */
typedef uint8_t swu_progress_t;

/**
 * @brief A customer-specific failure code that indicates why an installation failed
 */
typedef uint32_t swu_failure_code_t;

/**
 * @brief Represents a reference-counted string within the library.
 * @details A refrenced-counted string.  When working with a swu_string_t value returned
 * from a swu API, the caller must call swu_object_retain (unless otherwise noted) in order
 * to increase the reference-count and maintain access to the
 * variable.  Any swu_string_t that has the reference-count increased with swu_object_retain
 * must be released by using swu_object_release when no longer needed.
 */
typedef char *swu_string_t;

/**
 * @brief A unique ID representing an Update.  Should be unique amongst all Updates present.
 */
typedef swu_string_t swu_update_id_t;

/**
 * @brief Represents a standard URI string
 */
typedef swu_string_t swu_uri_t;

/**
 * @brief Represents a UNIX time (seconds since 1/1/1970 UTC)
 */
typedef int64_t swu_timestamp_t;

/**
 * @brief A constant representing an invalid grace period value
 */
#define SWU_INVALID_GRACE_PERIOD ((swu_timestamp_t) INT64_MAX)

/**
 * @brief A unique ID for a manifest that was successfully parsed by the library
 */
typedef uint32_t swu_manifest_id_t;

/**
 * @brief A value used to indicate an invalid manifest ID.
 */
#define SWU_INVALID_MANIFEST_ID ((swu_manifest_id_t)0)

/**
 * @brief A unique ID that is used to identify the UpdateClient
 */
typedef swu_string_t swu_client_id_t;

/**
 * @brief Common result codes used to indicate the success or failure of a swu API call.
 * @details Most APIs in the swu library return a swu_result_t to indicate the success or
 * failure of the API call.  For a typical operation, a caller of the swu API would simply
 * check to see if the call returned SWU_RESULT_SUCCESS or not.  The other result codes are
 * useful for logging purposes or for debugging.
 *
 * The function swu_result_to_string is helpful for logging or getting a string value of a
 * swu_result_t
 */
typedef enum {
    SWU_RESULT_SUCCESS,
    SWU_RESULT_ERROR,
    SWU_RESULT_EMPTY,
    SWU_RESULT_DUPLICATE_ENTRY,
    SWU_RESULT_NOT_FOUND,
    SWU_RESULT_INVALID_ARGUMENT,
    SWU_RESULT_OUT_OF_MEMORY,
    SWU_RESULT_API_NOT_AVAILABLE,
    SWU_RESULT_UPDATE_TARGET_BUSY,
    SWU_RESULT_NOT_INITIALIZED,
    SWU_RESULT_CONDITIONS_NOT_VALID_TO_INSTALL
} swu_result_t;

/**
 * @brief The possible failure reasons for Update installations.
 */
typedef enum {
    SWU_FAILURE_REASON_UPDATE_NOT_SUPPORTED,
    SWU_FAILURE_REASON_NOT_READY_FOR_UPDATE,
    SWU_FAILURE_REASON_INVALID_CONDITIONS,
    SWU_FAILURE_REASON_INSTALL_FAILED,
    SWU_FAILURE_REASON_INSTALL_VERIFICATION_FAILED
} swu_failure_reason_t;

/**
 * @brief The possible priority levels that an Update can have.
 */
typedef enum {
    SWU_UPDATE_PRIORITY_CRITICAL = 1,   /* Critical update, highest priority */
    SWU_UPDATE_PRIORITY_NORMAL = 10,    /* Normal update */
    SWU_UPDATE_PRIORITY_USEFUL = 20     /* Useful update, lowest priority */

} swu_update_priority_t;

/**
 * @brief The states that a software update can be in
 * @details This an enumeration of all of the states that an update can be in. The enumeration
 * is defined in a manner that allows the values to be used to create a mask for notifications.
 *
 * The function swu_update_state_to_string is useful for logging or getting a string value of a
 * swu_update_state_t
 */
typedef enum {
    SWU_UPDATE_STATE_NEW = 0x00000001,  /* The update has not yet been downloaded or installed */
    SWU_UPDATE_STATE_VERIFYING = 0x00000080,   /* The downloaded file is being verified with the update server. */
    SWU_UPDATE_STATE_VERIFIED = 0x00000100,   /* The downloaded file was verified with the update server. */
    SWU_UPDATE_STATE_INSTALLING = 0x00000200,   /* The update is currently being installed */
    SWU_UPDATE_STATE_INSTALL_COMPLETED = 0x00000400,    /* The update was successfully installed */
    SWU_UPDATE_STATE_INSTALL_FAILED = 0x00000800,   /* The update could not be installed successfully */
    SWU_UPDATE_STATE_INSTALL_CANCELLING = 0x00001000,   /* The update installation is being canceled */
    SWU_UPDATE_STATE_INSTALL_CANCELLED = 0x00002000,    /* The update installation was canceled */
    SWU_UPDATE_STATE_INSTALL_VERIFYING = 0x00004000,    /* The update was installed and is currently being verified */
    SWU_UPDATE_STATE_INSTALL_VERIFIED = 0x00008000, /* The update was successfully verified */
    SWU_UPDATE_STATE_ROLLING_BACK = 0x00010000, /* The update is currently being rolled back to a previous version */
    SWU_UPDATE_STATE_ROLLBACK_COMPLETED = 0x00020000,   /* The update was successfully rolled back */
    SWU_UPDATE_STATE_ROLLBACK_FAILED = 0x00040000,  /* The update could not be rolled back */
    SWU_UPDATE_STATE_ERROR = 0x00080000,    /* The update is in an error state */
    SWU_UPDATE_STATE_DECLINED = 0x00100000 /* the update has been declined */
} swu_update_state_t;

/**
 * @brief A constant that is useful for setting a notification for all available Update states.
 */
#define SWU_UPDATE_ALL_STATES   (SWU_UPDATE_STATE_NEW|SWU_UPDATE_STATE_VERIFYING|                   \
        SWU_UPDATE_STATE_VERIFIED|SWU_UPDATE_STATE_INSTALLING|SWU_UPDATE_STATE_INSTALL_COMPLETED|   \
        SWU_UPDATE_STATE_INSTALL_FAILED|SWU_UPDATE_STATE_INSTALL_CANCELLING|                        \
        SWU_UPDATE_STATE_INSTALL_CANCELLED|SWU_UPDATE_STATE_INSTALL_VERIFYING|                      \
        SWU_UPDATE_STATE_INSTALL_VERIFIED|SWU_UPDATE_STATE_ROLLING_BACK|                            \
        SWU_UPDATE_STATE_ROLLBACK_COMPLETED|SWU_UPDATE_STATE_ROLLBACK_FAILED|SWU_UPDATE_STATE_ERROR|\
        SWU_UPDATE_STATE_DECLINED)

/**
 * @brief Indicates the severity level of a message logged via the swu_logging_callback_t.
 */
typedef enum swu_log_level {
    SWU_LOG_SHUTDOWN,
    SWU_LOG_CRITICAL,
    SWU_LOG_ERROR,
    SWU_LOG_WARNING,
    SWU_LOG_NOTICE,
    SWU_LOG_INFO
} swu_log_level_t;

/**
 * @brief Defines the information about an UpdateTarget.
 * @details This a structure that defines the information of the software contained on an UpdateTarget.
 * The vendor_id and hardware_id fields of this structure are used to identify which UpdateTarget an
 * Update is meant for.  This means that that vendor_id and hardware_id pair of fields must be unique
 * amongst all UpdateTargets registered with the swu library.
 */
typedef struct {
    /**
    * @brief The size of the swu_target_sw_information_t struct.
    * @details The size of the software information structure.  This field should be set by calling
    * sizeof(swu_target_sw_information_t) before using a swu_target_sw_information_t with the swu library.
    */
    size_t size;

    /**
    * @brief This is one part of the pair of IDs (along with hardware_id) used to uniquely identify the UpdateTarget.
    */
    char vendor_id[SWU_UPDATE_TARGET_VENDOR_ID_LEN + 1];

    /**
    * @brief This is one part of the pair of IDs (along with vendor_id) used to uniquely identify the UpdateTarget.
    */
    char hardware_id[SWU_UPDATE_TARGET_HARDWARE_ID_LEN + 1];

    /**
    * @brief Describes the serial number of the UpdateTarget.  This is up to the library integrator to decide how to use.
    */
    char serial_number[SWU_UPDATE_TARGET_SERIAL_NUM_LEN + 1];

    /**
    * @brief Describes the version of the UpdateTarget.  This is up to the library integrator to decide how to use.
    */
    char bom_version[SWU_UPDATE_TARGET_BOM_VERSION_LEN + 1];
} swu_target_sw_information_t;

/**
 * @brief Describes the type of failure experienced by an UpdateTarget.
 * @details The swu_failure_info_t is a structure for passing around the pair of failure information
 * fields that are used to describe a failure with an UpdateTarget.
 */
typedef struct {
    /**
    * @brief A common swu_failure_reason_t indicating the general category of failure.
    */
    swu_failure_reason_t reason;

    /**
    * @brief A user-specific code that can provide more detail about the failure.
    */
    swu_failure_code_t code;
} swu_failure_info_t;

/**
 * @brief swu_update_t is a handle to an Update object.  The Update object is a swu_object.
 * @details Throughout the swu API, Update objects are represented by the swu_update_t.  Since
 * the Update object is reference-counted, the caller must call swu_object_retain in order to
 * increase the reference-count and maintain access to the Update.  Any swu_update_t that has
 * the reference-count increased with swu_object_retain must be released by using
 * swu_object_release when no longer needed.
 */
typedef void *swu_update_t;

/**
 * @brief swu_update_list_t is a handle to an UpdateList object.
 * @details The swu_update_list_t is a handle to an UpdateList, which represents a list of
 * Update objects.
 */
typedef void *swu_update_list_t;

/**
 * @brief swu_target_t is a handle to an UpdateTarget object.  The UpdateTarget object is a swu_object.
 * @details Throughout the swu API, UpdateTarget objects are represented by the swu_target_t.  Since
 * the UpdateTarget object is reference-counted, the caller must call swu_object_retain in order to
 * increase the reference-count and maintain access to the UpdateTarget.  Any swu_target_t that has
 * the reference-count increased with swu_object_retain must be released by using
 */
typedef void *swu_target_t;

/**
 * @brief Retains an swu_object that was previously retrieved from some other swu API
 * @details This function is used to increment the reference count of swu objects (such as
 * swu_string_t, swu_update_t, swu_target_t and others) that are
 * returned by swu APIs.  The caller must call swu_object_retain in order to increase the
 * reference-count and maintain access to the a swu object.  Any swu object that has
 * the reference-count increased with swu_object_retain must be released by using
 * swu_object_release when no longer needed.
 * @par Category
 * Immediate Execution
 * @param[in] swu_object that was returned from a swu API
 * @retval None
 */
void swu_object_retain(void *object);

/**
 * @brief Releases an swu_object that was previously retrieved from some other swu API
 * @details This function is used to decrement the reference count of swu objects (such as
 * swu_string_t, swu_update_t, swu_target_t and others) that are
 * returned by swu APIs.  The caller must call swu_object_retain in order to increase the
 * reference-count and maintain access to the a swu object.  Any swu object that has
 * the reference-count increased with swu_object_retain must be released by using
 * swu_object_release when no longer needed.
 * @par Category
 * Immediate Execution
 * @param[in] swu_object that was returned from a swu API
 * @retval None
 */
void swu_object_release(void *object);

/**
 * @brief Returns a string representation of swu_result_t
 * @details This function returns a constant null-terminated string representation of a
 * specified swu_result_t enum.
 * @par Category
 * Immediate Execution
 * @param[in] result The swu_result_t that the caller needs a string form of
 * @retval string constant for the swu_result_t.
 */
const char* swu_result_to_string(swu_result_t result);

/**
 * @brief Returns a string representation of swu_update_state_t
 * @details This function returns a constant null-terminated string representation of a
 * specified swu_update_state_t enum.
 * @par Category
 * Immediate Execution
 * @param[in] state The swu_update_state_t that the caller needs a string form of
 * @eetval string constant for the swu_update_state_t.
 */
const char* swu_update_state_to_string(swu_update_state_t state);

/** @} */

#endif /* _SWU_COMMON_H */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/services/swu/lib/core/public/swu/Common.h $ $Rev: 728101 $")
#endif
