/**
 * @file mod_types.h
 *
 * @brief Data types and functions for the audio, recognition, and conversation modules
 *
 * The @c mod_types.h header file provides data type definitions and functions for the audio, recognition,
 * and conversation modules. 
 *
 */

#ifndef ASR_MODULE_H_INCLUDED
#define ASR_MODULE_H_INCLUDED

#include "asr/types.h"
#include "asr/cfg.h"
#include "asr/asrp.h"
#include <inttypes.h>
#include <sys/slog.h>
#include <dlfcn.h>
#include <errno.h>
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/** The ASR version */
#define ASR_VERSION "0.9"

/**
 * @brief The status of the module
 *
 * This data type enumerates the states of readiness of modules. Either a module is
 * ready and can interact with @c io-asr or it can be shut down (or unloaded, if
 * implemented as a DLL).
 */
typedef enum module_status_e {
	ASR_MODULE_STATUS_READY,    /**< The module is ready. */
	ASR_MODULE_STATUS_SHUTDOWN, /**< The module can be shut down. */ 
} asr_module_status_t ;

/**
 * @brief The module handle
 * 
 * This opaque type represents the module handle. The module handle is used
 *  internally by @c io-asr to manage data passed between the modules.
 */
typedef struct asr_module_hdl asr_module_hdl_t;

/**
 * @brief The context handle
 * 
 * This type is an alias for the context handle, @c asr_context_hdl. 
 */
typedef struct asr_context_hdl asr_context_hdl_t;

/**
 * @brief Alias for the conversation module interface
 * 
 * This type is an alias for the conversation module interface, @c asr_conversation_if. 
 */
typedef struct asr_conversation_if asr_conversation_if_t;

/**
 *  @brief Conversation module interface
 *  @details This structure defines the interface from @c io-asr to the conversation modules.
 *           Each conversation module's constructor function passes this structure to the @e asrm_connect() function. 
 *           The @c io-asr service invokes the member callback functions depending on the state of the 
 *           module.
 */
struct asr_conversation_if {
	/** The name of this module. */
	const char *name;
	
	/**
	 * The version of ASR that this module was designed for. The version number is used to prevent newer, incompatible 
	 * modules from being used with an older build of ASR.
	 */
	const char *asr_version;
	
	/** Indicates whether localized assets (TTS prompts, commands, etc.) are required. Set to 
	 *  @c 0 if no localized assets are needed.
	 */
	int localized; 

	/**
	 * @brief Initialize the specified module
	 * @details Optional. The @c io-asr service calls @e %init() for each registered module upon startup.
	 *
	 * @b Arguments
	 *  - @c module_data The data provided to @c io-asr when the module registered itself.
	 *  - @c asr_config Configuration information for the converstaion module.
	 *
	 * @b Returns
	 *  - @c 0 Success
	 *  - @c -1 An error occurred. The @c io-asr service logs the error and exits.
	 */
	int                  (*init)(void *module_data, cfg_item_t *asr_config);

	/**
	 * @brief Destroy a module
	 * @details Optional. The @c io-asr service calls @e %destroy() when shutting down a module that has
	 *          successfuly initialized via the @e %init() function.
	 *
	 * @b Arguments
	 *  - @c module_data The data provided to @c io-asr when the module registered itself.
	 */
	void                 (*destroy)(void *module_data);

	/** 
	 * @brief Handle a change of state
	 * @details Optional. The @c io-asr service calls @e %on_asr_step() each time the state of the recognizer
	 *          changes (see @c #asr_step_t).
	 *
	 * @b Arguments
	 *  - @c step The current or last event that occurred on the recognizer.
	 *  - @c module_data The data provided to @e io-asr when the module registered itself.
	 *
	 * @b Returns
 	 *  - @c 0 Success.
	 *  - @c -1 An error occurred. The @c io-asr service logs the error and exits.
	 */
	int                  (*on_asr_step)(asr_step_t step, void *module_data);

	/**
	 * @brief Select a recognition result from active modules
	 * @details Optional. The @c io-asr service calls @e %select_result() 
	 *          for the current exclusive module if there is one; otherwise, @c io-asr makes the call for all active
	 *          registered modules. If a result is selected, it is returned via @e selected_result.
	 *
	 * @b Arguments
	 *  - @c results A list of results containing the hypotheses from the current recognition.
	 *  - @c module_data The data provided to @c io-asr when the module registered itself.
	 *  - @c selected_result A pointer to the result most suited for the module. The @c io-asr service treats as valid
	 *                        any result with a return value greater than -1.
	 *
	 * @b Returns
	 *  - @c > -1 if a result is selected; -1 if no result is selected.
	 */
	int (*select_result)(asr_result_t *results, void *module_data, asr_result_t **selected_result);

	/**
	 * @brief Handle a selected result
	 * @details Optional. The @c io-asr service calls @e %on_result() for a module only if no other module has a result
	 *          with a higher confidence level. Results found to be relevant to this module won't be
     *          processed if this function isn't defined.
	 *
	 * @b Arguments
	 *  - @c result A reference to the selected result within the results list.
	 *  - @c results The full list of results.
	 *  - @c module_data The data provided to @c io-asr when the module registered itself.
	 *
	 * @b Returns
	 *  - The next action to take. See @c asr_result_action_t for the list of actions.
	 */
	asr_result_action_t  (*on_result)(asr_result_t  *result, asr_result_t  *results, void *module_data);

	/**
	 * @brief Pass additional data for use with a result.
	 * @details Optional. The @c io-asr service calls @e %on_result_data() to specify additional parameters or pass additional
	 *  data that the module requires (i.e., not recognition results). For example, the module may require a
	 *  vendor-specific data format (e.g., a tracklist generated from a <tt>find music</tt> command).
	 *
	 * @b Arguments
	 *  - @c module_data The data or parameters to be passed to the module.
	 *  - @c error An error code. The error value is currently specific to the ASR vendor used with @c io-asr.
	 *
	 * @b Returns
	 *  - The next action to take; NULL on error. See @c asr_result_action_t for the list of actions.
	 */
	asr_result_action_t  (*on_result_data)(void *result, void *module_data, int error);
	
	/**
	 * @brief Stop the module
	 * @details Optional. The @c io-asr service calls @e %stop() if the speech session is canceled before an @e %on_result() callback has
	 *          completed. This callback can be useful to break out of any function that blocks for an extended period
	 *          of time in the @e %on_result() callback. A new speech session can't be started until the
	 *          @e %on_result() callback returns.
	 */
	void (*stop)(void);
} ;

/**
 * For internal use only.
 */
typedef struct appcon {
	int ver;
	int fd;
	asr_conversation_if_t *base_module;
	asr_conversation_if_t *current_module;
} appcon_t ;


/**
 *  @brief Audio capture information
 *  @details This structure carries the audio capture properties.
 */
typedef struct asr_audio_info {
	uint8_t *buffer;  /**< The buffer to carry the audio samples. */
	int buffer_len;   /**< The length of the buffer. */
	int sample_size;  /**< The number of bits per sample. */
	int sample_rate;  /**< The sample rate. */
	int channels;     /**< The number of channels. */
} asr_audio_info_t;

/**
 * @brief Alias for the audio module interface
 * 
 * This type is an alias for the audio module interface, @c asra_module_interface. 
 */
typedef struct asra_module_interface asra_module_interface_t;

/**
 *  @brief Audio module interface
 *  @details This structure defines the interface from @c io-asr to the audio module.
 *           Each audio module's constructor function passes this structure to 
 *           @e asra_connect().
 */
struct asra_module_interface {
	/** The name of the module.  */
	const char *name;
	
	/**
	 * The version of ASR that this module was designed for. The version number is used to prevent newer, incompatible 
	 * modules from being used with an older build of ASR.
	 */
	const char *version;
	
	/**
	 * @brief Initialize the specified module
	 * @details The @c io-asr service calls @e %init() for each registered module on startup.
	 *          The @e %init() function sets the audio properties.
	 *
	 * @b Arguments
	 *  - @c asr_config ASR configuration information (such as the sample rate, number of channels
	 *        sample size, and so on. The required settings depend on the vendor implementation). See @c #cfg_item_t.
	 *
	 * @b Returns
	 *  - @c 0 Success.
	 *  - @c <0 An error occurred.
	 */
	int (*init)(cfg_item_t *asr_config);
	
	/**
	 * @brief Destroy a module
	 * @details The @c io-asr service calls @e %destroy() when shutting down a module that has
	 *          successfuly initialized via the @e %init() function.
     */
	void (*destroy)();
	
	/**
	 * @brief Rate this module for the specified source
	 * @details The @e %rate() function rates this module's ability to handle the specified
	 *          audio source URL. The module should rate itself 100 if it can reliably play
	 *          resources of the specified type, but should supply a lower rating if can't
	 *          play the resources or if it must perform additional processing first.
	 *
	 * @b Arguments
	 *  - @c url The URL for the audio source.
	 *
	 * @b Returns
	 *  - The module's rating on success; @c -1 on error.
	 */
	int (*rate) (const char *url);
	
	/**
	 * @brief Remove the rating for this module
	 * @details The @e %unrate() function removes the rating for this audio module.
	 */
	void (*unrate)();
	
	/**
	 * @brief Set the audio parameters for this module
	 * @details  The @e %set_params() function sets the global audio parameters for this module.
	 *
	 * @b Returns
	 *  - @c 0 Success.
	 *  - @c -1 An error occurred.
	 */
	int (*set_params)();
	
	/**
	 * @brief Open the audio module
	 * @details The @e %open() function opens this audio module.
	 *
	 * @b Returns
	 *  - @c 1 Success.
	 *  - @c <1 An error occurred.
	 */
	int (*open)();
	
	/**
	 * @brief Start the audio module.
	 * @details The @e %start() function causes the module to begin to perform its particular service,
	 * for example capturing audio or playing back from a file.
	 *
	 * @b Returns
	 *  - @c 0 Success.
	 *  - @c -1 An error occurred.
	 */
	int (*start)();
	
	/**
	 * @brief Request an audio buffer
	 * @details The @e %acquire_buffer() function requests a buffer. 
	 *
	 * @b Arguments
	 *  - @c info The structure to store the audio sample.
	 *  - @c wait An optional flag to indicate whether the module should wait for a successful audio sample.
	 *
	 * @b Returns
	 *  - @c 0 Capturing has finished. The buffer is available.
	 *  - @c >0 Capturing is ongoing.
	 *  - @c <0 An error ocurred.
	 */
	int (*acquire_buffer)(asr_audio_info_t *info, int wait);
	
	/**
	 * @brief Relinquish an audio buffer
	 * @details The @e %relinquish_buffer() function resets the buffer in the @e info structure
	 *          so that it can be used again.
	 *
	 * @b Arguments
	 *  - @c info The structure that contains the buffer.
	 */
	void (*relinquish_buffer)(asr_audio_info_t *info);
	
	/**
	 * @brief Capture an utterance
	 * @details The @e %get_utterance() function stores an audio sample in the buffer
	 *          referenced by the @e info parameter. It also sets the associated properties
	 *          of the utterance: buffer size, sample size, sample rate, and number of channels.
	 *          The @e %get_utterance() function waits until the audio capture has completed before copying
	 *          the sample and returning.
	 *
	 * @b Arguments
	 *  - @c info Indicates the structure in which to store the utterance and set
	 *             the properties.
	 *
	 * @b Returns
	 *  - @c 0 Success.
	 *  - @c -1 An error occurred.
	 */
	int (*get_utterance)(asr_audio_info_t *info);
	
    /**
	 * @brief Copy an utterance to the specified buffer
	 * @details The @e %set_utterance() function copies the last captured audio sample to the buffer referenced
	 *          by the @e info parameter, at the offset specified by the @e offset_ms parameter. The sample size,
	 *          sample rate, and number of channels must match the properties of the captured
	 *          sample. If the requested offset results in a buffer overrun, an error is returned. If the
	 *          audio capture has not completed, an error is returned.
	 *
	 * @b Arguments
	 *  - @c info Indicates the structure in which to store the utterance.
	 *  - @c offset_ms The offset (in milliseconds) of the utterance.
	 *
	 * @b Returns
	 *  - @c 0 Success.
	 *  - @c EBUSY Capture has not completed.
	 *  - @c EINVAL The audio properties don't match.
	 *  - @c ERANGE Buffer overrun.
	 */
	int (*set_utterance) (asr_audio_info_t *info, int offset_ms);
	
	/**
	 * @brief Save the captured audio sample as a WAV file
	 * @details The @e %save_wavefile() copies the captured audio sample as a WAV file with the 
	 *          specified filename.
	 *
	 * @b Arguments
	 *  - @c fname The name to use for the WAV file.
	 *
	 * @b Returns
	 *  - @c 0 Success.
	 *  - @c -1 The file couldn't be opened for writing.
	 */
	int (*save_wavefile)(const char *fname);
	
	/**
	 * @brief Stop the audio capture
	 * @details The @e %stop() function forces the audio capturing to stop.
	 *
	 * @b Returns
	 *  - @c 0 Success
	 *  - @c -1 An error occurred.
	 */
	int (*stop)();
	
	/**
	 * @brief Close the audio module.
	 * @details The @e %close() function closes the audio module.
	 *
	 * @b Returns
	 *	- @c 0 on success.
	 */
	int (*close)();
} ;

/**
 * @brief The transcription type
 * @details A transcription represents the different ways a
 * context entry word can be spelled. The transcription is associated with a slot
 * entry and is used to update a recognizer context with additional
 * speech information (e.g., names from a phonebook for voice dialing).
 */
typedef struct asr_transcription_s {
	int type;         /**< The type of the transcription. */
	void *data;       /**< A pointer to the transcriptions. */
	size_t data_len;  /**< The length of the data. */
} asr_transcription_t ;

/** The maximum number of slot updates allowed */
#define MAX_SLOT_UPDATE 200;

/** The maximum number of transcriptions allowed */
#define MAX_TRANSCRIPTIONS 5;

/**
 * @brief A transcription slot entry
 * @details  A slot entry is used internally by the ASR subsystem to manage context slots. The word
 * buffer contains the terminal string associated with the slot. There are no restrictions on the
 * contents of the word buffer. The @c asr_slot_entry_t structure is a member of the structure
 * @c _Entry in @c slot-factory.h
 */
typedef struct asr_slot_entry {
	char *word;                           /**< The word buffer. */
	uint64_t id;                          /**< The ID of the entry. */   
	asr_transcription_t *transcription;   /**< A pointer to the transcriptions for this entry. */
	size_t num_transcriptions;            /**< The number of transcriptions for this entry. */
} asr_slot_entry_t ;

/**
 * @brief An alias for the recognizer handle, @c asr_recognizer_hdl
 * @details This type is an alias for the opaque recognizer handle, @c asr_recognizer_hdl.
 */
typedef struct asr_recognizer_hdl asr_recognizer_hdl_t;

/**
 * @brief An alias for the recognizer interface, @c asr_recognizer_if
 * @details This type is an alias for the recognizer interface, @c asr_recognizer_if
 */
typedef struct asr_recognizer_if asr_recognizer_if_t;

/**
 * @brief The recognizer interface
 * @details The recognizer interface provides functions to @c io-asr for
 *          managing speech-to-text processing. Each recognizer module's constructor
 *          function passes this structure to @e asr_connect().
 */
struct asr_recognizer_if {
	/** The name of the module. */
	const char *name;
	
	/**
	 * The version of ASR that this module was designed for. The version number is used to prevent newer, incompatible 
	 * modules from being used with an older build of ASR.
	 */
	const char *version;
	
	/**
	 * @brief Initialize the module
	 * @details The @c io-asr service calls @e %init() for each registered module on startup.
	 *          The @e %init() function sets the recognizer properties. The properties
	 *          that are required vary by vendor.
	 *
	 * @b Arguments
	 *  - @c config_base Configuration data for this recognizer. See @c #cfg_item_t.
	 *
	 * @b Returns
	 *  - @c 0 Success.
	 *  - @c <0 An error occurred.
	 */ 
	int (*init)(cfg_item_t *config_base);
	
	/**
	 * @brief Clean up memory and data after shutting down a module
	 * @details The @c io-asr service calls @e %cleanup() after shutting down a module to release any memory, destroy mutexes
	 *          or condvars, or handle any data that must be changed as a result of the module shutting
	 *          down. The exact requirements of the cleanup vary by vendor.
	 *
	 * @b Returns
	 *  - @c 0 Success.
	 *  - @c <0 An error occurred.
	 */ 	
	int (*cleanup)();
	
	/**
	 * @brief Start the module
	 * @details The @c io-asr service calls @e %start() to start a recognition request. The recognizer should collect and process the
     *          audio sample, and then provide status and results via the API defined in the ASR vendor interface, @c asrv.h.
     *          This call must be asynchronous and the recognition operation started must be interuptable via a call to
     *          the @e %stop() callback.
	 *
	 * @b Returns
	 *  - @c 0 Success.
	 *  - @c <0 An error occurred.
	 */ 	
	int (*start)();
	
	/**
	 * @brief Stop the module
	 * @details The @c io-asr service calls @e %stop() to stop the current recognition operation. The recognizer stops audio
	 *          acquisition and stops processing results.
	 *
	 * @b Returns
	 *  - @c 0 Success.
	 *  - @c <0 An error occurred.
	 */ 
	int (*stop)();
	
	/**
	 * @brief Handle a recognition step
	 * @details The @c io-asr service calls @e %step() when the module's current step changes. The @e %step() function
	 *          takes the appropriate action depending on what the step is.
	 *
	 * @b Arguments
	 *  - @c step The step to handle.
	 *
	 * @b Returns
	 *  - @c 0 Success.
	 *  - @c <0 An error occurred.
	 */ 
	void (*step)(asr_step_t step);
	
	/**
	 * @brief Create a context
	 * @details The @c io-asr service calls @e %context_create() during the recognition process to create 
	 *          a recognition context.
	 *
	 * @b Arguments
	 *  - @c cfg The configuration structure for the recognizer.
	 *
	 * @b Returns
	 *  - A pointer to the new context handle on success.
	 */ 
	asr_context_hdl_t *(*context_create)(cfg_item_t *cfg);
	
	/**
	 * @brief Save a context
	 * @details After @c io-asr has created a context by invoking @e %context_create(), it
	 *          calls @e %context_save() to save the context in the recognizer's required
	 *          format, which varies by vendor.
	 *
	 * @b Arguments
	 *  - @c hdl The context handle.
	 *  - @c cfg The configuration structure for the recognizer.
	 *
	 * @b Returns
	 *  - @c 0 Success.
	 *  - @c <0 An error occurred.
	 */ 
	int (*context_save)(asr_context_hdl_t *hdl, cfg_item_t *cfg);
	
	/**
	 * @brief Add entries to the specified context.
	 * @details The @c io-asr service calls @e %context_add_entries() to add additional entries to the specified context.
	 *
	 * @b Arguments
	 *  - @c hdl A pointer to the context handle.
	 *  - @c cfg A pointer to the configuration associated with the context.
	 *  - @c slot_identifier A pointer to the slot identifier (the position of the new entry).
	 *  - @c slot_entry A pointer to the array of new entries.
	 *  - @c num_slot_entries The number of entries to add.
	 *
	 * @b Returns
	 *  - @c 0 Success.
	 *  - @c <0 An error occurred.
	 */ 
	int (*context_add_entries)(asr_context_hdl_t *hdl, cfg_item_t *cfg, const char *slot_identifier, asr_slot_entry_t *slot_entry, int num_slot_entries);
	
	/**
	 * @brief Delete entries from the specified context.
	 * @details The @c io-asr service calls @e %context_delete_entries() to remove entries from the specified context.
	 *
	 * @b Arguments
	 *  - @c hdl A pointer to the context handle.
	 *  - @c cfg A pointer to the configuration associated with the context.
	 *  - @c slot_identifier A pointer to the slot identifier (the position of the entry).
	 *  - @c slot_entry A pointer to the entry.
	 *  - @c num_slot_entries The number of entries to delete.
	 *
	 * @b Returns
	 *  - @c 0 Success.
	 *  - @c <0 An error occurred.
	 */ 
	int (*context_delete_entries)(asr_context_hdl_t *hdl, cfg_item_t *cfg, const char *slot_identifier, asr_slot_entry_t *slot_entry, int num_slot_entries);
	
	/**
	 * @brief Destroy the specified context.
	 * @details The @c io-asr service calls @e %context_destroy() to destroy a context.
	 *
	 * @b Arguments
	 *  - @c hdl A pointer to the context handle.
	 *
	 * @b Returns
	 *  - @c 0 Success.
	 *  - @c <0 An error occurred.
	 */ 
	int (*context_destroy)(asr_context_hdl_t *hdl);
	
	/**
	 * @brief Capture an utterance
	 * @details The @e %get_utterance() function stores an audio sample in the buffer
	 *          referenced by the @e info parameter. It also sets the associated properties
	 *          of the utterance: buffer size, sample size, sample rate, and number of channels.
	 *          The @e get_utterance function waits until the audio capture has completed before copying
	 *          the sample and returning.
	 *
	 * @b Arguments
	 *  - @c audio_info Indicates the structure in which to store the utterance and set
	 *             the properties.
	 *
	 * @b Returns
	 *  - @c 0 Success.
	 *  - @c -1 An error occurred.
	 */
	int (*get_utterance)(asr_audio_info_t *audio_info);
	
    /**
	 * @brief Copy an utterance to the specified buffer
	 * @details The @e %set_utterance() function copies the last captured audio sample to the buffer referenced
	 *          by the @e info parameter, at the offset specified by the @e offset_ms parameter. The sample size,
	 *          sample rate, and number of channels must match the properties of the captured
	 *          sample. If the requested offset results in a buffer overrun, an error is returned. If the
	 *          audio capture has not completed, an error is returned.
	 *
	 * @b Arguments
	 *  - @c audio_info Indicates the structure in which to store the utterance.
	 *  - @c offset_ms The offset (in milliseconds) of the utterance.
	 *
	 * @b Returns
	 *  - @c 0 Success.
	 *  - @c EBUSY Capture has not completed.
	 *  - @c EINVAL The audio properties don't match.
	 *  - @c ERANGE Buffer overrun.
	 */
	int (*set_utterance)(asr_audio_info_t *audio_info, uint32_t offset_ms);
};

/**
 * @brief Connect the recognition module to @c io-asr
 * @details The @e %asr_connect() function adds the specified recognizer to <tt>io-asr</tt>'s list of 
 *          registered modules, and then attaches the specified interface to the new handle.
 * @param rif The initialized recognizer interface. The name, version, and callbacks in the interface must be
 *            set.
 * @param len The size of the recognizer interface.
 * @return The recognizer handle on success; NULL on error.
 */
asr_recognizer_hdl_t *asr_connect(const asr_recognizer_if_t *rif, unsigned len);

/**
 * @brief Finds a matching string (case-insensitive)
 * @details The @e %stristr() function performs a case-insensitive search for @e find in @e string.
 *          In other words, this is a case-insensitive version of the standard POSIX @e %strstr() function.
 * @param string The string to search within.
 * @param find The string to search for.
 * @param opt_len The maximum length of @e string to search.
 * @return The search string on success; NULL on error.
 */
char *stristr(const char *string, const char *find, int opt_len);


#ifdef __cplusplus
}
#endif
#endif

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/services/asr/core/public/asr/mod_types.h $ $Rev: 730767 $")
#endif
