/**
 * @file asrm.h
 *
 * @brief Functions and data types for module management
 *
 * @details The @c asrm.h header file provides functions and data types for module management.
 *          It also includes support functions used to implement conversation flows (e.g., verifying
 *          whether a result corresponds to a help request or a cancel request).
 */

#ifndef _ASRM_H_INCLUDED
#define _ASRM_H_INCLUDED

#include "asr/mod_types.h"

#ifdef __cplusplus
extern "C" {
#endif


/**
 * @brief Connect to the module
 * @details The @e %asrm_connect() function connects to the specified module by adding the module
 *        to <tt>io-asr</tt>'s list of current modules.
 * @param cif The conversation module interface.
 * @param len The size of the conversation module interface.
 * @param module_private Module-specific data that can be attached to the module. The <tt>io-asr</tt>
 *        service passes this data to to the module's callback functions to support module-specific actions.
 * @return The audio module handle on success; NULL on error, with error details written to the log.
 */
asr_module_hdl_t * asrm_connect (const asr_conversation_if_t *cif,unsigned len, void *module_private);

/**
 * @brief Capture logging information for the module
 * @details The @e %asrm_slog() function sends debugging information to the
 *          appropriate log. Log messages will be written to the log buffer only if their severity is
 *          greater than or equal to the specified severity.
 *
 * @param mod The module handle.
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
extern int asrm_slog (asr_module_hdl_t *mod, int severity, const char *fmt, ... ) __attribute__((format(printf, 3, 4)));

/**
 * @brief Set the locale in the global configuration
 * @details The @e %asrm_set_locale() function sets the locale in the global configuration tree
 *          to the specified value.
 * @param locale The name of the locale to set.
 * @return Nothing.
 */
void asrm_set_locale(const char *locale);

/** 
 * @brief Get the current locale
 * @details The @e asrm_get_locale() funtion retrieves the current local from the global
 *           configuration tree.
 * @return The name of the current locale.
 */
const char* asrm_get_locale();

/**
 * @brief Get the current configuration 
 * @details The @e %asrm_get_config() function retrieves the current configuration tree.
 * @return A pointer to the root of the configuration tree.
 */
cfg_item_t *asrm_get_config();

/**
 * @brief Determine whether the current result is a cancellation request
 * @details The @e %asrm_is_cancellation_request() function determines whether the specified result is a 
 *          cancellation request. If it is, the function sets @e ret to the appropriate action code.
  * @param result A pointer to the result structure.
 * @param opt_cancel_section A pointer to the cancel configuration section.
 * @param ret The action to take.
 * @return 1 The result is a cancellation request. The @e res parameter is set to @c ASR_RECOGNITION_CANCEL.
 * @return 0 The result is not a cancellation request.
 */
int asrm_is_cancellation_request (asr_result_t *result, cfg_item_t *opt_cancel_section, asr_result_action_t *ret);

/**
 * @brief Determine whether the current result is a help request
 * @details The @e %asrm_is_help_request() function determines whether the specified result is a 
 *          help request. If it is, the function sets @e ret to the appropriate action code. If @e perform is
 *          nonzero, the @e asrp_active_help() function is invoked.
 * @param result A pointer to the result structure.
 * @param opt_help_section A pointer to the help configuration section.
 * @param ret The action to take.
 * @param perform A flag to indicate whether to take action on the result.
 * @return 1 The result is a cancellation request. The @e res parameter is set to @c ASR_RECOGNITION_RESTART.
 * @return 0 The result is not a cancellation request.
 */
int asrm_is_help_request (asr_result_t *result, cfg_item_t *opt_help_section, asr_result_action_t *ret, int perform);

/**
 * @brief Determine whether the current result is either a help request or a cancel request
 * @details The @e %asrm_is_help_or_cancel() function determines whether the specified result is 
 *          either a help request or a cancel request. If it is one of these, the function sets
 *          @e ret to the appropriate action code. If the result is a help request and @e perform
 *          is nonzero, the @e asrp_active_help() function is invoked.
 * @param result A pointer to the result structure.
 * @param opt_help_section A pointer to the help configuration section.
 * @param opt_cancel_section A pointer to the cancel configuration section.
 * @param ret The action to take.
 * @param perform A flag to indicate whether to take action on the result.
 * @return 1 The result is either a help request or a cancel request. The @e res parameter is set to
 *         either @c ASR_RECOGNITION_CANCEL or @c ASR_RECOGNITION_RESTART.
 * @return 0 The result is neither a help request nor a cancel request.
 */
int asrm_is_help_or_cancel (asr_result_t *result, cfg_item_t *opt_help_section, cfg_item_t *opt_cancel_section, asr_result_action_t *ret, int perform);

/**
 * @brief Determine whether the current result is a confirmation
 * @details The @e %asrm_is_help_or_cancel() function determines whether the specified result is 
 *          a confirmation, either affirmative or negative.
 * @param result A pointer to the result.
 * @param opt_confirm A pointer to the configuration item that specifies confirmation options
 *        (e.g., "yes", "yeah", "no", "nope", and so on).
 * @return 1 The response was affirmative.
 * @return -1 The response was negative.
 * @return 0 The response is not understood (neither affirmative nor negative).
 */
int asrm_is_confirmation (asr_result_t *result,  cfg_item_t *opt_confirm);

// recognizer control
/**
 * @brief Place a hold on the recognizer
 * @details The @e %asrm_recognizer_hold() function stops the current recognition turn and
 *          increments the recognizer hold count. The
 *          recognizer stops acquiring audio and processing results for the current request.
 * @param mod A pointer to the module handle of the recognizer.
 * @return The number of holds.
 */
int asrm_recognizer_hold (asr_module_hdl_t *mod);

/**
 * @brief Return the number of holds on the recognizer
 * @details The @e %asrm_get_holdcount() function returns the number of holds on the recognizer.
 * @return The number of holds.
 */
int asrm_get_holdcount(void);

/**
 * @brief Release a hold on the recognizer
 * @details The @e %asrm_recognizer_release() function reduces the hold count on the recognizer by one. If no holds
 *          remain, it starts the recognizer.
 * @param mod A pointer to the module handle of the recognizer.
 * @return The number of holds remaining.
 */
int asrm_recognizer_release (asr_module_hdl_t *mod);

/**
 * @brief Start a recognition request
 * @details The @e %asrm_recognizer_start() function starts a recognition request by invoking @e asr_start().
 * @param mod A pointer to the module handle.
 * @return 0 Success.
 * @return <0 An error occurred.
 */
int asrm_recognizer_start (asr_module_hdl_t *mod);

/**
 * @brief Stop a recognition request
 * @details The @e %asrm_recognizer_stop() function stops a recognition request by invoking @e asr_stop(). 
 * @param mod A pointer to the module handle.
 * @return 0 Success.
 * @return <0 An error occurred.
 */
int asrm_recognizer_stop (asr_module_hdl_t *mod);

// module management
/**
 * @brief Set a module as active
 * @details The @e %asrm_activate_module() function sets the specified module as active.
 * @param mod A pointer to the module handle.
 * @return Nothing.
 */
void asrm_activate_module (asr_module_hdl_t *mod);

/**
 * @brief Set a module as inactive
 * @details The @e %asrm_deactivate_module() function sets the specified module as inactive.
 * @param mod A pointer to the module handle.
 * @return Nothing.
 */
void asrm_deactivate_module (asr_module_hdl_t *mod);

/**
 * @brief Set the specified configuration as active
 * @details The @e %asrm_set_active_sections() function sets the vendor configuration sections
 *          used by the module. This allows different grammars to be used by the NLAL in
 *          different circumstances.
 * @param mod A pointer to the module handle.
 * @param num_sections The number of configuration sections.
 * @param sections A pointer to the array of configuration sections.
 * @return 0 Success.
 * @return -1 An error occurred.
 */
int asrm_set_active_sections (asr_module_hdl_t *mod, int num_sections, const char **sections);

/**
 * @brief Set a module as exclusive
 * @details The @e %asrm_set_exclusive() function sets the specified module as exclusive. Only the exclusive module will
 *          see results from recognition sessions until its exclusive status is removed. Exclusive modules must implement
 *          the @e %select_result() and @e %on_result() callback functions; otherwise, the call to @e %asrm_set_exclusive() will fail. 
 *          If a recognition context is provided, it will be used instead of the contexts described in the active
 *          configuration sections.
 * @param mod A pointer to the module handle.
 * @param context A pointer to the context handle.
 * @return 0 Success.
 * @return -1 An error occurred.
 */
int asrm_set_exclusive (asr_module_hdl_t *mod, asr_context_hdl_t *context);

/**
 * @brief Remove a module's exclusive setting
 * @details The @e %asrm_unset_exclusive() function removes the exclusive setting of the specified module.
 * @param mod A pointer to the module handle.
 * @return Nothing.
 */
void asrm_unset_exclusive (asr_module_hdl_t *mod);

/**
 * @brief Find the specified module
 * @details The @e %asrm_find_module() function returns the module handle of the named module.
 * @param module_name The name of the module to find.
 * @return A pointer to the module handle; NULL if the module can't be found.
 */
asr_module_hdl_t *asrm_find_module (const char *module_name);

/**
 * @brief Find the next module
 * @details The @e %asrm_next_module() function returns the module pointed to by the specifed module's "next" pointer.
 * @param module A pointer to the module handle.
 * @return On success, a pointer to the handle for the module following the specified module; otherwise, a pointer to 
 *         the module list.
 */
asr_module_hdl_t *asrm_next_module (asr_module_hdl_t *module);

/**
 * @brief Get the exclusive module
 * @details The @e %asrm_get_exclusive() function returns a handle to the exclusive module, if there is one.
 * @return The exclusive module's handle; NULL if there is no exclusive module.
 */
asr_module_hdl_t *asrm_get_exclusive (void);

/**
 * @brief Post a recognition result
 * @details The @e %asrm_post_result() function posts recognition results to the current conversation.
 * @param result A pointer to the result to post.
 * @return The action to take on the result.
 */
asr_result_action_t asrm_post_result (asr_result_t *result);

// dynamic contexts
/**
 * @brief Create a context
 * @details The @e %asrm_context_create() function creates a new context from the specified section by invoking the 
 *         current recognition module's @e %context_create() callback. The exact implementation of the callback
 *         depends on the ASR vendor.
 * @param section_identifier The configuration section to use to create the context.
 * @return The new context handle.
 */
asr_context_hdl_t *asrm_context_create (const char *section_identifier);

/**
 * @brief Add context entries
 * @details The @e %asrm_context_add_entries() function adds entries to the specified context by first finding the configuration
 *          node identified by the @e slot_identifier_section, then invoking the current
 *          recognition module's @e %context_add_entries() callback function on that configuration node. The exact
 *          implementation of the @e %context_add_entries() callback function depends on the ASR vendor.
 * @param chdl A pointer to the handle of the context to add entries to.
 * @param slot_identifier_section The configuration node for the section required (e.g., "phone").
 * @param slot_name The name of the slot to add (e.g., "voice dialing").
 * @param slot_entry An array of slot entries.
 * @param num_slot_entries The size of the array of slot entries.
 * @return 0 Success.
 * @return <0 An error occurred.
 */
int asrm_context_add_entries (asr_context_hdl_t *chdl, const char *slot_identifier_section, const char *slot_name, asr_slot_entry_t *slot_entry, int num_slot_entries);

/**
 * @brief Save a context
 * @details The @e %asrm_context_save() function saves the specified context by first finding the configuration
 *          section identified by the @e section_identifier, then invoking the current
 *          recognition module's @e %context_save() callback function on that section. The exact implementation 
 *          of the callback depends on the ASR vendor.
 * @param chdl A pointer to the context handle.
 * @param section_identifier The configuration section to save.
 * @return 0 Success.
 * @return <0 An error occurred.
 */
int asrm_context_save (asr_context_hdl_t *chdl, const char *section_identifier);

/**
 * @brief Save a context
 * @details The @e %asrm_context_destroy() function destroys the specified context by invoking the current
 *          recognition module's @e %context_destroy() callback function. The exact implementation of the
 *          callback depends on the ASR vendor.
 * @param chdl A pointer to the context handle.
 * @return 0 Success.
 * @return <0 An error occurred.
 */
int asrm_context_destroy (asr_context_hdl_t *chdl);

// audio
/**
 * @brief Capture an utterance
 * @details The @e %asrm_get_utterance() function stores an audio sample in the buffer
 *          referenced by the @e audio_info parameter by invoking the @e asra_get_utterance() function.
 * @param mod A pointer to the module handle (optional).
 * @param audio_info The structure in which to store the utterance and set the properties.
 * @return 0 Success.
 * @return -1 An error occurred.
 */
int asrm_get_utterance (asr_module_hdl_t *mod, asr_audio_info_t *audio_info);

/**
 * @brief Copy an utterance to the specified buffer
 * @details The @e %asrm_set_utterance() function copies the last captured audio sample to the buffer referenced
 *          by the @e audio_info parameter, at the offset specified by the @e ms_offset parameter. If the requested
 *          offset results in a buffer overrun, an error is returned. If the
 *          audio capture has not completed, an error is returned.
 * @param mod A pointer to the module handle (for error logging).
 * @param audio_info A pointer to the structure in which to store the utterance.
 * @param ms_offset The offset (in milliseconds) of the utterance.
 * @return 0 Success.
 * @return EBUSY Capture has not completed.
 * @return ENOMEM Buffer overrun or other memory error.
 */
int asrm_set_utterance (asr_module_hdl_t *mod, asr_audio_info_t *audio_info, uint32_t ms_offset);

/**
 * @brief Initialize all registered modules
 * @details The @e %asr_module_initialize() function initializes all registered modules by invoking
 *          their respective @e %init() callback functions.
 * @param None.
 * @return 0 Success.
 * @return -1 A module couldn't be initialized. The details are written to the log.
 */
int asr_module_initialize (void);

// Result handling
/**
 * @brief Delete result terminals
 * @details The @e %asrm_delete_terminals() deletes the result terminals from @e start_index to @e end_index,
 *          inclusive.
 * @param result A pointer to the result structure to delete terminals from.
 * @param start_index The index from which to start the deletion.
 * @param end_index The index of the last terminal to delete.
 * @return 0 Success.
 * @return -1 An error occurred.
 */
int asrm_delete_terminals(asr_result_t *result, unsigned int start_index, unsigned int end_index);

/**
 * @brief Free the memory associated with a recognition result
 * @details The @e %asrm_free_result() function frees all the memory associated with and referenced
 *          by the specified @e result.
 * @param result A pointer to the recognition result to free.
 * @return Nothing.
 */ 
void asrm_free_result (asr_result_t *result);

/**
 * @brief Create a dictation result
 * @details The @e %asrm_create_dictation_result() creates a new dictation result based on the specified
            parameters. The new result has the recognition type set to @c ASR_RECOGNITION_DICTATION, the result
            type set to @c ASR_RESULT_FINAL, and the result status set to @c ASR_RESULT_OK. The grammar, rule, confidence
            level, and recognized speech are set to the corresponding specified parameters.
 * @param grammar The grammar of the new result.
 * @param rule The rule of the new result.
 * @param conf The confidence level of the new result.
 * @param inbuffer The recognized speech to copy to the new result.
 * @return The new result; NULL on error.
 */ 
asr_result_t* asrm_create_dictation_result(const char *grammar, const char *rule, int conf, const char *inbuffer);

/**
 * @brief Copy the text from a result
 * @details The @e %asrm_strdup_result() method copies the terminals from the specified result to a new
 *          string, starting from the specified index.
 * @param result A pointer to the result to copy from.
 * @param index The index to begin copying from.
 */
char * asrm_strdup_result (asr_result_t *result, unsigned int index);

/**
 * @brief Append an intent to the specified result
 * @details The @e %asrm_append_intent() function appends the intent specified by @e key and @e value to the
 *          intents array of the specified @e result. Note that sufficient memory must be available to add
 *          items to the intent structure. No warning or error is generated if there is insufficient memory. 
 * @param result The result to add the intent to.
 * @param key The key of the intent.
 * @param value The value of the intent.
 * @return Nothing.
 */
void asrm_append_intent(asr_result_t *result, char* key, char* value);

/**
 * @brief Append a result to a list of results
 * @details The @e %asrm_append_result() function appends the result specified by @e new_result to the
 *          specified results list, @e results. 
 * @param results The results list.
 * @param new_result The result to append.
 * @return A pointer to the updated results list.
 */
asr_result_t * asrm_append_result (asr_result_t *results, asr_result_t *new_result);

// NLP

/**
 * @brief Evaluate a result against the configuration
 * @details The @e %asrnl_evaluate_result() function checks the recognized speech in the specified result against the 
 *        active configuration sections to interpret it as a rule or an intent. If the result is successfully interpreted,
 *        it is appended to the results list.
 * @param result A pointer to the result to evaluated.
 * @return A pointer to the updated results list.
 */
asr_result_t *asrnl_evaluate_result (asr_result_t *result);

/**
 * @brief Check the active configuration for BNF rules
 * @details The @e %asrnl_check_section_rules() checks the active configuration section for the BNF rules that the NLAL
 *          used to extract intents.
 * @param base A pointer to the base of the configuration tree.
 * @param match_beg A pointer to the start of the matching configuration section.
 * @param remaining_utt A pointer to the remainder of the utterance.
 * @param match_item The configuration item that describes the BNF rule that the NLAL matched the utterance against.
 * @param payload A pointer to the configuration item to check.
 * @return The confidence level of the result.
 */
int asrnl_check_section_rules(cfg_item_t *base, char **match_beg, char **remaining_utt, cfg_item_t **match_item, cfg_item_t *payload);

/** 
 * @brief Get the specified intent
 * @details The @e %asrm_get_intent_field() function returns a reference to the specified intent, @e field, within one
 *      of the specified result's intent entries. If @e tag is provided, it's set to point to the intent's tag entry,
 *      which contains confidence levels, an ID, and possibly millisecond start and end values. If @e iterator is
 *      provided, its value is used as a starting point for scanning for the specified intent. If an intent is found
 *      whose key matches @e field, its index is stored in @e iterator. 
 *      
 * 		If @e field is NULL, the entry at the index indicated by @e iterator is returned. If @e tag is NULL, no tag
 *      information is returned. If iterator is NULL, the index search begins at 0.
 *
 *		For example, to get the "hour" field:
 *      @code
 *        value = asrm_get_intent_field (result, "hour", NULL, NULL); 
 *      @endcode
 *
 *      To extract all "hour" fields:
 *      @code
 * 			for (i = 0; (value = asrm_get_intent_field(result, "hour", NULL, &i)); ){
 *				printf ("Found hour intent, value = %s\n", value);
 * 			}
 * 			-- extract all fields
 * 			for (i = 0; (value = asrm_get_intent_field(result, NULL, NULL, &i)); ){
 *				printf ("Found hour intent, value = %s\n", value);
 * 			}
 *     @endcode
 *
 * @param result The result structure to search.
 * @param field The field to search for.
 * @param tag The tag entry for the successfully located intent.
 * @param iterator The index to start searching from. On return, the index of the successfully located intent.
 * @return The value of the intent on success; NULL on failure (the intent wasn't found).
 */
const char *asrm_get_intent_field (asr_result_t *result, const char *field, asr_result_tag_t **tag, int *iterator);

/**
 * @brief Phrase search mode enumeration
 * @details The @e asrm_phrase_search_mode_t enumeration lists the modes of phrase searching.
 */
typedef enum {
	PHRASE_EXACT = 0x01, /**< Exact match searching. */
	PHRASE_FUZZY = 0x02, /**< Fuzzy match searching. */
}  asrm_phrase_search_mode_t;

/**
 * @brief Calculate the confidence that two strings match
 *
 * @details The @e %asr_strmatch() function calculates a confidence score that can be used to
 * evaluate the confidence with which @e str1 matches @e str2. Higher
 * confidence scores indicate a higher confidence that the two strings
 * match. This algorithm is based on the Damerau-Levenshtein <em>edit distance</em> algorithm.
 *
 * @param str1 The first string to compare.
 * @param str2 The second string to compare.
 * @return An integer confidence score (0 - 1000) that indicates the confidence with which
 * @e str1 and @e str2 match.
 */
int asr_strmatch( const char* str1, const char* str2 ) ;

/**
 * @brief Calculate the confidence that two strings match (case insensitive)
 * @details The @e %strconfstr() function searches for a substring of @e string that loosely matches the @e find
 * string and then returns the confidence level of the match.
 * @param string The larger string to search within.
 * @param find The string to search for.
 * @param opt_len The number of characters starting from @e string to include in the search.
 * @param ret_beg If provided, is set to the character in @e string at the beginning of the matched range.
 * @param ret_end If provided, is set to first the character in @e string past the matched range.
 * @return The confidence level (0 - 1000) of the best match of @e find in @e string.
 */
int strconfstr(char const *string, int opt_len, char const *find, char **ret_beg, char **ret_end);

/**
 * @brief Get the value for a specified key
 * @details The @e %asrv_get_common_value() function finds the value of the configuration item corresponding to the specified
 *          key and that matches at least one other configuration item's value.
 * @param key The key string to search on (e.g., "locale").
 * @return The value of the configuration item; NULL if it isn't found.
 */
const char *asrv_get_common_value (const char *key);

/**
 * @brief Return the ID of a configuration item containing a speech result
 * @details The @e %find_result_phrase() function finds the specified result phrase in the specified configuration and returns the ID
 *          of the matching configuration item. The configuration item must contain an exact match.
 * @param base The configuration structure to search.        
 * @param result The speech result containing the string to search for.
 * @param start_terminal Not used.
 * @param terminal On success, @e terminal is set to the index of the first terminal in the match.
 * @param conf On success, @e conf is set to the confidence level of the match.
 * @param def_id A default ID to return if the phrase isn't found.
 * @return The configuration ID of the matching configuration item or the default ID if a match isn't found.
 */
int find_result_phrase (cfg_item_t *base, asr_result_t *result, int start_terminal, int *terminal, int *conf, int def_id);

/**
 * @brief Return the ID of a configuration item containing a specified string
 * @details The @e %find_phrase() function finds the specified string in the specified configuration and returns the ID of 
 *          the matching configuration item. The configuration item must contain an exact match.
 * @param base The configuration structure to search.        
 * @param result The result string to search for.
 * @param start_terminal Not used.
 * @param terminal On success, @e terminal is set to the index of the first terminal in the match.
 * @param conf On success, @e conf is set to the confidence level of the match.
 * @param def_id A default ID to return if the phrase isn't found.
 * @return The configuration ID of the matching configuration item; the default ID if a match isn't found.
 */
int find_phrase (cfg_item_t *base, const char *result, int start_terminal, int *terminal, int *conf, int def_id);

/**
 * @brief Return the ID of a configuration item containing a speech result
 * @details The @e %asrm_find_result_phrase_id() function searches the specified configuration for the string in the specified speech
 *          result and returns the ID of the matching configuration item. The configuration item must contain an exact match.
 * @param base The configuration structure to search.        
 * @param result The speech result containing the string to search for.
 * @param start_terminal Not used.
 * @param terminal_beg On success, @e beg_terminal is set to the index of the first terminal in the match.
 * @param terminal_end On success, @e beg_terminal is set to the index of the last terminal in the match.
 * @param conf On success, @e conf is set to the confidence level of the match.
 * @param def_id A default ID to return if the phrase isn't found.
 * @return The configuration ID of the matching configuration item; the default ID if a match isn't found.
 */
int asrm_find_result_phrase_id(cfg_item_t *base, asr_result_t *result, int start_terminal, int *terminal_beg, int *terminal_end, int *conf, int def_id);

/**
 * @brief Find a configuration item containing a speech result
 * @details The @e %asrm_find_result_phrase() function searches the specified configuration for the string in the specified speech
 *          result and returns a pointer to the matching configuration item. The configuration item must contain an exact match.
 * @param base The configuration structure to search.        
 * @param result The speech result containing the string to search for.
 * @param start_terminal Not used.
 * @param terminal_beg On success, @e terminal_beg is set to the index of the first terminal in the match.
 * @param terminal_end On success, @e terminal_end is set to the index of the last terminal in the match.
 * @param conf On success, @e conf is set to the confidence level of the match.
 * @return A pointer to the matching configuration item; NULL on failure.
 */
cfg_item_t * asrm_find_result_phrase(cfg_item_t *base, asr_result_t *result, int start_terminal, int *terminal_beg, int *terminal_end, int *conf);

/**
 * @brief Find a configuration item containing a result string
 * @details The @e %asrm_find_phrase() function searches a configuration structure for a specified result string and returns
 *          a pointer to the matching configuration item.
 * @param base The configuration structure to search.
 * @param result The result string to search for.
 * @param start_terminal Not used.
 * @param mode The search mode (from the @c asrm_phrase_search_mode_t enumeration).
 * @param beg_terminal On success, @e beg_terminal is set to the index of the first terminal in the match.
 * @param end_terminal On success, @e end_terminal is set to the index of the last terminal in the match.
 * @param conf On success, @e conf is set to the confidence level of the match.
 * @return A pointer to the configuration item that was the closest match; NULL on failure.
**/
cfg_item_t * asrm_find_phrase (cfg_item_t *base, const char *result, int start_terminal, asrm_phrase_search_mode_t mode, int *beg_terminal, int *end_terminal, int *conf);

/**
 * @brief Return the ID of a configuration item containing a result string
 * @details The @e asrm_find_phrase_id() function searches a configuration for a specified result string and returns
 *        the ID of the matching configuration item. The configuration item must contain an exact match.
 * @param base The configuration structure to search.
 * @param result_string The result string to search for.
 * @param start_terminal Not used.
 * @param terminal_end On success, @e terminal_end is set to the index of the last terminal in the match.
 * @param conf On success, @e conf is set to the confidence level of the match.
 * @param def_id A default ID to return if the configuration item isn't found.
 * @return A pointer to the configuration item that was the closest match; NULL on failure.
**/
int asrm_find_phrase_id (cfg_item_t *base, const char *result_string, int start_terminal,  int *terminal_end, int *conf, int def_id);
#ifdef __cplusplus
}
#endif

#endif 

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/services/asr/core/public/asr/asrm.h $ $Rev: 730767 $")
#endif
