/**
 * @file asr.h
 *
 * @brief Functions and data types for automatic speech recognition
 *
 * @details The @c asr.h header file provides functions and data types for interacting
 *         with <tt>io-asr</tt>.
 */

#ifndef ASR_H_INCLUDED
#define ASR_H_INCLUDED

#include "asr/types.h"
#include "asr/cfg.h"
#include "asr/mod_types.h"

#ifdef __cplusplus
extern "C" {
#endif

/** A flag to indicate that a recognition response is pending. */
#define ASR_RESPONSE_PENDING 0x8000

/**
 * @brief Identifying information about an instance of the recognition service
 * @details This opaque data type carries identifying information about an instance of the speech
 * recognition service. This information may vary by vendor.
 */
typedef struct asr_instance_data asr_instance_data_t;

/**
 * @brief Information about the recognizer module
 * @details This opaque data type carries global information about the recognizer module.
 * This information may vary by vendor.
 */
typedef struct asr_global_data   asr_global_data_t;

/**
 * @brief The context handle
 * @details This opaque data type represents the context handle, which is an opaque definition of a local
 * recognizer context. The context is used to add new words to a recognizer, increasing the 
 * chance that it will be able to find correct matches for more utterances.
 * The required structure of this data type may vary by vendor.
 */
struct asr_context_hdl { 
		int dummy; /**< A dummy field that can be redeclared depending on vendor requirements. */
};

/**
 * @brief Open a connection to the recognizer module.
 * @details The @e %asr_open_global() function initializes the recognizer and 
 *          returns identifying information about the recognizer via the @e data parameter. 
 *          The operations performed by the @e %asr_open_global() function and the contents of
 *          the @c asr_global_data_t structure may vary by vendor.
 * @param asr_hdl The handle to the recognizer module.
 * @param config_base Configuration data for the recognizer.
 * @param data Identifying information about the recognizer.
 * @return 0 Success. 
 * @return -1 An error occurred.
 */
int asr_open_global (void *asr_hdl, cfg_item_t *config_base, asr_global_data_t **data);

/**
 * @brief Close a connection to the recognizer module.
 * @details The @e %asr_close_global() closes a connection to the recognizer module.
 *          The operations performed by the @e %asr_close_global() function and the contents of
 *          the @c asr_global_data_t structure may vary by vendor.
 * @param asr_hdl The handle to close.
 * @param data Global data to be passed to or received from @c io-asr.
 * @return 0 Success.
 * @return -1 An error occurred.
 */
int asr_close_global (void *asr_hdl, asr_global_data_t *data);

/**
 * @brief Open an instance of the recognizer module
 * @details The @e %asr_open_instance() function opens a new instance of the recognizer and returns
 *          identifying information about it via the @e data parameter. 
 *          The operations performed by the @e %asr_open_instance() function and the contents of
 *          the @c asr_instance_data_t structure may vary by vendor.
 * @param asr_hdl The handle to the recognizer service.
 * @param data Identifying information about the instance.
 * @return 0 on success; an error code on error.
 */
int asr_open_instance (void *asr_hdl, asr_instance_data_t **data);

/**
 * @brief Close an instance of the recognizer module
 * @details The @e %asr_close_instance() function closes the specified instance of the recognizer
 *          and frees the memory consumed by @e data.
 *          The operations performed by the @e %asr_close_instance() function and the contents of
 *          the @c asr_instance_data_t structure may vary by vendor.
 * @param asr_hdl The recognizer handle.
 * @param data The instance data to be freed.
 * @return 0 on success; an error code on error.
 */
int asr_close_instance (void *asr_hdl, asr_instance_data_t  *data);

/**
 * @brief Start a recognition request
 * @details The @e %asr_start() function starts a recognition request by invoking the @e %start() callback function
 *          defined in the recognizer interface, @c asr_recognizer_if. The recognizer should collect and process the
 *          audio sample, and then provide status and results via the API defined in the ASR vendor interface, @c asrv.h.
 *          This call must be asynchronous and the recognition operation started must be interuptable via a call to
 *          @e asr_stop().
 * @return 0 Success.
 * @return <0 An error occurred.
 */
int asr_start();

/**
 * For internal use only.
 */
int asr_restart();

/**
 * @brief Place a hold on the recognizer
 * @details The @e %asr_hold() function invokes the @e %stop() callback function defined
 *          in the recognizer interface, @c asr_recognizer_if, and increments the recognizer hold count. The
 *          recognizer stops acquiring audio and processing results for the current request.
 * @return The number of holds.
 */
int asr_hold();

/**
 * @brief Return the number of holds on the recognizer
 * @details The @e %asr_get_hold_count() function returns the number of holds on the recognizer.
 * @return The number of holds.
 */
int asr_get_hold_count();

/**
 * @brief Release a hold on the recognizer
 * @details The @e %asr_release() function reduces the hold count on the recognizer by one. If no holds
 *          remain it starts the recognizer.
 * @return The number of holds remaining.
 */
int asr_release();

/**
 * @brief Stop an in-process recognition request
 * @details The @e %asr_stop() function invokes the @e %stop() callback function defined
 *          in the recognizer interface, @c asr_recognizer_if, and sets the hold count to 0. The recognizer stops audio
 *          acquisition and stops processing results. This call blocks until the recognizer returns, confirming that the
 *          recognition request has terminated. If there's no recognition request running, @e %asr_stop() returns 
 *          immediately with a successful result.
 * @return 0 Success.
 * @return -1 An error occurred; @c errno is set.
 */
int asr_stop();

/**
 * @brief Cancel a recognition request
 * @details The @e %asr_cancel() function invokes the @e %stop() callback function defined
 *          in the recognizer interface, @c asr_recognizer_if, and sets the hold count to 0. The recognizer stops audio
 *          acquisition and stops processing results. 
 *          
 *          This function is the same as @e asr_stop() except that it also notifies the recognizer that the 
 *          request was canceled.
 * @return 0 Success.
 * @return -1 An error occurred; @c errno is set.
 */
int asr_cancel();

/**
 * @brief Process a state change
 * @details The @e %asr_post_step() function invokes the @e %step() callback function defined
 *          in the recognizer interface, @c asr_recognizer_if.
 * @param step The step to handle.
 * @return Nothing.
 */
void asr_post_step(asr_step_t step);

/**
 * @brief Map a vendor-specific recognition result status to a generic ASR result status
 * @details The @e %asr_result_map_status() maps a results status and confidence level to a 
 *          member of the @c result_status enumeration. The exact mapping is vendor dependent.
 * @param vendor_AsrRes The vendor-specific result status.
 * @return A corresponding generic ASR result status from the @c result_status enumeration. Note that
 *         a return code of @c ASR_RESULT_OK means that an exact mapping wasn't successful.
 */
int asr_result_map_status (void *vendor_AsrRes);

/**
 * @brief Create a conversation context
 * @details The @e %asr_context_create() function invokes the @e %context_create() callback function defined
 *          in the recognizer interface, @c asr_recognizer_if.
 * @param cfg A pointer to the configuration item associated with the context.
 * @return A pointer to the new context handle on success; NULL on error.
 */ 
asr_context_hdl_t *asr_context_create (cfg_item_t *cfg);

/**
 * @brief Destroy a conversation context
 * @details The @e %asr_context_create() function invokes the @e %context_create() callback function defined
 *          in the recognizer interface, @c asr_recognizer_if.
 * @param chdl A pointer to the context handle.
 * @return 0 Success.
 * @return -1 An error occurred; @c errno is set.
 */ 
int asr_context_destroy (asr_context_hdl_t *chdl);

/**
 * @brief Save a context
 * @details The @e %asr_context_save() function invokes the @e %context_save() callback function defined
 *          in the recognizer interface, @c asr_recognizer_if.
 * @param chdl The context handle.
 * @param cfg The configuration structure for the recognizer.
 *
 * @return 0 Success.
 * @return <0 An error occurred.
 */ 
int asr_context_save (asr_context_hdl_t *chdl, cfg_item_t *cfg);

/**
 * @brief Add entries to the specified context.
 * @details The @e %asr_context_add_entries() function invokes the @e %context_add_entries() callback function
 *          defined in the recognizer interface, @c asr_recognizer_if.
 *
 * @param chdl A pointer to the context handle.
 * @param cfg A pointer to the configuration associated with the context.
 * @param slot_identifier A pointer to the slot identifier (the position of the new entry).
 * @param slot_entry An array of slot entries.
 * @param num_slot_entries The size of the array of slot entries.
 * @return 0 Success.
 * @return <0 An error occurred.
 */ 
int asr_context_add_entries (asr_context_hdl_t *chdl, cfg_item_t *cfg, const char *slot_identifier, asr_slot_entry_t *slot_entry, int num_slot_entries);

/**
 * @brief Initialize the recognizer module
 * @details The @e %asr_recognition_initialize() function invokes the @e %init() callback function
 *          defined in the recognizer interface, @c asr_recognizer_if, for each active recognizer
 *          module.
 *
 * @return 0 Success.
 * @return <0 An error occurred.
 */ 
int asr_recognition_initialize();

/**
 * @brief Reload localization information
 * @details The @e %asr_reload_localization() function finds modules that require localized assets and reloads
 *          the definitions for those assets from the configuration structure.
 *
 * @return 0 Success.
 * @return <0 An error occurred.
 */ 
int asr_reload_localization(void);

/**
 * @brief Return the recongizer restart setting
 * @details The @e %asr_get_restart() function returns the recognizer restart setting.
 *
 * @return The recognizer restart setting.
 */ 
int asr_get_restart();

/**
 * @brief Set the recongizer restart setting
 * @details The @e %asr_get_restart() function sets the recognizer restart setting.
 *
 * @param restart The recognizer restart setting.
 * @return Nothing.
 */ 
void asr_set_restart(int restart);

/**
 * For internal use only. 
 */ 
const char *asr_get_features (void *hdl, uint32_t *num_feature_bytes, asr_instance_data_t *data);

/**
 * @brief Capture an utterance
 * @details The @e %asr_get_utterance() function invokes the @e %get_utterance() callback function
 *          defined in the recognizer interface, @c asr_recognizer_if. If no @e %get_utterance() function
 *          is defined in the recognizer interface, the  @e %get_utterance() callback function
 *          defined in the audio interface, @c asra_module_interface, is invoked instead.
 *
 * @param audio_info Audio capture information
 * @return 0 Success.
 * @return <0 An error occurred.
 */
int asr_get_utterance (asr_audio_info_t *audio_info);

/**
 * @brief Copy an utterance to the specified buffer
 * @details The @e %asr_set_utterance() function invokes the @e %set_utterance() callback function
 *          defined in the recognizer interface, @c asr_recognizer_if. If no @e %set_utterance() function
 *          is defined in the recognizer interface, the @e %set_utterance() callback function
 *          defined in the audio interface, @c asra_module_interface, is invoked instead.
 *
 * @param audio_info Indicates the structure in which to store the utterance.
 * @param ms_offset The offset (in milliseconds) of the utterance.
 *
 * @return 0 Success.
 * @return EBUSY Capture has not completed.
 * @return EINVAL The audio properties don't match.
 * @return ERANGE Buffer overrun.
 */
int asr_set_utterance (asr_audio_info_t *audio_info, uint32_t ms_offset);

/**
 * @brief Set a recognizer as current
 * @details The @e %asr_set_recognizer() function sets the specified recognizer as the current one for handling
 *          recognition requests.
 *
 * @param recognizer The name of the recognizer to set as current.
 * @return 0 Success.
 * @return <0 An error occurred.
 */
int asr_set_recognizer (const char *recognizer);

/**
 * @brief Capture logging information for the recognizer
 * @details The @e %asr_slog() function sends debugging information to the
 *          appropriate log. Log messages will be written to the log buffer only if their severity is
 *          greater than or equal to the specified severity.
 *
 * @param mod The recognizer handle.
 * @param severity The severity of the condition that triggered the message. 
 * For more information on severity levels, see @e slogf() in the <em>QNX C Library Reference</em>.
 * Valid values include:
 * - @c _SLOG_INFO
 * - @c _SLOG_WARN
 * - @c _SLOG_ERROR
 * - @c _SLOG_CRITICAL
 * @param fmt The format string to print to the log buffer. This may include tokens that will
 *            be replaced by values of variable arguments appended to the end of the call. The
 *            max length of an expanded log message is 1024 characters (this includes
 *            all format substitutions and the null terminator).
 * @return 0 Success.
 * @return <0 An error occurred.
 */
int asr_slog (asr_recognizer_hdl_t *mod, int severity, const char *fmt, ... ) __attribute__((format(printf, 3, 4)));

#ifdef __cplusplus
}
#endif
#endif

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/services/asr/core/public/asr/asr.h $ $Rev: 730767 $")
#endif
