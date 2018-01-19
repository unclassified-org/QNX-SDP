/**
 * @file types.h
 *
 * @brief Data types for control flow during speech analysis
 *
 * @details The @c types.h header provides data types for the control flow of speech
 *         recognition. These data types include result classifications, state
 *         enumerations, and error codes.
 */



#ifndef ASR_TYPES_H_INCLUDED
#define ASR_TYPES_H_INCLUDED

#include <ctype.h>
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/** For internal use only.  */
#define MAX_REC_LEN          140

/**  For internal use only. */
#define MAX_REC_RESULTS        5

/** The maximum length of a terminal in a recognition result. */
#define MAX_REC_TERMINAL_LEN  80

/** The maximum number of terminals in a recognition result. */
#define MAX_REC_TERMINALS     80

/**
 * @brief The status of the result
 *
 * This data type describes the status of the recognition result.
 */
typedef struct asr_result_type {
	/** The recognition type. */
	enum {
		ASR_RECOGNITION_GRAMMAR,           /**<  A grammar result. */ 
		ASR_RECOGNITION_DICTATION,        /**<  A dictation result. */
		ASR_RECOGNITION_INTENT,           /**<  An intent result. */
	} recognition_type;
	/** The result type. */
	enum {
		ASR_RESULT_PARTIAL,               /**< A partial result. */
		ASR_RESULT_FINAL,                 /**< A final result. */
		ASR_RESULT_FAILED,                /**< A failed result. */
	} result_type;
	/** The result status. */
	enum {
		ASR_RESULT_OK,                    /**< The result is OK. */
		ASR_RESULT_LOW_CONFIDENCE,        /**< There is low confidience in the correctness of the result. */
		ASR_RESULT_REJECTED,              /**< The result is rejected. */
		ASR_RESULT_SILENCE,               /**< The recognizer did not find any speech in the audio capture. */
		ASR_RESULT_CANCELED,              /**< The recognition turn was canceled. */
		ASR_RESULT_INTERUPTED,            /**< The recognition turn was interrupted. */
		ASR_RESULT_MAX_RETRIES,           /**< The recognizer has retried the maximum number of times. */
		ASR_RESULT_ERROR,                 /**< There was an error with the result. */
	} result_status;
	/** Error codes. */
	enum res_error_t {
		ASR_ERROR_NONE,                   /**< No error. */
		ASR_ERROR_REMOTE_SERVER,          /**< A server error occurred. */
		ASR_ERROR_NETWORK,                /**< A network error occurred. */
		ASR_ERROR_GENERAL,                /**< A general error occurred. */
		ASR_ERROR_AUDIO,                  /**< An audio capture error occurred. */
		ASR_ERROR_TIMEOUT,                /**< A timeout error occurred. */
		ASR_ERROR_NO_MEMORY,              /**< There was insufficient memory for the operation. */
		ASR_WARNING_NOTHING_RECOGNIZED,   /**< The recognizer couldn't detect any speech (possibly because the audio level is too low). */
		ASR_WARNING_SPOKE_TOO_SOON,       /**< The user spoke too soon. This can cause the recognizer to miss the first part of the utterance. */
		ASR_WARNING_SILENCE,              /**< The recognizer couldn't detect any speech. */
		ASR_ERROR_SERVICE_UNAVAILABLE,    /**< The service is temporarily unavailable. */
	}  error;
	/** The long description of the error. */
	char *error_description;
} asr_result_type_t;

/**
 * @brief Properties of the result
 *
 * This data type represents properties of a recognition result.
 */
typedef struct asr_result_tag {
	uint64_t id;                          /**< The ID of the result. */
	int      confidence;                  /**< The confidence score for the speech-to-text result. A higher score indicates greater confidence. */
	int      score;                       /**< The score is used to determine the correct context for the result. The lower the score for a context, the better the match. */
	unsigned begin_ms;                    /**< The time in the audio capture (in milliseconds) where the terminal begins. */
	unsigned end_ms;                      /**< The time in the audio capture (in milliseconds) where the terminal ends. */
} asr_result_tag_t; 

/**
 * @brief A recognized terminal
 *
 * This data type represents a terminal. A terminal is a recognized block of speech, usually corresponding to a single word or number. In the 
 * case of voice dialing, a terminal may correspond to a spoken digit. 
 */
typedef struct asr_terminal {
	char *string;                        /**< The string representation of the recognized word, number, or digit. */
	int from_slot;                       /**< The starting slot. */
	asr_result_tag_t tag;                /**< The result tag for this terminal. */
} asr_terminal_t;

/**
 * @brief A recognized intent
 *
 * This data type represents an intent. An intent is an interpreted aim or purpose of an utterance. For example,
 * the intent could be to play a media selection or dial a phone number.
 */ 
typedef struct asr_intent {
	char *field;                        /**< The field of the intent (e.g., <tt>search-type</tt>).  */
	char *value;                        /**< The value of the intent (e.g., <tt>media</tt>).  */
	asr_result_tag_t tag;               /**< The result tag for this intent. */
} asr_intent_t; 

/** 
 * @brief Alias for the recognition result
 *
 * This type is an alias for the recognition result type, @c asr_result.
 */
typedef struct asr_result asr_result_t;

/**
 * @brief The recognition result
 * 
 * This type represents the recognition result, which is the text representation of the spoken utterance.
 * The result is either a terminal or an intent.
 */
struct asr_result {
	asr_result_t *next;                  /**< A pointer to the next result. */
	char *recognizer_id;                 /**< The ID of the recognizer that generated this result. */
	asr_result_type_t type;              /**< The result type of this result. */
	asr_result_tag_t  tag;               /**< The result tag of this result. */
	char *grammar_name;                  /**< The name of the grammar used to interpret this result. This is "dictation" for NL
	                                          (natural language) recognizers. */
	char *start_rule;                    /**< The name of the rule to use to fulfill the user's command. */
	char *recognized_speech;             /**< The string representing the recognized speech. */
	int  entries;                        /**< The number of entries (either terminal or intent).  */
	union {
		asr_terminal_t *terminal;        /**< The array of terminals for this result. */
		asr_intent_t *intent;            /**< The array of intents for this result. */
	};
};

/**
 * @brief The recognition step
 *
 * This enumeration represents the steps in the recognition process flow. Some of these steps change
 * the state of ASR, as recorded in the @c state attribute of the @c /pps/services/asr/control PPS object.
 * This state change is noted with the enumeration values where applicable.
 */
typedef enum asr_step_e {
	ASR_STEP_LOCALE_CHANGED,	         /**< The locale has changed and localized assets have been updated.  */
	ASR_STEP_SESSION_OPENED,             /**< A speech session has been opened.  */
	ASR_STEP_SESSION_ERROR,              /**< An unrecoverable error has occurred. This step is be followed by @c ASR_STEP_SESSION_CLOSED.  */
	ASR_STEP_SESSION_CANCELED,           /**< The user cancelled the recognition session.  */
	ASR_STEP_PROMPT_STARTING,            /**< An audio prompt service has been requested. The ASR @c state is @c prompting.  */
	ASR_STEP_PROMPT_STOPPED,             /**< An audio prompt service has completed. The ASR @c state is @c processing.  */
	ASR_STEP_RECOGNITION_BEGIN,          /**< A recognition turn has started. */
	ASR_STEP_RECOGNITION_CONFIGURED,     /**< The recognition contexts, data, and configuration have been loaded.  */
	ASR_STEP_PRE_AUDIO_CAPTURE,          /**< Audio capture is about to start (microphone will be turned on). The ASR @c state is @c listening.  */
	ASR_STEP_PRE_SPEECH_SILENCE_TIMEOUT, /**< No speech was detected within the silence timeout period.  */
	ASR_STEP_POST_AUDIO_CAPTURE,         /**< The microphone has been turned off (either end of speech was detected or @e asra_stop() was called).
	                                          The ASR @c state is @c processing.  */
	ASR_STEP_LOCAL_QUERY_BEGIN,          /**< The local ASR service has started processing the captured audio.  */
	ASR_STEP_REMOTE_QUERY_BEGIN,         /**< A remote ASR service has started processing the captured audio (expect latency).  */
	ASR_STEP_QUERY_END,                  /**< The ASR service has returned results.  */
	ASR_STEP_POSTING_RESULT,             /**< The recognition result has been generated and is about to be delivered.  */
	ASR_STEP_REPOSTING_RESULT,           /**< The recognition result was selected by the wrong module.  */
	ASR_STEP_RECOGNIZED_SPEECH,          /**< The module has processed the results.  */
	ASR_STEP_UNRECOGNIZED_SPEECH,        /**< The ASR service didn't recognize any speech in the utterance.  */
	ASR_STEP_UNHANDLED_SPEECH,           /**< No module selected any of the recognition results.  */
	ASR_STEP_RECOGNIZED_SILENCE,         /**< There was no audio captured or the audio was too quiet.  */
	ASR_STEP_TURN_COMPLETE,		         /**< Result processing is complete.  */
	ASR_STEP_RECOGNITION_END,            /**< All module select and result callbacks have completed.  */
	ASR_STEP_RECOGNITION_HELD,           /**< The current speech session has been held, to be ended or resumed later.  */
	ASR_STEP_SESSION_CLOSED,             /**< The speech session has ended.  */
	ASR_STEP_SESSION_CLEANUP,            /**< ASR is cleaning up the speech session. The ASR @c state is @c idle.  */
	ASR_STEP_TASK_COMPLETE,		         /**< The user's task has been accomplished (e.g., media playback has begun, phone call has been placed, etc.)  */
	ASR_STEP_SESSION_ABORTED, 	         /**< There was an external cancellation of the recognition session (@e asr_stop() was called due to a PPS
	                                          <tt>strobe::off</tt> message.)  */
} asr_step_t ; 

/**
 * @brief The result action
 *
 * This enumeration represents the actions that can be taken during the processing of recognition results.
 */
typedef enum result_action_e {
	ASR_RECOGNITION_ABORT,      /**< Stop the recognition turn as incomplete. */
	ASR_RECOGNITION_CANCEL,     /**< Stop the recognition turn and discard any pending results. */
	ASR_RECOGNITION_REPOST,     /**< Repost the current results. This allows a conversation module to hand off to other conversation modules.  */
	ASR_RECOGNITION_COMPLETE,   /**< The recognition is complete. Stop the recognition turn if not in continuous mode. Values higher than this indicate a recognizer restart. */
	ASR_RECOGNITION_CONTINUE ,  /**< Continue recognizing. Incremental results are cached. */
	ASR_RECOGNITION_RESTART,    /**< Restart the recognition from the audio source (either get new audio data from the microphone or call @e asr_set_utterance() to get a new audio buffer). */
	ASR_RECOGNITION_REPEAT,     /**< Restart the recognition from previous recognition features (stored phonemes). */
	ASR_RECOGNITION_UNKNOWN ,   /**< The module doesn't understand the command. This might occur if there has been a context switch. */
	ASR_RECOGNITION_HELD,		/**< A recognition hold has blocked the processing of results. */
	ASR_RECOGNITION_HOLD,		/**< A recognition hold will be triggered, requiring a call to @e asr_release() or @e asr_stop(). */
} asr_result_action_t ; 

/* we will create utf-8 version of the followings */
#undef isdigit
#undef isspace
#undef isblank

/** Determine whether the specified character is a digit. */
#define isdigit(_c) ( __extension__ ({ int _d = (int)(_c); _d = (_d >= '0' && _d <= '9');}))

/** Determine whether the specified character is white space. */
#define isspace(_c) ( __extension__ ({ int _d = (int)(_c); _d = (_d == ' ' || _d == '\f' || _d == '\n' || _d == '\r'  || _d == '\a' || _d == '\b' || _d == '\t' || _d == '\v');}))

/** Determine whether the specified character is a space or a tab. */
#define isblank(_c) ( __extension__ ({ int _d = (int)(_c); _d = (_d == ' ' || _d == '\t');}))

/**
 * @brief Convert the specified character to uppercase.
 * @details The @e toupper_m() function converts the specified ASCII character to uppercase. If the character isn't in the 
 *          range of ASCII lowercase characters, it's returned unchanged.
 * @param c The character to convert.
 * @return The uppercase character on success; the unchanged character on error.
 */
extern int toupper_m (int c);

/**
 * @brief Convert the specified character to lowercase.
 * @details The @e tolower_m() function converts the specified ASCII character to lowercase. If the character isn't in the 
 *          range of ASCII uppercase characters, it's returned unchanged.
 * @param c The character to convert.
 * @return The lowercase character on success; the unchanged character on error.
 */
extern int tolower_m (int c);

#ifdef __cplusplus
}
#endif
#endif

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/services/asr/core/public/asr/types.h $ $Rev: 730879 $")
#endif
