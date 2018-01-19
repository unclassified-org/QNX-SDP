/**
 * @file asrv.h
 *
 * @brief Functions for vendor-specific actions
 *
 * @details The @c asrv.h header file provides functions to interact with vendor-supplied modules.
 */
#ifndef _ASRV_H_
#define _ASRV_H_

#include "asr/mod_types.h"
#include <ctype.h>

#ifdef __cplusplus
extern "C" {
#endif

/*
* Vendor result calls
*/

/**
 * @brief Handle results from recognizer
 * @details The @e %asrv_post_result() function handles the specified recognition result. It ensures ASR isn't on hold,
 *          selects the appropriate module, passes the result to the module for actioning (the module's @e %on_result()
 *          callback function is invoked), and returns the action to take next.
 * @param hdl The recognizer handle.
 * @param results The results to post.
 * @return The next action to take.
 */
asr_result_action_t asrv_post_result (void *hdl, asr_result_t *results);

/**
 * @brief Post a recognition step
 * @details The @e %asrv_post_step() function handles the specified step. In the case of an active recognition turn
 *          it invokes the appropriate module's @e %step() callback function.
 * @param step The step to post.
 * @return Nothing.
 */
void asrv_post_step (asr_step_t step);

/**
 * @brief Pass additional data for use with a result
 * @details The @e %asrv_post_data() function specifies additional parameters or passes additional
 *  data that the active module requires (i.e., not recognition results). For example, the module may require a
 *  vendor-specific data format (e.g., a tracklist generated from a <tt>find music</tt> command).
 * @param hdl The recognizer handle.
 * @param data The data or parameters to be passed to the module.
 * @param error An error code. The error value is currently specific to the ASR vendor used with @c io-asr.
 * @return The next action to take; NULL on error. See @c asr_result_action_t for the list of actions.
 */
asr_result_action_t asrv_post_data (void *hdl, void *data, int error);

/**
 * @brief Return @c <tt>io-asr</tt>'s active configuration sections
 * @details The @e %asrv_get_active_sections() function returns <tt>io-asr</tt>'s active configuration sections.
 * @param sections A pointer to the sections (the active sections will be returned using this pointer).
 * @return The number of active sections.
 */
int asrv_get_active_sections(char **sections[]);

/**
 * @brief Return @c io-asr's active recognizer configuration sections
 * @details The @e %asrv_get_recognizer_sections() function returns <tt>io-asr</tt>'s active recognizer-related
 *          configuration sections.
 * @param name This parameter is currently not used.
 * @param recognizer_section A pointer to the sections (the active sections will be returned using this pointer).
 * @return The number of sections returned.
 */
int asrv_get_recognizer_sections(char *name, cfg_item_t **recognizer_section[]);

/** 
 * @brief Get the active context
 * @details The @e %asrv_get_context() function returns the preloaded context that the current exclusive module 
 *          has selected to use for recognition. 
 * @param chdl The context handle.
 * @return 1 on success.
 * @return 0 if no context is active.
 */
int asrv_get_context(asr_context_hdl_t **chdl);


/*
* Vendor audio acquisition calls
*/

/**
 * @brief Set the audio parameters for the module
 * @details  The @e %asrv_audio_set_params() function sets the global audio parameters.
 * @param sample_rate The audio sample rate.
 * @param volume The audio volume.
 * @param frag_size The audio fragment size. 
 * @return 0 Success.
 * @return -1 An error occurred.
 */
int asrv_audio_set_parms (int sample_rate, int volume, int frag_size);

/**
 * @brief Open the audio module
 * @details The @e %asrv_audio_open() function opens the current audio module.
 *
 * @return >=0 Success.
 * @return <0 An error occurred.
 */
int asrv_audio_open();

/**
 * @brief Start the audio module.
 * @details The @e %asrv_audio_start() function causes the module to begin to perform its particular service,
 *          for example capturing audio or playing back from a file.
 * @return 0 Success.
 * @return -1 An error occurred.
 */
int asrv_audio_start();

/**
 * @brief Request an audio buffer
 * @details The @e %asrv_audio_acquire_buffer() function requests a buffer. 
 * @param buffer The structure to store the audio sample.
 * @param bufflen The size of the buffer.
 * @param more_data An flag to indicate whether more data is available.
 * @return 0 Capturing has finished. The buffer is available.
 * @return >0 Capturing is ongoing.
 * @return <0 An error ocurred.
 */
int asrv_audio_acquire_buffer (char **buffer, int *bufflen, int *more_data);

/**
 * @brief Relinquish an audio buffer
 * @details The @e %asrv_audio_relinquish_buffer() function resets the buffer in the @e buffer structure
 *          so that it can be used again.
 * @param buffer The structure that contains the buffer.
 * @return 0 Success.
 * @return -1 An error occurred.
 */
int asrv_audio_relinquish_buffer(char *buffer);

/**
 * @brief Stop the audio capture
 * @details The @e %asrv_audio_stop() function forces the audio capturing to stop.
 * @return 0 Success.
 * @return -1 An error occurred.
 */
int asrv_audio_stop();

/**
 * @brief Close the audio module
 * @details The @e %asrv_audio_close() function closes the current audio module.
 * @return 0 Success.
 * @return <0 An error occurred.
 */
int asrv_audio_close();

#ifdef __cplusplus
}
#endif
#endif

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/services/asr/core/public/asr/asrv.h $ $Rev: 730767 $")
#endif
