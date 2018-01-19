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

#ifndef __MM_BROWSE_PLUGIN_H_INCLUDED
#define __MM_BROWSE_PLUGIN_H_INCLUDED

#include <stdarg.h>
#include <sys/cdefs.h>
#include <sys/slogcodes.h>
#include <sys/strm.h>

#include <mm/browse/browse.h>


#if defined(NDEBUG)
 #define MMBROWSE_PLUGIN_LOG_MIN _SLOG_INFO
#else
 #define MMBROWSE_PLUGIN_LOG_MIN _SLOG_DEBUG2
#endif

#define MMBROWSE_PLUGIN_LOG_ENABLED( level ) ( (level) <= MMBROWSE_PLUGIN_LOG_MIN )

/* mm-browse plug-ins should use MMBROWSE_PLUGIN_LOG to log messages.
 *
 * If a plug-in is compiled with NDEBUG set, _SLOG_DEBUG1 and
 * _SLOG_DEBUG2 messages will not be included in the output binary.
 *
 * The log level of given log messages may be used to determine whether
 * the message is logged based on the logging verbosity level enabled
 * in mm-browse.
 *
 * plugin - the plugin pointer provided by mm-browse when the plug-in was
 *          initialized.
 * level - the log level of this message, from _SLOG_SHUTDOWN to
 *         _SLOG_DEBUG2 as defined in <sys/slog.h>.
 * fmt - a printf() style format string
 * args - optional arguments, as required by fmt string.
 */
#define MMBROWSE_PLUGIN_LOG(plugin, level, fmt, args...)     ( MMBROWSE_PLUGIN_LOG_ENABLED(level) ? mmbrowse_plugin_log(plugin, level, __PRETTY_FUNCTION__, __LINE__, fmt, ##args) : (void)0 )


/**
 *  Internal handle representing a loaded plugin
 */
typedef struct mmbrowse_plugin mmbrowse_plugin_t;

/**
 *  A plugin's pointer to any private data it needs.
 *  Each plugin defines its own version of this structure.
 */
typedef struct mmbrowse_plugin_data mmbrowse_plugin_data_t;

/**
 *  The call table exported by a plugin.
 */
typedef struct mmbrowse_plugin_calls {
	/**
	 *	Plugin name.  This should be short.
	 */
	const char *name;

	/**
	 *	Plugin description.  This can be longer.
	 */
	const char *description;

	/**
	 *  Initialize the plugin.
	 *  @param handle A handle representing this plugin.
	 *  @param cfg The plugin's configuration parameters (plugin consumes the handle on success)
	 *  @return NULL on a failure (plugin will be unloaded)
	 */
	mmbrowse_plugin_data_t *(*init)(mmbrowse_plugin_t *handle, strm_dict_t *cfg );

	/**
	 *  Register any interfaces.
	 *  If not NULL, this function is called right after init(),
	 *  and then possibly again at some point after deregistered().
	 *  @param handle A handle, needed to register interfaces.
	 *  @param data The pointer returned by the plugin's init() call
	 *  @return 0 on success (any registered interfaces will be unregistered on failure)
	 */
	int (*register_interfaces)(mmbrowse_plugin_t *handle, mmbrowse_plugin_data_t *pdata );

	/**
	 *  Cleanup resources because this module is going to be unloaded.
	 */
	void (*cleanup)(mmbrowse_plugin_data_t *pdata);
} mmbrowse_plugin_calls_t, mmbrowse_plugin_calls_100_t;

#define MMBROWSE_PLUGIN_CALL_TABLE_NAME "mmbrowse_plugin_100"
#define MMBROWSE_PLUGIN_CALL_TABLE       mmbrowse_plugin_100
extern const mmbrowse_plugin_calls_t MMBROWSE_PLUGIN_CALL_TABLE;

/**
 *  A browse session's pointer to any private data it needs.
 *  Each implementation defines its own version of this structure.
 */
typedef struct mmbrowse_plugin_session mmbrowse_plugin_session_t;

/**
 *  A browse list's pointer to any private data it needs.
 *  Each implementation defines its own version of this structure.
 */
typedef struct mmbrowse_plugin_list mmbrowse_plugin_list_t;

typedef struct mmbrowse_plugin_table_s {
	/* Probe a mountpoint for browse support.
	 *
	 * mountpoint - requested mountpoint to browse
	 * options - string dictionary pointer to session options; will never be NULL
	 * pdata - plugin data pointer returned from plugin init
	 *
	 * returns rating level from 0 (unsupported) to 100 (highest rating)
	 */
	int (*probe)(const char *mountpoint, const strm_dict_t *options, mmbrowse_plugin_data_t *pdata);

	/* Start a browse session.
	 *
	 * mountpoint - requested mountpoint to browse
	 * options - string dictionary pointer to session options; will never be NULL
	 * pdata - plugin data pointer returned from plugin init
	 *
	 * returns a session handle on success, NULL on error
	 */
	mmbrowse_plugin_session_t *(*start)(const char *mountpoint, const strm_dict_t *options, mmbrowse_plugin_data_t *pdata);

	/* End a browse session.
	 *
	 * pbhdl - browse session handle
	 */
	void (*end)(mmbrowse_plugin_session_t *pbhdl);

	/* Jump to a specific path.
	 *
	 * pbhdl - browse session handle
	 * path - path to jump to; "/" must always be supported, otherwise a string returned
	 *        from path_get will be passed in.
	 *
	 * returns a list handle on success, NULL on error
	 */
	mmbrowse_plugin_list_t *(*path_jump)(mmbrowse_plugin_session_t *pbhdl, const char *path);

	/* Get the current list's path.
	 *
	 * plhdl - list handle
	 *
	 * returns list path pointer, valid as long as plhdl
	 */
	const char *(*path_get)(mmbrowse_plugin_list_t *plhdl);

	/* Enter a list entry by name.
	 *
	 * plhdl - list handle
	 * name - entry name
	 *
	 * returns a list handle on success, NULL on error
	 */
	mmbrowse_plugin_list_t *(*enter_name)(mmbrowse_plugin_list_t *plhdl, const char *name);

	/* Enter a list entry by handle.
	 *
	 * plhdl - list handle
	 * ehdl - entry handle
	 *
	 * returns a list handle on success, NULL on error
	 */
	mmbrowse_plugin_list_t *(*enter_handle)(mmbrowse_plugin_list_t *plhdl, const mmbrowse_entry_hdl_t *ehdl);

	/* Return to parent list.
	 *
	 * plhdl - list handle
	 *
	 * returns a list handle on success, NULL on error
	 * Note: if at the root this should return a new handle to the root.
	 */
	mmbrowse_plugin_list_t *(*lreturn)(mmbrowse_plugin_list_t *plhdl);

	/* Search the mountpoint.
	 *
	 * pbhdl - browse session handle
	 * search_string - string to search for
	 * search_options - options specific to this search
	 *
	 * returns a list handle on success, NULL on error
	 */
	mmbrowse_plugin_list_t *(*search)(mmbrowse_plugin_session_t *pbhdl, const char *search_string, const strm_dict_t *search_options);

	/* Get entries from a list.
	 *
	 * plhdl - list handle
	 * offset - zero-based offset from which to get entries
	 * entries - array of entry structures
	 * entries_cnt - number of entries that can be stored in entries array
	 *
	 * returns total number of entries available from the current offset
	 *         -1 on error
	 *         set errno to ECANCELED if getting entries is cancelled via entries_cancel().
	 *
	 * If it returns -1 because entries_cancel is called, the plhdl becomes invalid, the user has to obtain a new list handle.
	 */
	int (*entries_get)(mmbrowse_plugin_list_t *plhdl, uint32_t offset, mmbrowse_entry_t *entries, unsigned entries_cnt);

	/* Get the number of entries in a list.
	 *
	 * plhdl - list handle
	 *
	 * returns number of entries from the current list, -1 on error
	 */
	int (*entries_nitems)(mmbrowse_plugin_list_t *plhdl);

	/* Cancel the current operation of getting entries from a list.
	 *plhdl - list handle
	 *
	 *return 0 on success, -1 on error
	 *It is safe to call this function from a different thread without protecting plhdl.
	 */
	int (*entries_cancel)(mmbrowse_plugin_list_t *plhdl);

	/* Release a list's resources.
	 *
	 * plhdl - list handle
	 */
	void (*listfree)(mmbrowse_plugin_list_t *plhdl);

	/* Set a browse session option.
	 *
	 * Please see <mm/browse/browse.h> documentation for mmbrowse_option_set()
	 * for a list of well-known options.  A session may extend this list to
	 * offer any session-specific options.
	 *
	 * pbhdl - browse session handle
	 * okey - option name
	 * oval - option value
	 *
	 * returns 0 on success, -1 on error
	 */
	int (*option_set)(mmbrowse_plugin_session_t *pbhdl, const char *okey, const char *oval);

	/* Get a browse session's options.
	 *
	 * pbhdl - browse session handle
	 *
	 * returns browse session options on success, NULL on error
	 */
	const strm_dict_t *(*options_get)(mmbrowse_plugin_session_t *pbhdl);
} mmbrowse_plugin_table_t;


__BEGIN_DECLS

/* See MMBROWSE_PLUGIN_LOG comments above; avoid direct calling. */
void mmbrowse_plugin_log(mmbrowse_plugin_t *plugin, int level, const char *func, int line, const char *fmt, ...)
#ifdef __GNUC__
  __attribute__((format(printf,5,6)))
#endif
;

/* Register a browse plugin interface.
 *
 * plugin - the plugin pointer provided by mm-browse when the plug-in was
 *          initialized.
 * table - pointer to mmbrowse interface structure
 *
 * returns 0 on success, -1 on error
 */
extern int mmbrowse_plugin_register(mmbrowse_plugin_t *plugin, mmbrowse_plugin_table_t *table);

__END_DECLS


#endif

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/mm-browse/core/public/mm/browse/plugin.h $ $Rev: 723444 $")
#endif
