/**
 * @file asra.h
 * @brief Data types and functions for interacting with the audio module
 *
 * @details The @c asra.h header file provides functions and data types for capturing audio from the
 *          microphone or reading audio data from a file.
 */


#ifndef _ASRA_H_
#define _ASRA_H_

#include "asr/protos.h"
#include "asr/mod_types.h"
#include <ctype.h>

#ifdef __cplusplus
extern "C" {
#endif

/**
 * @brief This audio module handle
 * @details This opaque type represents the audio module handle and is used by @c io-asr to manage data it
 *  passes to and from the audio module.
 */
typedef struct asra_module_hdl asra_module_hdl_t;

/**
 * @brief Initialize the audio module
 * @details The @e %asr_audio_initialize() function initializes registered audio modules by
 *          invoking their @e %init() callback functions (see @c #asra_module_interface_t).
 * @return 0 Success.
 * @return -1 An error occurred.
 */
int asr_audio_initialize(void);

/**
 * @brief Connect to the audio module
 * @details The @e %asra_connect() function connects to the specified audio module by adding the module
 *        to <tt>io-asr</tt>'s list of current modules.
 * @param aif The audio module interface.
 * @param len The size of the audio module interface.
 * @return The audio module handle on success; NULL on error, with error details written to the log.
 */
asra_module_hdl_t *asra_connect(const asra_module_interface_t *aif,unsigned len);

/**
 * @brief Disconnect the prompt module
 * @details The @e %asra_disconnect() function disconnects the specified audio module from
 *        @c io-asr and frees the associated memory.
 * @param hdl The prompt module handle.
 * @return Nothing.
 */
void asra_disconnect(asra_module_hdl_t *hdl);

/**
 * @brief Set the audio source
 * @details The @e %asra_set_source() sets the specified URL as the audio source and sets the module
 *          best suited to that URL (the module that rates itself highest) as current.
 * @param url The audio source URL.
 * @return 0 Success.
 * @return -1 An error occurred.
 */
int asra_set_source(const char *url);

/**
 * @brief Set the audio parameters for the module
 * @details  The @e %asra_set_params() function sets the global audio parameters.
 * @param sample_rate The audio sample rate.
 * @param volume The audio volume.
 * @param frag_size The audio fragment size. 
 * @return 0 Success.
 * @return -1 An error occurred.
 */
int asra_set_params (int sample_rate, int volume, int frag_size);

/**
 * @brief Open the audio module
 * @details The @e %asra_open() function opens the current audio module.
 *
 * @return >=0 Success.
 * @return <0 An error occurred.
 */
int asra_open();

/**
 * @brief Start the audio module.
 * @details The @e %asra_start() function causes the module to begin to perform its particular service,
 * for example capturing audio or playing back from a file.
 *
 * @return 0 Success.
 * @return -1 An error occurred.
 */
 int asra_start();

/**
 * @brief Request an audio buffer
 * @details The @e %asra_acquire_buffer() function requests a buffer. 
 *
 * @param info The structure to store the audio sample.
 * @param wait An optional flag to indicate whether the module should wait for a successful audio sample.
 * @return 0 Capturing has finished. The buffer is available.
 * @return >0 Capturing is ongoing.
 * @return <0 An error ocurred.
 */
int asra_acquire_buffer (asr_audio_info_t *info, int wait); 

/**
 * @brief Relinquish an audio buffer
 * @details The @e %asra_relinquish_buffer() function resets the buffer in the @e info structure
 *          so that it can be used again.
 *
 * @param info The structure that contains the buffer.
 * @return 0 Success.
 * @return -1 An error occurred.
 */
int asra_relinquish_buffer (asr_audio_info_t *info); 

/**
 * @brief Capture an utterance
 * @details The @e %asra_get_utterance() function stores an audio sample in the buffer
 *          referenced by the @e info parameter. It also sets the associated properties
 *          of the utterance: buffer size, sample size, sample rate, and number of channels.
 *          It waits until the audio capture has completed before copying
 *          the sample and returning.
 *
 * @param info The structure in which to store the utterance and set the properties.
 * @return 0 Success.
 * @return -1 An error occurred.
 */
int asra_get_utterance (asr_audio_info_t *info);

/**
 * @brief Copy an utterance to the specified buffer
 * @details The @e %asra_set_utterance() function copies the last captured audio sample to the buffer referenced
 *          by the @e info parameter, at the offset specified by the @e offset_ms parameter. If the requested
 *          offset results in a buffer overrun, an error is returned. If the
 *          audio capture hasn't completed, an error is returned.
 *
 * @param info Indicates the structure in which to store the utterance.
 * @param offset_ms The offset (in milliseconds) of the utterance.
 * @return 0 Success.
 * @return EBUSY Capture has not completed.
 * @return ENOMEM Buffer overrun or other memory error.
 */
int asra_set_utterance (asr_audio_info_t *info, int offset_ms); 

/**
 * @brief Stop the audio capture
 * @details The @e %asra_stop() function forces the audio capturing to stop.
 *
 * @return 0 Success.
 * @return -1 An error occurred.
 */
int asra_stop();

/**
 * @brief Close the audio module
 * @details The @e %asra_close() function closes the current audio module.
 *
 * @return 0 Success.
 * @return <0 An error occurred.
 */
int asra_close();

/** 
 * @brief Save the captured audio sample as a WAV file
 * @details The @e asra_save_wavefile() copies the captured audio sample as a WAV file
 *          with the specified filename.
 *
 * @param fname The name to use for the WAV file.
 * @return 0 Success.
 * @return -1 The file couldn't be opened for writing.
 */
int asra_save_wavefile(const char *fname);

#ifdef __cplusplus
}
#endif
#endif

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/services/asr/core/public/asr/asra.h $ $Rev: 730767 $")
#endif
