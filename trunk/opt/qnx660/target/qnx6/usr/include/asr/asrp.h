/**
 * @file asrp.h
 *
 * @brief Functions and data types for prompts
 *
 * @details The @c asrp.h header file provides functions and data types for rendering prompts.
 */

#ifndef _ASRP_H
#define _ASRP_H
#include <sync.h>
#include "asr/mod_types.h"

#ifdef __cplusplus
extern "C" {
#endif

/**
 * @brief Prompt type enumeration
 * @details The @c asrp_processing_flags_t enumeration lists the types of prompts that can be 
 * processed. Depending on the stage processing, members of this enumeration could indicate prompts
 * that have been rendered or prompts that are required.
 */
typedef enum {
	ASRP_NO_PROMPTS             = 0,     /**< No prompts. */
	ASRP_AUDIO_PROMPT           = 0x01,  /**< Audio prompt. */
	ASRP_VISUAL_PROMPT          = 0x02,  /**< Visual prompt, such as a dialog. */
	ASRP_INTERACTIVE_PROMPT     = 0x10,  /**< Interactive prompt to collect user input. */
	ASRP_PROMPT_STEP_NOTIFY     = 0x20,  /**< The member is used in processing prompts. */
} asrp_processing_flags_t;

/**
 * @brief Alias for the prompt information type
 * 
 * This type is an alias for the prompt information type, @c asrp_prompt_info. 
 */
typedef struct asrp_prompt_info asrp_prompt_info_t;

/**
 * @brief Alias for the prompt module interface
 * 
 * This type is an alias for the prompt module interface, @c asrp_module_interface. 
 */
typedef struct asrp_module_interface asrp_module_interface_t;

/**
 * @brief The prompt module interface
 * @details This structure defines the interface from @c io-asr to the prompt module.
 *          The prompt module's constructor function passes this structure to @e asrp_connect(). 
 *          The @c io-asr service invokes the member callback functions depending on the state of the 
 *          module.
 */
struct asrp_module_interface {
    /** The name of the prompt module */
	const char *name;
	
	/** The version of the prompt module */
	const char *version;
	
	/**
	 * @brief Initialize the prompt module.
	 * @details This function initializes the prompt module. Among other actions it may take,
	 *          it should open the PPS control object for monitoring.
	 *
	 * @b Arguments
	 *  - @c module_data A pointer to any data the prompt module requires for initialization.
	 *  - @c asr_config Configuration settings for the module.
	 *
	 * @b Returns
	 *  - @c 0 on success; @c -1 on error
	 */
	int (*init)(void *module_data, cfg_item_t *asr_config);
	
	/**
	 * @brief Set a rating for this prompt module.
	 * @details The @e %rate() function sets a rating for the prompt interface handled by this module.
	 *         Higher quality, interactive interfaces (such as the HMI) generally receive higher
	 *         ratings than less interactive interfaces (such as the console).
	 *
	 * @b Arguments
	 *  - @c prompt_info Identifying information about the prompt.
	 *  - @c visual_rating The visual rating is returned in this parameter.
	 *  - @c audio_rating The audio rating is returned in this parameter.
	 *  - @c module_data Optional data relating to the module.
	 *
	 * @b Returns 
	 *  - @c 0 on success; @c -1 on error
	 */
	int (*rate)(asrp_prompt_info_t *prompt_info, int *visual_rating, int *audio_rating, void *module_data);
	
	 /**
	 * @brief Remove ratings for this prompt module.
	 * @details The @e %unrate() function removes ratings for this module.
	 *
	 * @b Arguments 
	 *  - @c module_data Optional data relating to the module.
	 *
	 * @b Returns 
	 *  - @c  0 on success; @c -1 on error
	 */
	int (*unrate)(void *module_data);
	
	/**
	 * @brief Start the prompt module.
	 * @details The @e %start() function starts the prompt module.
	 *
	 * @b Arguments 
	 *  - @c prompt_info Information to pass to the prompt module.
	 *  - @c module_data Optional data relating to the module.
	 *
	 * @b Returns 
	 *  - @c Flags to indicate which, if any, prompts were rendered.
	 */
	asrp_processing_flags_t (*start)(asrp_prompt_info_t *prompt_info, void *module_data);
	
	 /**
	 * @brief Stop the prompt module.
	 * @details The @e %stop() function stops the prompt module.
	 *
	 * @b Arguments 
	 *  - @c module_data Optional data relating to the module.
	 *
	 * @b Returns 
	 *  - @c ASRP_NO_PROMPTS on success.
	 */
	asrp_processing_flags_t (*stop)(void *module_data);
	
	/**
	 * @brief Handle a step
	 * @details The @e %step() function handles a step. The action taken depends on the step specified.
	 *
	 * @b Arguments 
	 *  - @c step The step to handle.
	 *  - @c module_data Optional data relating to the module.
	 */
	void (*step)(asr_step_t step, void *module_data);
} ;


/*
* Interactive visual dialog support
*/
/**
 * @brief Prompt response callback function
 * @details The @e %asrp_response_cb_t() function can be called from a prompt dialog (e.g., when
 *          the user clicks OK).
 *          
 * @param selection_index An index that represents an item in a list of options presented to the user. A value
 *        of @c -1 indicates a cancel action.
 * @param payload Data for this function to manipulate. If no changes are made, this function should pass
 *        back a NULL pointer.
 */
typedef void (*asrp_response_cb_t)(int selection_index, cfg_item_t *payload);

/**
 * @brief Alias for the prompt visual dialog
 * 
 * This type is an alias for the prompt visual dialog, @c asrp_visual_dialog.
 */
typedef	struct asrp_visual_dialog asrp_visual_dialog_t;

/**
 * @brief The prompt visual dialog
 * 
 * This type is used to set text to be displayed to the user in a visual dialog in the HMI. The elements
 * of this type represent the header and footer of the dialog, an array of items to display in the center of
 * the dialog, and text to be displayed on the cancel button, as well as a callback function and optional
 * data to pass to the callback.
 */
struct asrp_visual_dialog {
	const char *header;              /**< Text to display above the array of items. */
	int num_items;                   /**< The number of items in the array. */
	const char **item;               /**< The items to display. */
	const char *footer;              /**< Text to display below the array of items. */
	const char *cancel_button;       /**< Text to display on the cancel button. */
	asrp_response_cb_t response_cb;  /**< A callback to be invoked on the OK button. */
	void *data;                      /**< Data to be passed in the response callback. */
} ;

/**
 * @brief The prompt information type
 * 
 * This type represents information required to produce a prompt. 
 */
struct asrp_prompt_info {
	asrp_processing_flags_t prompt_flags; /**< The type of prompt */
	const char *audio_url;                /**< The URL for the audio source for an audio prompt. Acceptable formats include
	                                           <tt>%file://</tt> and <tt>string://</tt> for text for TTS; <tt>wav://</tt> for an audio file to play. */
	const char *disp_url;                 /**< The URL for a noninteractive display (text bubbles and other simple notices). */
	asrp_visual_dialog_t visual_dialog;   /**< The visual dialog to display. */
	cfg_item_t *payload;                  /**< Data that can be provided for the caller's consumption. This member can express
	                                           arbritrary information, so is useful for providing text to display or audio files
	                                           to load.*/
	asrp_response_cb_t response_cb;       /**< Optional callback from the prompt module (on-screen dialogs defined in the payload). */
} ;

/**
 * @brief The prompt module handle.
 * 
 * This opaque data structure is used by @c io-asr to manage data it passes to and from the prompt module. 
 */
typedef struct asrp_module_hdl asrp_module_hdl_t;

/**
 * @brief Connect to the prompt module
 * @details The @e %asrp_connect() function connects to the prompt module and 
 *          returns identifying information about the recognizer via the @e data parameter. 
 *          
 * @param pmif The prompt module interface.
 * @param len The size of the prompt module interface.
 * @param data Data associated with the prompt module.
 * @return The prompt module handle.
 */
asrp_module_hdl_t *asrp_connect (const asrp_module_interface_t *pmif, unsigned len, void *data);

/**
 * @brief Capture logging information for the prompt module
 * @details The @e %asrp_slog() function sends debugging information to the
 *          appropriate log. Log messages will be written to the log buffer only if their severity is
 *          greater than or equal to the specified severity.
 *
 * @param mod The prompt module handle.
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
int asrp_slog (asrp_module_hdl_t *mod, int severity, const char *fmt, ... )  __attribute__((format(printf, 3, 4)));

/**
 * @brief The prompt interface.
 * @details This data structure represents the high-level interface between the prompt module and @c io-asr. 
 *          The callback functions provide the mechanism for @c io-asr to request actions from the prompt module.
 */
typedef struct asr_prompt_interface {
	/** The version of the module. */
	const char *version;
	/** The @e %connect() callback function. */
	asrp_module_hdl_t *(*connect) (const asrp_module_interface_t *pmif, unsigned pmif_size, void *module_data);
	/** The logging callback function. */
	int (*slog) (asrp_module_hdl_t *mod, int severity, const char *format, ...) __attribute__((format(printf, 3, 4)));
	/** The @e %start() callback function. */
	asrp_processing_flags_t (*start) (asrp_prompt_info_t *pi);
	/** The @e %stop() callback function. */
	void (*stop) (asrp_processing_flags_t prompt_services);
	/** The @e %reset() callback function. */
	void (*reset)(void);
	/** The @e %active_help() callback function. */
	void (*active_help)(void);
	/** The @e %section_help() callback function. */
	void (*section_help)(cfg_item_t *section);
	/** The @e %play_tts() callback function. */
	asrp_processing_flags_t (*play_tts) (char *fmt,...) __attribute__((format(printf, 1, 2)));
} asr_prompt_interface_t;


/**
 * @brief Provide help prompts to the user.
 * @details The @e %asrp_active_help() function provides contextual help prompts to
 *          the user.
 * @param None.
 * @return Nothing.
 */
void asrp_active_help (void);

/**
 * @brief Provide help related to the specified configuration.
 * @details The @e %asrp_section_help() function plays all the help URLs in the specified configuration.
 * @param base The configuration for the prompt module.
 * @return Nothing. 
 */
void asrp_section_help (cfg_item_t *base);

/**
 * @brief Play the audio item at the specified configuration node
 * @details The @e %asrp_play_item() function resolves the specified configuration and path to a URL and
 *          then plays the audio file specified by the URL.
 * @param base The configuration node to start at.
 * @param item_path A '/' separated list of node names that leads to the required node.
 * @return Flags to indicate which, if any, prompts were rendered.
 */
asrp_processing_flags_t asrp_play_item (cfg_item_t *base, const char *item_path);

/**
 * @brief Play the specified text
 * @details The @e %asrp_play_tts() function converts the specified text to speech and plays it back. The 
 *          text may take the form of a string literal or a variable.
 * @param fmt The format string for the text. This may include tokens that will
 *            be replaced by values of variable arguments appended to the end of the call.
 * @return Flags to indicate which, if any, prompts were rendered.
 */
asrp_processing_flags_t asrp_play_tts (const char *fmt,...) __attribute__((format(printf, 1, 2)));

/**
 * @brief Play the TTS item at the specified configuration node
 * @details The @e %asrp_play_tts_item() function resolves the specified configuration and path to a URL and
 *          then plays the TTS item specified by the URL.
 * @param base The configuration node to start at.
 * @param item_path A '/' separated list of node names that leads to the required node.
 * @return Flags to indicate which, if any, prompts were rendered. 
 */
asrp_processing_flags_t asrp_play_tts_item (cfg_item_t *base, const char *item_path);

/**
 * @brief Play the audio item at the specified URL
 * @details The @e %asrp_play_url() function plays the audio resource specified by the URL.
 * @param url The URL of the resource to play.
 * @return Flags to indicate which, if any, prompts were rendered. 
 */
asrp_processing_flags_t asrp_play_url (const char *url);

/** 
 * @brief Request prompt service from registered prompt service providers
 * @details The @e %asrp_start() function renders the prompt specified by @e prompt_info.
 * @param prompt_info Structure describing the prompt to be played or shown and providing an interactive callback function
 *        if required (e.g., for an interactive visual prompt).
 * @return Flags to indicate which, if any, prompts were rendered. A return value of @c 0 (ASRP_NO_PROMPTS) 
 *         indicates that no prompts were rendered.
 */
asrp_processing_flags_t asrp_start (asrp_prompt_info_t *prompt_info);

/** 
 * @brief Get the prompt status
 * @details The @e %asrp_get_status() returns the list of active prompts.
 * @param None.
 * @return Flags to indicate which prompts are active.
 */
asrp_processing_flags_t asrp_get_status(void);

/** 
 * @brief Stop active prompts.
 * @details The @e %asrp_stop() function dismisses any visible prompts and stops playing audio prompts.
 * @param stop_services The prompts to stop (audio and/or video).
 * @return ASRP_NO_PROMPTS on success.
 */
asrp_processing_flags_t asrp_stop (asrp_processing_flags_t stop_services);

//void asrp_block (asrp_processing_flags_t stop_services);

/**
 * @brief Allow prompting after a stop
 * @details The @e %asrp_reset() function resets the prompt control flags to allow prompting again after
 *          a call to @e asrp_stop().
 * @param None.
 * @return Nothing.
 */
void asrp_reset (void);

/**
 * @brief Post a recognition step
 * @details The @e %asrp_post_step() function posts the specified step to the active prompt module.
 * @param step The step to post.
 * @return 0 Success.
 */
int asrp_post_step(asr_step_t step);

// For use by prompt modules..
/**
 * @brief Error class enumeration
 * @details The @c %tts_error_class_t enumeration lists the classes of errors that may occur during speech processing.
 * This information can be used to provide information to the user and to populate error logs.
 */
typedef enum {
		TSS_ERROR_CLASS_NONE,        /**< No error class. */
		TTS_ERROR_CLASS_MODIFIER,    /**< Used with the @e asrp_set_error() function to provide additional information about the error. */
		TTS_ERROR_CLASS_URL,         /**< The playback URL could not be resolved. */
		TTS_ERRROR_CLASS_RESOURCE,   /**< A required resource was unavailable. */
		TTS_ERROR_CLASS_SYNTHESIS,   /**< There was an error during TTS synthesis. */
		TTS_ERROR_CLASS_SYSTEM,      /**< There was a system-level error. */
} tts_error_class_t;

/** 
 * @brief Set error information.
 * @details The @e %asrp_set_error() function writes error information to the log.
 * @param mod The prompt module handle.
 * @param error_class The class of the error that was encountered.
 * @param error An error code. See @c /usr/include/errno.h.
 * @param description A description of the error. 
 * @return Nothing.
 */
void asrp_set_error(asrp_module_hdl_t *mod, tts_error_class_t error_class, int error, const char *description);


#ifdef __cplusplus
}
#endif

#endif

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/services/asr/core/public/asr/asrp.h $ $Rev: 730767 $")
#endif
